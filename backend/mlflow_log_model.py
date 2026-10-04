import joblib
import mlflow
from pathlib import Path

BASE = Path(__file__).resolve().parent
MODEL_PATH = BASE / "models" / "xgboost_loan_default_model.pkl"
FEATURES_PATH = BASE / "models" / "feature_columns.pkl"

model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)

mlflow.set_tracking_uri("http://127.0.0.1:5000")
mlflow.set_experiment("P137_Loan_Default_Prediction")

with mlflow.start_run(run_name="P137_XGBoost_Baseline") as run:
    mlflow.log_param("model_type", type(model).__name__)
    mlflow.log_param("feature_count", len(features))
    mlflow.log_param("dataset_rows", 27003)
    mlflow.log_metric("roc_auc", 0.7157)
    mlflow.set_tag("project", "HCL P_137")
    mlflow.set_tag("domain", "Banking - Loan Default Prediction")
    mlflow.set_tag("model_status", "baseline")
    
    try:
        mlflow.xgboost.log_model(model, name="xgboost_model")
    except Exception:
        mlflow.sklearn.log_model(model, name="xgboost_model")
    
    mlflow.log_artifact(str(MODEL_PATH), artifact_path="model_files")
    mlflow.log_artifact(str(FEATURES_PATH), artifact_path="model_files")

    print("MLflow RUN ID:", run.info.run_id)
    print("MLflow model logging completed successfully.")
