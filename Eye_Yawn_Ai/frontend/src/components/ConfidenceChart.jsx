import React from "react";
import { LineChart, Line, YAxis } from "recharts";


export default function ConfidenceChart({ data }) {
  return (
    <LineChart width={300} height={160} data={data}>
      <YAxis domain={[0, 100]} />
      <Line
        type="monotone"
        dataKey="confidence"
        stroke="#22d3ee"
        strokeWidth={3}
        dot={false}
      />
    </LineChart>
  );
}
