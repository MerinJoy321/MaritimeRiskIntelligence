from fastapi import FastAPI, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add scripts directory to path to import risk_scoring
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))
import risk_scoring

app = FastAPI(title="Maritime Risk Intelligence API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Maritime Risk Intelligence API is online"}

@app.get("/vessel-risk/{vessel_id}")
async def get_vessel_risk(vessel_id: str):
    profile = risk_scoring.generate_vessel_profile(vessel_id)
    if not profile:
        return {"error": "Vessel not found"}
    return profile

@app.get("/voyage-risk")
async def get_voyage_risk(
    vessel_id: str = Query(...),
    origin: str = Query(...),
    destination: str = Query(...)
):
    route = f"{origin} → {destination}"
    risk_data = risk_scoring.calculate_voyage_risk(vessel_id, route)
    if not risk_data:
        return {"error": "Could not calculate risk"}
    return risk_data

@app.get("/vessels")
async def get_vessels():
    return risk_scoring.get_all_vessels()

@app.post("/add-vessel")
async def add_vessel(request: Request):
    data = await request.json()
    success = risk_scoring.add_new_vessel(data)
    if not success:
        return {"error": "Failed to add vessel"}
    return {"message": "Vessel added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
