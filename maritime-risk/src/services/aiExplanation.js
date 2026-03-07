/**
 * AI Risk Explanation Service
 * Generates human-readable risk explanations and voyage summaries
 * for the Maritime Risk Intelligence dashboard.
 */

/**
 * Generates an AI-style risk explanation based on voyage risk factors.
 *
 * @param {number}  riskScore   - Overall voyage risk score (0–100)
 * @param {string}  piracyRisk  - Piracy threat level: "HIGH" | "MODERATE" | "LOW"
 * @param {string}  weatherRisk - Weather threat level: "SEVERE" | "MODERATE" | "LOW"
 * @returns {string} Natural-language risk explanation
 */
export function generateRiskExplanation(riskScore, piracyRisk, weatherRisk) {
  if (riskScore >= 75) {
    return (
      `⚠️ HIGH VOYAGE RISK — This voyage presents elevated risk due to ` +
      `active piracy hotspots (threat level: ${piracyRisk}) combined with ` +
      `severe weather conditions (threat level: ${weatherRisk}). ` +
      `Marine insurers should apply additional risk loading and require ` +
      `enhanced monitoring. Underwriter attention is strongly recommended ` +
      `before binding coverage.`
    );
  }

  if (riskScore >= 40) {
    return (
      `⚡ MODERATE VOYAGE RISK — This voyage carries moderate risk. ` +
      `Environmental threats are present (piracy: ${piracyRisk}, ` +
      `weather: ${weatherRisk}) but remain within manageable parameters. ` +
      `Continuous monitoring is recommended. Standard underwriting terms ` +
      `may apply with appropriate risk surcharge consideration.`
    );
  }

  return (
    `✅ LOW VOYAGE RISK — This voyage presents minimal risk. ` +
    `Maritime conditions are stable (piracy: ${piracyRisk}, ` +
    `weather: ${weatherRisk}). Standard underwriting terms are ` +
    `acceptable. No additional risk loading required.`
  );
}

/**
 * Generates a short voyage summary paragraph for a given vessel.
 *
 * @param {object} vessel - A vessel object from the dataset
 * @returns {string} Natural-language voyage summary
 */
export function generateVoyageSummary(vessel) {
  const level =
    vessel.riskScore >= 75
      ? "high"
      : vessel.riskScore >= 40
        ? "moderate"
        : "low";

  const recommendation =
    vessel.riskScore >= 75
      ? "Enhanced monitoring and additional risk loading are strongly recommended."
      : vessel.riskScore >= 40
        ? "Continued monitoring is advised; standard terms may apply with surcharge."
        : "Standard underwriting terms are acceptable with no additional action required.";

  return (
    `${vessel.name} (${vessel.type}, flag: ${vessel.flag}) currently ` +
    `shows a ${level} voyage risk score of ${vessel.riskScore} while ` +
    `transiting the ${vessel.route} route. Vessel reliability is rated ` +
    `at ${vessel.reliability}%. ${recommendation}`
  );
}
