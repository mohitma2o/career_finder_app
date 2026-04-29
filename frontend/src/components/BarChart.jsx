import React from 'react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BarChart({ data, valueFormatter, accentColor = "var(--accent)" }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="label" 
            type="category" 
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}
            width={90}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            formatter={(value) => valueFormatter ? valueFormatter(value) : value}
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={accentColor} fillOpacity={0.8 - (index * 0.1)} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
