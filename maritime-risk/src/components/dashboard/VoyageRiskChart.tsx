import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface VoyageRiskChartProps {
  factors: {
    incident_rate: number;
    maintenance_impact: number;
    route_risk: number;
    weather_risk: number;
  };
}

export function VoyageRiskChart({ factors }: VoyageRiskChartProps) {
  const data = [
    { subject: "Incidents", value: factors.incident_rate },
    { subject: "Maintenance", value: factors.maintenance_impact },
    { subject: "Route", value: factors.route_risk },
    { subject: "Weather", value: factors.weather_risk },
    { subject: "Traffic", value: 45 }, // Simulated
    { subject: "Piracy", value: 30 }, // Simulated
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
        <Card className="border-none bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400">Risk Factor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Radar
                    name="RiskFactor"
                    dataKey="value"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                    itemStyle={{ color: "#0ea5e9" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
    </motion.div>
  );
}
