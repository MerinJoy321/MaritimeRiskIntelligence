import { vessels } from "../data/vessels";

/**
 * Returns all available vessels in the dataset.
 */
export const getAllVessels = () => {
  return vessels;
};

/**
 * Finds a specific vessel by its unique ID.
 */
export const getVesselById = (id) => {
  return vessels.find((vessel) => vessel.id === id);
};

/**
 * Returns a list of vessels considered "High Risk" (Score >= 70).
 */
export const getHighRiskVessels = () => {
  return vessels.filter((vessel) => vessel.riskScore >= 70);
};

/**
 * Returns a list of vessels that are currently in transit.
 */
export const getActiveVessels = () => {
  return vessels.filter((vessel) => vessel.status === "En Route");
};
