import { Layer, Scene } from "./Scene";

// Emerald glass: a forecast chart glowing across a deep green field, with
// the health score, an anomaly alert and the AI advisor floating above it.

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

const HIST = [700, 655, 668, 612, 470, 592, 548, 506, 482];
const FC = [482, 452, 461, 412, 380];
const X0 = 110;
const DX = 111;
const TODAY = X0 + (HIST.length - 1) * DX;
const hist = HIST.map((y, i) => [X0 + i * DX, y] as [number, number]);
const fc = FC.map((y, i) => [TODAY + i * DX, y] as [number, number]);
const upper = fc.map(([x, y], i) => [x, y - 10 - i * 22] as [number, number]);
const lower = fc.map(([x, y], i) => [x, y + 10 + i * 22] as [number, number]);
const CONE = `${smooth(upper)} L${lower.at(-1)![0]} ${lower.at(-1)![1]} ${smooth([...lower].reverse()).replace(/^M[^C]+/, "")} Z`;
const HIST_D = smooth(hist);
const AREA = `${HIST_D} L${TODAY} 920 L${X0} 920 Z`;
const FC_D = smooth(fc);
const SPIKE = hist[4];
const MONTHS = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR"];

const glass =
  "rounded-[1.3cqw] border border-[#6ee7b7]/20 bg-[linear-gradient(155deg,rgb(16_66_50/.82),rgb(4_24_18/.9))] shadow-[0_2.6cqw_5cqw_-1.8cqw_rgb(0_0_0/.8),inset_0_1px_0_rgb(255_255_255/.08)]";

export default function FinSight() {
  return (
    <Scene className="bg-[radial-gradient(100%_95%_at_12%_0%,#0f6447_0%,#06291e_44%,#020c08_100%)]">
      <Layer d={0.3} className="inset-0">
        <span className="absolute inset-0 [background-image:linear-gradient(rgb(110_231_183/.06)_1px,transparent_1px),linear-gradient(90deg,rgb(110_231_183/.06)_1px,transparent_1px)] [background-size:6.25cqw_6.25cqw] [mask-image:radial-gradient(ellipse_at_60%_55%,#000_20%,transparent_75%)]" />
        <span className="absolute -right-[18%] -bottom-[40%] size-[70cqw] rounded-full bg-[radial-gradient(circle,rgb(52_211_153/.18),transparent_60%)]" />
      </Layer>

      {/* The forecast */}
      <Layer d={0.9} className="inset-0">
        <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="fs-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ecfdf5" stopOpacity=".16" />
              <stop offset="1" stopColor="#ecfdf5" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fs-fc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
          {[330, 480, 630, 780].map((y) => (
            <line key={y} x1="80" x2="1540" y1={y} y2={y} stroke="#6ee7b7" strokeOpacity=".1" strokeDasharray="4 10" />
          ))}
          <path d={AREA} fill="url(#fs-area)" />
          <path d={CONE} fill="#34d399" fillOpacity=".12" />
          <path d={HIST_D} stroke="#ecfdf5" strokeOpacity=".12" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d={HIST_D} stroke="#ecfdf5" strokeWidth="4.5" fill="none" strokeLinecap="round" pathLength={1} className="pa-draw" />
          <path d={FC_D} stroke="#34d399" strokeOpacity=".25" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d={FC_D} stroke="url(#fs-fc)" strokeWidth="4.5" fill="none" strokeDasharray="14 12" strokeLinecap="round" className="pa-dash-slow" />
          {hist.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 4 ? 0 : 7} fill="#022c22" stroke="#ecfdf5" strokeWidth="3.5" />
          ))}
          <line x1={TODAY} x2={TODAY} y1="250" y2="880" stroke="#a7f3d0" strokeOpacity=".5" strokeDasharray="3 9" />
          <circle cx={TODAY} cy={hist.at(-1)![1]} r="11" fill="#34d399" />
          <circle cx={TODAY} cy={hist.at(-1)![1]} r="11" fill="none" stroke="#34d399" strokeWidth="2" className="pa-ping" />
          <text x={TODAY + 14} y="268" fill="#a7f3d0" fontSize="20" letterSpacing="3" style={{ fontFamily: "var(--font-mono)" }}>
            TODAY
          </text>
          {/* the anomaly */}
          <circle cx={SPIKE[0]} cy={SPIKE[1]} r="10" fill="#f87171" />
          <circle cx={SPIKE[0]} cy={SPIKE[1]} r="10" fill="none" stroke="#f87171" strokeWidth="2.5" className="pa-ping" />
          {MONTHS.map((m, i) => (
            <text key={i} x={X0 + i * DX} y="950" textAnchor="middle" fill="#6ee7b7" fillOpacity={i < HIST.length ? 0.45 : 0.75} fontSize="19" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
              {m}
            </text>
          ))}
        </svg>
      </Layer>

      {/* Headline number */}
      <Layer d={1.4} className="top-[7%] left-[5%]">
        <div className="font-mono text-[1.15cqw] tracking-[.14em] text-[#6ee7b7] uppercase">Forecast · next 5 months</div>
        <div className="mt-[.6cqw] flex items-baseline gap-[1.2cqw]">
          <span className="font-display text-[5cqw] leading-none font-[680] tracking-[-.045em] text-[#ecfdf5]">₹48,210</span>
          <span className="rounded-full bg-[#34d399]/15 px-[1cqw] py-[.35cqw] font-mono text-[1.15cqw] text-[#6ee7b7]">▲ 6.2% vs plan</span>
        </div>
      </Layer>

      {/* Anomaly alert */}
      <Layer d={2.4} className="top-[22%] left-[22%] w-[25%]">
        <div className={`pa-float p-[1.3cqw] ${glass} [animation-delay:-2s]`}>
          <div className="flex items-center gap-[.6cqw] font-mono text-[1cqw] tracking-[.12em] text-[#fca5a5] uppercase">
            <i className="pa-blink size-[.75cqw] rounded-full bg-[#f87171]" />
            Anomaly
          </div>
          <div className="mt-[.6cqw] text-[1.6cqw] leading-tight font-[620] text-[#ecfdf5]">Travel spend +3.4σ</div>
          <div className="mt-[.5cqw] font-mono text-[.95cqw] text-[#6ee7b7]/80">isolation forest · 2m ago</div>
        </div>
      </Layer>

      {/* Health score */}
      <Layer d={2} className="top-[7%] right-[4.5%] w-[21%]">
        <div className={`pa-float flex flex-col items-center p-[1.5cqw] ${glass}`}>
          <div className="self-start font-mono text-[1cqw] tracking-[.12em] text-[#6ee7b7] uppercase">Health score</div>
          <div className="relative mt-[.8cqw] grid size-[11cqw] place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" stroke="#064e3b" strokeWidth="9" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="#34d399" strokeWidth="9" fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="78 100" className="pa-gauge" />
            </svg>
            <span className="font-display text-[3.6cqw] leading-none font-[700] tracking-[-.04em] text-[#ecfdf5]">78</span>
          </div>
          <div className="mt-[.8cqw] font-mono text-[1cqw] tracking-[.1em] text-[#a7f3d0] uppercase">Strong · top 22%</div>
        </div>
      </Layer>

      {/* AI advisor */}
      <Layer d={2.8} className="right-[4.5%] bottom-[16%] w-[31%]">
        <div className={`pa-float p-[1.5cqw] ${glass} [animation-delay:-4s]`}>
          <div className="flex items-center justify-between font-mono text-[1cqw] tracking-[.12em] text-[#6ee7b7] uppercase">
            <span className="flex items-center gap-[.6cqw]">
              <span className="grid size-[2.2cqw] place-items-center rounded-[.6cqw] bg-[#34d399] text-[1cqw] font-bold text-[#022c22]">AI</span>
              Advisor
            </span>
            <span className="text-[#a7f3d0]/70">&lt;100 ms</span>
          </div>
          <p className="m-0 mt-[1cqw] text-[1.4cqw] leading-snug text-[#d1fae5]">
            Cut dining by <b className="font-[650] text-[#ecfdf5]">₹2.1k</b> to hit your March savings goal.
          </p>
          <div className="mt-[1.1cqw] flex items-center gap-[.8cqw]">
            <span className="rounded-[.7cqw] bg-[#34d399] px-[1.3cqw] py-[.6cqw] text-[1.15cqw] font-[650] text-[#022c22]">Apply plan</span>
            <span className="rounded-[.7cqw] border border-[#6ee7b7]/30 px-[1.3cqw] py-[.6cqw] text-[1.15cqw] text-[#a7f3d0]">Why?</span>
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
