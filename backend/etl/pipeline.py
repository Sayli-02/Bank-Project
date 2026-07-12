import pandas as pd
import numpy as np

def clean_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Cleans the raw customer dataset.
    Returns the cleaned DataFrame and a dictionary of logging metrics.
    """
    metrics = {
        'initial_rows': len(df),
        'duplicates_removed': 0,
        'missing_values_filled': 0,
        'invalid_ages_fixed': 0,
        'outliers_winsorized': 0
    }

    # 1. Remove duplicates
    initial_len = len(df)
    df = df.drop_duplicates(subset=['customer_id'])
    metrics['duplicates_removed'] = initial_len - len(df)

    # 2. Handle missing values
    missing_before = df.isna().sum().sum()
    df['age'] = df['age'].fillna(df['age'].median())
    df['balance'] = df['balance'].fillna(df['balance'].median())
    df['gender'] = df['gender'].fillna(df['gender'].mode()[0])
    # Also fill geography in case we missed it
    df['geography'] = df['geography'].fillna(df['geography'].mode()[0])
    metrics['missing_values_filled'] = int(missing_before - df.isna().sum().sum())

    # 3. Standardize geography strings
    df['geography'] = df['geography'].str.strip().str.title()

    # 4. Fix invalid ages
    invalid_age_mask = (df['age'] < 18) | (df['age'] > 100)
    metrics['invalid_ages_fixed'] = int(invalid_age_mask.sum())
    # Cap ages to 18-100 range
    df.loc[df['age'] < 18, 'age'] = 18
    df.loc[df['age'] > 100, 'age'] = 100

    # 5. Winsorize outliers in balance and estimated_salary (cap at 99th percentile)
    balance_99 = df['balance'].quantile(0.99)
    salary_99 = df['estimated_salary'].quantile(0.99)
    
    outliers_balance = (df['balance'] > balance_99).sum()
    outliers_salary = (df['estimated_salary'] > salary_99).sum()
    metrics['outliers_winsorized'] = int(outliers_balance + outliers_salary)

    df.loc[df['balance'] > balance_99, 'balance'] = balance_99
    df.loc[df['estimated_salary'] > salary_99, 'estimated_salary'] = salary_99
    
    # Same for income since we duplicated estimated_salary to income
    df.loc[df['income'] > salary_99, 'income'] = salary_99

    metrics['final_rows'] = len(df)

    return df, metrics
