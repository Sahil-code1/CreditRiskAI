# CreditRisk AI — GitHub Publish Checklist

## Before first push

- [ ] Confirm `.env` is ignored.
- [ ] Confirm real passwords/API keys/service-account files are absent.
- [ ] Review `git status`.
- [ ] Review large files, especially model `.pkl` artifacts.
- [ ] Add 3–4 screenshots to `docs/images/`.
- [ ] Update `<YOUR_USERNAME>` placeholders in `README.md`.
- [ ] Replace placeholder contact details if desired.
- [ ] Confirm the README claims only verified metrics and capabilities.

## Recommended repository metadata

**Name**
`CreditRiskAI`

**Description**
`Explainable loan-default prediction platform with XGBoost, SHAP, FastAPI, PostgreSQL, MLflow and EvidentlyAI.`

**Topics**
`machine-learning`
`credit-risk`
`loan-default-prediction`
`xgboost`
`shap`
`fastapi`
`postgresql`
`mlflow`
`evidently-ai`
`react`
`python`
`fintech`

## First push

```powershell
git init
git branch -M main
git add .
git status
git commit -m "feat: initialize CreditRisk AI portfolio project"
git remote add origin https://github.com/<YOUR_USERNAME>/CreditRiskAI.git
git push -u origin main
```

## After push

1. Open the repository's **About** settings.
2. Add the project description.
3. Add the topics above.
4. Add a social preview image if desired.
5. Run the Community Standards check.
6. Review the Security / Dependabot / code scanning settings.
7. Create tag/release `v1.0.0` after the first stable public snapshot.
8. Pin the repository on the GitHub profile.

## Security

Never bypass a GitHub secret-scanning block just to get a push through. Remove or rotate the secret instead.
