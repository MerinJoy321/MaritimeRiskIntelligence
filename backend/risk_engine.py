"""
Risk Engine Module
Calculates maritime voyage risk scores using weighted rules.
"""

def calculate_risk(weather_risk: float, piracy_risk: float, congestion_risk: float, behaviour_risk: float) -> float:
    """
    Calculates the total voyage risk score based on weighted parameters.
    
    Args:
        weather_risk (float): Risk factor from weather (0.0 to 1.0)
        piracy_risk (float): Risk factor from piracy (0.0 to 1.0)
        congestion_risk (float): Risk factor from port congestion (0.0 to 1.0)
        behaviour_risk (float): Risk factor from vessel behaviour (0.0 to 1.0)
        
    Returns:
        float: Total risk score rounded to 2 decimals.
    """
    risk_score = (
        0.4 * weather_risk +
        0.3 * piracy_risk +
        0.2 * congestion_risk +
        0.1 * behaviour_risk
    )
    return round(float(risk_score), 2)

def risk_level(score: float) -> str:
    """
    Categorizes the risk score into human-readable levels.
    
    Args:
        score (float): The calculated risk score.
        
    Returns:
        str: "Low", "Medium", or "High".
    """
    if score < 0.3:
        return "Low"
    elif score < 0.6:
        return "Medium"
    else:
        return "High"
