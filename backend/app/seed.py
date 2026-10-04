import os, json
from datetime import datetime
import pandas as pd
from sqlalchemy import select
from .db import Base, engine, SessionLocal
from .models import User, Loan
from .security import hash_password
from .model_service import ModelService

DATASET_PATH = os.getenv("DATASET_PATH", "backend/data/loan_train.csv")

RAW_COLS = [
    "loan_amnt","funded_amnt","funded_amnt_inv","term","int_rate","installment","grade","sub_grade","emp_length",
    "home_ownership","annual_inc","verification_status","loan_status","purpose","addr_state","dti","delinq_2yrs",
    "inq_last_6mths","open_acc","pub_rec","revol_bal","revol_util","total_acc","pub_rec_bankruptcies","issue_d"
]

def parse_issue_date(x):
    try:
        return pd.to_datetime(str(x), format="%b-%y").date()
    except Exception:
        return None

def seed_if_needed():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if not db.scalar(select(User.id).limit(1)):
            db.add(User(email="analyst@p137.local", password_hash=hash_password("P137@Analyst123!"), name="P_137 Analyst"))
            db.commit()
        existing = db.query(Loan).count()
        if existing > 0:
            return existing

        df = pd.read_csv(DATASET_PATH)
        # model probabilities on the actual dataset for dashboard risk segmentation
        model = ModelService()
        raw_for_model = df.copy()
        temp = raw_for_model.drop(columns=["id","member_id","url","desc","emp_title","mths_since_last_record","mths_since_last_delinq","out_prncp","out_prncp_inv","total_pymnt","total_pymnt_inv","total_rec_prncp","total_rec_int","total_rec_late_fee","recoveries","collection_recovery_fee","last_pymnt_d","last_pymnt_amnt"], errors="ignore")
        temp["term"] = temp["term"].astype(str).str.extract(r"(\d+)")[0].astype(float)
        temp["int_rate"] = temp["int_rate"].astype(str).str.replace("%", "", regex=False).astype(float)
        temp["revol_util"] = temp["revol_util"].astype(str).str.replace("%", "", regex=False).astype(float)
        temp["emp_length"] = temp["emp_length"].astype("string").replace({"< 1 year":"0","10+ years":"10"}).str.extract(r"(\d+)")[0].astype(float)
        temp["emp_length"] = temp["emp_length"].fillna(temp["emp_length"].median())
        temp["pub_rec_bankruptcies"] = temp["pub_rec_bankruptcies"].fillna(0)
        temp["revol_util"] = temp["revol_util"].fillna(temp["revol_util"].median())
        temp["title"] = temp.get("title", pd.Series(["Unknown"]*len(temp))).fillna("Unknown")
        temp["last_credit_pull_d"] = temp.get("last_credit_pull_d", pd.Series(["Unknown"]*len(temp))).fillna("Unknown")
        X = temp.drop(columns=["loan_status","issue_d","earliest_cr_line","last_credit_pull_d","title"], errors="ignore")
        X = pd.get_dummies(X, drop_first=True).reindex(columns=model.feature_columns, fill_value=0).astype(float)
        probs = model.model.predict_proba(X)[:,1]
        temp["model_probability"] = probs
        temp["risk_level"] = pd.cut(probs, bins=[-0.01,0.20,0.40,1.01], labels=["LOW","MEDIUM","HIGH"]).astype(str)

        records=[]
        for i,row in temp.iterrows():
            records.append(Loan(
                source_id=int(df.iloc[i]["id"]), issue_date=parse_issue_date(df.iloc[i].get("issue_d")),
                loan_amnt=float(row.loan_amnt), funded_amnt=float(row.funded_amnt), funded_amnt_inv=float(row.funded_amnt_inv),
                term=float(row.term), int_rate=float(row.int_rate), installment=float(row.installment), grade=str(row.grade), sub_grade=str(row.sub_grade),
                emp_length=None if pd.isna(row.emp_length) else float(row.emp_length), home_ownership=None if pd.isna(row.home_ownership) else str(row.home_ownership),
                annual_inc=None if pd.isna(row.annual_inc) else float(row.annual_inc), verification_status=None if pd.isna(row.verification_status) else str(row.verification_status),
                loan_status=int(row.loan_status), purpose=None if pd.isna(row.purpose) else str(row.purpose), addr_state=None if pd.isna(row.addr_state) else str(row.addr_state),
                dti=None if pd.isna(row.dti) else float(row.dti), delinq_2yrs=None if pd.isna(row.delinq_2yrs) else int(row.delinq_2yrs),
                inq_last_6mths=None if pd.isna(row.inq_last_6mths) else int(row.inq_last_6mths), open_acc=None if pd.isna(row.open_acc) else int(row.open_acc),
                pub_rec=None if pd.isna(row.pub_rec) else int(row.pub_rec), revol_bal=None if pd.isna(row.revol_bal) else float(row.revol_bal),
                revol_util=None if pd.isna(row.revol_util) else float(row.revol_util), total_acc=None if pd.isna(row.total_acc) else int(row.total_acc),
                pub_rec_bankruptcies=None if pd.isna(row.pub_rec_bankruptcies) else float(row.pub_rec_bankruptcies),
                model_probability=float(row.model_probability), risk_level=str(row.risk_level)
            ))
            if len(records) >= 2000:
                db.bulk_save_objects(records); db.commit(); records=[]
        if records:
            db.bulk_save_objects(records); db.commit()
        return len(df)
