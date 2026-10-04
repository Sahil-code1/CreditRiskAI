from datetime import datetime, date
from sqlalchemy import String, Integer, Float, DateTime, Date, Boolean, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(120), default="Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Loan(Base):
    __tablename__ = "loans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    issue_date: Mapped[date | None] = mapped_column(Date)
    loan_amnt: Mapped[float] = mapped_column(Float)
    funded_amnt: Mapped[float] = mapped_column(Float)
    funded_amnt_inv: Mapped[float] = mapped_column(Float)
    term: Mapped[float] = mapped_column(Float)
    int_rate: Mapped[float] = mapped_column(Float)
    installment: Mapped[float] = mapped_column(Float)
    grade: Mapped[str] = mapped_column(String(4), index=True)
    sub_grade: Mapped[str] = mapped_column(String(8))
    emp_length: Mapped[float | None] = mapped_column(Float)
    home_ownership: Mapped[str | None] = mapped_column(String(30))
    annual_inc: Mapped[float | None] = mapped_column(Float)
    verification_status: Mapped[str | None] = mapped_column(String(40))
    loan_status: Mapped[int] = mapped_column(Integer, index=True)
    purpose: Mapped[str | None] = mapped_column(String(60))
    addr_state: Mapped[str | None] = mapped_column(String(8))
    dti: Mapped[float | None] = mapped_column(Float)
    delinq_2yrs: Mapped[int | None] = mapped_column(Integer)
    inq_last_6mths: Mapped[int | None] = mapped_column(Integer)
    open_acc: Mapped[int | None] = mapped_column(Integer)
    pub_rec: Mapped[int | None] = mapped_column(Integer)
    revol_bal: Mapped[float | None] = mapped_column(Float)
    revol_util: Mapped[float | None] = mapped_column(Float)
    total_acc: Mapped[int | None] = mapped_column(Integer)
    pub_rec_bankruptcies: Mapped[float | None] = mapped_column(Float)
    model_probability: Mapped[float | None] = mapped_column(Float, index=True)
    risk_level: Mapped[str | None] = mapped_column(String(10), index=True)

class Prediction(Base):
    __tablename__ = "predictions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    applicant_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    default_probability: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(10), index=True)
    model_version: Mapped[str] = mapped_column(String(80))
    payload: Mapped[dict] = mapped_column(JSON)
    explanation: Mapped[dict] = mapped_column(JSON)

Index("ix_loans_grade_issue_date", Loan.grade, Loan.issue_date)
Index("ix_predictions_created_risk", Prediction.created_at, Prediction.risk_level)
