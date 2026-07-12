import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from etl.db import engine
from typing import Dict, Any

# Simple in-memory cache
# Note: Since these stats are computed from DB data that only changes when the ETL pipeline 
# reruns (a separate process), this cache will keep serving stale results after a data 
# refresh until the FastAPI process restarts, OR until the /api/analytics/refresh endpoint is hit.
_cache = {}

def get_cached_df() -> pd.DataFrame:
    if "df" not in _cache:
        # Load from the customers table
        df = pd.read_sql_table('customers', engine)
        _cache["df"] = df
    return _cache["df"]

def clear_cache():
    """Invalidates the in-memory cache to force a re-fetch from the database."""
    _cache.clear()

def compute_correlations() -> Dict[str, Any]:
    if "correlations" in _cache:
        return _cache["correlations"]

    df = get_cached_df()
    cols = ['credit_score', 'balance', 'age']
    results = {}

    for col in cols:
        corr, p_value = stats.pearsonr(df[col], df['churned'])
        
        # Interpretation string
        direction = "higher" if corr > 0 else "lower"
        magnitude = "strong" if abs(corr) > 0.5 else "moderate" if abs(corr) > 0.3 else "weak"
        if p_value > 0.05:
            interp = f"There is no statistically significant correlation between {col} and churn."
        else:
            interp = f"There is a statistically significant, {magnitude} correlation indicating that {direction} {col.replace('_', ' ')} is associated with higher odds of churn."
            
        results[col] = {
            "coefficient": round(corr, 4),
            "p_value": round(p_value, 4),
            "interpretation": interp
        }
        
    _cache["correlations"] = results
    return results

def compute_chi_square() -> Dict[str, Any]:
    if "chi_square" in _cache:
        return _cache["chi_square"]

    df = get_cached_df()
    cols = ['gender', 'geography', 'card_type']
    results = {}

    for col in cols:
        contingency = pd.crosstab(df[col], df['churned'])
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
        
        if p_value > 0.05:
            interp = f"Customer {col.replace('_', ' ')} does not significantly impact churn."
        else:
            # Find the category with highest churn rate
            churn_rates = df.groupby(col)['churned'].mean()
            highest_cat = churn_rates.idxmax()
            lowest_cat = churn_rates.idxmin()
            interp = f"Customer {col.replace('_', ' ')} significantly impacts churn. Customers in the '{highest_cat}' group churn the most, while '{lowest_cat}' customers churn the least."
            
        results[col] = {
            "chi2_statistic": round(chi2, 4),
            "p_value": round(p_value, 4),
            "interpretation": interp
        }
        
    _cache["chi_square"] = results
    return results

def compute_anova() -> Dict[str, Any]:
    if "anova" in _cache:
        return _cache["anova"]

    df = get_cached_df()
    # Using geography instead of segment since segment is Phase 10
    group_col = 'geography'
    target_col = 'balance'
    
    groups = [group[target_col].values for name, group in df.groupby(group_col)]
    f_stat, p_value = stats.f_oneway(*groups)
    
    if p_value > 0.05:
        interp = f"There is no significant difference in average {target_col} across different {group_col}s."
    else:
        means = df.groupby(group_col)[target_col].mean().sort_values(ascending=False)
        highest_grp = means.index[0]
        lowest_grp = means.index[-1]
        interp = f"Average {target_col} varies significantly by {group_col}. '{highest_grp}' has the highest average {target_col}, while '{lowest_grp}' has the lowest."

    result = {
        group_col: {
            "f_statistic": round(f_stat, 4),
            "p_value": round(p_value, 4),
            "interpretation": interp
        }
    }
    
    _cache["anova"] = result
    return result

def compute_logistic_regression() -> Dict[str, Any]:
    if "logistic_regression" in _cache:
        return _cache["logistic_regression"]

    df = get_cached_df()
    
    # Select interpretable numeric/boolean drivers
    features = ['age', 'num_products', 'num_complaints', 'tenure_years', 'is_active_member', 'balance']
    X = df[features].copy()
    y = df['churned']
    
    # Scale continuous features for the model so solver converges well,
    # but we will calculate odds ratios using standard deviation units or keep it simple.
    # We will use unscaled for direct interpretation, but max_iter=1000 for convergence.
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    
    results = {}
    for i, feature in enumerate(features):
        coef = model.coef_[0][i]
        odds_ratio = np.exp(coef)
        
        # Calculate impact direction clearly
        if odds_ratio > 1:
            increase_pct = (odds_ratio - 1) * 100
            interp = f"Each additional unit of {feature.replace('_', ' ')} is associated with a {increase_pct:.1f}% HIGHER odds of churn."
        else:
            decrease_pct = (1 - odds_ratio) * 100
            interp = f"Each additional unit of {feature.replace('_', ' ')} is associated with a {decrease_pct:.1f}% LOWER odds of churn."
            
        results[feature] = {
            "coefficient": round(coef, 4),
            "odds_ratio": round(odds_ratio, 4),
            "interpretation": interp
        }
    
    # Sort by absolute coefficient size (impact magnitude)
    sorted_results = {k: v for k, v in sorted(results.items(), key=lambda item: abs(item[1]['coefficient']), reverse=True)}
    
    _cache["logistic_regression"] = sorted_results
    return sorted_results
