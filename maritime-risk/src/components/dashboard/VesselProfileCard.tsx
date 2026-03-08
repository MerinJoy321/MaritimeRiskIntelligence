import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Anchor, ShieldAlert, Wrench, History } from "lucide-react";

interface VesselProfileCardProps {
  profile: {
    vessel_id: string;
    total_incidents: number;
    maintenance_score: number;
    historical_risk: number;
  };
}

export function VesselProfileCard({ profile }: VesselProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-none bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Anchor className="w-4 h-4" /> Vessel Risk Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{profile.vessel_id}</span>
            <Badge variant={profile.historical_risk > 50 ? "destructive" : "secondary"}>
                Reliability: {(100 - profile.historical_risk).toFixed(0)}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
               <div className="flex items-center gap-2 text-rose-400 text-xs mb-1">
                 <ShieldAlert className="w-3 h-3" /> Total Incidents
               </div>
               <div className="text-xl font-bold">{profile.total_incidents}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
               <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                 <Wrench className="w-3 h-3" /> Maintenance
               </div>
               <div className="text-xl font-bold">{profile.maintenance_score}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
               <History className="w-3 h-3" /> Historical Risk Trend
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.historical_risk}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
