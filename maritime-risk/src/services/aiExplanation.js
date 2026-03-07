/**
 * Generates a textual explanation of the risk status based on the score and primary threats.
 * 
 * @param {number} riskScore - 0-100
 * @param {string} piracyRisk - Enum description (e.g., "HIGH", "MODERATE", "LOW")
 * @param {string} weatherRisk - Enum description
 * @returns {string} Human-readable explanation
 */
export const generateRiskExplanation = (riskScore, piracyRisk, weatherRisk) => {
  if (riskScore >= 75) {
    return `This voyage presents high voyage risk due to significant piracy hotspot exposure in transit zones and severe weather conditions. Immediate underwriter attention and enhanced security protocols are required.`;
  } else if (riskScore >= 40) {
    return `This voyage shows moderate voyage risk. While environmental threats are present, they are currently within manageable levels. Continuous monitoring is recommended.`;
  } else {
    return `This is a low risk voyage with stable maritime conditions. No immediate threats detected, and standard underwriting procedures are acceptable.`;
  }
};

/**
 * Generates a short paragraph summarizing the vessel's current status and risk.
 * 
 * @param {object} vessel - Vessel data object
 * @returns {string} Summary paragraph
 */
export const generateVoyageSummary = (vessel) => {
  const { name, route, riskScore } = vessel;
  
  let riskLevel = "low";
  let recommendation = "Standard monitoring.";

  if (riskScore >= 75) {
    riskLevel = "high";
    recommendation = "Apply additional monitoring and risk loading.";
  } else if (riskScore >= 40) {
    riskLevel = "moderate";
    recommendation = "Maintain standard surveillance.";
  }

  return `${name} currently shows a ${riskLevel} voyage risk score of ${riskScore} while transiting the ${route} route. ${
    riskScore >= 70 ? "Elevated piracy incidents and moderate weather conditions contribute to the increased risk level." : ""
  } ${recommendation}`;
};
