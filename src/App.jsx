import React, { useState, useEffect } from "react";
import { Moon, Sun, Shield, Settings, Download, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Camera from "./components/Camera";
import Dashboard from "./components/Dashboard";
import LiveTracking from "./components/LiveTracking";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    showMesh: false,
    perclosSensitivity: 80, // % of baseline EAR
    pitchThreshold: 15,     // degrees drop
    yawTolerance: 25,       // degrees sideways for distraction
    audioEnabled: false,    // text-to-speech alarms
  });

  const [sessionLog, setSessionLog] = useState([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Session Logger (Throttled to 1 log per second)
  useEffect(() => {
    let lastLogTime = 0;
    const handler = (e) => {
      const now = Date.now();
      if (now - lastLogTime >= 1000) {
        lastLogTime = now;
        setSessionLog(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          status: e.detail.status,
          ear: e.detail.ear ? e.detail.ear.toFixed(3) : 0,
          mar: e.detail.mar ? e.detail.mar.toFixed(3) : 0,
          pitch: e.detail.pitch ? e.detail.pitch.toFixed(1) : 0,
          yaw: e.detail.yaw ? e.detail.yaw.toFixed(1) : 0,
          perclos: e.detail.perclos ? e.detail.perclos.toFixed(1) : 0
        }]);
      }
    };
    window.addEventListener("telemetry", handler);
    return () => window.removeEventListener("telemetry", handler);
  }, []);

  // Audio Engine
  useEffect(() => {
    let lastSpeechTime = 0;
    const handler = (e) => {
      if (!settings.audioEnabled) return;
      const status = e.detail.status;
      const now = Date.now();
      
      // 6-second cooldown between voice warnings
      if (now - lastSpeechTime < 6000) return;

      if (status === "Critical") {
        const utter = new SpeechSynthesisUtterance("Wake up! Pull over immediately!");
        utter.rate = 1.1;
        utter.pitch = 1.2;
        window.speechSynthesis.speak(utter);
        lastSpeechTime = now;
      } else if (status === "Distracted") {
        const utter = new SpeechSynthesisUtterance("Keep your eyes on the road.");
        utter.rate = 1.1;
        window.speechSynthesis.speak(utter);
        lastSpeechTime = now;
      }
    };
    window.addEventListener("telemetry", handler);
    return () => window.removeEventListener("telemetry", handler);
  }, [settings.audioEnabled]);

  const downloadCSV = () => {
    if (sessionLog.length === 0) return;
    const headers = "Timestamp,Status,EAR,MAR,Pitch,Yaw,PERCLOS\n";
    const rows = sessionLog.map(row => `${row.timestamp},${row.status},${row.ear},${row.mar},${row.pitch},${row.yaw},${row.perclos}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WakeGuard_Session_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleAudio = () => {
    if (!settings.audioEnabled) {
      // Unlock audio context on user interaction
      const utter = new SpeechSynthesisUtterance("Audio alerts enabled.");
      window.speechSynthesis.speak(utter);
    }
    setSettings(s => ({ ...s, audioEnabled: !s.audioEnabled }));
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans gradient-bg overflow-x-hidden overflow-y-auto">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 dark:bg-sky-900/20 blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/40 dark:border-slate-800/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-500 rounded-xl text-white shadow-lg shadow-sky-500/25">
            <Shield className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            WakeGuard Enterprise
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleAudio}
            className={`p-2.5 rounded-full shadow-sm transition-all duration-300 border ${settings.audioEnabled ? 'bg-sky-100 border-sky-300 text-sky-600 dark:bg-sky-900/50 dark:border-sky-700 dark:text-sky-400' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white border-white/60 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-400'}`}
            aria-label="Toggle Audio"
          >
            {settings.audioEnabled ? <Volume2 className="w-4 h-4" strokeWidth={2.5} /> : <VolumeX className="w-4 h-4" strokeWidth={2.5} />}
          </button>
          <button 
            onClick={downloadCSV}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-all duration-300 text-sky-700 dark:text-sky-400 font-semibold text-sm shadow-sm border border-sky-200 dark:border-sky-800"
          >
            <Download className="w-4 h-4" />
            Export Log
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white border border-white/60 dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm transition-all duration-300 text-slate-600 dark:text-slate-300"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white border border-white/60 dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm transition-all duration-300 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" strokeWidth={2.5} /> : <Moon className="w-4 h-4" strokeWidth={2.5} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="mb-4 shrink-0">
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Vision Feed</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1 font-medium">Real-time facial landmark analysis running locally via MediaPipe.</p>
            </div>
            <Camera settings={settings} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="mb-4 shrink-0">
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Telemetry</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1 font-medium">Live metrics and state tracking.</p>
            </div>
            <Dashboard />
          </motion.div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="w-full mt-2"
        >
          <LiveTracking />
        </motion.div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel p-6 lg:p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl border border-white/50 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Audio Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Voice Alarms</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Spoken warnings for safety events.</p>
                  </div>
                  <button 
                    onClick={toggleAudio}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.audioEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.audioEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Face Mesh Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Face Mesh Visualizer</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Show real-time 3D landmark tracking.</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, showMesh: !s.showMesh }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.showMesh ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showMesh ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <hr className="border-slate-200 dark:border-slate-700/50" />

                {/* Yaw Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Distraction Tolerance</h3>
                    <span className="text-fuchsia-600 dark:text-fuchsia-400 font-mono text-sm">±{settings.yawTolerance}°</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Degrees you can turn your head sideways before it triggers a warning.</p>
                  <input 
                    type="range" min="15" max="45" step="1"
                    value={settings.yawTolerance}
                    onChange={(e) => setSettings(s => ({ ...s, yawTolerance: Number(e.target.value) }))}
                    className="w-full accent-fuchsia-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    <span>Strict (15°)</span>
                    <span>Lenient (45°)</span>
                  </div>
                </div>

                {/* Sensitivity Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Eye Droop Sensitivity</h3>
                    <span className="text-sky-600 dark:text-sky-400 font-mono text-sm">{settings.perclosSensitivity}%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Triggers closure when EAR drops below this percentage of your baseline.</p>
                  <input 
                    type="range" min="60" max="95" step="5"
                    value={settings.perclosSensitivity}
                    onChange={(e) => setSettings(s => ({ ...s, perclosSensitivity: Number(e.target.value) }))}
                    className="w-full accent-sky-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    <span>Lenient (60%)</span>
                    <span>Strict (95%)</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Head Drop Threshold</h3>
                    <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">+{settings.pitchThreshold}°</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Degrees of forward pitch required to trigger a Critical warning.</p>
                  <input 
                    type="range" min="5" max="30" step="1"
                    value={settings.pitchThreshold}
                    onChange={(e) => setSettings(s => ({ ...s, pitchThreshold: Number(e.target.value) }))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    <span>Sensitive (5°)</span>
                    <span>Forgiving (30°)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
