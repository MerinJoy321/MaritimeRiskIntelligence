"""
Risk Pipeline Module
Orchestrates the entire risk analysis flow:
1. Risk Calculation
2. AI Explanation Generation
3. Data Integration
"""

import json
from risk_engine import calculate_risk, risk_level
from ai_engine import generate_ai_explanation
from mock_data import mock_vessels

def voyage_risk_pipeline(vessel_data: dict) -> dict:
    """
    Connects all modules to process a vessel's voyage risk.
    
    Args:
        vessel_data (dict): Dictionary with keys ['name', 'weather', 'piracy', 'congestion', 'behaviour']
        
    Returns:
        dict: Structured risk analysis report.
    """
    name = vessel_data.get("name", "Unknown Vessel")
    weather = vessel_data.get("weather", 0.0)
    piracy = vessel_data.get("piracy", 0.0)
    congestion = vessel_data.get("congestion", 0.0)
    behaviour = vessel_data.get("behaviour", 0.0)
    
    # 1. Compute total risk score
    score = calculate_risk(weather, piracy, congestion, behaviour)
    
    # 2. Determine risk level
    level = risk_level(score)
    
    # 3. Prepare data for AI explanation
    ai_input = {
        "vessel": name,
        "weather": weather,
        "piracy": piracy,
        "congestion": congestion,
        "behaviour": behaviour,
        "total": score
    }
    
    # 4. Generate AI explanation
    explanation = generate_ai_explanation(ai_input)
    
    # 5. Build Final Result
    return {
        "vessel": name,
        "weather_risk": weather,
        "piracy_risk": piracy,
        "congestion_risk": congestion,
        "behaviour_risk": behaviour,
        "risk_score": score,
        "risk_level": level,
        "ai_explanation": explanation
    }

if __name__ == "__main__":
    # Test script to run the pipeline for all mock vessels
    print("--- MARITIME VOYAGE RISK INTELLIGENCE PIPELINE TEST ---")
    
    for vessel in mock_vessels:
        result = voyage_risk_pipeline(vessel)
        print(json.dumps(result, indent=4))
        print("-" * 50)
