from fastapi import APIRouter
from typing import Dict, Any
from services import stats

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.post("/refresh")
def refresh_cache():
    """
    Clears the in-memory statistical cache.
    Must be called after an ETL pipeline run to ensure dashboards show fresh data.
    """
    stats.clear_cache()
    from services import segmentation
    segmentation.clear_cache()
    return {"status": "success", "message": "Analytics and segmentation caches cleared successfully."}

@router.get("/correlations")
def get_correlations() -> Dict[str, Any]:
    """Returns Pearson correlations for continuous variables against churn."""
    return stats.compute_correlations()

@router.get("/chi-square")
def get_chi_square() -> Dict[str, Any]:
    """Returns Chi-Square test results for categorical variables against churn."""
    return stats.compute_chi_square()

@router.get("/anova")
def get_anova() -> Dict[str, Any]:
    """Returns ANOVA test results for continuous variance across categorical groups."""
    return stats.compute_anova()

@router.get("/logistic-regression")
def get_logistic_regression() -> Dict[str, Any]:
    """Returns Logistic Regression odds ratios and interpretable insights for churn drivers."""
    return stats.compute_logistic_regression()
