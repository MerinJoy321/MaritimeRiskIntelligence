/**
 * Calculates the total voyage risk based on weighted parameters.
 * 
 * @param {number} weatherRisk - 0-100
 * @param {number} piracyRisk - 0-100
 * @param {number} congestionRisk - 0-100
 * @param {number} behaviourRisk - 0-100
 * @returns {number} Rounded risk score between 0 and 100
 */
export const calculateVoyageRisk = (weatherRisk, piracyRisk, congestionRisk, behaviourRisk) => {
  const risk = 
    (0.4 * weatherRisk) + 
    (0.3 * piracyRisk) + 
    (0.2 * congestionRisk) + 
    (0.1 * behaviourRisk);
  
  return Math.round(risk);
};

/**
 * Generates an example risk breakdown and calculates the total.
 * Useful for demoing individual risk components in UI components like Recharts.
 */
export const getVoyageRiskBreakdown = () => {
  // Mock values for a typical high-risk scenario
  const weatherRisk = 42;
  const piracyRisk = 22;
  const congestionRisk = 8;
  const behaviourRisk = 5;

  const totalRisk = calculateVoyageRisk(
    weatherRisk, 
    piracyRisk, 
    congestionRisk, 
    behaviourRisk
  );

  return {
    weatherRisk,
    piracyRisk,
    congestionRisk,
    behaviourRisk,
    totalRisk
  };
};
