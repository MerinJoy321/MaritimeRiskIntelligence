
const { detectBehaviour, demoVessel } = require('./maritime-risk/src/logic/behaviourDetection.js');

// Note: Since we are using ESM exports in the JS file and running in Node,
// we might need to handle the import differently or use a temporary modification.
// However, for a quick check, I'll just copy the logic or use a script that can handle ESM.

// Re-defining logic for scratch test because I cannot easily import ESM into CJS node without flags or package.json
function testDetectBehaviour(vessel) {
  const anomalies = [];
  let riskScore = 0;

  if (vessel.speed < vessel.expectedSpeed * 0.5) {
    anomalies.push("Slow speed anomaly detected");
    riskScore += 30;
  }
  if (vessel.speed > vessel.expectedSpeed * 1.5) {
    anomalies.push("High speed anomaly detected");
    riskScore += 20;
  }
  if (vessel.aisGap > 30) {
    anomalies.push("AIS signal lost");
    riskScore += 40;
  }
  if (vessel.routeDeviation > 15) {
    anomalies.push("Route deviation detected");
    riskScore += 25;
  }

  if (anomalies.length === 0) return "Normal vessel behaviour";
  return { anomalies, riskScore };
}

const cases = [
  {
    name: "Normal Vessel",
    vessel: { speed: 10, expectedSpeed: 10, aisGap: 5, routeDeviation: 2 },
    expected: "Normal vessel behaviour"
  },
  {
    name: "Slow Speed Only",
    vessel: { speed: 4, expectedSpeed: 10, aisGap: 5, routeDeviation: 2 },
    expected: { riskScore: 30 }
  },
  {
    name: "High Speed Only",
    vessel: { speed: 16, expectedSpeed: 10, aisGap: 5, routeDeviation: 2 },
    expected: { riskScore: 20 }
  },
  {
    name: "AIS Gap Only",
    vessel: { speed: 10, expectedSpeed: 10, aisGap: 31, routeDeviation: 2 },
    expected: { riskScore: 40 }
  },
  {
    name: "Deviation Only",
    vessel: { speed: 10, expectedSpeed: 10, aisGap: 5, routeDeviation: 16 },
    expected: { riskScore: 25 }
  },
  {
    name: "Demo Vessel (Slow + AIS + Deviation)",
    vessel: { speed: 6, expectedSpeed: 15, aisGap: 45, routeDeviation: 18 },
    expected: { riskScore: 95 } // 30 (slow) + 40 (ais) + 25 (deviation) = 95
  }
];

cases.forEach(c => {
  const result = testDetectBehaviour(c.vessel);
  console.log(`Test: ${c.name}`);
  if (typeof result === 'string') {
    console.log(`Result: ${result}`);
  } else {
    console.log(`Anomalies: ${result.anomalies.join(', ')}`);
    console.log(`Risk Score: ${result.riskScore}`);
  }
  console.log('---');
});
