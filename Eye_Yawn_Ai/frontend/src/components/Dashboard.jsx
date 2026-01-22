import React from "react";
import { useEffect, useState } from "react";
import ConfidenceChart from "./ConfidenceChart";

export default function Dashboard() {
  const [pred, setPred] = useState("Initializing…");
  const [conf, setConf] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      setPred(e.detail.label);
      setConf(e.detail.confidence);
      setHistory(h =>
        [...h.slice(-15), { confidence: e.detail.confidence }]
      );
    };

    window.addEventListener("prediction", handler);
    return () => window.removeEventListener("prediction", handler);
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass p-6 text-center">
        <h2 className="text-2xl neon-text">{pred}</h2>
        <p className="mt-2">{conf.toFixed(1)}%</p>

        <div className="w-full bg-white/20 rounded-full overflow-hidden mt-2">
          <div
            className="confidence-bar"
            style={{ width: `${conf}%` }}
          />
        </div>
      </div>

      <div className="glass p-4">
        <ConfidenceChart data={history} />
      </div>
    </div>
  );
}
