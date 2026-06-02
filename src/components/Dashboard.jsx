import React, { useEffect, useState } from "react";
import { Activity, Eye, MessageSquare, AlertTriangle, CheckCircle2, Clock, Move3D, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [status, setStatus] = useState("Initializing…");
  const [ear, setEar] = useState(0);
  const [mar, setMar] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [perclos, setPerclos] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      setStatus(e.detail.status);
      setEar(e.detail.ear);
      setMar(e.detail.mar);
      setPitch(e.detail.pitch || 0);
      setYaw(e.detail.yaw || 0);
      setPerclos(e.detail.perclos || 0);
    };

    window.addEventListener("telemetry", handler);
    return () => window.removeEventListener("telemetry", handler);
  }, []);

  const getStatusColor = () => {
    switch(status) {
      case "Critical": return { text: "text-rose-600 dark:text-rose-400", border: "border-rose-400/50", bg: "bg-rose-50/90 dark:bg-rose-950/40", shadow: "shadow-rose-500/20", icon: <AlertTriangle className="w-7 h-7 text-rose-500" /> };
      case "Distracted": return { text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-400/50", bg: "bg-fuchsia-50/90 dark:bg-fuchsia-950/40", shadow: "shadow-fuchsia-500/20", icon: <EyeOff className="w-7 h-7 text-fuchsia-500" /> };
      case "Drowsy": return { text: "text-orange-600 dark:text-orange-400", border: "border-orange-400/50", bg: "bg-orange-50/90 dark:bg-orange-950/40", shadow: "shadow-orange-500/20", icon: <AlertTriangle className="w-7 h-7 text-orange-500" /> };
      case "Fatigued": return { text: "text-amber-600 dark:text-amber-400", border: "border-amber-400/50", bg: "bg-amber-50/90 dark:bg-amber-950/40", shadow: "shadow-amber-500/20", icon: <Clock className="w-7 h-7 text-amber-500" /> };
      case "Alert": return { text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-400/50", bg: "bg-emerald-50/90 dark:bg-emerald-950/40", shadow: "shadow-emerald-500/20", icon: <CheckCircle2 className="w-7 h-7 text-emerald-500" /> };
      case "Calibrating": return { text: "text-sky-600 dark:text-sky-400", border: "border-sky-400/50", bg: "bg-sky-50/90 dark:bg-sky-950/40", shadow: "shadow-sky-500/20", icon: <Activity className="w-7 h-7 text-sky-500 animate-spin-slow" /> };
      default: return { text: "text-slate-700 dark:text-slate-300", border: "border-white/40 dark:border-slate-700/50", bg: "glass-panel", shadow: "shadow-sky-500/5", icon: <Activity className="w-7 h-7 text-slate-400 animate-pulse" /> };
    }
  };

  const style = getStatusColor();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Status Card */}
      <motion.div 
        layout
        className={`p-5 rounded-[1.5rem] flex items-center justify-between transition-all duration-500 border-2 shrink-0 ${style.border} ${style.bg} ${style.shadow} glass-panel`}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">System Status</p>
          <div className="flex items-center gap-2.5">
            <AnimatePresence mode="popLayout">
              <motion.div key={status} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                {style.icon}
              </motion.div>
            </AnimatePresence>
            <h3 className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${style.text}`}>
              {status}
            </h3>
          </div>
        </div>
        {(status === "Critical" || status === "Drowsy" || status === "Distracted") && (
          <div className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'Critical' ? 'bg-rose-400' : status === 'Distracted' ? 'bg-fuchsia-400' : 'bg-orange-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-4 w-4 ${status === 'Critical' ? 'bg-rose-500' : status === 'Distracted' ? 'bg-fuchsia-500' : 'bg-orange-500'} shadow-md`}></span>
          </div>
        )}
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        
        {/* PERCLOS Card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center group hover:shadow-lg transition-all min-h-[120px] col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">PERCLOS</span>
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-1">
            <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{Number(perclos).toFixed(1)}<span className="text-xl text-slate-400 font-semibold ml-0.5">%</span></p>
          </div>
          
          {/* Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/20 w-full">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(perclos, 100)}%` }} />
          </div>
        </div>

        {/* EAR Card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center group hover:shadow-lg transition-all min-h-[100px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">EAR</span>
            <div className="p-1.5 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-lg shadow-sm">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{Number(ear).toFixed(2)}</p>
          </div>
        </div>

        {/* MAR Card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center group hover:shadow-lg transition-all min-h-[100px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">MAR</span>
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg shadow-sm">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{Number(mar).toFixed(2)}</p>
          </div>
        </div>

        {/* Pitch Card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center group hover:shadow-lg transition-all min-h-[100px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">Pitch</span>
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shadow-sm">
              <Move3D className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{Number(pitch).toFixed(1)}</p>
          </div>
        </div>

        {/* Yaw Card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center group hover:shadow-lg transition-all min-h-[100px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-fuchsia-500 transition-colors">Yaw</span>
            <div className="p-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400 rounded-lg shadow-sm">
              <Move3D className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{Number(yaw).toFixed(1)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
