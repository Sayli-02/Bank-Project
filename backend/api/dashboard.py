from fastapi import APIRouter
from typing import Dict, Any
from etl.db import engine
import pandas as pd

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/executive")
def get_executive_dashboard() -> Dict[str, Any]:
    """
    Returns aggregated KPIs and chart data for the Executive Dashboard.
    """
    df = pd.read_sql_table('customers', engine)
    
    # 1. KPIs
    total_customers = len(df)
    churn_rate = (df['churned'].sum() / total_customers) * 100
    avg_clv = df['clv'].mean()
    # Using balance of churned customers as a proxy for "Revenue at Risk" for now
    revenue_at_risk = df[df['churned'] == 1]['balance'].sum()
    
    kpis = {
        "total_customers": total_customers,
        "churn_rate": round(churn_rate, 1),
        "avg_clv": round(avg_clv, 2),
        "revenue_at_risk": float(revenue_at_risk)
    }
    
    # 2. Revenue at Risk by Geography
    # Group by geography and sum balance for churned customers
    geo_risk = df[df['churned'] == 1].groupby('geography')['balance'].sum().reset_index()
    revenue_by_geo = [
        {"name": row['geography'], "value": float(row['balance'])}
        for _, row in geo_risk.iterrows()
    ]
    
    # 3. Mock Historical Churn Trend
    # "Illustrative trend — historical data pending"
    mock_trend = [
        {"month": "Jan", "rate": 18.2},
        {"month": "Feb", "rate": 19.5},
        {"month": "Mar", "rate": 19.8},
        {"month": "Apr", "rate": 20.4},
        {"month": "May", "rate": 21.0},
        {"month": "Jun", "rate": round(churn_rate, 1)} # Anchor to current rate
    ]
    
    return {
        "kpis": kpis,
        "revenue_by_geography": revenue_by_geo,
        "churn_trend": mock_trend
    }
