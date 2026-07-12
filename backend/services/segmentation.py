import pandas as pd
from sklearn.cluster import KMeans
from etl.db import engine
import logging

logger = logging.getLogger(__name__)

# In-memory cache for clustering results
_cluster_cache = None

def clear_cache():
    global _cluster_cache
    _cluster_cache = None
    logger.info("Segmentation cache cleared.")

def get_segmented_customers() -> pd.DataFrame:
    """
    Fetches customers, applies K-Means clustering on the 4 engineered scores,
    maps the clusters to business segments, and returns the annotated DataFrame.
    """
    global _cluster_cache
    if _cluster_cache is not None:
        return _cluster_cache

    df = pd.read_sql_table('customers', engine)
    
    if len(df) == 0:
        return df
        
    features = ['clv', 'product_engagement_score', 'financial_health_score', 'customer_loyalty_score']
    
    # Fill any potential NaNs in features just to be safe
    X = df[features].fillna(0)
    
    # Run K-Means
    kmeans = KMeans(n_clusters=4, random_state=42, n_init='auto')
    df['cluster'] = kmeans.fit_predict(X)
    
    # Centroid mapping to business labels: Premium, Growth, At-Risk, Dormant
    centroids = pd.DataFrame(kmeans.cluster_centers_, columns=features)
    centroids['cluster'] = centroids.index
    
    # Composite scores for ranking
    centroids['composite_clv_loyalty'] = centroids['clv'] + centroids['customer_loyalty_score']
    centroids['composite_health_product'] = centroids['financial_health_score'] + centroids['product_engagement_score']
    
    # 1. Premium = Highest CLV + Loyalty
    premium_cluster = centroids.loc[centroids['composite_clv_loyalty'].idxmax(), 'cluster']
    
    # 2. Dormant = Lowest CLV + Loyalty
    dormant_cluster = centroids.loc[centroids['composite_clv_loyalty'].idxmin(), 'cluster']
    
    # Remaining two are Growth vs At-Risk
    remaining = centroids[~centroids['cluster'].isin([premium_cluster, dormant_cluster])]
    
    if len(remaining) == 2:
        # Growth = Higher Health + Product among the remaining
        growth_cluster = remaining.loc[remaining['composite_health_product'].idxmax(), 'cluster']
        # At-Risk is the last one
        at_risk_cluster = remaining[remaining['cluster'] != growth_cluster].iloc[0]['cluster']
    else:
        # Fallback if something weird happens (e.g. all overlapping)
        growth_cluster = -1
        at_risk_cluster = -1

    # Log centroids for sanity check
    logger.info("K-Means Centroids Mapping:")
    for _, row in centroids.iterrows():
        c_id = int(row['cluster'])
        label = "Unknown"
        if c_id == premium_cluster: label = "Premium"
        elif c_id == growth_cluster: label = "Growth"
        elif c_id == at_risk_cluster: label = "At-Risk"
        elif c_id == dormant_cluster: label = "Dormant"
        
        logger.info(f"Cluster {c_id} ({label}): CLV={row['clv']:.1f}, PE={row['product_engagement_score']:.1f}, FH={row['financial_health_score']:.1f}, Loyalty={row['customer_loyalty_score']:.1f}")

    label_map = {
        premium_cluster: 'Premium',
        growth_cluster: 'Growth',
        at_risk_cluster: 'At-Risk',
        dormant_cluster: 'Dormant'
    }
    
    df['segment'] = df['cluster'].map(label_map)
    
    _cluster_cache = df
    return df
