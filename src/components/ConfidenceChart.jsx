import React, { useEffect, useState } from "react";
import { LineChart, Line, YAxis, ResponsiveContainer, CartesianGrid, XAxis, Tooltip } from "recharts";

export default function ConfidenceChart({ data }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)";
  const tooltipBorder = isDark ? "rgba(30, 41, 59, 1)" : "none";
  const tooltipTextColor = isDark ? "#f1f5f9" : "#0f172a";

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <YAxis domain={[0, 1]} tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }} stroke="transparent" width={30} />
          <XAxis dataKey="index" tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderRadius: '12px', 
              border: tooltipBorder, 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              color: tooltipTextColor,
              fontWeight: 600,
              padding: '12px 16px'
            }} 
            itemStyle={{
                paddingTop: '4px'
            }}
            labelStyle={{ display: 'none' }}
          />
          <Line
            type="monotone"
            dataKey="ear"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="EAR"
          />
          <Line
            type="monotone"
            dataKey="mar"
            stroke="#6366f1"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="MAR"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
