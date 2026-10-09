import { Layer, Scene } from "./Scene";

// Premium AI dashboard: the FinSight app itself, in a glass window over a
// midnight aurora — KPIs, a forecast with its prediction band, live budgets
// and the Copilot answering with tool calls and citations. A health-score
// ring and an anomaly alert float in front at their own depth.

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Catmull-Rom through the points, as cubic Béziers. */
function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Forecast chart geometry (viewBox 400 × 210)
const Y = (v: number) => Math.round(v * 1.55 + 4);
const HIST = [96, 88, 92, 80, 52, 74, 70, 64, 60].map(Y);
const FC = [60, 56, 58, 50, 46].map(Y);
const X0 = 14;
const DX = 31;
const TODAY = X0 + (HIST.length - 1) * DX;
const hist = HIST.map((y, i) => [X0 + i * DX, y] as [number, number]);
const fc = FC.map((y, i) => [TODAY + i * DX, y] as [number, number]);
const up = fc.map(([x, y], i) => [x, y - 4 - i * 8] as [number, number]);
const lo = fc.map(([x, y], i) => [x, y + 4 + i * 8] as [number, number]);
const BAND = `${smooth(up)} L${lo.at(-1)![0]} ${lo.at(-1)![1]} ${smooth([...lo].reverse()).replace(/^M[^C]+/, "")} Z`;
const HIST_D = smooth(hist);
const AREA = `${HIST_D} L${TODAY} 186 L${X0} 186 Z`;
const FC_D = smooth(fc);
const TRACE = `${HIST_D} ${FC_D.replace(/^M[^C]+/, "")}`;
const SPIKE = hist[4];
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const KPIS = [
  { l: "Net worth", v: "₹8.42L", d: "+4.1%", up: true, s: "M0 14 L8 12 L16 13 L24 9 L32 10 L40 5 L48 3" },
  { l: "Spent · Oct", v: "₹41,280", d: "−6.2%", up: true, s: "M0 4 L8 7 L16 5 L24 9 L32 8 L40 11 L48 12" },
  { l: "Savings rate", v: "31%", d: "+3 pts", up: true, s: "M0 12 L8 11 L16 12 L24 8 L32 9 L40 6 L48 5" },
  { l: "Overspend risk", v: "12%", d: "low", up: false, s: "M0 6 L8 9 L16 7 L24 10 L32 11 L40 12 L48 13" },
];

const BUDGETS = [
  { l: "Dining", v: 78, c: "#f472b6", t: "₹6.2k / 8k" },
  { l: "Groceries", v: 54, c: "#5eead4", t: "₹5.4k / 10k" },
  { l: "Travel", v: 91, c: "#fbbf24", t: "₹9.1k / 10k" },
];

const NAV = [
  "M4 13h4v7H4zM10 8h4v12h-4zM16 4h4v16h-4z", // analytics
  "M4 7h16M4 12h16M4 17h10", // ledger
  "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z", // goals
  "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z", // copilot
  "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3", // settings
];

const panel = "rounded-[1cqw] border border-white/[.07] bg-[linear-gradient(165deg,rgb(255_255_255/.045),rgb(255_255_255/.012))]";
const label = "font-mono text-[.82cqw] tracking-[.14em] text-[#8b93c9] uppercase";

export default function FinSight() {
  return (
    <Scene className="bg-[radial-gradient(120%_100%_at_50%_0%,#161d4a_0%,#0a0e27_45%,#04050d_100%)]">
      {/* Aurora */}
      <Layer d={0.25} className="inset-0">
        <span className="pa-breathe absolute -top-[36%] -left-[14%] size-[60cqw] rounded-full bg-[radial-gradient(circle,rgb(45_212_191/.24),transparent_62%)]" />
        <span className="pa-breathe absolute -right-[18%] -bottom-[50%] size-[72cqw] rounded-full bg-[radial-gradient(circle,rgb(139_92_246/.32),transparent_62%)] [animation-delay:-2.1s]" />
        <span className="absolute top-[20%] left-[40%] size-[30cqw] rounded-full bg-[radial-gradient(circle,rgb(244_114_182/.12),transparent_64%)]" />
      </Layer>

      {/* The app window */}
      <Layer d={0.8} className="top-[5.5%] right-[4%] bottom-[5.5%] left-[4%]">
        <div className="flex size-full flex-col overflow-hidden rounded-[1.4cqw] border border-white/[.1] bg-[linear-gradient(170deg,rgb(17_22_52/.94),rgb(8_10_26/.97))] shadow-[0_4cqw_8cqw_-2cqw_rgb(0_0_0/.85),inset_0_1px_0_rgb(255_255_255/.08)]">
          {/* top bar */}
          <div className="flex h-[3.6cqw] flex-none items-center gap-[1.2cqw] border-b border-white/[.06] px-[1.4cqw]">
            <span className="flex gap-[.5cqw]">
              <i className="size-[.75cqw] rounded-full bg-[#ff5f57]/80" />
              <i className="size-[.75cqw] rounded-full bg-[#febc2e]/80" />
              <i className="size-[.75cqw] rounded-full bg-[#28c840]/80" />
            </span>
            <span className="flex items-center gap-[.6cqw]">
              <span className="grid size-[1.8cqw] place-items-center rounded-[.5cqw] bg-[conic-gradient(from_200deg,#5eead4,#818cf8,#f472b6,#5eead4)] text-[.9cqw] font-bold text-[#0a0e27]">F</span>
              <span className="font-display text-[1.25cqw] font-[680] tracking-[-.01em] text-[#eef2ff]">FinSight AI</span>
              <span className="rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10 px-[.6cqw] py-[.1cqw] font-mono text-[.7cqw] tracking-[.14em] text-[#fcd34d] uppercase">Pro</span>
            </span>
            <span className="mx-auto flex w-[34%] items-center gap-[.7cqw] rounded-[.7cqw] border border-white/[.08] bg-white/[.03] px-[1cqw] py-[.5cqw] text-[.95cqw] text-[#8b93c9]">
              <svg viewBox="0 0 24 24" className="size-[1.1cqw]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
              Ask anything about your money…
              <span className="ml-auto rounded-[.3cqw] border border-white/10 px-[.4cqw] font-mono text-[.75cqw]">⌘K</span>
            </span>
            <span className="relative grid size-[2.2cqw] place-items-center rounded-full bg-[linear-gradient(135deg,#818cf8,#5eead4)] font-mono text-[.85cqw] font-bold text-[#0a0e27]">
              MS
              <i className="absolute -top-[.1cqw] -right-[.1cqw] size-[.7cqw] rounded-full border-[.15cqw] border-[#0a0e27] bg-[#f472b6]" />
            </span>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* sidebar */}
            <div className="flex w-[4.6cqw] flex-none flex-col items-center gap-[1cqw] border-r border-white/[.06] pt-[1.4cqw]">
              {NAV.map((d, i) => (
                <span
                  key={i}
                  className={`relative grid size-[2.6cqw] place-items-center rounded-[.7cqw] ${i === 0 ? "bg-[#818cf8]/18 text-[#c7d2fe]" : "text-[#5b6394]"}`}
                >
                  {i === 0 && <i className="absolute top-1/2 -left-[1cqw] h-[1.6cqw] w-[.25cqw] -translate-y-1/2 rounded-full bg-[#818cf8]" />}
                  <svg viewBox="0 0 24 24" className="size-[1.4cqw]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                    <path d={d} />
                  </svg>
                </span>
              ))}
            </div>

            {/* main */}
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-[1cqw] p-[1.2cqw]">
              {/* KPI row */}
              <div className="col-span-2 grid grid-cols-4 gap-[1cqw]">
                {KPIS.map((k, i) => (
                  <div key={k.l} className={`${panel} px-[1.1cqw] py-[.9cqw]`}>
                    <div className={label}>{k.l}</div>
                    <div className="mt-[.5cqw] flex items-end justify-between gap-[.6cqw]">
                      <span className="font-display text-[1.95cqw] leading-none font-[680] tracking-[-.025em] text-[#eef2ff]">{k.v}</span>
                      <svg viewBox="0 0 48 16" className="h-[1.6cqw] w-[4.4cqw] overflow-visible" aria-hidden>
                        <path d={k.s} fill="none" stroke={i === 3 ? "#5eead4" : "#a5b4fc"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="pa-draw-loop" style={{ animationDelay: `${i * 0.25}s` }} />
                      </svg>
                    </div>
                    <div className={`mt-[.45cqw] font-mono text-[.8cqw] ${k.up ? "text-[#5eead4]" : "text-[#a5b4fc]"}`}>{k.d}</div>
                  </div>
                ))}
              </div>

              {/* Forecast */}
              <div className={`${panel} flex min-h-0 flex-col p-[1.1cqw]`}>
                <div className="flex items-center justify-between">
                  <span className={label}>Spend forecast · 5 months</span>
                  <span className="flex items-center gap-[1cqw] font-mono text-[.78cqw] text-[#8b93c9]">
                    <span className="flex items-center gap-[.35cqw]"><i className="h-[.2cqw] w-[1.2cqw] rounded-full bg-[#c7d2fe]" />Actual</span>
                    <span className="flex items-center gap-[.35cqw]"><i className="h-[.7cqw] w-[1.2cqw] rounded-[.2cqw] bg-[#5eead4]/30" />80% band</span>
                  </span>
                </div>
                <svg viewBox="0 0 400 210" className="mt-[.6cqw] min-h-0 w-full flex-1" preserveAspectRatio="xMidYMid meet" aria-hidden>
                  <defs>
                    <linearGradient id="fs3-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#818cf8" stopOpacity=".35" />
                      <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="fs3-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#a5b4fc" />
                      <stop offset="1" stopColor="#e0e7ff" />
                    </linearGradient>
                  </defs>
                  {[40, 88, 136, 184].map((y) => (
                    <line key={y} x1="10" x2="394" y1={y} y2={y} stroke="#8b93c9" strokeOpacity=".1" strokeDasharray="2 5" />
                  ))}
                  <path d={AREA} fill="url(#fs3-area)" />
                  <path d={BAND} fill="#5eead4" fillOpacity=".16" />
                  <path d={HIST_D} stroke="url(#fs3-line)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <path d={FC_D} stroke="#5eead4" strokeWidth="2.4" strokeDasharray="6 5" fill="none" strokeLinecap="round" className="pa-dash-slow" />
                  <path d={TRACE} stroke="#fff" strokeOpacity=".9" strokeWidth="3.4" fill="none" strokeLinecap="round" pathLength={1} className="pa-comet" />
                  <line x1={TODAY} x2={TODAY} y1="26" y2="186" stroke="#c7d2fe" strokeOpacity=".35" strokeDasharray="2 4" />
                  <text x={TODAY + 5} y="32" fill="#c7d2fe" fillOpacity=".7" fontSize="8" letterSpacing="1.2" style={{ fontFamily: "var(--font-mono)" }}>
                    TODAY
                  </text>
                  <circle cx={TODAY} cy={HIST.at(-1)} r="4" fill="#5eead4" />
                  <circle cx={TODAY} cy={HIST.at(-1)} r="4" fill="none" stroke="#5eead4" strokeWidth="1.2" className="pa-ping" />
                  <circle cx={SPIKE[0]} cy={SPIKE[1]} r="4" fill="#f472b6" />
                  <circle cx={SPIKE[0]} cy={SPIKE[1]} r="4" fill="none" stroke="#f472b6" strokeWidth="1.2" className="pa-ping" />
                  <g transform={`translate(${SPIKE[0] - 22} ${SPIKE[1] - 22})`}>
                    <rect width="44" height="13" rx="3" fill="#f472b6" fillOpacity=".18" stroke="#f472b6" strokeOpacity=".5" strokeWidth=".6" />
                    <text x="22" y="9" textAnchor="middle" fill="#fbcfe8" fontSize="7" style={{ fontFamily: "var(--font-mono)" }}>
                      +3.4σ
                    </text>
                  </g>
                  {MONTHS.map((m, i) => (
                    <text key={i} x={X0 + i * DX} y="204" textAnchor="middle" fill="#8b93c9" fillOpacity={i < HIST.length ? 0.55 : 0.9} fontSize="7.5" style={{ fontFamily: "var(--font-mono)" }}>
                      {m}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Copilot */}
              <div className={`${panel} row-span-2 flex min-h-0 flex-col p-[1.1cqw]`}>
                <div className="flex items-center gap-[.6cqw]">
                  <span className="relative grid size-[2cqw] place-items-center rounded-[.55cqw] bg-[conic-gradient(from_200deg,#5eead4,#818cf8,#f472b6,#5eead4)]">
                    <svg viewBox="0 0 24 24" className="size-[1.1cqw] text-[#0a0e27]" fill="currentColor" aria-hidden>
                      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
                    </svg>
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[1.1cqw] font-[650] text-[#eef2ff]">Copilot</span>
                    <span className="font-mono text-[.72cqw] tracking-[.1em] text-[#8b93c9] uppercase">gpt-oss-120b · 14 tools</span>
                  </span>
                  <span className="ml-auto flex items-center gap-[.35cqw] font-mono text-[.75cqw] text-[#5eead4]">
                    <i className="pa-blink size-[.5cqw] rounded-full bg-[#5eead4]" /> live
                  </span>
                </div>

                <div className="mt-[1cqw] flex min-h-0 flex-1 flex-col gap-[.65cqw] overflow-hidden">
                  <div className="pa-msg ml-auto max-w-[86%] rounded-[.9cqw] rounded-br-[.25cqw] bg-[#818cf8]/20 px-[.9cqw] py-[.55cqw] text-[1cqw] leading-snug text-[#e0e7ff]">
                    Can I afford a ₹60k trip in May?
                  </div>
                  <div className="pa-msg flex flex-wrap gap-[.4cqw] [animation-delay:.9s]">
                    {["get_forecast", "plan_goal", "search_knowledge"].map((t) => (
                      <span key={t} className="rounded-full border border-[#5eead4]/30 bg-[#5eead4]/[.08] px-[.6cqw] py-[.15cqw] font-mono text-[.72cqw] text-[#99f6e4]">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                  <div className="pa-msg max-w-[96%] rounded-[.9cqw] rounded-bl-[.25cqw] border border-white/[.07] bg-white/[.04] px-[.9cqw] py-[.65cqw] text-[1cqw] leading-snug text-[#dbe1ff] [animation-delay:1.8s]">
                    Yes — save <b className="font-[650] text-white">₹9.4k/mo</b> from now and you&apos;ll hit it with an{" "}
                    <b className="font-[650] text-[#5eead4]">82%</b> chance.
                    <span className="mt-[.6cqw] block">
                      <span className="flex justify-between font-mono text-[.72cqw] text-[#8b93c9]">
                        <span>Monte Carlo · 4,000 paths</span>
                        <span className="text-[#5eead4]">82%</span>
                      </span>
                      <span className="mt-[.3cqw] block h-[.5cqw] overflow-hidden rounded-full bg-white/[.07]">
                        <span className="pa-grow-loop block h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#818cf8,#5eead4)]" />
                      </span>
                    </span>
                    <span className="mt-[.5cqw] flex gap-[.35cqw] font-mono text-[.7cqw] text-[#a5b4fc]">
                      <span className="rounded-[.25cqw] bg-white/[.06] px-[.35cqw]">[1] 50/30/20 rule</span>
                      <span className="rounded-[.25cqw] bg-white/[.06] px-[.35cqw]">[2] Emergency fund</span>
                    </span>
                  </div>
                  <div className="pa-msg flex gap-[.5cqw] [animation-delay:2.7s]">
                    <span className="rounded-[.6cqw] bg-[linear-gradient(90deg,#818cf8,#5eead4)] px-[.9cqw] py-[.4cqw] text-[.9cqw] font-[650] text-[#0a0e27]">Create goal</span>
                    <span className="rounded-[.6cqw] border border-white/10 px-[.9cqw] py-[.4cqw] text-[.9cqw] text-[#c7d2fe]">Show plan</span>
                  </div>
                </div>

                <div className="mt-[.8cqw] flex items-center gap-[.6cqw] rounded-[.7cqw] border border-white/[.08] bg-black/20 px-[.8cqw] py-[.55cqw] text-[.9cqw] text-[#5b6394]">
                  Ask a follow-up
                  <i className="pa-blink h-[1cqw] w-[.12cqw] bg-[#a5b4fc]" />
                  <span className="ml-auto grid size-[1.6cqw] place-items-center rounded-[.4cqw] bg-[#818cf8] text-[.9cqw] text-[#0a0e27]">↑</span>
                </div>
              </div>

              {/* Budgets */}
              <div className={`${panel} px-[1.1cqw] py-[.9cqw]`}>
                <div className="flex items-center justify-between">
                  <span className={label}>Budgets · October</span>
                  <span className="font-mono text-[.78cqw] text-[#5eead4]">on pace</span>
                </div>
                <div className="mt-[.7cqw] grid grid-cols-3 gap-[1.2cqw]">
                  {BUDGETS.map((b, i) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-[.92cqw]">
                        <span className="text-[#dbe1ff]">{b.l}</span>
                        <span className="font-mono text-[.8cqw] text-[#8b93c9]">{b.v}%</span>
                      </div>
                      <span className="mt-[.4cqw] block h-[.5cqw] overflow-hidden rounded-full bg-white/[.07]">
                        <span className="pa-grow-loop block h-full rounded-full" style={{ width: `${b.v}%`, background: b.c, animationDelay: `${i * 0.15}s` }} />
                      </span>
                      <div className="mt-[.35cqw] font-mono text-[.75cqw] text-[#8b93c9]">{b.t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* Floating: health score */}
      <Layer d={2.4} className="right-[1.8%] bottom-[14%] w-[12cqw]">
        <div className="pa-float rounded-[1.2cqw] border border-white/[.12] bg-[linear-gradient(160deg,rgb(30_38_90/.95),rgb(12_15_40/.97))] p-[1cqw] shadow-[0_2.4cqw_4cqw_-1.4cqw_rgb(0_0_0/.85),0_0_3cqw_-1cqw_rgb(94_234_212/.35)] [animation-duration:7s]">
          <div className={label}>Health score</div>
          <div className="relative mx-auto mt-[.5cqw] grid size-[7.6cqw] place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <defs>
                <linearGradient id="fs3-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5eead4" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="#ffffff" strokeOpacity=".08" strokeWidth="9" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="url(#fs3-ring)" strokeWidth="9" fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="81 100" className="pa-gauge-loop" />
            </svg>
            <span className="flex flex-col items-center leading-none">
              <span className="font-display text-[2.6cqw] font-[700] tracking-[-.03em] text-white">81</span>
              <span className="mt-[.2cqw] font-mono text-[.7cqw] tracking-[.12em] text-[#5eead4] uppercase">Strong</span>
            </span>
          </div>
        </div>
      </Layer>

      {/* Floating: anomaly alert */}
      <Layer d={3} className="bottom-[2.5%] left-[2.5%] w-[22cqw]">
        <div className="pa-msg flex items-center gap-[.8cqw] rounded-[1cqw] border border-[#f472b6]/35 bg-[linear-gradient(160deg,rgb(60_20_60/.95),rgb(20_10_30/.97))] px-[1cqw] py-[.8cqw] shadow-[0_2.4cqw_4cqw_-1.4cqw_rgb(0_0_0/.85),0_0_3cqw_-1cqw_rgb(244_114_182/.45)] [animation-delay:3.4s]">
          <span className="grid size-[2.2cqw] flex-none place-items-center rounded-full bg-[#f472b6]/20 text-[1.1cqw] font-bold text-[#f9a8d4]">!</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[1.05cqw] font-[640] text-[#fdf2f8]">Unusual travel spend</span>
            <span className="font-mono text-[.75cqw] tracking-[.06em] text-[#f9a8d4]/80">₹14.2k · 3.4σ above your baseline</span>
          </span>
        </div>
      </Layer>
    </Scene>
  );
}
