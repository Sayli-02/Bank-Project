import sys
import os

# Add backend to path so imports work when run from backend directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from etl.generate_data import generate_synthetic_data
from etl.pipeline import clean_data
from etl.db import engine, init_db, recreate_customers_table, Customer

def run_etl():
    print("--- Starting Phase 1 ETL Pipeline ---")
    
    # 1. Initialization
    init_db()
    recreate_customers_table()
    
    raw_path = '../data/raw_customers.csv'
    
    # 2. Generation
    print("Generating synthetic data...")
    generate_synthetic_data(num_samples=10000, output_path=raw_path)
    
    # 3. Ingestion & Cleaning
    print("Loading and cleaning data...")
    df_raw = pd.read_csv(raw_path)
    df_clean, metrics = clean_data(df_raw)
    
    print("\n--- Cleaning Summary ---")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    
    # 4. Loading to DB
    print("\nLoading to Database...")
    # Use to_sql for fast loading, append mode since we just recreated the table
    df_clean.to_sql('customers', con=engine, if_exists='append', index=False)
    
    print("ETL Pipeline completed successfully.")

if __name__ == "__main__":
    run_etl()
