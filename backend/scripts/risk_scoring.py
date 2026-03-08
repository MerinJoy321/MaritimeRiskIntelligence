import pandas as pd
import numpy as np
import os

# Paths to data files
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
INCIDENTS_PATH = os.path.join(DATA_DIR, 'incidents.csv')
MAINTENANCE_PATH = os.path.join(DATA_DIR, 'maintenance.csv')
VOYAGES_PATH = os.path.join(DATA_DIR, 'voyages.csv')
VESSELS_PATH = os.path.join(DATA_DIR, 'vessels.csv')

def load_data():
    """Loads datasets from CSV files."""
    try:
        incidents = pd.read_csv(INCIDENTS_PATH)
        maintenance = pd.read_csv(MAINTENANCE_PATH)
        voyages = pd.read_csv(VOYAGES_PATH)
        vessels = pd.read_csv(VESSELS_PATH)
        return incidents, maintenance, voyages, vessels
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None, None, None

def calculate_incident_rate(vessel_id, incidents_df):
    """Computes incident frequency and severity for a vessel."""
    vessel_incidents = incidents_df[incidents_df['vessel_id'] == vessel_id]
    if vessel_incidents.empty:
        return 0
    
    # Simple rate calculation: sum of severities
    total_severity = vessel_incidents['severity'].sum()
    # Normalize (example: max 20 incidents/severity sum for a scale of 0-1)
    rate = min(total_severity / 20.0, 1.0)
    return rate

def get_maintenance_score(vessel_id, maintenance_df):
    """Retrieves and normalizes maintenance score."""
    vessel_maint = maintenance_df[maintenance_df['vessel_id'] == vessel_id]
    if vessel_maint.empty:
        return 0.5  # Neutral score if no data
    
    score = vessel_maint['maintenance_score'].iloc[0]
    # Normalize 0-100 to 0-1 (inverse because higher maintenance score should mean lower risk)
    normalized_risk_factor = 1.0 - (score / 100.0)
    return normalized_risk_factor

def get_route_risk(vessel_id, route, voyages_df):
    """Retrieves route risk factor."""
    # Simulation: if route matches a known high-risk route in voyages.csv
    matching_voyage = voyages_df[voyages_df['origin'] + ' → ' + voyages_df['destination'] == route]
    if not matching_voyage.empty:
        return matching_voyage['route_risk'].iloc[0] / 100.0
    
    # Generic risk based on vessel_id if no route match
    return 0.3 # Default medium-low risk

def simulate_weather_risk():
    """Simulates real-time weather risk factor (0-1)."""
    return np.random.uniform(0.1, 0.9)

def generate_vessel_profile(vessel_id):
    """Generates a comprehensive risk profile for a vessel."""
    incidents, maintenance, voyages, vessels = load_data()
    if incidents is None: return None

    total_incidents = len(incidents[incidents['vessel_id'] == vessel_id])
    maint_row = maintenance[maintenance['vessel_id'] == vessel_id]
    maint_score = maint_row['maintenance_score'].iloc[0] if not maint_row.empty else 0
    
    incident_rate = calculate_incident_rate(vessel_id, incidents)
    maint_factor = get_maintenance_score(vessel_id, maintenance)
    
    # Historical risk (simple average)
    historical_risk = (incident_rate + maint_factor) / 2.0 * 100

    return {
        "vessel_id": vessel_id,
        "total_incidents": total_incidents,
        "maintenance_score": int(maint_score),
        "historical_risk": round(historical_risk, 2)
    }

def calculate_voyage_risk(vessel_id, route):
    """Calculates total voyage risk score (0-100)."""
    incidents, maintenance, voyages, vessels = load_data()
    if incidents is None: return None

    incident_rate = calculate_incident_rate(vessel_id, incidents)
    maint_score = get_maintenance_score(vessel_id, maintenance)
    route_risk = get_route_risk(vessel_id, route, voyages)
    weather_risk = simulate_weather_risk()

    # Weighting: 40% incidents, 25% maintenance, 20% route, 15% weather
    raw_score = (
        0.4 * incident_rate +
        0.25 * maint_score +
        0.2 * route_risk +
        0.15 * weather_risk
    )

    risk_score = min(max(raw_score * 100, 0), 100)
    
    risk_level = "low"
    if risk_score > 60:
        risk_level = "high"
    elif risk_score > 30:
        risk_level = "medium"

    factors = {
        "incident_rate": round(incident_rate * 100, 1),
        "maintenance_impact": round(maint_score * 100, 1),
        "route_risk": round(route_risk * 100, 1),
        "weather_risk": round(weather_risk * 100, 1)
    }

    return {
        "vessel_id": vessel_id,
        "voyage_risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "factors": factors
    }

def get_all_vessels():
    """Returns a list of all vessels with their metadata."""
    incidents, maintenance, voyages, vessels = load_data()
    if vessels is None: return []
    return vessels.to_dict(orient='records')

def add_new_vessel(vessel_data):
    """
    Appends a new vessel and its initial data to CSVs.
    vessel_data: {vessel_id, name, flag, type, route, maintenance_score, reliability, ais, ...}
    """
    try:
        # 1. Update vessels.csv
        vessel_df = pd.DataFrame([{
            "vessel_id": vessel_data['vessel_id'],
            "name": vessel_data['name'],
            "flag": vessel_data['flag'],
            "type": vessel_data['type'],
            "route": vessel_data.get('route', 'Unknown'),
            "lat": vessel_data.get('lat', 0.0),
            "lng": vessel_data.get('lng', 0.0),
            "status": vessel_data.get('status', 'Port'),
            "reliability": vessel_data.get('reliability', 80),
            "tier": vessel_data.get('tier', 'LOW'),
            "ais": str(vessel_data.get('ais', True)).lower()
        }])
        vessel_df.to_csv(VESSELS_PATH, mode='a', header=False, index=False)

        # 2. Update maintenance.csv
        maint_df = pd.DataFrame([{
            "vessel_id": vessel_data['vessel_id'],
            "last_maintenance_date": "2026-03-01",
            "maintenance_score": vessel_data.get('maintenance_score', 80)
        }])
        maint_df.to_csv(MAINTENANCE_PATH, mode='a', header=False, index=False)

        return True
    except Exception as e:
        print(f"Error adding vessel: {e}")
        return False
