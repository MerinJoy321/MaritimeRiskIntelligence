import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: number;
  level: "low" | "medium" | "high";
}

export function RiskScoreCard({ score, level }: RiskScoreCardProps) {
  const getColor = () => {
    switch (level) {
      case "low": return "text-emerald-500";
      case "medium": return "text-amber-500";
      case "high": return "text-rose-500";
      default: return "text-primary";
    }
  };

  const getBgColor = () => {
      switch (level) {
        case "low": return "bg-emerald-500/10";
        case "medium": return "bg-amber-500/10";
        case "high": return "bg-rose-500/10";
        default: return "bg-primary/10";
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("overflow-hidden border-none bg-slate-900/50 backdrop-blur-xl", getBgColor())}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Voyage Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-4">
            <motion.span 
              className={cn("text-5xl font-bold tracking-tighter", getColor())}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {score.toFixed(1)}
            </motion.span>
            <Badge variant={level === "low" ? "success" : level === "medium" ? "secondary" : "destructive"}>
              {level.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={score} className="h-2" />
            <p className="text-xs text-slate-500">
              Score normalized based on historical and real-time factors.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
