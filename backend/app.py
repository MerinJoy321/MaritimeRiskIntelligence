from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random

# Import our custom modules
from data_loader import load_vessel_data
from risk_model import calculate_risk

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)