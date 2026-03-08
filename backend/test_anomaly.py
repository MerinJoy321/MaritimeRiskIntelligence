"""
Behaviour Anomaly Detection Test
Verifies the ML-based anomaly detection logic.
"""

import pandas as pd
from anomaly_detector import detect_anomalies, behaviour_risk

def test_anomaly_detection():
    print("--- BEHAVIOUR ANOMALY DETECTION TEST ---")
    
    # Mock telemetry data: speed, heading_change, route_deviation
    data = {
        'speed': [12.5, 12.8, 12.2, 5.0, 12.6, 12.7],  # 5.0 is an outlier
        'heading_change': [2, 1, 3, 45, 2, 1],         # 45 is an outlier
        'route_deviation': [0.1, 0.2, 0.1, 2.5, 0.2, 0.1] # 2.5 is an outlier
    }
    
    df = pd.DataFrame(data)
    print("Input Telemetry:")
    print(df)
    
    # Detect
    result_df = detect_anomalies(df)
    print("\nDetection Results:")
    print(result_df)
    
    # Verify risk mapping
    print("\nRisk Mapping:")
    for idx, row in result_df.iterrows():
        risk = behaviour_risk(row['anomaly'])
        status = "ANOMALOUS" if row['anomaly'] == -1 else "NORMAL"
        print(f"Row {idx}: Status={status}, Risk Score={risk}")

if __name__ == "__main__":
    test_anomaly_detection()
