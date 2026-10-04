# P_137 backend — local development without Docker

Docker/PostgreSQL can be added later. For now the app uses SQLite automatically via `.env`, while seeding the actual `loan_train.csv` records and using the trained XGBoost model.

## Run
From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
python backend/run.py
```

Backend: http://localhost:8000
Health: http://localhost:8000/health
Docs: http://localhost:8000/docs

Default local account:
- analyst@p137.local
- P137@Analyst123!

The database file is `backend/p137_credit_risk.db` and is populated from the included real public Kaggle `loan_train.csv` dataset. No synthetic dashboard dataset is required.

When PostgreSQL is ready, replace `DATABASE_URL` in `backend/.env` with the PostgreSQL URL and restart the backend.
