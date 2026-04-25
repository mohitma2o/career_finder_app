/**
 * Horizontal bar chart rendered as SVG.
 * Each bar shows label, value, and a proportional filled bar.
 */
export default function BarChart({ data, maxValue, valueFormatter, accentColor = "#15CF93" }) {
  const barH = 28;
  const gap = 10;
  const labelW = 180;
  const chartW = 500;
  const totalW = labelW + chartW + 60;
  const totalH = data.length * (barH + gap) + gap;
  const computedMax = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const y = i * (barH + gap) + gap;
        const barWidth = (d.value / computedMax) * chartW;
        const formatted = valueFormatter ? valueFormatter(d.value) : d.value;

        return (
          <g key={i}>
            {/* Label */}
            <text
              x={labelW - 8}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fill="#C0C0C0"
              fontSize="12"
              fontFamily="Inter, sans-serif"
            >
              {d.label}
            </text>

            {/* Track */}
            <rect x={labelW} y={y} width={chartW} height={barH} rx="4" fill="rgba(255,255,255,0.04)" />

            {/* Fill */}
            <rect x={labelW} y={y} width={barWidth} height={barH} rx="4" fill={accentColor} opacity="0.85">
              <animate attributeName="width" from="0" to={barWidth} dur="0.6s" fill="freeze" />
            </rect>

            {/* Value */}
            <text
              x={labelW + chartW + 8}
              y={y + barH / 2}
              dominantBaseline="central"
              fill="#8A8A8A"
              fontSize="12"
              fontFamily="Inter, sans-serif"
            >
              {formatted}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
