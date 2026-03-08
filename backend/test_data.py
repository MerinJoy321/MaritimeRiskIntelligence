from risk_model import calculate_risk

risk = calculate_risk(
    lat=12.5,
    lon=58.3,
    speed=14,
    congestion=0.6
)

print("Risk Score:", risk)