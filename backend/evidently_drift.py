import json
from pathlib import Path

import numpy as np
import pandas as pd
from evidently import Report
from evidently.presets import DataDriftPreset


BASE = Path(__file__).resolve().parent
DATASET = BASE / "data" / "loan_train.csv"
REPORT_PATH = BASE / "evidently_drift_report.html"
SUMMARY_PATH = BASE / "evidently_drift_summary.json"

FEATURES = ["int_rate", "annual_inc", "loan_amnt", "revol_util"]


def psi(reference, current, bins=10):
    reference = pd.to_numeric(reference, errors="coerce").dropna()
    current = pd.to_numeric(current, errors="coerce").dropna()

    if reference.empty or current.empty:
        return 0.0

    quantiles = np.linspace(0, 1, bins + 1)
    edges = np.unique(reference.quantile(quantiles).values)

    if len(edges) < 3:
        return 0.0

    ref_counts, _ = np.histogram(reference, bins=edges)
    cur_counts, _ = np.histogram(current, bins=edges)

    ref_pct = ref_counts / max(ref_counts.sum(), 1)
    cur_pct = cur_counts / max(cur_counts.sum(), 1)

    eps = 1e-6
    ref_pct = np.clip(ref_pct, eps, None)
    cur_pct = np.clip(cur_pct, eps, None)

    return float(np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct)))


df = pd.read_csv(DATASET)

reference = df.sample(frac=0.8, random_state=42)
current = df.drop(reference.index)

# Actual Evidently drift report
ref_report = reference.drop(columns=["loan_status"], errors="ignore")
cur_report = current.drop(columns=["loan_status"], errors="ignore")

report = Report(metrics=[DataDriftPreset()])
snapshot = report.run(
    current_data=cur_report,
    reference_data=ref_report
)

snapshot.save_html(str(REPORT_PATH))

# Monitoring summary for API/frontend
feature_results = []

for feature in FEATURES:
    value = psi(reference[feature], current[feature])

    if value < 0.10:
        status = "Stable"
    elif value < 0.20:
        status = "Watch"
    else:
        status = "Drift"

    feature_results.append({
        "feature": feature,
        "psi": round(value, 4),
        "status": status
    })

max_psi = max(x["psi"] for x in feature_results)

if max_psi < 0.10:
    overall_status = "Stable"
elif max_psi < 0.20:
    overall_status = "Watch"
else:
    overall_status = "Drift"

summary = {
    "overall_status": overall_status,
    "reference_rows": int(len(reference)),
    "current_rows": int(len(current)),
    "features": feature_results,
    "report_file": str(REPORT_PATH)
}

SUMMARY_PATH.write_text(
    json.dumps(summary, indent=2),
    encoding="utf-8"
)

print("Evidently report updated.")
print(f"HTML report: {REPORT_PATH}")
print(f"JSON summary: {SUMMARY_PATH}")
print(f"Overall drift status: {overall_status}")