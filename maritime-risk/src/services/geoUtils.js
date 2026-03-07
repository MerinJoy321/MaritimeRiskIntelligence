/**
 * Simple Euclidean distance between two lat/lon points.
 * Sufficient for small-scale demo calculations.
 */
export function distance(a, b) {
    const dx = a.lat - b.lat;
    const dy = a.lon - b.lon;
    return Math.sqrt(dx * dx + dy * dy);
}
