import type { CSSProperties } from "react";

// One line-art motif per project slot: simulation curve, agent graph,
// realtime grid, dashboard bars, regression scatter.
const MOTIFS = [
  <g key="0">
    {[70, 52, 34].map((r) => (
      <circle key={r} cx="100" cy="100" r={r} />
    ))}
    <path d="M20 150 C 60 150, 70 40, 100 40 S 140 150, 180 150" strokeWidth="1.6" stroke="var(--color-accent)" />
  </g>,
  <g key="1">
    {[
      [40, 60, 100, 40], [100, 40, 160, 70], [40, 60, 70, 130], [100, 40, 110, 110],
      [160, 70, 110, 110], [70, 130, 110, 110], [110, 110, 150, 150], [70, 130, 150, 150],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
    ))}
    {[[40, 60], [100, 40], [160, 70], [70, 130], [110, 110], [150, 150]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i === 4 ? 7 : 4.5} fill={i === 4 ? "var(--color-accent)" : "var(--color-bg)"} />
    ))}
  </g>,
  <g key="2">
    {Array.from({ length: 25 }, (_, i) => (
      <rect key={i} x={30 + (i % 5) * 30} y={30 + Math.floor(i / 5) * 30} width="20" height="20" rx="3"
        stroke={i === 12 || i === 7 ? "var(--color-accent)" : undefined} />
    ))}
  </g>,
  <g key="3">
    {[60, 95, 75, 130, 110, 150].map((h, i) => (
      <rect key={i} x={28 + i * 26} y={170 - h} width="16" height={h} rx="3"
        stroke={i === 5 ? "var(--color-accent)" : undefined} />
    ))}
    <line x1="20" y1="170" x2="180" y2="170" />
  </g>,
  <g key="4">
    {Array.from({ length: 34 }, (_, i) => {
      const x = 25 + ((i * 37) % 150);
      const y = 160 - x * 0.62 + (((i * 53) % 40) - 20);
      return <circle key={i} cx={x} cy={y} r="2.6" />;
    })}
    <line x1="20" y1="162" x2="182" y2="58" strokeWidth="1.6" stroke="var(--color-accent)" />
  </g>,
];

const ORBS = [
  { left: "55%", top: "10%" },
  { left: "-5%", top: "30%" },
  { left: "40%", top: "45%" },
  { left: "10%", top: "-10%" },
  { left: "50%", top: "35%" },
];

/** Generated cover art shown until a real screenshot is added. */
export default function Cover({
  index,
  label,
  style,
  className = "",
}: {
  index: number;
  label: string;
  style?: CSSProperties;
  className?: string;
}) {
  const orb = ORBS[index % ORBS.length];
  return (
    <div className={`cover absolute overflow-hidden ${className}`} style={style}>
      <div
        className="absolute size-[75%] rounded-full opacity-70 blur-3xl"
        style={{
          ...orb,
          background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 24%, transparent), transparent 65%)",
          animation: `drift ${11 + index * 2}s ease-in-out infinite alternate`,
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 m-auto h-[62%] w-[62%] opacity-80"
        fill="none"
        stroke="rgb(250 250 250 / .2)"
        strokeWidth="1.2"
        aria-hidden
      >
        {MOTIFS[index % MOTIFS.length]}
      </svg>
      <span className="ph-label absolute top-6 left-6">{label}</span>
    </div>
  );
}
