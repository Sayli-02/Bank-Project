from fastapi import APIRouter
from typing import Dict, Any
from etl.db import engine
import pandas as pd
from services import stats

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

@router.get("/insights")
def get_insights_dashboard(
    geography: str = None,
    gender: str = None,
    card_type: str = None,
    age_band: str = None
) -> Dict[str, Any]:
    """
    Returns demographic and geographic distributions.
    Supports cross-filtering via query parameters.
    """
    df = pd.read_sql_table('customers', engine)
    
    # Define age bands before filtering
    bins = [17, 30, 45, 60, 120]
    labels = ['18-30', '31-45', '46-60', '60+']
    df['age_band'] = pd.cut(df['age'], bins=bins, labels=labels)
    
    # Apply filters
    if geography:
        df = df[df['geography'] == geography]
    if gender:
        df = df[df['gender'] == gender]
    if card_type:
        df = df[df['card_type'] == card_type]
    if age_band:
        df = df[df['age_band'] == age_band]
        
    def get_dist_and_churn(col: str):
        if len(df) == 0:
            return []
        grouped = df.groupby(col).agg(
            count=('customer_id', 'count'),
            churn_count=('churned', 'sum')
        ).reset_index()
        grouped['churn_rate'] = (grouped['churn_count'] / grouped['count']) * 100
        # Return as list of dicts, fillna for NaNs
        return [
            {
                "name": str(row[col]), 
                "count": int(row['count']), 
                "churn_rate": round(float(row['churn_rate']) if pd.notna(row['churn_rate']) else 0, 1)
            }
            for _, row in grouped.iterrows()
        ]

    return {
        "age_distribution": get_dist_and_churn('age_band'),
        "gender_split": get_dist_and_churn('gender'),
        "geographic_churn": get_dist_and_churn('geography'),
        "segment_distribution": get_dist_and_churn('card_type')
    }

@router.get("/product")
def get_product_dashboard(
    geography: str = None,
    gender: str = None,
    card_type: str = None,
    age_band: str = None
) -> Dict[str, Any]:
    """
    Returns product ownership and impact on retention.
    Supports cross-filtering via query parameters.
    """
    df = pd.read_sql_table('customers', engine)
    
    # Define age bands before filtering
    bins = [17, 30, 45, 60, 120]
    labels = ['18-30', '31-45', '46-60', '60+']
    df['age_band'] = pd.cut(df['age'], bins=bins, labels=labels)
    
    # Apply filters
    if geography:
        df = df[df['geography'] == geography]
    if gender:
        df = df[df['gender'] == gender]
    if card_type:
        df = df[df['card_type'] == card_type]
    if age_band:
        df = df[df['age_band'] == age_band]

    if len(df) == 0:
        return {
            "product_breakdown": [],
            "product_combinations": []
        }
        
    # 1. Product Ownership Breakdown
    ownership = df.groupby('num_products').agg(
        count=('customer_id', 'count'),
        churn_count=('churned', 'sum')
    ).reset_index()
    ownership['churn_rate'] = (ownership['churn_count'] / ownership['count']) * 100
    
    product_breakdown = [
        {
            "num_products": int(row['num_products']),
            "count": int(row['count']),
            "churn_rate": round(float(row['churn_rate']) if pd.notna(row['churn_rate']) else 0, 1)
        }
        for _, row in ownership.iterrows()
    ]
    
    # 2. Product Combination Retention Impact
    combo = df.groupby(['num_products', 'card_type']).agg(
        count=('customer_id', 'count'),
        churn_count=('churned', 'sum')
    ).reset_index()
    combo['churn_rate'] = (combo['churn_count'] / combo['count']) * 100
    
    product_combinations = [
        {
            "num_products": int(row['num_products']),
            "card_type": str(row['card_type']),
            "count": int(row['count']),
            "churn_rate": round(float(row['churn_rate']) if pd.notna(row['churn_rate']) else 0, 1)
        }
        for _, row in combo.iterrows()
    ]
    
    return {
        "product_breakdown": product_breakdown,
        "product_combinations": product_combinations
    }

@router.get("/churn")
def get_churn_dashboard(
    geography: str = None,
    gender: str = None,
    card_type: str = None,
    age_band: str = None
) -> Dict[str, Any]:
    """
    Returns data for the Churn Dashboard (Phase 8).
    """
    df = pd.read_sql_table('customers', engine)
    
    bins = [17, 30, 45, 60, 120]
    labels = ['18-30', '31-45', '46-60', '60+']
    df['age_band'] = pd.cut(df['age'], bins=bins, labels=labels)

    # Income bands
    income_bins = [-1, 50000, 100000, 150000, float('inf')]
    income_labels = ['<50k', '50k-100k', '100k-150k', '150k+']
    df['income_band'] = pd.cut(df['estimated_salary'], bins=income_bins, labels=income_labels)
    
    if geography: df = df[df['geography'] == geography]
    if gender: df = df[df['gender'] == gender]
    if card_type: df = df[df['card_type'] == card_type]
    if age_band: df = df[df['age_band'] == age_band]

    def get_churn_by(col: str):
        if len(df) == 0: return []
        grouped = df.groupby(col).agg(
            count=('customer_id', 'count'),
            churn_count=('churned', 'sum')
        ).reset_index()
        grouped['churn_rate'] = (grouped['churn_count'] / grouped['count']) * 100
        return [
            {
                "name": str(row[col]), 
                "count": int(row['count']), 
                "churn_rate": round(float(row['churn_rate']) if pd.notna(row['churn_rate']) else 0, 1)
            }
            for _, row in grouped.iterrows()
        ]

    # Mock monthly trend based on current churn rate
    current_churn = (df['churned'].sum() / len(df) * 100) if len(df) > 0 else 0
    mock_trend = [
        {"month": "Jan", "rate": max(0, round(current_churn - 2.8, 1))},
        {"month": "Feb", "rate": max(0, round(current_churn - 1.5, 1))},
        {"month": "Mar", "rate": max(0, round(current_churn - 1.2, 1))},
        {"month": "Apr", "rate": max(0, round(current_churn - 0.6, 1))},
        {"month": "May", "rate": round(current_churn, 1)},
        {"month": "Jun", "rate": round(current_churn, 1)}
    ]

    # Logistic regression drivers (we use global stats, ignoring filters for simplicity since the model is precomputed)
    drivers = stats.compute_logistic_regression()
    
    return {
        "churn_trend": mock_trend,
        "churn_by_geography": get_churn_by('geography'),
        "churn_by_age": get_churn_by('age_band'),
        "churn_by_income": get_churn_by('income_band'),
        "churn_by_product": get_churn_by('num_products'),
        "top_drivers": drivers
    }

@router.get("/profitability")
def get_profitability_dashboard(
    geography: str = None,
    gender: str = None,
    card_type: str = None,
    age_band: str = None
) -> Dict[str, Any]:
    """
    Returns data for the Profitability Dashboard (Phase 9).
    """
    df = pd.read_sql_table('customers', engine)
    
    bins = [17, 30, 45, 60, 120]
    labels = ['18-30', '31-45', '46-60', '60+']
    df['age_band'] = pd.cut(df['age'], bins=bins, labels=labels)
    
    if geography: df = df[df['geography'] == geography]
    if gender: df = df[df['gender'] == gender]
    if card_type: df = df[df['card_type'] == card_type]
    if age_band: df = df[df['age_band'] == age_band]

    if len(df) == 0:
        return {
            "clv_distribution": [],
            "revenue_by_segment": [],
            "high_value_customers": [],
            "retention_opportunities": []
        }

    # Revenue by segment
    rev_seg = df.groupby('card_type')['balance'].sum().reset_index()
    revenue_by_segment = [
        {"name": str(row['card_type']), "value": float(row['balance'])}
        for _, row in rev_seg.iterrows()
    ]

    # CLV Distribution
    clv_bins = [0, 10000, 50000, 100000, 200000, float('inf')]
    clv_labels = ['<10k', '10k-50k', '50k-100k', '100k-200k', '200k+']
    df['clv_band'] = pd.cut(df['clv'], bins=clv_bins, labels=clv_labels)
    clv_dist = df.groupby('clv_band').size().reset_index(name='count')
    clv_distribution = [
        {"name": str(row['clv_band']), "count": int(row['count'])}
        for _, row in clv_dist.iterrows()
    ]

    # High Value Customers (Top 100 by CLV)
    high_val_df = df.sort_values(by='clv', ascending=False).head(100)
    high_value_customers = high_val_df.to_dict(orient='records')

    # Retention Opportunities: Active customers, high CLV, high risk proxy
    # Risk proxy = scale(num_complaints) * 50 + scale(100 - loyalty_score) * 50
    active_df = df[df['churned'] == 0].copy()
    if len(active_df) > 0:
        max_complaints = active_df['num_complaints'].max() or 1
        active_df['risk_score'] = ((active_df['num_complaints'] / max_complaints) * 50) + (((100 - active_df['loyalty_score']) / 100) * 50)
        # Top 100 opportunities
        opportunities_df = active_df.sort_values(by=['clv', 'risk_score'], ascending=[False, False]).head(100)
        
        # Add recommendation text based on business rules
        def get_recommendation(row):
            if row['num_products'] == 1:
                return "Cross-sell nudge for single-product customer"
            if row['risk_score'] > 60:
                return "Targeted loyalty offer for disengaged high-value customer"
            return "Personalized retention campaign"
            
        opportunities_df['recommendation'] = opportunities_df.apply(get_recommendation, axis=1)
        retention_opportunities = opportunities_df.to_dict(orient='records')
    else:
        retention_opportunities = []

    return {
        "clv_distribution": clv_distribution,
        "revenue_by_segment": revenue_by_segment,
        "high_value_customers": high_value_customers,
        "retention_opportunities": retention_opportunities
    }

@router.get("/segmentation")
def get_segmentation_dashboard(
    geography: str = None,
    gender: str = None,
    card_type: str = None,
    age_band: str = None,
    page: int = 1,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Returns data for the Segmentation & At-Risk Explorer (Phase 10).
    Includes scatter plot data and paginated customer list.
    """
    from services import segmentation
    df = segmentation.get_segmented_customers()
    
    if len(df) == 0:
        return {
            "scatter_data": [],
            "customers": [],
            "total_customers": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0
        }
        
    bins = [17, 30, 45, 60, 120]
    labels = ['18-30', '31-45', '46-60', '60+']
    df['age_band'] = pd.cut(df['age'], bins=bins, labels=labels)
    
    if geography: df = df[df['geography'] == geography]
    if gender: df = df[df['gender'] == gender]
    if card_type: df = df[df['card_type'] == card_type]
    if age_band: df = df[df['age_band'] == age_band]

    # Generate scatter plot data
    # We only need clv, customer_loyalty_score, segment, and id for scatter
    scatter_df = df[['customer_id', 'clv', 'customer_loyalty_score', 'segment']].copy()
    scatter_data = scatter_df.to_dict(orient='records')
    
    # Generate customer list
    # Add recommendation
    def get_recommendation(row):
        seg = row['segment']
        if seg == 'Premium':
            return "Targeted loyalty offer to maintain engagement"
        elif seg == 'Growth':
            if row['num_products'] == 1:
                return "Cross-sell nudges for single-product customer"
            return "Growth-oriented personalized campaign"
        elif seg == 'At-Risk':
            return "Prioritized outreach - High churn probability"
        elif seg == 'Dormant':
            return "Re-engagement campaign / Improved onboarding"
        return "No action"

    df['recommendation'] = df.apply(get_recommendation, axis=1)
    
    # Keep only relevant columns for table
    table_cols = [
        'customer_id', 'segment', 'clv', 'customer_loyalty_score', 
        'financial_health_score', 'product_engagement_score', 'recommendation'
    ]
    table_df = df[table_cols].copy()
    
    # Sort for consistency (e.g. by CLV descending)
    table_df = table_df.sort_values(by='clv', ascending=False)
    
    total_customers = len(table_df)
    total_pages = (total_customers + limit - 1) // limit
    
    # Paginate
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_df = table_df.iloc[start_idx:end_idx]
    customers = paginated_df.to_dict(orient='records')
    
    return {
        "scatter_data": scatter_data,
        "customers": customers,
        "total_customers": total_customers,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }
