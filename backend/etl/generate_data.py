import numpy as np
import pandas as pd
import os

def generate_synthetic_data(num_samples=10000, output_path='../data/raw_customers.csv'):
    np.random.seed(42)

    # Base features
    customer_id = np.arange(1, num_samples + 1)
    age = np.random.normal(45, 15, num_samples).astype(int)
    gender = np.random.choice(['Male', 'Female'], num_samples, p=[0.52, 0.48])
    geography = np.random.choice(
        ['New York', 'London', 'Paris', 'Frankfurt', 'Madrid'], 
        num_samples, 
        p=[0.3, 0.25, 0.2, 0.15, 0.1]
    )
    credit_score = np.random.normal(650, 80, num_samples).astype(int)
    balance = np.random.normal(100000, 50000, num_samples)
    balance = np.where(balance < 0, 0, balance) # No negative balances originally
    num_products = np.random.choice([1, 2, 3, 4], num_samples, p=[0.5, 0.4, 0.08, 0.02])
    tenure_years = np.random.randint(0, 11, num_samples)
    is_active_member = np.random.choice([0, 1], num_samples, p=[0.48, 0.52])
    estimated_salary = np.random.uniform(20000, 200000, num_samples)
    card_type = np.random.choice(['Silver', 'Gold', 'Platinum'], num_samples, p=[0.5, 0.3, 0.2])
    num_complaints = np.random.poisson(0.5, num_samples)
    digital_banking_usage = np.random.choice([0, 1], num_samples, p=[0.3, 0.7])

    # Churn probability calculation based on multiple factors
    risk_score = np.zeros(num_samples)

    # 1. Base strong predictors
    risk_score += np.where(num_complaints > 0, 1.5 * num_complaints, 0)
    risk_score += np.where(num_products == 1, 1.0, -0.5)
    risk_score += np.where(tenure_years <= 2, 0.8, -0.2)
    risk_score += np.where(is_active_member == 0, 0.5, -0.5)

    # 2. Richer correlations (as requested)
    # Age: young (18-25) and near-retirement (60+) higher churn
    risk_score += np.where(age < 26, 0.6, 0)
    risk_score += np.where(age > 60, 0.4, 0)
    # Geography: Paris and Frankfurt have elevated churn
    risk_score += np.where(np.isin(geography, ['Paris', 'Frankfurt']), 0.7, 0)
    # Credit score: low credit score -> higher churn
    risk_score += np.where(credit_score < 550, 0.5, 0)
    # Card type: Silver churns a bit more than Platinum
    risk_score += np.where(card_type == 'Silver', 0.3, 0)
    risk_score += np.where(card_type == 'Platinum', -0.4, 0)

    # Calculate probabilities using sigmoid
    prob_churn = 1 / (1 + np.exp(-(risk_score - 2.5))) # Shifted for ~20-25% average churn rate
    churned = np.random.binomial(1, prob_churn)

    df = pd.DataFrame({
        'customer_id': customer_id,
        'age': age,
        'gender': gender,
        'geography': geography,
        'income': estimated_salary, # Assuming income is estimated_salary based on schema
        'credit_score': credit_score,
        'balance': balance,
        'num_products': num_products,
        'tenure_years': tenure_years,
        'is_active_member': is_active_member,
        'estimated_salary': estimated_salary,
        'card_type': card_type,
        'num_complaints': num_complaints,
        'digital_banking_usage': digital_banking_usage,
        'churned': churned
    })

    # Inject deliberate errors for the ETL pipeline to fix
    # Missing values
    df.loc[np.random.choice(df.index, 100, replace=False), 'age'] = np.nan
    df.loc[np.random.choice(df.index, 50, replace=False), 'gender'] = np.nan
    df.loc[np.random.choice(df.index, 150, replace=False), 'balance'] = np.nan
    
    # Geography standardization issues
    dirty_geo = np.random.choice(df.index, 200, replace=False)
    df.loc[dirty_geo, 'geography'] = df.loc[dirty_geo, 'geography'].apply(lambda x: f" {x.lower()} ")

    # Invalid ages
    df.loc[np.random.choice(df.index, 20, replace=False), 'age'] = -5
    df.loc[np.random.choice(df.index, 20, replace=False), 'age'] = 150

    # Outliers
    df.loc[np.random.choice(df.index, 10, replace=False), 'balance'] = 10000000 # 10 million
    df.loc[np.random.choice(df.index, 10, replace=False), 'estimated_salary'] = 5000000 # 5 million

    # Duplicates (create 50 duplicate rows)
    duplicates = df.sample(50)
    df = pd.concat([df, duplicates], ignore_index=True)

    # Save to CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows with synthetic churn signals and saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_data()
