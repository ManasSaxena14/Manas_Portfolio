import type { CSSProperties } from "react";
import { Layer, Scene } from "./Scene";

// Velvet & gold: a single lot under a spotlight on a violet stage, the
// countdown ticking, and the server-validated bid feed rolling in.

const GOLD = "#f5c518";
const r2 = (v: number) => Math.round(v * 100) / 100;

const SPARKS = [
  [8, 22], [14, 64], [22, 38], [31, 12], [37, 80], [46, 30], [55, 9], [63, 72], [69, 20], [76, 52], [84, 12], [91, 40], [95, 70], [27, 55], [58, 46],
];

const BIDS = [
  { n: "Tony S.", v: "$7,000,000", t: "now" },
  { n: "Bruce W.", v: "$6,850,000", t: "12s" },
  { n: "Diana P.", v: "$6,600,000", t: "40s" },
  { n: "Clark K.", v: "$6,250,000", t: "1m" },
  { n: "Selina K.", v: "$6,000,000", t: "2m" },
];

/** A digit column that rolls 9 → 0 once per `period` (seconds), stepping. */
function Roll({ period, offset = 0 }: { period: number; offset?: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top leading-none">
      <span
        className="pa-roll flex flex-col"
        style={{ animationDuration: `${period}s`, animationDelay: `${-offset}s` } as CSSProperties}
      >
        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9].map((d, i) => (
          <span key={i} className="h-[1em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function BidVerse() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const long = i % 3 === 0;
    return {
      x1: r2(800 + Math.cos(a) * (long ? 96 : 104)),
      y1: r2(500 + Math.sin(a) * (long ? 96 : 104)),
      x2: r2(800 + Math.cos(a) * 116),
      y2: r2(500 + Math.sin(a) * 116),
      w: long ? 7 : 3.5,
    };
  });

  return (
    <Scene className="bg-[radial-gradient(90%_80%_at_50%_0%,#5b21b6_0%,#2a0f55_38%,#0c0420_70%,#05020c_100%)]">
      {/* Spotlight + gold dust */}
      <Layer d={0.3} className="inset-0">
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_240_200/.16),transparent_80%)] [clip-path:polygon(43%_0,57%_0,76%_100%,24%_100%)]" />
        {SPARKS.map(([x, y], i) => (
          <i
            key={i}
            className="pa-twinkle absolute size-[.5cqw] rounded-full bg-[#fde68a]"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-((i * 37) % 300) / 100}s` }}
          />
        ))}
      </Layer>

      {/* The lot: a watch floating above its plinth */}
      <Layer d={1.1} className="inset-0">
        <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="bv-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={GOLD} stopOpacity=".38" />
              <stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bv-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1b8" />
              <stop offset=".45" stopColor="#e7b416" />
              <stop offset="1" stopColor="#8a5a07" />
            </linearGradient>
            <linearGradient id="bv-strap" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3b2410" />
              <stop offset=".5" stopColor="#6b4419" />
              <stop offset="1" stopColor="#3b2410" />
            </linearGradient>
            <radialGradient id="bv-dial" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#2a1a52" />
              <stop offset="1" stopColor="#0b0618" />
            </radialGradient>
            <linearGradient id="bv-plinth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#24124a" />
              <stop offset="1" stopColor="#07030f" />
            </linearGradient>
          </defs>
          <circle cx="800" cy="500" r="330" fill="url(#bv-glow)" />
          {/* plinth */}
          <path d="M560 846 L1040 846 L1010 1000 L590 1000 Z" fill="url(#bv-plinth)" />
          <ellipse cx="800" cy="846" rx="240" ry="34" fill="#1a0b36" stroke={GOLD} strokeOpacity=".55" strokeWidth="2" />
          <ellipse cx="800" cy="846" rx="150" ry="16" fill={GOLD} fillOpacity=".12" />
          <g className="pa-bob">
            {/* straps */}
            <rect x="742" y="186" width="116" height="200" rx="26" fill="url(#bv-strap)" />
            <rect x="742" y="614" width="116" height="190" rx="26" fill="url(#bv-strap)" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="756" x2="844" y1={226 + i * 38} y2={226 + i * 38} stroke="#000" strokeOpacity=".35" strokeWidth="3" />
            ))}
            {/* case */}
            <circle cx="800" cy="500" r="150" fill="url(#bv-gold)" />
            <rect x="944" y="482" width="26" height="36" rx="6" fill="url(#bv-gold)" />
            <circle cx="800" cy="500" r="128" fill="url(#bv-dial)" stroke="#fde68a" strokeOpacity=".5" strokeWidth="2" />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={GOLD} strokeWidth={t.w} strokeLinecap="round" />
            ))}
            <text x="800" y="455" textAnchor="middle" fill="#fde68a" fontSize="22" letterSpacing="5" style={{ fontFamily: "var(--font-serif)" }}>
              BIDVERSE
            </text>
            <line x1="800" y1="500" x2="800" y2="420" stroke="#fef3c7" strokeWidth="9" strokeLinecap="round" />
            <line x1="800" y1="500" x2="862" y2="532" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" />
            <g className="pa-sweep" style={{ transformOrigin: "800px 500px" }}>
              <line x1="800" y1="530" x2="800" y2="392" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
            </g>
            <circle cx="800" cy="500" r="11" fill={GOLD} />
            <path d="M700 420 A 128 128 0 0 1 842 380" stroke="#fff" strokeOpacity=".22" strokeWidth="10" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </Layer>

      {/* Brand + lot */}
      <Layer d={1.4} className="top-[6%] left-[5%]">
        <div className="font-serif text-[3.4cqw] leading-none text-[#fde68a]">BidVerse</div>
        <div className="mt-[.8cqw] flex items-center gap-[.8cqw] font-mono text-[1.05cqw] tracking-[.14em] text-[#d8c7f5] uppercase">
          <span className="flex items-center gap-[.5cqw] rounded-full border border-[#f87171]/50 bg-[#f87171]/10 px-[.9cqw] py-[.25cqw] text-[#fca5a5]">
            <i className="pa-blink size-[.65cqw] rounded-full bg-[#f87171]" /> Live
          </span>
          Lot 042 · Grand complication
        </div>
      </Layer>

      {/* Current bid + countdown */}
      <Layer d={2} className="bottom-[8%] left-[5%] w-[30%]">
        <div className="font-mono text-[1.05cqw] tracking-[.16em] text-[#c4b5fd] uppercase">Current bid</div>
        <div className="mt-[.4cqw] bg-[linear-gradient(180deg,#fff1b8,#e7b416_55%,#a16207)] bg-clip-text font-display text-[4.6cqw] leading-none font-[720] tracking-[-.04em] text-transparent">
          $7,000,000
        </div>
        <div className="mt-[1.2cqw] flex items-center gap-[.6cqw] font-mono text-[2.2cqw] font-[600] text-[#fde68a]">
          {["00", "24"].map((v, i) => (
            <span key={i} className="flex items-center gap-[.6cqw]">
              <span className="rounded-[.6cqw] border border-[#f5c518]/35 bg-[#1a0b36] px-[.7cqw] py-[.35cqw] leading-none">{v}</span>
              <span className="text-[#f5c518]/60">:</span>
            </span>
          ))}
          <span className="rounded-[.6cqw] border border-[#f5c518]/35 bg-[#1a0b36] px-[.7cqw] py-[.35cqw] leading-none">
            <span className="inline-block w-[1.4cqw] text-center leading-none">3</span>
            <Roll period={10} />
          </span>
        </div>
      </Layer>

      {/* Bid feed */}
      <Layer d={2.5} className="top-[14%] right-[4.5%] w-[29%]">
        <div className="pa-float rounded-[1.3cqw] border border-[#f5c518]/25 bg-[linear-gradient(160deg,rgb(42_18_84/.92),rgb(14_6_30/.95))] p-[1.3cqw] shadow-[0_2.6cqw_5cqw_-1.6cqw_rgb(0_0_0/.85)]">
          <div className="flex items-center justify-between font-mono text-[.98cqw] tracking-[.12em] text-[#c4b5fd] uppercase">
            <span>Bid feed</span>
            <span className="text-[#86efac]">✓ validated</span>
          </div>
          <div className="relative mt-[1cqw] h-[18.4cqw] overflow-hidden">
            <div className="pa-feed flex flex-col gap-[.6cqw]">
              {[...BIDS, ...BIDS.slice(0, 4)].map((b, i) => (
                <div
                  key={i}
                  className={`flex h-[4.1cqw] flex-none items-center gap-[.8cqw] rounded-[.8cqw] border px-[.9cqw] ${
                    i % BIDS.length === 0 ? "border-[#f5c518]/50 bg-[#f5c518]/10" : "border-white/[.07] bg-white/[.03]"
                  }`}
                >
                  <span className="grid size-[2.2cqw] flex-none place-items-center rounded-full bg-[#f5c518] font-mono text-[1cqw] font-bold text-[#1a0b36]">
                    {b.n[0]}
                  </span>
                  <span className="flex-1 truncate text-[1.2cqw] text-[#ede9fe]">{b.n}</span>
                  <span className={`font-mono text-[1.15cqw] ${i % BIDS.length === 0 ? "text-[#fde68a]" : "text-[#a78bfa]"}`}>{b.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layer>

      {/* Place bid */}
      <Layer d={2.2} className="right-[4.5%] bottom-[8%]">
        <span className="pa-glow inline-flex items-center gap-[.8cqw] rounded-[1cqw] bg-[linear-gradient(180deg,#fde68a,#eab308)] px-[2cqw] py-[1cqw] text-[1.5cqw] font-[700] text-[#1a0b36]">
          Place bid <span className="font-mono">+$150k</span>
        </span>
      </Layer>
    </Scene>
  );
}
