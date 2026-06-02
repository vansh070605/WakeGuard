import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import ConfidenceChart from "./ConfidenceChart";

export default function LiveTracking() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      setHistory(h => {
        return [...h.slice(-60), { ear: e.detail.ear, mar: e.detail.mar }];
      });
    };

    window.addEventListener("telemetry", handler);
    return () => window.removeEventListener("telemetry", handler);
  }, []);

  return (
    <div className="glass-panel p-4 lg:p-6 rounded-3xl flex flex-col h-[140px] lg:h-[180px] shrink-0 mb-4">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-4 shrink-0">
        <Activity className="w-5 h-5 text-sky-500" />
        <span className="text-xs font-bold uppercase tracking-widest">LIVE TRACKING</span>
      </div>
      <div className="flex-1 -ml-4 relative">
        <div className="absolute inset-0">
          <ConfidenceChart data={history} />
        </div>
      </div>
    </div>
  );
}
