/**
 * Vessel Behaviour / Anomaly Detection Module
 * 
 * This module simulates an AI system that detects suspicious vessel behaviour
 * using rule-based logic. It is designed for use in maritime risk dashboards.
 */

/**
 * Detects suspicious behaviour based on vessel parameters.
 * 
 * @param {Object} vessel - The vessel data object.
 * @param {string} vessel.name - Name of the vessel.
 * @param {number} vessel.speed - Current speed of the vessel (knots).
 * @param {number} vessel.expectedSpeed - Expected speed for this route/vessel type (knots).
 * @param {number} vessel.aisGap - Time since last AIS signal (minutes).
 * @param {number} vessel.routeDeviation - Deviation from planned route (degrees).
 * @returns {Object|string} Detected anomalies and risk score, or "Normal vessel behaviour".
 */
export function detectBehaviour(vessel) {
  const anomalies = [];
  let riskScore = 0;

  // 1. Speed Anomaly: Slow Speed
  // Rule: If vessel speed is less than 50% of the expected speed.
  // Slow speed can indicate mechanical failure, smuggling, or unauthorized boarding.
  if (vessel.speed < vessel.expectedSpeed * 0.5) {
    anomalies.push("Slow speed anomaly detected");
    riskScore += 30;
  }

  // 2. Speed Anomaly: High Speed
  // Rule: If vessel speed is more than 150% of the expected speed.
  // High speed might indicate an attempt to evade authorities or unusual urgency.
  if (vessel.speed > vessel.expectedSpeed * 1.5) {
    anomalies.push("High speed anomaly detected");
    riskScore += 20;
  }

  // 3. AIS Signal Loss
  // Rule: If the AIS gap is greater than 30 minutes.
  // "Dark" vessels often disable AIS to conceal their location and activities.
  if (vessel.aisGap > 30) {
    anomalies.push("AIS signal lost");
    riskScore += 40;
  }

  // 4. Route Deviation
  // Rule: If the route deviation is greater than 15 degrees.
  // Significant deviation from the planned course can indicate hijacking or illegal maneuvers.
  if (vessel.routeDeviation > 15) {
    anomalies.push("Route deviation detected");
    riskScore += 25;
  }

  // If no anomalies were identified, the vessel is behaving normally.
  if (anomalies.length === 0) {
    return "Normal vessel behaviour";
  }

  return {
    anomalies,
    riskScore
  };
}

/**
 * Demo vessel object for testing the behaviour detection logic.
 */
export const demoVessel = {
  name: "MV Ocean Star",
  speed: 6,
  expectedSpeed: 15,
  aisGap: 45,
  routeDeviation: 18
};
