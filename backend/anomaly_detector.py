"""
Anomaly Detector Module
Uses Isolation Forest to detect abnormal vessel behaviour patterns.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """
    Trains an IsolationForest model to identify anomalies in vessel telemetry.
    
    Args:
        df (pd.DataFrame): Dataframe with columns ['speed', 'heading_change', 'route_deviation']
        
    Returns:
        pd.DataFrame: Original dataframe with an added 'anomaly' column.
    """
    # Initialize the model
    # contamination=0.05 implies we expect ~5% of data to be anomalous
    model = IsolationForest(contamination=0.05, random_state=42)
    
    # Fit and predict
    # 1 for normal, -1 for anomaly
    df['anomaly'] = model.fit_predict(df[['speed', 'heading_change', 'route_deviation']])
    
    return df

def behaviour_risk(anomaly: int) -> float:
    """
    Translates an ML-detected anomaly into a numeric risk score.
    
    Args:
        anomaly (int): Prediction from IsolationForest (1 or -1)
        
    Returns:
        float: 0.7 if anomalous, 0.1 if normal.
    """
    if anomaly == -1:
        return 0.7
    return 0.1
