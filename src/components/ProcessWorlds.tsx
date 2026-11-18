import { portfolio } from "@/data/portfolio";

/*
 * The four nested worlds of the Process zoom. Each is drawn in a 1000 × 1000
 * box whose exact centre (500, 500) holds the seed of the next world, so
 * zooming 18× into the middle of one lands inside the next:
 *   Data → one glowing cell holds a tiny cluster
 *   Models → the central centroid holds a tiny agent graph
 *   Agents → the LLM core holds a tiny product window
 *   Products → ten live builds around manas-saxena.vercel.app
 * Everything is deterministic so server and client draw the same picture.
 */

const LIME = "#c8f25a";
const INK = "#fafafa";
const r1 = (v: number) => Math.round(v * 10) / 10;

function prng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────── 0 · Data: rows of raw cells, noisy and unlabelled ───────── */

const CELLS = (() => {
  const rnd = prng(11);
  const out: { x: number; y: number; o: number; w: number }[] = [];
  const N = 30;
  const s = 1000 / N;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (r === 15 && c === 15) continue; // the seed cell, drawn on its own
      const v = rnd();
      out.push({ x: r1(c * s + 3), y: r1(r * s + 3), o: r1(0.04 + v * v * 0.32), w: r1(s * (0.45 + rnd() * 0.5)) });
    }
  return out;
})();

const DIGITS = (() => {
  const rnd = prng(23);
  return Array.from({ length: 46 }, () => ({
    x: r1(20 + rnd() * 960),
    y: r1(30 + rnd() * 950),
    t: rnd() < 0.2 ? "NaN" : (rnd() * 9999).toFixed(rnd() < 0.5 ? 2 : 0),
  })).filter((d) => Math.hypot(d.x - 500, d.y - 500) > 70);
})();

function DataWorld() {
  return (
    <svg viewBox="0 0 1000 1000" className="size-full" aria-hidden>
      {CELLS.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height="10" rx="2" fill={INK} fillOpacity={c.o} />
      ))}
      {DIGITS.map((d, i) => (
        <text key={i} x={d.x} y={d.y} fontSize="13" fill={d.t === "NaN" ? "#f87171" : INK} fillOpacity=".35" style={{ fontFamily: "var(--font-mono)" }}>
          {d.t}
        </text>
      ))}
      {/* Seed: the one cell worth looking into, with a cluster inside */}
      <rect x="484" y="486" width="32" height="28" rx="4" fill="#0b0b0d" stroke={LIME} strokeWidth="1.4" />
      <g transform="translate(500 500) scale(.0556) translate(-500 -500)">
        <ClusterMarks />
      </g>
      <circle cx="500" cy="500" r="40" fill="none" stroke={LIME} strokeOpacity=".5" strokeWidth="1" className="pw-ping" />
    </svg>
  );
}

/* ───────── 1 · Models: four clusters, centroids, the boundaries between ───────── */

const CENTRES: [number, number, string][] = [
  [500, 500, LIME],
  [250, 300, INK],
  [760, 280, INK],
  [300, 760, INK],
  [770, 740, INK],
];

const POINTS = (() => {
  const rnd = prng(37);
  const g = () => {
    const u = 1 - rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };
  return CENTRES.flatMap(([cx, cy, c], k) =>
    Array.from({ length: k === 0 ? 70 : 90 }, () => ({ x: r1(cx + g() * (k === 0 ? 46 : 70)), y: r1(cy + g() * (k === 0 ? 46 : 70)), c, k })),
  );
})();

function ClusterMarks() {
  return (
    <>
      {POINTS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.k === 0 ? 4 : 3.4} fill={p.c} fillOpacity={p.k === 0 ? 0.85 : 0.4} />
      ))}
    </>
  );
}

function ModelWorld() {
  return (
    <svg viewBox="0 0 1000 1000" className="size-full" aria-hidden>
      {/* Decision boundaries */}
      <g stroke={INK} strokeOpacity=".12" strokeWidth="1.2" strokeDasharray="6 8">
        <path d="M0 520 C 300 470, 700 560, 1000 500" />
        <path d="M520 0 C 470 300, 560 700, 500 1000" />
      </g>
      <ClusterMarks />
      {CENTRES.slice(1).map(([x, y]) => (
        <g key={`${x}${y}`} stroke={INK} strokeOpacity=".6" strokeWidth="1.4">
          <circle cx={x} cy={y} r="14" fill="none" />
          <path d={`M${x - 22} ${y} H${x + 22} M${x} ${y - 22} V${y + 22}`} />
        </g>
      ))}
      {/* Seed: the central centroid holds the agent graph */}
      <circle cx="500" cy="500" r="30" fill="#0b0b0d" stroke={LIME} strokeWidth="1.6" />
      <g transform="translate(500 500) scale(.0556) translate(-500 -500)">
        <AgentMarks />
      </g>
      <circle cx="500" cy="500" r="56" fill="none" stroke={LIME} strokeOpacity=".5" strokeWidth="1" className="pw-ping" />
    </svg>
  );
}

/* ───────── 2 · Agents: an LLM core, its tools, the documents it cites ───────── */

const TOOLS = ["search", "retrieve", "cite", "route", "refuse", "act"].map((t, i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  return { t, x: r1(500 + Math.cos(a) * 250), y: r1(500 + Math.sin(a) * 250) };
});
const DOCS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  return { x: r1(500 + Math.cos(a) * 420), y: r1(500 + Math.sin(a) * 420) };
});

function AgentMarks() {
  return (
    <>
      {TOOLS.map((t, i) => (
        <path key={t.t} d={`M500 500 L${t.x} ${t.y}`} stroke={i % 2 ? INK : LIME} strokeOpacity=".55" strokeWidth="2" />
      ))}
      {DOCS.map((d, i) => (
        <path key={i} d={`M${TOOLS[i % 6].x} ${TOOLS[i % 6].y} L${d.x} ${d.y}`} stroke={INK} strokeOpacity=".16" strokeWidth="1.2" />
      ))}
      {TOOLS.map((t) => (
        <circle key={`c${t.t}`} cx={t.x} cy={t.y} r="26" fill="#111113" stroke={INK} strokeOpacity=".7" strokeWidth="1.6" />
      ))}
      {DOCS.map((d, i) => (
        <rect key={`d${i}`} x={d.x - 9} y={d.y - 12} width="18" height="24" rx="3" fill="#111113" stroke={INK} strokeOpacity=".35" />
      ))}
    </>
  );
}

function AgentWorld() {
  return (
    <svg viewBox="0 0 1000 1000" className="size-full" aria-hidden>
      <AgentMarks />
      {/* Signals travelling out along the tool edges */}
      {TOOLS.map((t, i) => (
        <path key={`s${t.t}`} d={`M500 500 L${t.x} ${t.y}`} stroke={LIME} strokeWidth="3" strokeLinecap="round" strokeDasharray="10 240" className="pw-signal" style={{ animationDelay: `${-i * 0.35}s` }} />
      ))}
      {TOOLS.map((t) => (
        <text key={`l${t.t}`} x={t.x} y={t.y + 52} textAnchor="middle" fontSize="18" letterSpacing="2" fill={INK} fillOpacity=".7" style={{ fontFamily: "var(--font-mono)" }}>
          {t.t.toUpperCase()}
        </text>
      ))}
      {/* Seed: the LLM core holds a tiny product window */}
      <circle cx="500" cy="500" r="34" fill="#0b0b0d" stroke={LIME} strokeWidth="2" />
      <g transform="translate(500 500) scale(.0556) translate(-500 -500)">
        <ProductMarks />
      </g>
      <circle cx="500" cy="500" r="64" fill="none" stroke={LIME} strokeOpacity=".5" strokeWidth="1.2" className="pw-ping" />
    </svg>
  );
}

/* ───────── 3 · Products: the ten live builds, coloured by path ───────── */

const HUES = Object.fromEntries(portfolio.work.paths.map((p) => [p.id, p.hue]));
const BUILDS = portfolio.work.projects.map((p) => ({ t: p.title, c: HUES[p.path] ?? LIME }));

// Ten tiles around a central browser window: 4 above, 2 beside, 4 below.
const SLOTS: [number, number][] = [
  [70, 110], [300, 110], [530, 110], [760, 110],
  [70, 440], [760, 440],
  [70, 770], [300, 770], [530, 770], [760, 770],
];

function ProductMarks() {
  // Drawn at 78% around the centre so the whole wall fits the screen at rest.
  return (
    <g transform="translate(500 500) scale(.78) translate(-500 -500)">
      {SLOTS.map(([x, y], i) => {
        const b = BUILDS[i];
        if (!b) return null;
        return (
          <g key={b.t}>
            <rect x={x} y={y} width="190" height="120" rx="14" fill="#111113" stroke={b.c} strokeOpacity=".75" strokeWidth="2" />
            <rect x={x} y={y} width="190" height="22" rx="14" fill={b.c} fillOpacity=".16" />
            <circle cx={x + 16} cy={y + 11} r="4" fill={b.c} />
            <text x={x + 18} y={y + 66} fontSize="19" fontWeight="600" fill={INK} style={{ fontFamily: "var(--font-display)" }}>
              {b.t.length > 16 ? `${b.t.slice(0, 15)}…` : b.t}
            </text>
            <rect x={x + 18} y={y + 84} width="110" height="6" rx="3" fill={INK} fillOpacity=".14" />
            <rect x={x + 18} y={y + 98} width="70" height="6" rx="3" fill={INK} fillOpacity=".1" />
          </g>
        );
      })}
      {/* The portfolio itself, in the middle */}
      <rect x="320" y="330" width="360" height="340" rx="18" fill="#0b0b0d" stroke={LIME} strokeWidth="2.4" />
      <rect x="320" y="330" width="360" height="40" rx="18" fill={LIME} fillOpacity=".14" />
      <circle cx="346" cy="350" r="6" fill="#ff5f57" />
      <circle cx="366" cy="350" r="6" fill="#febc2e" />
      <circle cx="386" cy="350" r="6" fill="#28c840" />
      <text x="500" y="470" textAnchor="middle" fontSize="88" fontWeight="700" fill={LIME} style={{ fontFamily: "var(--font-display)" }}>
        10
      </text>
      <text x="500" y="520" textAnchor="middle" fontSize="20" letterSpacing="3" fill={INK} fillOpacity=".75" style={{ fontFamily: "var(--font-mono)" }}>
        LIVE BUILDS
      </text>
      <text x="500" y="620" textAnchor="middle" fontSize="16" fill={INK} fillOpacity=".5" style={{ fontFamily: "var(--font-mono)" }}>
        manas-saxena.vercel.app
      </text>
    </g>
  );
}

function ProductWorld() {
  return (
    <svg viewBox="0 0 1000 1000" className="size-full" aria-hidden>
      <ProductMarks />
    </svg>
  );
}

export const WORLDS = [DataWorld, ModelWorld, AgentWorld, ProductWorld];
