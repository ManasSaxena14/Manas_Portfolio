import { Layer, Scene } from "./Scene";

// Studio still life on pearl. A support ticket enters as one beam of white
// light; a glass prism splits it into three: the help article, the routed
// queue and the escalation risk, each landing on its own small card. The only
// light, spectral, product-photograph preview on the page.

const INK = "#1d1b2b";
const MUTED = "#77748a";

// Beam geometry in a 160 × 100 box (x% = x / 160, y% = y / 100), worked out
// from the prism: apex (80, 31), base from (65, 60) to (95, 60). White light
// meets the left face at its middle; the three colours leave the right face
// and end exactly on the left edge of their cards (x = 116).
const IN = "M40 42 L72.5 45.5";
const INSIDE = "M72.5 45.5 L87.5 45.5";
const OUTS = [
  { d: "M85.2 41.2 L116 15", c: "#6366f1", k: "Help article", v: "Password reset · 63% match", y: "15%" },
  { d: "M87.5 45.5 L116 45", c: "#14b8a6", k: "Queue", v: "Service Outages · 47%, check", y: "45%" },
  { d: "M89.8 49.9 L116 75", c: "#f43f5e", k: "Escalation risk", v: "82% · flagged", y: "75%" },
];

export default function ResolveIQ() {
  return (
    <Scene className="bg-[linear-gradient(180deg,#f7f6f4_0%,#efeef2_48%,#e2e0e8_78%,#d6d3de_100%)]">
      {/* Studio light: a soft key from above and a seamless sweep to the floor */}
      <Layer d={0.2} className="inset-0">
        <span className="absolute -top-[40%] left-[22%] size-[80cqw] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/.95),transparent_58%)]" />
        <span className="absolute inset-x-0 bottom-0 h-[38%] bg-[radial-gradient(60%_80%_at_52%_0%,rgb(255_255_255/.45),transparent_70%)]" />
      </Layer>

      {/* Caustics thrown on the floor by the prism */}
      <Layer d={0.5} className="top-[63%] left-[46%] w-[30%]">
        <span className="rq-caustic block h-[9cqw] w-full rounded-[50%] bg-[conic-gradient(from_200deg,#6366f1,#14b8a6,#facc15,#f43f5e,#6366f1)] opacity-30 blur-[2.2cqw]" />
      </Layer>

      {/* Beams */}
      <Layer d={0.9} className="inset-0">
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <filter id="rq-bloom" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>
          {/* Incoming white light: a halo in grey so it reads on pearl */}
          <path d={IN} stroke="#a9a5bd" strokeOpacity=".35" strokeWidth="3" filter="url(#rq-bloom)" />
          <path d={IN} stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
          <path d={INSIDE} stroke="#ffffff" strokeOpacity=".8" strokeWidth=".9" />
          {OUTS.map((o, i) => (
            <g key={o.d}>
              <path d={o.d} stroke={o.c} strokeOpacity=".4" strokeWidth="3.4" filter="url(#rq-bloom)" className="rq-beam" style={{ animationDelay: `${-i * 0.6}s` }} />
              <path d={o.d} stroke={o.c} strokeWidth=".8" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      </Layer>

      {/* The prism */}
      <Layer d={1.4} className="top-[30%] left-[40.6%] w-[18.8%]">
        <svg viewBox="0 0 100 96" className="w-full overflow-visible drop-shadow-[0_2cqw_2cqw_rgb(40_30_80/.22)]" aria-hidden>
          <defs>
            <linearGradient id="rq-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
              <stop offset=".45" stopColor="#e9e7f5" stopOpacity=".55" />
              <stop offset="1" stopColor="#c9c5df" stopOpacity=".8" />
            </linearGradient>
            <linearGradient id="rq-edge" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset=".5" stopColor="#14b8a6" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <polygon points="50,0 100,96 0,96" fill="url(#rq-glass)" stroke="#ffffff" strokeWidth="1.4" strokeLinejoin="round" />
          <polygon points="50,0 100,96 0,96" fill="none" stroke="url(#rq-edge)" strokeOpacity=".5" strokeWidth=".8" strokeLinejoin="round" />
          <polygon points="50,18 62,42 42,42" fill="#ffffff" fillOpacity=".7" className="rq-glint" />
          <line x1="50" y1="0" x2="50" y2="96" stroke="#ffffff" strokeOpacity=".5" strokeWidth=".6" />
        </svg>
      </Layer>

      {/* The ticket the light comes from */}
      <Layer d={2} className="top-[29%] left-[4%] w-[21%]">
        <div className="pa-float rotate-[-4deg] rounded-[1cqw] bg-white p-[1.2cqw] shadow-[0_1.6cqw_3cqw_-1.4cqw_rgb(40_30_80/.35)]">
          <div className="flex justify-between font-mono text-[.85cqw] tracking-[.16em] uppercase" style={{ color: MUTED }}>
            <span>Ticket</span>
            <span className="text-[#f43f5e]">new</span>
          </div>
          <div className="mt-[.6cqw] text-[1.25cqw] leading-[1.4]" style={{ color: INK }}>
            “Our whole team has been locked out since this morning.”
          </div>
        </div>
      </Layer>

      {/* Where each beam lands */}
      {OUTS.map((o, i) => (
        <Layer key={o.k} d={2.2 + i * 0.3} className="right-[3.5%] w-[24%] -translate-y-1/2" style={{ top: o.y }}>
          <div className="flex items-center gap-[1cqw] rounded-[1cqw] bg-white/85 px-[1.2cqw] py-[.9cqw] shadow-[0_1.4cqw_2.6cqw_-1.4cqw_rgb(40_30_80/.3)] backdrop-blur-[.6cqw]">
            <span className="h-[3cqw] w-[.35cqw] flex-none rounded-full" style={{ background: o.c }} />
            <div className="min-w-0">
              <div className="font-mono text-[.85cqw] tracking-[.16em] uppercase" style={{ color: MUTED }}>
                {o.k}
              </div>
              <div className="truncate text-[1.25cqw] font-semibold" style={{ color: INK }}>
                {o.v}
              </div>
            </div>
          </div>
        </Layer>
      ))}

      {/* Signature */}
      <Layer d={1.2} className="bottom-[7%] left-[4%]">
        <div className="font-display text-[3.6cqw] leading-none font-[720] tracking-[-.03em]" style={{ color: INK }}>
          ResolveIQ
        </div>
        <div className="mt-[.5cqw] font-mono text-[1cqw] tracking-[.18em] uppercase" style={{ color: MUTED }}>
          One ticket · three answers · one call
        </div>
      </Layer>
    </Scene>
  );
}
