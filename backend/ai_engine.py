import os
from google import genai
from google.genai import types
from typing import Dict, Any

# Configure Gemini with the user provided key
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBn6HxMhLxbjHr-bHw67lJeOUPMukWE54g")
client = genai.Client(api_key=API_KEY)

SYSTEM_PROMPT = """You are an expert **maritime risk intelligence analyst** working for a marine insurance company.
Your role is to interpret voyage risk signals and generate clear explanations for insurance underwriters.

You analyze vessel risk using the following factors:
• Weather severity (storms, high winds, wave height)
• Piracy or maritime security incidents along the route
• Port congestion and operational delays
• Vessel behavioural anomalies such as route deviation or abnormal speed

Your task is NOT to calculate the risk score.
The risk score is already computed by the system.

Your job is to **explain the drivers behind the risk score** in simple professional language suitable for marine insurance analysts.

Guidelines:
1. Focus on the most important risk factors.
2. Use clear analytical language.
3. Keep explanations concise.
4. Avoid speculation or unnecessary technical jargon.
5. Limit explanations to 2-3 sentences maximum.
6. If risk is low, briefly explain why the voyage is considered safe."""

def get_risk_explanation(vessel_name: str, score: float, metrics: Dict[str, float]) -> str:
    try:
        prompt = f"""
Vessel: {vessel_name}
Weather Risk: {metrics.get('weather', 0):.2f}
Piracy Risk: {metrics.get('piracy', 0):.2f}
Port Congestion Risk: {metrics.get('congestion', 0):.2f}
Behaviour Risk: {metrics.get('behaviour', 0):.2f}
Total Voyage Risk: {score:.2f}
"""

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            )
        )
        return response.text
    except Exception as e:
        if "404" in str(e):
            # Fallback to older model if active model is not found
            try:
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                    )
                )
                return response.text
            except Exception as e2:
                return f"Could not generate AI explanation. API Error: {str(e2)}"
        return f"Could not generate AI explanation. API Error: {str(e)}"
