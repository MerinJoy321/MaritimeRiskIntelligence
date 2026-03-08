import { useState, useEffect } from "react";
import { getVesselRisk, getVoyageRisk } from "@/lib/api";
import { RiskScoreCard } from "@/components/dashboard/RiskScoreCard";
import { VoyageRiskChart } from "@/components/dashboard/VoyageRiskChart";
import { VesselProfileCard } from "@/components/dashboard/VesselProfileCard";
import { IncidentHeatmap } from "@/components/dashboard/IncidentHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Ship, Globe, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [vesselId, setVesselId] = useState("V001");
  const [vesselRisk, setVesselRisk] = useState<any>(null);
  const [voyageRisk, setVoyageRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const vRisk = await getVesselRisk(vesselId);
    const voyRisk = await getVoyageRisk(vesselId, "Dubai", "Suez");
    setVesselRisk(vRisk);
    setVoyageRisk(voyRisk);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 lg:p-10 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
               <Globe className="w-8 h-8" />
            </div>
            MARITIME <span className="text-primary">RISK</span> INTEL
          </motion.h1>
          <p className="text-slate-500 mt-1 font-medium">Global AI Voyage Surveillance & Underwriting Intelligence</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
             <Ship className="w-4 h-4 text-slate-400" />
             <input 
                type="text" 
                value={vesselId} 
                onChange={(e) => setVesselId(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-24 font-bold"
                placeholder="Vessel ID"
             />
          </div>
          <button 
            onClick={fetchData}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> ANALYZE
          </button>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Skeleton className="h-64" />
           <Skeleton className="h-64" />
           <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Core Analytics */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {voyageRisk && (
                 <RiskScoreCard 
                    score={voyageRisk.voyage_risk_score} 
                    level={voyageRisk.risk_level} 
                 />
               )}
               <VesselProfileCard profile={vesselRisk} />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
               {voyageRisk && <VoyageRiskChart factors={voyageRisk.factors} />}
            </div>
          </div>

          {/* Right Column - Secondary Intel */}
          <div className="lg:col-span-4 space-y-6">
             <IncidentHeatmap />
             
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.8 }}
               className="p-6 rounded-xl bg-orange-500/10 border border-orange-500/20"
             >
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-3 text-sm italic">
                   <AlertTriangle className="w-4 h-4" /> REAL-TIME ADVISORY
                </div>
                <p className="text-xs text-orange-200/80 leading-relaxed">
                   Current route passes through <strong>High Congestion</strong> zones. 
                   Predictive model suggests 4.2h delay at current speed.
                   Weather patterns stable for next 72h.
                </p>
             </motion.div>
          </div>

        </div>
      )}

      {/* Footer Status */}
      <footer className="mt-12 pt-6 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          <div>System Status: <span className="text-emerald-500">OPTIMAL</span></div>
          <div>Neural Engine v2.4.1 // Real-time AIS Stream Active</div>
      </footer>
    </div>
  );
}
