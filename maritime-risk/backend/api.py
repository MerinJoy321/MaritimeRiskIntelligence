from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import requests
import os

app = FastAPI(title="Maritime Risk API")

# Add CORS so React frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
VESSELS_CSV = "data/processed_vessels.csv"
RISK_FEATURES_CSV = "data/risk_features.csv"

# Models
class AIExplanationRequest(BaseModel):
    vessel_id: str
    weather_risk: float
    piracy_risk: float
    congestion_risk: float
    behaviour_risk: float
    total_risk: float

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "message": "Maritime Risk API is running"
    }

@app.get("/api/vessels")
async def get_vessels():
    try:
        if not os.path.exists(VESSELS_CSV):
            # Fallback/Mock logic if CSV is missing
            return {
                "vessels": [
                    {"vessel_id": "MV Ocean Star", "lat": 21.4, "lon": 63.8, "speed": 14.2},
                    {"vessel_id": "MT Blue Wave", "lat": 14.6, "lon": 52.1, "speed": 12.5}
                ]
            }
        
        df = pd.read_csv(VESSELS_CSV)
        vessels = df.to_dict(orient="records")
        return {"vessels": vessels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voyage-risk/{vessel_id}")
async def get_voyage_risk(vessel_id: str):
    try:
        if not os.path.exists(RISK_FEATURES_CSV):
            raise HTTPException(status_code=404, detail="Risk features data not found")
        
        df = pd.read_csv(RISK_FEATURES_CSV)
        vessel_data = df[df["vessel_id"] == vessel_id]
        
        if vessel_data.empty:
            raise HTTPException(status_code=404, detail=f"Vessel {vessel_id} not found")
        
        row = vessel_data.iloc[0]
        weather = float(row.get("weather_risk", 0))
        piracy = float(row.get("piracy_risk", 0))
        congestion = float(row.get("congestion_risk", 0))
        behaviour = float(row.get("behaviour_risk", 0))
        
        # Risk formula
        total_risk = (0.4 * weather) + (0.3 * piracy) + (0.2 * congestion) + (0.1 * behaviour)
        total_risk = round(total_risk, 2)
        
        # Classification
        if total_risk < 0.3:
            level = "Low"
        elif total_risk < 0.6:
            level = "Medium"
        else:
            level = "High"
            
        return {
            "vessel_id": vessel_id,
            "weather_risk": weather,
            "piracy_risk": piracy,
            "congestion_risk": congestion,
            "behaviour_risk": behaviour,
            "total_risk": total_risk,
            "risk_level": level
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/route-simulation")
async def route_simulation(origin: str = "Dubai", destination: str = "Singapore"):
    return {
        "origin": origin,
        "destination": destination,
        "route": [
            {"lat": 25.20, "lon": 55.27, "risk": 0.2},
            {"lat": 20.50, "lon": 60.10, "risk": 0.4},
            {"lat": 15.90, "lon": 65.00, "risk": 0.7},
            {"lat": 10.30, "lon": 75.20, "risk": 0.5},
            {"lat": 1.29, "lon": 103.85, "risk": 0.3}
        ]
    }

@app.get("/api/anomaly/{vessel_id}")
async def get_anomaly(vessel_id: str):
    return {
        "vessel_id": vessel_id,
        "anomaly_score": 0.81,
        "anomaly_flag": True,
        "reason": "Route deviation and unusual speed drop detected"
    }

@app.post("/api/ai-explanation")
async def ai_explanation(data: AIExplanationRequest):
    prompt = (
        f"You are a maritime insurance risk analyst. Explain the voyage risk for {data.vessel_id} in 2 short sentences. "
        f"The risk parameters are: weather {data.weather_risk}, piracy {data.piracy_risk}, "
        f"congestion {data.congestion_risk}, and behaviour {data.behaviour_risk}. "
        f"The total risk score is {data.total_risk}."
    )
    
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        # Call local Ollama endpoint
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        
        return {
            "vessel_id": data.vessel_id,
            "explanation": result.get("response", "No explanation generated.")
        }
    except requests.exceptions.RequestException as e:
        return {
            "vessel_id": data.vessel_id,
            "explanation": f"AI service unavailable (Ollama error). Local risk data: {data.total_risk}. Error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Runnable command:
# uvicorn api:app --reload
