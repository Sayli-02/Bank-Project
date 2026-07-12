import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# -----------------------------------------------------------------------------
# FEATURE WEIGHTS
# -----------------------------------------------------------------------------
# Product Engagement Score Weights:
# Heavily weighted toward product count as it's a direct stickiness metric (40%),
# digital usage drives regular habituation (35%), 
# and transaction frequency shows active use (25%).
WEIGHT_PE_PRODUCT_COUNT = 0.40
WEIGHT_PE_DIGITAL_USAGE = 0.35
WEIGHT_PE_TRANSACTION = 0.25

# Financial Health Score Weights:
# Credit score and balance are primary markers of wealth/solvency (35% each),
# while income and loan repayment are strong secondary indicators (15% each).
WEIGHT_FH_CREDIT_SCORE = 0.35
WEIGHT_FH_BALANCE = 0.35
WEIGHT_FH_INCOME = 0.15
WEIGHT_FH_LOAN = 0.15

# Customer Loyalty Score Weights:
# Tenure is the strongest historical indicator (40%),
# active membership shows current engagement (30%),
# product usage shows breadth of relationship (15%),
# and lack of complaints (inverse) shows satisfaction (15%).
WEIGHT_CL_TENURE = 0.40
WEIGHT_CL_ACTIVE = 0.30
WEIGHT_CL_PRODUCT = 0.15
WEIGHT_CL_COMPLAINTS_INV = 0.15

def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes and adds engineered scores (CLV, Product Engagement, Financial Health, Loyalty)
    Note: Min-Max normalization is population-relative. Re-running this on different data
    will scale scores differently based on the min/max of that specific run.
    """
    df = df.copy()
    
    # 1. Customer Lifetime Value (CLV)
    # Formula: (avg_balance * tenure * product_count_factor) - complaint_penalty
    # Product count factor assumes more products = higher multiplier on value
    product_factor = df['num_products'] * 1.2 
    complaint_penalty = df['num_complaints'] * 5000 # Penalty in dollar-equivalents
    
    raw_clv = (df['balance'] * df['tenure_years'] * product_factor) - complaint_penalty
    
    # 2. Product Engagement Score (raw)
    raw_pe = (
        df['num_products'] * WEIGHT_PE_PRODUCT_COUNT +
        df['digital_banking_usage'] * WEIGHT_PE_DIGITAL_USAGE +
        (df['transaction_frequency'] / 100) * WEIGHT_PE_TRANSACTION # Normalize transaction_frequency roughly 0-1
    )
    
    # 3. Financial Health Score (raw)
    raw_fh = (
        (df['credit_score'] / 850) * WEIGHT_FH_CREDIT_SCORE + # Credit score max ~850
        (df['balance'] / 200000) * WEIGHT_FH_BALANCE + # Cap rough balance
        (df['income'] / 200000) * WEIGHT_FH_INCOME + 
        df['loan_repayment_status'] * WEIGHT_FH_LOAN
    )
    
    # 4. Customer Loyalty Score (raw)
    # Inverse of complaints: max 0 complaints -> 1, >0 goes down
    complaints_inv = 1 / (1 + df['num_complaints'])
    raw_cl = (
        (df['tenure_years'] / 10) * WEIGHT_CL_TENURE +
        df['is_active_member'] * WEIGHT_CL_ACTIVE +
        (df['num_products'] / 4) * WEIGHT_CL_PRODUCT +
        complaints_inv * WEIGHT_CL_COMPLAINTS_INV
    )

    # Normalize all to 0-100 using MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 100))
    
    df['clv'] = scaler.fit_transform(raw_clv.values.reshape(-1, 1)).flatten()
    df['product_engagement_score'] = scaler.fit_transform(raw_pe.values.reshape(-1, 1)).flatten()
    df['financial_health_score'] = scaler.fit_transform(raw_fh.values.reshape(-1, 1)).flatten()
    df['customer_loyalty_score'] = scaler.fit_transform(raw_cl.values.reshape(-1, 1)).flatten()
    
    return df
