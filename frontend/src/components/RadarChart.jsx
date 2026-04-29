import React from 'react';
import { Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function RadarChart({ labels, values }) {
  const data = labels.map((label, i) => ({
    subject: label,
    A: values[i],
    fullMark: 10,
  }));

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(129, 140, 248, 0.2)', borderRadius: '12px' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <Radar
            name="Skills/Interests"
            dataKey="A"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.5}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
