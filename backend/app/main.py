import os
import json
import math
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter

import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from jose import JWTError

from .db import Base, engine, get_db, SessionLocal
from .models import User, Loan, Prediction
from .schemas import LoginRequest, RegisterRequest, LoanInput
from .security import create_token, verify_password, decode_token, hash_password
from .model_service import ModelService
from .seed import seed_if_needed


app = FastAPI(title="P_137 Credit Risk API", version="1.0.0")

origins = [
    x.strip()
    for x in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173"
    ).split(",")
    if x.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model_service: ModelService | None = None


@app.on_event("startup")
def startup():
    global model_service

    Base.metadata.create_all(bind=engine)

    try:
        model_service = ModelService()

        if os.getenv("AUTO_SEED", "true").lower() == "true":
            seed_if_needed()

    except Exception as exc:
        print(f"Startup warning: {exc}")


def current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Authentication required")

    try:
        payload = decode_token(authorization.split(" ", 1)[1])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(401, "User not found")

    return user


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "postgresql",
        "model_loaded": model_service is not None
    }


@app.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == body.email
    ).first()

    if not user or not verify_password(
        body.password,
        user.password_hash
    ):
        raise HTTPException(401, "Invalid email or password")

    return {
        "token": create_token(user.id, user.email),
        "name": user.name,
        "email": user.email
    }

@app.post("/auth/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.email == body.email
    ).first()

    if existing_user:
        raise HTTPException(400, "Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "token": create_token(user.id, user.email),
        "name": user.name,
        "email": user.email
    }


@app.post("/predict")
def predict(
    body: LoanInput,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    if model_service is None:
        raise HTTPException(503, "Model is not loaded")

    payload = body.model_dump()

    result = model_service.predict(payload)

    applicant_id = (
        f"APP-{datetime.utcnow().strftime('%y%m%d%H%M%S%f')[:-3]}"
    )

    result["applicant_id"] = applicant_id
    result["applicant"] = payload

    db.add(
        Prediction(
            applicant_id=applicant_id,
            user_id=user.id,
            default_probability=result["default_probability"],
            risk_level=result["risk_level"],
            model_version=result["model_version"],
            payload=payload,
            explanation=result["explanation"]
        )
    )

    db.commit()

    return result


@app.get("/dashboard/stats")
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    total = db.query(func.count(Loan.id)).scalar() or 0

    defaults = db.query(
        func.sum(Loan.loan_status)
    ).scalar() or 0

    high = db.query(
        func.count(Loan.id)
    ).filter(
        Loan.risk_level == "HIGH"
    ).scalar() or 0

    low = db.query(
        func.count(Loan.id)
    ).filter(
        Loan.risk_level == "LOW"
    ).scalar() or 0

    med = db.query(
        func.count(Loan.id)
    ).filter(
        Loan.risk_level == "MEDIUM"
    ).scalar() or 0

    pred7 = db.query(
        func.count(Prediction.id)
    ).filter(
        Prediction.created_at >= datetime.utcnow() - timedelta(days=7)
    ).scalar() or 0

    grade_rows = db.query(
        Loan.grade,
        func.count(Loan.id),
        func.avg(Loan.loan_status)
    ).group_by(
        Loan.grade
    ).order_by(
        Loan.grade
    ).all()

    risk_dist = [
        {"name": k, "value": v}
        for k, v in [
            ("LOW", low),
            ("MEDIUM", med),
            ("HIGH", high)
        ]
    ]

    by_grade = [
        {
            "grade": g,
            "count": int(c),
            "rate": round(float(r or 0) * 100, 2)
        }
        for g, c, r in grade_rows
    ]

    def hist_numeric(col, edges, unit=None):
        out = []

        for lo, hi in zip(edges[:-1], edges[1:]):
            c = db.query(
                func.count(Loan.id)
            ).filter(
                col >= lo,
                col < hi
            ).scalar() or 0

            out.append(
                {
                    "range": f"{lo}{unit or ''}–{hi}{unit or ''}",
                    "count": int(c)
                }
            )

        return out

    rateHist = hist_numeric(
        Loan.int_rate,
        [0, 8, 12, 16, 20, 24, 40],
        "%"
    )

    amtHist = hist_numeric(
        Loan.loan_amnt,
        [0, 5000, 10000, 15000, 20000, 25000, 40000]
    )

    incHist = hist_numeric(
        Loan.annual_inc,
        [0, 40000, 60000, 80000, 100000, 150000, 300000]
    )

    utilHist = hist_numeric(
        Loan.revol_util,
        [0, 20, 40, 60, 80, 100, 200],
        "%"
    )

    rows = db.query(
        Loan
    ).order_by(
        desc(Loan.issue_date)
    ).limit(1200).all()

    scatter = [
        {
            "income": r.annual_inc or 0,
            "amount": r.loan_amnt,
            "risk": r.risk_level or "LOW"
        }
        for r in rows
    ]

    recent = [
        {
            "applicant_id": f"LC-{r.source_id}",
            "date": r.issue_date.isoformat()
            if r.issue_date else "",
            "loan_amnt": r.loan_amnt,
            "grade": r.grade,
            "probability": r.model_probability or 0,
            "risk_level": r.risk_level or "LOW",
            "status": "Default"
            if r.loan_status == 1
            else "Repaid/Non-default",
            "purpose": r.purpose or ""
        }
        for r in rows[:50]
    ]

    month_counts = Counter()

    for r in rows:
        if r.issue_date:
            month_counts[
                r.issue_date.strftime("%Y-%m")
            ] += 1

    trend = [
        {
            "day": m,
            "volume": int(month_counts[m]),
            "avgProb": None
        }
        for m in sorted(month_counts)[-30:]
    ]

    return {
        "total": total,
        "defaultRate": (
            defaults / total
            if total else 0
        ),
        "high": high,
        "low": low,
        "roc_auc": 0.7157,
        "volume7": pred7,
        "riskDist": risk_dist,
        "byGrade": by_grade,
        "rateHist": rateHist,
        "amtHist": amtHist,
        "incomeHist": incHist,
        "utilHist": utilHist,
        "scatter": scatter,
        "trend": trend,
        "recent": recent,
        "source": {
            "name": "Kaggle Loan Default Prediction",
            "records": total,
            "note": (
                "Historical borrower data; model scores are generated "
                "by the trained P_137 XGBoost model."
            )
        }
    }


@app.get("/analytics")
def analytics(
    grade: str = "",
    risk: str = "",
    days: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    q = db.query(Loan)

    if grade:
        q = q.filter(Loan.grade == grade)

    if risk:
        q = q.filter(Loan.risk_level == risk)

    rows = q.all()

    total = len(rows)

    default_rate = (
        sum(r.loan_status for r in rows) / total
        if total else 0
    )

    riskDist = [
        {
            "name": k,
            "value": sum(
                1 for r in rows
                if r.risk_level == k
            )
        }
        for k in ["LOW", "MEDIUM", "HIGH"]
    ]

    by = []

    for g in "ABCDEFG":
        rs = [
            r for r in rows
            if r.grade == g
        ]

        by.append(
            {
                "grade": g,
                "count": len(rs),
                "rate": round(
                    sum(x.loan_status for x in rs)
                    / len(rs) * 100,
                    2
                ) if rs else 0
            }
        )

    def hist(key, edges, percent=False):
        o = []

        for lo, hi in zip(edges[:-1], edges[1:]):
            c = sum(
                1
                for r in rows
                if getattr(r, key) is not None
                and lo <= getattr(r, key) < hi
            )

            o.append(
                {
                    "range": (
                        f"{lo}{'%' if percent else ''}–"
                        f"{hi}{'%' if percent else ''}"
                    ),
                    "count": c
                }
            )

        return o

    return {
        "total": total,
        "defaultRate": default_rate,
        "high": sum(
            1 for r in rows
            if r.risk_level == "HIGH"
        ),
        "low": sum(
            1 for r in rows
            if r.risk_level == "LOW"
        ),
        "riskDist": riskDist,
        "byGrade": by,
        "rateHist": hist(
            "int_rate",
            [0, 8, 12, 16, 20, 24, 40],
            True
        ),
        "amtHist": hist(
            "loan_amnt",
            [0, 5000, 10000, 15000, 20000, 25000, 40000]
        ),
        "incomeHist": hist(
            "annual_inc",
            [0, 40000, 60000, 80000, 100000, 150000, 300000]
        ),
        "utilHist": hist(
            "revol_util",
            [0, 20, 40, 60, 80, 100, 200],
            True
        ),
        "source": {
            "name": "PostgreSQL-backed historical loan dataset",
            "rows": total
        }
    }


@app.get("/monitoring")
def monitoring(
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    pred_count = db.query(
        func.count(Prediction.id)
    ).scalar() or 0

    summary_path = (
        Path(__file__).resolve().parents[1]
        / "evidently_drift_summary.json"
    )

    report_path = (
        Path(__file__).resolve().parents[1]
        / "evidently_drift_report.html"
    )

    drift_status = "Not available"
    drift = []
    reference_rows = 0
    current_rows = 0

    if summary_path.exists():
        try:
            summary = json.loads(
                summary_path.read_text(
                    encoding="utf-8"
                )
            )

            drift_status = summary.get(
                "overall_status",
                "Stable"
            )

            drift = summary.get(
                "features",
                []
            )

            reference_rows = summary.get(
                "reference_rows",
                0
            )

            current_rows = summary.get(
                "current_rows",
                0
            )

        except Exception as exc:
            print(
                f"Monitoring summary read warning: {exc}"
            )

    return {
        "metrics": {
            "roc_auc": 0.7157,
            "precision": 0.2567,
            "recall": 0.5925,
            "f1": 0.3582,
            "status": "Reference / holdout evaluation"
        },
        "model_version": "xgboost-p137-v1",
        "last_trained": "2026-10-01T00:00:00Z",
        "prediction_count": pred_count,
        "drift_status": drift_status,
        "drift": drift,
        "reference_rows": reference_rows,
        "current_rows": current_rows,
        "report_available": report_path.exists(),
        "note": (
            "Drift metrics are generated from the "
            "Evidently baseline report. Production drift "
            "requires live prediction history."
        )
    }


@app.get("/predictions")
def predictions(
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    rows = db.query(
        Prediction
    ).order_by(
        desc(Prediction.created_at)
    ).limit(500).all()

    return [
        {
            "applicant_id": r.applicant_id,
            "date": r.created_at.isoformat(),
            "loan_amnt": r.payload.get("loan_amnt"),
            "grade": r.payload.get("grade"),
            "probability": r.default_probability,
            "risk_level": r.risk_level,
            "status": "Model scored",
            "purpose": r.payload.get("purpose", "")
        }
        for r in rows
    ]


@app.get("/applicants/{applicant_id}")
def applicant(
    applicant_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    if applicant_id.startswith("LC-"):
        source = int(
            applicant_id.split("-", 1)[1]
        )

        row = db.query(
            Loan
        ).filter(
            Loan.source_id == source
        ).first()

        if not row:
            raise HTTPException(
                404,
                "Applicant not found"
            )

        payload = {
            k: getattr(row, k)
            for k in [
                "loan_amnt",
                "funded_amnt",
                "funded_amnt_inv",
                "term",
                "int_rate",
                "installment",
                "grade",
                "sub_grade",
                "emp_length",
                "home_ownership",
                "annual_inc",
                "verification_status",
                "purpose",
                "addr_state",
                "dti",
                "delinq_2yrs",
                "inq_last_6mths",
                "open_acc",
                "pub_rec",
                "revol_bal",
                "revol_util",
                "total_acc",
                "pub_rec_bankruptcies"
            ]
        }

        return {
            "applicant_id": applicant_id,
            "applicant": payload,
            "prediction": {
                "default_probability":
                    row.model_probability or 0,
                "risk_level":
                    row.risk_level or "LOW",
                "model_version":
                    "xgboost-p137-v1",
                "source":
                    "trained-xgboost"
            },
            "history": []
        }

    p = db.query(
        Prediction
    ).filter(
        Prediction.applicant_id == applicant_id
    ).first()

    if not p:
        raise HTTPException(
            404,
            "Applicant not found"
        )

    return {
        "applicant_id": p.applicant_id,
        "applicant": p.payload,
        "prediction": {
            "default_probability":
                p.default_probability,
            "risk_level":
                p.risk_level,
            "model_version":
                p.model_version,
            "source":
                "trained-xgboost",
            "explanation":
                p.explanation
        },
        "history": []
    }