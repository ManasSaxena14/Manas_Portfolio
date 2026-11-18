import { Layer, Scene } from "./Scene";

// Private banking, engraved. Deep emerald paper with gold guilloché, the
// fine-line rosettes printed on banknotes, framed like a note. The hero is
// the goal planner itself: a Monte Carlo fan of possible futures fanning out
// from today, the 80% band through them, and a gold line for the goal.

const GOLD = "#d9b968";
const PALE = "#efe2b8";
const JADE = "#7fd1a8";
const MUTED = "#8fae9f";

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Deterministic PRNG, so server and client draw the same futures. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hypotrochoid: the curve a guilloché lathe engraves. */
function rosette(R: number, r: number, d: number, cx: number, cy: number, turns: number, steps = 900) {
  let s = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    s += `${i ? "L" : "M"}${r2(cx + x)} ${r2(cy + y)}`;
  }
  return s;
}

// Chart frame (viewBox 160 × 100): history to the left of "today", then futures.
const T0 = 46; // x of today
const T1 = 154; // x of the horizon
const Y0 = 66; // balance today
const STEPS = 24;
const rand = mulberry32(7);
const gauss = () => {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const HISTORY = (() => {
  const pts: string[] = [];
  let y = 80;
  for (let i = 0; i <= 12; i++) {
    const x = 6 + (i / 12) * (T0 - 6);
    y += i === 12 ? Y0 - y : -0.9 + gauss() * 1.6;
    pts.push(`${r2(x)} ${r2(i === 12 ? Y0 : y)}`);
  }
  return `M${pts.join(" L")}`;
})();

// Paths drift upward (savings grow) with spread widening over time.
const PATHS = Array.from({ length: 64 }, () => {
  let y = Y0;
  let s = `M${T0} ${Y0}`;
  for (let i = 1; i <= STEPS; i++) {
    y += -1.15 + gauss() * 1.9;
    s += ` L${r2(T0 + (i / STEPS) * (T1 - T0))} ${r2(y)}`;
  }
  return s;
});

// Analytic 80% band and median for the same drift and volatility.
const band = (() => {
  const up: string[] = [];
  const dn: string[] = [];
  const mid: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const x = r2(T0 + (i / STEPS) * (T1 - T0));
    const m = Y0 - 1.15 * i;
    const w = 1.28 * 1.9 * Math.sqrt(i);
    up.push(`${x} ${r2(m - w)}`);
    dn.unshift(`${x} ${r2(m + w)}`);
    mid.push(`${x} ${r2(m)}`);
  }
  return { area: `M${up.join(" L")} L${dn.join(" L")} Z`, median: `M${mid.join(" L")}` };
})();

const GOAL_Y = 40;

const ROSETTE_A = rosette(34, 7.4, 13, 50, 50, 37);
const ROSETTE_B = rosette(22, 5.2, 9, 50, 50, 26, 700);

export default function FinSight() {
  return (
    <Scene className="bg-[radial-gradient(110%_100%_at_30%_30%,#0f4434_0%,#082a20_42%,#03120d_100%)]">
      {/* Engraved field: fine diagonal lines and a guilloché rosette */}
      <Layer d={0.25} className="inset-0">
        <span className="absolute inset-0 opacity-[.22] [background-image:repeating-linear-gradient(135deg,rgb(217_185_104/.25)_0_1px,transparent_1px_.7cqw)]" />
        <span className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_40%,transparent_30%,rgb(3_18_13/.85)_100%)]" />
      </Layer>

      <Layer d={0.6} className="top-[-14%] left-[-12%] w-[58%]">
        <svg viewBox="0 0 100 100" className="pa-spin-slow w-full [animation-duration:90s]" aria-hidden>
          <path d={ROSETTE_A} fill="none" stroke={GOLD} strokeOpacity=".28" strokeWidth=".14" />
          <path d={ROSETTE_B} fill="none" stroke={JADE} strokeOpacity=".22" strokeWidth=".12" />
        </svg>
      </Layer>

      {/* Banknote frame */}
      <Layer d={0.8} className="inset-[3.4%]">
        <div className="absolute inset-0 rounded-[1.2cqw] border border-[#d9b968]/35" />
        <div className="absolute inset-[.8cqw] rounded-[.8cqw] border border-[#d9b968]/15" />
        {["top-[.4cqw] left-[.4cqw]", "top-[.4cqw] right-[.4cqw]", "bottom-[.4cqw] left-[.4cqw]", "right-[.4cqw] bottom-[.4cqw]"].map((c) => (
          <span key={c} className={`absolute ${c} size-[1.2cqw] rotate-45 border border-[#d9b968]/50 bg-[#082a20]`} />
        ))}
      </Layer>

      {/* Masthead */}
      <Layer d={1.4} className="top-[9%] left-[8%]">
        <div className="font-mono text-[.95cqw] tracking-[.34em] uppercase" style={{ color: MUTED }}>
          Goal planner · Monte Carlo
        </div>
        <div className="mt-[.8cqw] font-serif text-[5.4cqw] leading-[.9] italic" style={{ color: PALE }}>
          Will it land?
        </div>
        <div className="mt-[1cqw] flex items-center gap-[.8cqw] font-mono text-[1cqw]" style={{ color: GOLD }}>
          <span className="h-px w-[3cqw] bg-[#d9b968]/60" />
          4,000 futures · 80% interval
        </div>
      </Layer>

      {/* The fan of futures */}
      <Layer d={1} className="right-[6%] bottom-[11%] w-[62%]">
        <svg viewBox="0 0 160 100" className="w-full overflow-visible" aria-hidden>
          {/* Goal line */}
          <line x1="6" x2={T1} y1={GOAL_Y} y2={GOAL_Y} stroke={GOLD} strokeWidth=".35" strokeDasharray="1.6 1.2" />
          <text x={T1} y={GOAL_Y - 2} textAnchor="end" fontSize="3" letterSpacing=".4" fill={GOLD} style={{ fontFamily: "var(--font-mono)" }}>
            SAVINGS GOAL
          </text>
          {/* Today marker */}
          <line x1={T0} x2={T0} y1="18" y2="96" stroke={PALE} strokeOpacity=".25" strokeWidth=".25" />
          <text x={T0 - 1.5} y="20" textAnchor="end" fontSize="2.8" letterSpacing=".4" fill={MUTED} style={{ fontFamily: "var(--font-mono)" }}>
            TODAY
          </text>
          {/* Futures */}
          {PATHS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i % 9 === 0 ? JADE : GOLD} strokeOpacity={i % 9 === 0 ? 0.32 : 0.14} strokeWidth=".22" />
          ))}
          <path d={band.area} fill={JADE} fillOpacity=".09" stroke={JADE} strokeOpacity=".35" strokeWidth=".2" />
          <path d={band.median} fill="none" stroke={PALE} strokeWidth=".55" pathLength={1} className="pa-draw" />
          {/* History */}
          <path d={HISTORY} fill="none" stroke={PALE} strokeWidth=".55" strokeOpacity=".85" />
          <circle cx={T0} cy={Y0} r="1.1" fill={PALE} />
          <circle cx={T0} cy={Y0} r="1.1" fill="none" stroke={PALE} className="pa-ping" />
        </svg>
      </Layer>

      {/* Seal + serial, bottom-left */}
      <Layer d={2} className="bottom-[11%] left-[8%] w-[22%]">
        <div className="flex items-center gap-[1.2cqw]">
          <div className="relative grid size-[7cqw] flex-none place-items-center rounded-full border border-[#d9b968]/60 bg-[radial-gradient(circle_at_35%_30%,#1a5a46,#082a20)]">
            <span className="absolute inset-[.5cqw] rounded-full border border-dashed border-[#d9b968]/40" />
            <span className="font-serif text-[2.6cqw] italic" style={{ color: GOLD }}>
              14
            </span>
          </div>
          <div className="font-mono text-[.95cqw] leading-[1.55] tracking-[.14em] uppercase" style={{ color: MUTED }}>
            agent tools
            <br />
            <span style={{ color: PALE }}>96.7% hit@1</span>
            <br />
            RAG · cited
          </div>
        </div>
      </Layer>

      <Layer d={1.2} className="top-[9%] right-[8%]">
        <div className="text-right font-mono text-[.95cqw] tracking-[.3em] uppercase" style={{ color: GOLD }}>
          FinSight AI
          <div className="mt-[.4cqw] tracking-[.18em]" style={{ color: MUTED }}>
            Nº FS–2026–0414
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
