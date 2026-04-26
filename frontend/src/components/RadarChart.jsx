/**
 * SVG radar chart for skill/interest profiles.
 * No chart library dependency.
 */
/**
 * Enhanced SVG radar chart for skill/interest profiles.
 * Premium aesthetics with gradients and responsive design.
 */
export default function RadarChart({ labels, values, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 40; // More padding for labels
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

  const chartId = Math.random().toString(36).substr(2, 9);

  return (
    <div style={{ width: "100%", maxWidth: size, margin: "0 auto", aspectRatio: "1/1" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${chartId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.1" />
          </linearGradient>
          <filter id={`glow-${chartId}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid rings */}
        {rings.map((r) => {
          const pts = Array.from({ length: n }, (_, i) => pointForAxis(i, r));
          return (
            <polygon
              key={r}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.5"
              strokeDasharray={r === 10 ? "none" : "2,2"}
            />
          );
        })}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const end = pointForAxis(i, 10);
          return (
            <line 
              key={i} 
              x1={cx} y1={cy} x2={end.x} y2={end.y} 
              stroke="var(--border)" 
              strokeWidth="0.5" 
            />
          );
        })}

        {/* Data area */}
        <polygon 
          points={polyStr} 
          fill={`url(#grad-${chartId})`} 
          stroke="var(--accent)" 
          strokeWidth="2" 
          filter={`url(#glow-${chartId})`}
          style={{ transition: 'all 0.5s ease' }}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} cy={p.y} r="4" 
            fill="var(--accent)" 
            stroke="var(--bg)" 
            strokeWidth="1"
            style={{ transition: 'all 0.5s ease' }}
          />
        ))}

        {/* Labels */}
        {labels.map((label, i) => {
          const p = pointForAxis(i, 11.5);
          const isLeft = p.x < cx;
          const isCenter = Math.abs(p.x - cx) < 1;

          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={isCenter ? "middle" : (isLeft ? "end" : "start")}
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize="10"
              fontWeight="600"
              style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
