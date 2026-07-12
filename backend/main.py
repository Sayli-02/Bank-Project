from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Import SQLAlchemy setup
from etl.db import SessionLocal, Customer
from sqlalchemy.orm import Session

from api import analytics, dashboard

load_dotenv(dotenv_path="../.env.example") # Fallback to .env.example for demo if .env doesn't exist

app = FastAPI(title="Bank Churn Analytics API")
app.include_router(analytics.router)
app.include_router(dashboard.router)

# Configure CORS — allow all origins so Vercel frontend can reach the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Bank Churn Analytics API. This is just the backend data server! Please visit the frontend application (usually http://localhost:5173) to see the dashboards.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@app.get("/api/customers")
def get_customers(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    """Returns a list of customers, including engineered scores for dashboards."""
    customers = db.query(Customer).offset(offset).limit(limit).all()
    return {"customers": customers, "limit": limit, "offset": offset}

