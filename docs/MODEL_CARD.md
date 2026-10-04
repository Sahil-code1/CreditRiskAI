# CreditRisk AI — Model Card

## Model

**Selected model:** XGBoost binary classifier  
**Task:** Predict probability of loan default  
**Model version:** `xgboost-p137-v1`

## Evaluation

| Model | ROC-AUC |
|---|---:|
| Logistic Regression | 0.6816 |
| Random Forest | 0.7040 |
| XGBoost | **0.7157** |

The reported metrics come from the project's hold-out evaluation.

## Data

- 27,003 cleaned historical loan records
- Public Kaggle/LendingClub-style dataset
- Target: `loan_status`
- Class distribution: 85.27% non-default / 14.73% default
- Encoded feature space: 925 model features

## Explainability

SHAP is used to provide local feature-level explanations for predictions. Example high-impact variables observed during analysis include:

- interest rate
- annual income
- term
- revolving utilization
- investor funded amount
- recent credit inquiries
- loan purpose
- loan amount

## Intended Use

The model is suitable for:

- academic demonstration
- portfolio review
- experimentation
- explainable ML / MLOps demonstrations

It is **not** presented as a production lending-decision model and should not be used to make real credit decisions without appropriate governance, validation, fairness assessment, security controls and regulatory review.

## Limitations

- Current hold-out ROC-AUC is 0.7157.
- The dataset is public/historical rather than Bank Muscat production data.
- Model performance may change on a different population or time period.
- Drift analysis is baseline/reference-oriented in the current prototype.

## Reproducibility

Model artifacts and feature-column metadata are kept separate from the training notebook/data-cleaning workflow. The repository documentation should be updated whenever the model version changes.
