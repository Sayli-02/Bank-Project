import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Index
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env.example") # using example as fallback if .env is not present

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local SQLite if DATABASE_URL is somehow missing
    # Important: local SQLite URL format requires 3 slashes for relative path, 4 for absolute.
    # postgresql:// is standard for postgres.
    DATABASE_URL = "sqlite:///../bank_churn.db"
elif DATABASE_URL.startswith("postgres://"):
    # SQLAlchemy 1.4+ requires postgresql:// instead of postgres://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
# If docker compose is not running locally, and it's set to localhost postgres, 
# it will fail. For demo purposes if Postgres is unavailable, we fallback to sqlite.
# A robust solution tries to connect and falls back, but let's try the DB URL first.
try:
    engine = create_engine(DATABASE_URL)
    engine.connect().close()
except Exception as e:
    print(f"Warning: Could not connect to {DATABASE_URL}. Falling back to SQLite for local dev. Error: {e}")
    DATABASE_URL = "sqlite:///../bank_churn.db"
    engine = create_engine(DATABASE_URL)


Base = declarative_base()

class Customer(Base):
    __tablename__ = 'customers'

    customer_id = Column(Integer, primary_key=True)
    age = Column(Integer)
    gender = Column(String)
    geography = Column(String)
    income = Column(Float)
    credit_score = Column(Integer)
    balance = Column(Float)
    num_products = Column(Integer)
    tenure_years = Column(Integer)
    is_active_member = Column(Integer)
    estimated_salary = Column(Float)
    card_type = Column(String)
    num_complaints = Column(Integer)
    digital_banking_usage = Column(Integer)
    transaction_frequency = Column(Integer)
    loan_repayment_status = Column(Integer)
    churned = Column(Integer)

    # Engineered Features (Phase 2)
    clv = Column(Float)
    product_engagement_score = Column(Float)
    financial_health_score = Column(Float)
    customer_loyalty_score = Column(Float)

    # Adding indexes as requested for dashboards
    __table_args__ = (
        Index('idx_geography', 'geography'),
        Index('idx_churned', 'churned'),
        Index('idx_card_type', 'card_type'),
    )

class Complaint(Base):
    __tablename__ = 'complaints'
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer)
    complaint_type = Column(String)

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer)
    amount = Column(Float)

class Segment(Base):
    __tablename__ = 'segments'
    customer_id = Column(Integer, primary_key=True)
    segment = Column(String)

def init_db():
    Base.metadata.create_all(engine)

def recreate_customers_table():
    """Drops and recreates the customers table for idempotent loading."""
    Customer.__table__.drop(engine, checkfirst=True)
    Customer.__table__.create(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
