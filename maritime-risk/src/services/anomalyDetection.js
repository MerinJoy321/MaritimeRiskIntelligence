import { plannedRoute } from "../data/routeData";
import { distance } from "./geoUtils";

/**
 * Detects if the vessel has deviated from the planned shipping corridor.
 */
export function detectRouteDeviation(currentPosition) {
    if (!currentPosition) return false;
    
    let minDistance = Infinity;

    plannedRoute.forEach(point => {
        const d = distance(currentPosition, point);
        if (d < minDistance) minDistance = d;
    });

    // Threshold of 1.0 degree deviation for demo purposes
    return minDistance > 1.0;
}

/**
 * Detects speed anomalies relative to historical average.
 */
export function detectSpeedAnomaly(history, latest) {
    if (!history || history.length === 0) return false;
    
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    
    // Threshold: 1.6x historical average
    return latest > avg * 1.6;
}

/**
 * Perform Explainable AI (XAI) behavior analysis on vessel telemetry.
 */
export function analyzeVesselBehaviour(data) {
    const reasons = [];

    if (detectSpeedAnomaly(data.speedHistory, data.latestSpeed)) {
        reasons.push("Speed spike detected compared to historical average");
    }

    if (detectRouteDeviation(data.currentPosition)) {
        reasons.push("Route deviation from planned shipping corridor");
    }

    if (data.piracyZoneNearby) {
        reasons.push("Operating near piracy hotspot / high-risk zone");
    }

    // Static confidence scores for demo
    const isAnomaly = reasons.length > 0;
    const confidence = isAnomaly ? 0.87 : 0.98;

    return {
        anomaly: isAnomaly,
        reasons,
        confidence,
        severity: isAnomaly ? (reasons.length > 2 ? "high" : "medium") : "low"
    };
}

/**
 * Legacy support for the previous implementation
 */
export const detectVesselAnomaly = (speedHistory) => {
    const latest = speedHistory[speedHistory.length - 1];
    const history = speedHistory.slice(0, -1);
    const result = analyzeVesselBehaviour({
        speedHistory: history,
        latestSpeed: latest,
        currentPosition: null, // Legacy won't have this
        piracyZoneNearby: false
    });

    return {
        alert: result.anomaly,
        severity: result.severity,
        message: result.reasons[0] || "Vessel behaviour normal"
    };
};
