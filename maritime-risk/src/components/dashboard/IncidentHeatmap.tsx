import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export function IncidentHeatmap() {
  // Simplified heatmap simulation
  const points = [
    { x: 30, y: 40, size: 20, intensity: "bg-rose-500/40" },
    { x: 60, y: 30, size: 15, intensity: "bg-orange-500/40" },
    { x: 45, y: 70, size: 25, intensity: "bg-rose-600/50" },
    { x: 80, y: 50, size: 10, intensity: "bg-yellow-500/40" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="border-none bg-slate-900/50 backdrop-blur-xl h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Global Incident Density
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              
              {/* Heatmap points */}
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  className={cn("absolute rounded-full blur-xl", p.intensity)}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}%`,
                    height: `${p.size}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}

              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">High Risk Zone</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Monitoring</span>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
