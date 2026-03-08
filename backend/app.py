from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random

# Import our custom modules
from data_loader import load_vessel_data
from risk_model import calculate_risk
from ai_engine import get_risk_explanation

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Maritime Risk Intelligence API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VesselRiskRequest(BaseModel):
    mmsi: int
    lat: float
    lon: float
    speed: float
    congestion: float

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Maritime Risk Intelligence"}

@app.get("/vessels")
def get_vessels():
    try:
        df = load_vessel_data()
        
        # Calculate risk score for each vessel
        vessels = []
        for _, row in df.iterrows():
            vessel_data = row.to_dict()
            # Simulation: random congestion between 0 and 1
            congestion = random.uniform(0, 1)
            vessel_data['risk_score'] = calculate_risk(
                lat=row['LAT'],
                lon=row['LON'],
                speed=row['SOG'],
                congestion=congestion
            )
            vessel_data['congestion'] = round(congestion, 2)
            # Map column names for frontend if necessary (optional but good for clarity)
            vessel_data['lat'] = vessel_data['LAT']
            vessel_data['lon'] = vessel_data['LON']
            vessel_data['mmsi'] = vessel_data['MMSI']
            vessel_data['speed'] = vessel_data['SOG']
            vessels.append(vessel_data)
            
        return vessels
    except Exception as e:
        return {"error": str(e)}

@app.post("/calculate-risk")
def post_calculate_risk(request: VesselRiskRequest):
    risk_score = calculate_risk(
        lat=request.lat,
        lon=request.lon,
        speed=request.speed,
        congestion=request.congestion
    )
    return {
        "mmsi": request.mmsi,
        "risk_score": risk_score,
        "recommendation": "Monitor" if risk_score > 50 else "Safe"
    }

class AIRiskRequest(BaseModel):
    name: str
    weather: float
    piracy: float
    congestion: float
    behaviour: float

@app.post("/api/risk")
def calculate_ai_risk(request: AIRiskRequest):
    # Base risk driven by telemetry inputs from the frontend simulation
    score = (request.weather * 40) + (request.piracy * 30) + (request.congestion * 20) + (request.behaviour * 10)
    
    explanation = get_risk_explanation(
        vessel_name=request.name,
        score=score,
        metrics={
            "weather": request.weather,
            "piracy": request.piracy,
            "congestion": request.congestion,
            "behaviour": request.behaviour
        }
    )
    
    return {
        "voyage_risk_score": round(score, 1),
        "risk_level": "CRITICAL" if score >= 80 else "HIGH" if score >= 60 else "MODERATE" if score >= 30 else "LOW",
        "ai_explanation": explanation
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)