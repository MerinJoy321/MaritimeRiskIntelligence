/**
 * Vessel Data Service
 * Simulates an API layer for retrieving vessel data.
 */

import { vessels } from "../data/vessels";

/** Returns all vessels. */
export function getAllVessels() {
  return vessels;
}

/** Returns a single vessel by ID, or undefined if not found. */
export function getVesselById(id) {
  return vessels.find((v) => v.id === id);
}

/** Returns vessels with risk >= 70. */
export function getHighRiskVessels() {
  return vessels.filter((v) => v.risk >= 70);
}

/** Returns vessels currently en route. */
export function getActiveVessels() {
  return vessels.filter((v) => v.status === "En Route");
}
