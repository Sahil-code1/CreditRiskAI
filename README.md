# LoanGuard AI — Explainable Loan Default Prediction Platform

<p align="center">
  <strong>End-to-end credit-risk ML platform for loan default prediction, explainability and portfolio analytics.</strong>
</p>

<p align="center">
  <a href="https://credit-risk-ai-snowy.vercel.app">Live Demo</a> ·
  <a href="https://creditriskai-w7vb.onrender.com/health">API Health</a> ·
  <a href="https://github.com/Sahil-code1/CreditRiskAI">GitHub Repository</a>
</p>

---

## Overview

LoanGuard AI is an end-to-end machine-learning application built for the HCL P_137 **Loan Default Prediction** problem.

It predicts the probability that a borrower will default, assigns a risk level, and provides feature-level explanations using SHAP. The platform combines a trained XGBoost model with a FastAPI inference service, PostgreSQL persistence, a React dashboard, MLflow experiment tracking and EvidentlyAI-based drift reporting.

The system is intended as a **decision-support tool**. Final lending decisions remain with the human underwriting process.

## Key Features

- XGBoost loan-default prediction
- SHAP-based individual prediction explanations
- FastAPI REST backend
- React + Vite + Tailwind frontend
- PostgreSQL-backed historical loan data and prediction history
- JWT authentication
- Portfolio dashboard and analytics
- Model-performance monitoring
- EvidentlyAI drift reporting
- MLflow experiment/model tracking
- Production deployment with Vercel + Render

## ML Results

Evaluation on the held-out test split:

| Model | ROC-AUC |
|---|---:|
| Logistic Regression | 0.6816 |
| Random Forest | 0.7040 |
| **XGBoost** | **0.7157** |

The deployed model is the XGBoost model.

### Important predictors identified with SHAP

- Interest rate
- Annual income
- Loan term
- Revolving utilization
- Investor-funded amount
- Recent credit inquiries
- Loan purpose
- Loan amount
- Funded amount
- Installment

## Dataset

The project uses the Kaggle Loan Default Prediction dataset.

- Original records: **27,003**
- Final model features after encoding: **925**
- Train split: **21,602**
- Test split: **5,401**
- Target: `loan_status`
- Default class: **14.73%**
- Non-default class: **85.27%**

## System Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│ Vite + Tailwind + Recharts   │
└──────────────┬───────────────┘
               │ HTTPS / REST
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│ Auth • Prediction • Analytics│
└───────┬──────────────┬───────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌─────────────────────┐
│ PostgreSQL   │  │ XGBoost + SHAP      │
│ Users/Loans/ │  │ Feature transform + │
│ Predictions  │  │ Explainability      │
└──────────────┘  └─────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ MLflow + EvidentlyAI                 │
│ Experiment tracking + drift reporting│
└──────────────────────────────────────┘
```

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- JWT authentication
- PostgreSQL
- psycopg

### Machine Learning
- Pandas
- NumPy
- scikit-learn
- XGBoost
- SHAP
- Joblib

### MLOps / Monitoring
- MLflow
- EvidentlyAI
- Docker
- AWS ECS-ready architecture

## Main Application Pages

- Login
- Executive Dashboard
- Risk Prediction
- Prediction History
- Analytics
- Model Monitoring
- Applicant Details

## Prediction Flow

```text
Applicant data
      ↓
Input validation
      ↓
Feature cleaning
      ↓
Categorical encoding
      ↓
925 model features
      ↓
XGBoost probability
      ↓
Risk classification
      ↓
SHAP explanation
      ↓
PostgreSQL prediction history
```

## API

### Health

```http
GET /health
```

Returns database and model-loading status.

### Authentication

```http
POST /auth/login
POST /auth/register
```

### Prediction

```http
POST /predict
```

Returns:

- Default probability
- Risk level
- Confidence
- Model version
- SHAP contributions
- Recommendation

### Analytics

```http
GET /dashboard/stats
GET /analytics
GET /monitoring
GET /predictions
GET /applicants/{applicant_id}
```

## Running Locally

### Backend

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
npm install
npm run dev
```

### PostgreSQL

The project can run with PostgreSQL through Docker Compose.

```bash
docker compose up -d
```

### Environment

Frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK=false
```

Backend secrets and database configuration should be supplied through environment variables and must not be committed to Git.

## Deployment

### Frontend
Vercel

**Live:** https://credit-risk-ai-snowy.vercel.app

### Backend
Render

**API:** https://creditriskai-w7vb.onrender.com

**Health:** https://creditriskai-w7vb.onrender.com/health

## Screenshots

Add final production screenshots under:

```text
docs/screenshots/
```

Recommended screenshots:

1. Executive dashboard
2. Risk prediction result with SHAP explanation
3. Prediction history
4. Analytics
5. Model monitoring

Then reference them here, for example:

```md
![Executive Dashboard](docs/screenshots/dashboard.png)
```

## Repository Structure

```text
CreditRiskAI/
├── backend/
│   ├── app/
│   ├── models/
│   ├── data/
│   ├── evidently_drift.py
│   └── requirements.txt
├── frontend/
├── docs/
├── .github/
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

## Engineering Notes

- The trained XGBoost model and feature-column artifact are loaded by the backend at runtime.
- Prediction preprocessing is aligned with the training feature space.
- SHAP explanations are generated per prediction.
- PostgreSQL stores users, historical loans and generated predictions.
- The system separates model inference from the final human underwriting decision.
- Production secrets are expected to be supplied through deployment environment variables.

## What This Project Demonstrates

**Machine Learning:** feature engineering, imbalanced classification, model comparison, XGBoost evaluation and explainability.

**Backend Engineering:** REST APIs, authentication, validation, persistence and model serving.

**Frontend Engineering:** responsive dashboard, API integration, charts and prediction workflows.

**MLOps:** model packaging, experiment tracking, drift reporting and cloud deployment.

## Author

**Sahil Ali**

B.Tech Computer Science Engineering

## License

MIT License

## Live Demo

Try the deployed application: https://credit-risk-ai-snowy.vercel.app
