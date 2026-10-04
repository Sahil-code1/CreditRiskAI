import json, os
import joblib
import numpy as np
import pandas as pd
import shap

MODEL_PATH = os.getenv("MODEL_PATH", "backend/models/xgboost_loan_default_model.pkl")
FEATURE_COLUMNS_PATH = os.getenv("FEATURE_COLUMNS_PATH", "backend/models/feature_columns.pkl")
META_PATH = os.path.join(os.path.dirname(FEATURE_COLUMNS_PATH), "model_metadata.json")

class ModelService:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH)
        self.feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
        self.version = "xgboost-p137-v1"
        self.metadata = json.load(open(META_PATH)) if os.path.exists(META_PATH) else {}
        self.explainer = shap.TreeExplainer(self.model)

    @staticmethod
    def _clean(raw: dict) -> pd.DataFrame:
        row = dict(raw)
        defaults = {
            "loan_amnt": 15000, "funded_amnt": 15000, "funded_amnt_inv": 14800,
            "term": 36, "int_rate": 13.5, "installment": 510, "grade": "C", "sub_grade": "C1",
            "emp_length": 5, "home_ownership": "RENT", "annual_inc": 72000,
            "verification_status": "Verified", "purpose": "debt_consolidation", "addr_state": "CA",
            "dti": 18, "delinq_2yrs": 0, "inq_last_6mths": 1, "open_acc": 9, "pub_rec": 0,
            "revol_bal": 12000, "revol_util": 52, "total_acc": 22, "pub_rec_bankruptcies": 0,
            "zip_code": "000", "out_prncp": 0, "out_prncp_inv": 0
        }
        for k, v in defaults.items():
            row.setdefault(k, v)
        df = pd.DataFrame([row])
        df["term"] = pd.to_numeric(df["term"], errors="coerce")
        df["int_rate"] = pd.to_numeric(df["int_rate"].astype(str).str.replace("%", "", regex=False), errors="coerce")
        df["revol_util"] = pd.to_numeric(df["revol_util"].astype(str).str.replace("%", "", regex=False), errors="coerce")
        df["emp_length"] = pd.to_numeric(df["emp_length"].astype(str).str.extract(r"(\d+)")[0], errors="coerce").fillna(0)
        return df

    def transform(self, raw: dict) -> pd.DataFrame:
        df = self._clean(raw)
        X = df.drop(columns=["loan_status", "issue_d", "earliest_cr_line", "last_credit_pull_d", "title", "id", "member_id", "url", "desc", "emp_title", "mths_since_last_record", "mths_since_last_delinq", "total_pymnt", "total_pymnt_inv", "total_rec_prncp", "total_rec_int", "total_rec_late_fee", "recoveries", "collection_recovery_fee", "last_pymnt_d", "last_pymnt_amnt"], errors="ignore")
        X = pd.get_dummies(X, drop_first=True)
        X = X.reindex(columns=self.feature_columns, fill_value=0).astype(float)
        return X

    def predict(self, raw: dict) -> dict:
        X = self.transform(raw)
        probability = float(self.model.predict_proba(X)[:, 1][0])
        risk = "LOW" if probability < 0.20 else "MEDIUM" if probability < 0.40 else "HIGH"
        sv = self.explainer.shap_values(X)
        vals = np.asarray(sv)
        if vals.ndim == 3:
            vals = vals[:, :, 1]
        vals = vals[0]
        top = np.argsort(np.abs(vals))[::-1][:8]
        contributions = []
        for idx in top:
            name = str(self.feature_columns[idx])
            contributions.append({"feature": name, "value": float(X.iloc[0, idx]), "impact": float(vals[idx])})
        expected = self.explainer.expected_value
        if isinstance(expected, (list, np.ndarray)):
            expected = float(np.asarray(expected).reshape(-1)[-1])
        base_prob = float(1 / (1 + np.exp(-float(expected))))
        positive = [c["feature"].replace("_", " ") for c in contributions if c["impact"] > 0][:3]
        summary = f"The model estimates a {probability:.1%} probability of default." + (f" Main risk contributors include {', '.join(positive)}." if positive else "")
        recommendation = {
            "LOW": "Lower modeled default risk. Continue with the lender's normal underwriting checks.",
            "MEDIUM": "Intermediate modeled risk. Route to additional underwriting review before a final decision.",
            "HIGH": "Higher modeled default risk. Require enhanced credit review before any decision."
        }[risk]
        return {
            "risk_level": risk,
            "default_probability": probability,
            "confidence": max(probability, 1 - probability),
            "predicted_at": pd.Timestamp.utcnow().isoformat(),
            "model_version": self.version,
            "source": "trained-xgboost",
            "explanation": {"method": "SHAP TreeExplainer", "is_demo": False, "base_value": base_prob, "contributions": contributions},
            "summary": summary,
            "recommendation": recommendation
        }
