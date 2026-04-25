/**
 * SVG radar chart for skill/interest profiles.
 * No chart library dependency.
 */
export default function RadarChart({ labels, values, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = labels.length;
  const angleStep = (2 * Math.PI) / n;

  const pointForAxis = (axisIndex, value, maxVal = 10) => {
    const angle = axisIndex * angleStep - Math.PI / 2;
    const r = (value / maxVal) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [2, 4, 6, 8, 10];

  // Data polygon
  const dataPoints = values.map((v, i) => pointForAxis(i, v));
  const polyStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {/* Grid rings */}
      {rings.map((r) => {
        const pts = Array.from({ length: n }, (_, i) => pointForAxis(i, r));
        return (
          <polygon
            key={r}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const end = pointForAxis(i, 10);
        return (
          <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}

      {/* Data area */}
      <polygon points={polyStr} fill="rgba(21,207,147,0.15)" stroke="#15CF93" strokeWidth="2" />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#15CF93" />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = pointForAxis(i, 12);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#8A8A8A"
            fontSize="11"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
