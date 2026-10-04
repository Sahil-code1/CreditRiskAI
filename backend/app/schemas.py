from pydantic import BaseModel, Field
from typing import Any

class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=8)

class LoanInput(BaseModel):
    loan_amnt: float = Field(ge=0)
    funded_amnt: float = Field(ge=0)
    funded_amnt_inv: float = Field(ge=0)
    term: int = Field(ge=1)
    int_rate: float = Field(ge=0)
    installment: float = Field(ge=0)
    grade: str
    sub_grade: str
    emp_length: float = Field(ge=0)
    home_ownership: str
    annual_inc: float = Field(ge=0)
    verification_status: str
    purpose: str
    addr_state: str
    dti: float = Field(ge=0)
    delinq_2yrs: int = Field(ge=0)
    inq_last_6mths: int = Field(ge=0)
    open_acc: int = Field(ge=0)
    pub_rec: int = Field(ge=0)
    revol_bal: float = Field(ge=0)
    revol_util: float = Field(ge=0)
    total_acc: int = Field(ge=0)
    pub_rec_bankruptcies: float = Field(ge=0)

class PredictionResponse(BaseModel):
    applicant_id: str
    risk_level: str
    default_probability: float
    confidence: float
    predicted_at: str
    model_version: str
    source: str
    explanation: dict[str, Any]
    summary: str
    recommendation: str
    applicant: dict[str, Any]
