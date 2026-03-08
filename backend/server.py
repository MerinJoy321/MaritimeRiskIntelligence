"""
FastAPI Server for Risk Intelligence Module
Provides REST API endpoints for the React frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the main pipeline function
from risk_pipeline import voyage_risk_pipeline

app = FastAPI(title="Maritime Risk Intelligence API")

# Configure CORS so the React app (typically on port 5173 or 5174) can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5176", "http://localhost:5177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoyageData(BaseModel):
    name: str
    weather: float
    piracy: float
    congestion: float
    behaviour: float

@app.post("/api/risk")
async def calculate_voyage_risk(data: VoyageData):
    """
    Endpoint to calculate risk and generate AI explanation for a voyage.
    """
    vessel_dict = data.dict()
    # Process through our pipeline
    result = voyage_risk_pipeline(vessel_dict)
    return result

@app.get("/api/health")
async def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "ok", "service": "Risk Intelligence Module"}

if __name__ == "__main__":
    # Start the server on port 8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
