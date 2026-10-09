import { Layer, Scene } from "./Scene";

// Obsidian & champagne: one lot — a faceted diamond — floating inside a live
// countdown ring. The price ticks up as server-validated bids land, the bid
// history climbs in steps, and paddles rise around the room.

const GOLD = "#e9c46a";
const CHAMPAGNE = "#f6e7c1";
const r2 = (v: number) => Math.round(v * 100) / 100;

const PRICES = ["$4.20M", "$4.35M", "$4.50M", "$4.65M", "$4.80M"];
const FEED = [
  { n: "Paddle 17", tag: "17", v: "$4.80M", c: "#e9c46a" },
  { n: "Paddle 08", tag: "08", v: "$4.65M", c: "#a78bfa" },
  { n: "Online · SG", tag: "SG", v: "$4.50M", c: "#5eead4" },
  { n: "Paddle 23", tag: "23", v: "$4.35M", c: "#f472b6" },
  { n: "Online · NY", tag: "NY", v: "$4.20M", c: "#93c5fd" },
];
const STEPS = "M0 92 H14 V78 H28 V70 H40 V56 H54 V48 H66 V34 H80 V22 H92 V10 H100";

// Diamond facets (crown + pavilion), as polygons in a 200×200 box.
const FACETS: [string, string][] = [
  ["40,70 70,40 100,70", "#fdf8ec"],
  ["70,40 130,40 100,70", "#e9dcbf"],
  ["100,70 130,40 160,70", "#fbf3df"],
  ["40,70 100,70 70,90", "#d9c79f"],
  ["100,70 160,70 130,90", "#efe2c4"],
  ["70,90 100,70 130,90", "#fffaf0"],
  ["40,70 70,90 100,170", "#c7b48b"],
  ["70,90 130,90 100,170", "#f1e6cc"],
  ["130,90 160,70 100,170", "#b39d70"],
];

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i / 60) * Math.PI * 2;
  const r1 = i % 5 === 0 ? 81 : 85;
  return {
    x1: r2(100 + Math.cos(a) * r1),
    y1: r2(100 + Math.sin(a) * r1),
    x2: r2(100 + Math.cos(a) * 88),
    y2: r2(100 + Math.sin(a) * 88),
    o: i % 5 === 0 ? 0.5 : 0.18,
  };
});

export default function BidVerse() {
  return (
    <Scene className="bg-[radial-gradient(90%_80%_at_50%_42%,#2a2318_0%,#14110c_42%,#070605_100%)]">
      {/* Marble veins, gallery light, rising dust */}
      <Layer d={0.25} className="inset-0">
        <span className="absolute inset-0 opacity-60 [background-image:linear-gradient(115deg,transparent_46%,rgb(233_196_106/.08)_47%,transparent_49%),linear-gradient(64deg,transparent_60%,rgb(233_196_106/.06)_61%,transparent_63%),linear-gradient(150deg,transparent_25%,rgb(255_255_255/.04)_26%,transparent_28%)]" />
        <span className="absolute top-0 left-1/2 h-full w-[46%] -translate-x-1/2 bg-[linear-gradient(180deg,rgb(246_231_193/.14),transparent_75%)] [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" />
        {Array.from({ length: 10 }, (_, i) => (
          <i
            key={i}
            className="pa-rise absolute bottom-[10%] size-[.34cqw] rounded-full bg-[#f6e7c1]"
            style={{ left: `${34 + ((i * 47) % 32)}%`, animationDelay: `${-i * 0.8}s`, animationDuration: `${6 + (i % 4)}s` }}
          />
        ))}
      </Layer>

      {/* Countdown ring + the diamond */}
      <Layer d={1} className="top-[8%] left-[33%] w-[34%]">
        <div className="relative aspect-square">
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="100" cy="100" r="94" fill="none" stroke={GOLD} strokeOpacity=".14" strokeWidth="3" />
            <circle cx="100" cy="100" r="94" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="100 100" className="pa-countdown" />
            {TICKS.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={CHAMPAGNE} strokeOpacity={t.o} strokeWidth="1" />
            ))}
          </svg>
          <div className="absolute inset-[20%]">
            <span className="pa-breathe absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgb(246_231_193/.32),transparent_62%)]" />
            <div className="pa-bob relative size-full [animation-duration:7s]">
              <svg viewBox="0 0 200 200" className="size-full overflow-visible drop-shadow-[0_2cqw_2cqw_rgb(0_0_0/.6)]" aria-hidden>
                <defs>
                  <clipPath id="bv2-gem">
                    <polygon points="40,70 70,40 130,40 160,70 100,170" />
                  </clipPath>
                </defs>
                {FACETS.map(([pts, fill]) => (
                  <polygon key={pts} points={pts} fill={fill} stroke="#8a7650" strokeOpacity=".55" strokeWidth=".8" strokeLinejoin="round" />
                ))}
                <g clipPath="url(#bv2-gem)">
                  <rect x="0" y="20" width="34" height="180" fill="#fff" fillOpacity=".75" transform="skewX(-18)" className="pa-gem-glint" />
                </g>
                <path d="M86 52 L89 60 L97 63 L89 66 L86 74 L83 66 L75 63 L83 60 Z" fill="#fff" className="pa-twinkle" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                <path d="M136 80 L138 85 L143 87 L138 89 L136 94 L134 89 L129 87 L134 85 Z" fill="#fff" className="pa-twinkle" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: "-1.4s" }} />
              </svg>
            </div>
          </div>
          <span className="absolute -bottom-[3%] left-1/2 -translate-x-1/2 rounded-full border border-[#e9c46a]/40 bg-[#14110c]/95 px-[1.2cqw] py-[.35cqw] font-mono text-[1.05cqw] tracking-[.18em] whitespace-nowrap text-[#e9c46a] uppercase">
            Going once…
          </span>
        </div>
      </Layer>

      {/* Lot + live price */}
      <Layer d={1.6} className="top-[7%] left-[5%] w-[27%]">
        <div className="flex items-center gap-[.8cqw] font-mono text-[1.05cqw] tracking-[.16em] text-[#bfae86] uppercase">
          <span className="flex items-center gap-[.5cqw] rounded-full border border-[#f87171]/50 bg-[#f87171]/10 px-[.9cqw] py-[.25cqw] text-[#fca5a5]">
            <i className="pa-blink size-[.6cqw] rounded-full bg-[#f87171]" /> Live
          </span>
          Lot 042
        </div>
        <div className="mt-[1.2cqw] font-serif text-[3.8cqw] leading-[.95] text-[#f6e7c1] italic">The Aurora</div>
        <div className="mt-[.3cqw] font-display text-[2.2cqw] leading-none font-[650] tracking-[-.02em] text-[#f6e7c1]">Diamond · 12.4 ct</div>

        <div className="mt-[2.2cqw] font-mono text-[1cqw] tracking-[.16em] text-[#8d7f62] uppercase">Current bid</div>
        <div className="mt-[.4cqw] h-[4.6cqw] overflow-hidden">
          <div className="pa-price flex flex-col">
            {[...PRICES, PRICES[0]].map((p, i) => (
              <span
                key={i}
                className="block h-[4.6cqw] bg-[linear-gradient(180deg,#fff4d6,#e9c46a_55%,#9a7426)] bg-clip-text font-display text-[4.2cqw] leading-[4.6cqw] font-[720] tracking-[-.03em] text-transparent"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-[.6cqw] flex items-center gap-[.6cqw] font-mono text-[1cqw] text-[#86efac]">
          <span>▲ +$150k</span>
          <span className="text-[#5c513d]">·</span>
          <span className="text-[#bfae86]">reserve met</span>
        </div>
      </Layer>

      {/* Bid history climbing */}
      <Layer d={1.2} className="bottom-[7%] left-[5%] w-[27%]">
        <div className="rounded-[1.2cqw] border border-[#e9c46a]/20 bg-[#14110c]/85 p-[1.2cqw]">
          <div className="flex justify-between font-mono text-[.95cqw] tracking-[.14em] text-[#8d7f62] uppercase">
            <span>Bid history</span>
            <span className="text-[#e9c46a]">38 bids</span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-[.8cqw] h-[7cqw] w-full overflow-visible" aria-hidden>
            <path d={`${STEPS} V100 H0 Z`} fill={GOLD} fillOpacity=".08" />
            <path d={STEPS} stroke={GOLD} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" pathLength={1} className="pa-draw-loop" />
          </svg>
        </div>
      </Layer>

      {/* Live feed */}
      <Layer d={2.2} className="top-[8%] right-[4.5%] w-[27%]">
        <div className="pa-float rounded-[1.3cqw] border border-[#e9c46a]/25 bg-[linear-gradient(160deg,rgb(40_33_22/.94),rgb(14_12_9/.96))] p-[1.3cqw] shadow-[0_2.6cqw_5cqw_-1.6cqw_rgb(0_0_0/.85)]">
          <div className="flex items-center justify-between font-mono text-[.98cqw] tracking-[.14em] text-[#bfae86] uppercase">
            <span>Bid feed</span>
            <span className="text-[#86efac]">✓ validated</span>
          </div>
          <div className="relative mt-[1cqw] h-[18.4cqw] overflow-hidden">
            <div className="pa-feed flex flex-col gap-[.6cqw]">
              {[...FEED, ...FEED.slice(0, 4)].map((b, i) => (
                <div
                  key={i}
                  className={`flex h-[4.1cqw] flex-none items-center gap-[.8cqw] rounded-[.8cqw] border px-[.9cqw] ${
                    i % FEED.length === 0 ? "border-[#e9c46a]/50 bg-[#e9c46a]/10" : "border-white/[.06] bg-white/[.02]"
                  }`}
                >
                  <span className="grid size-[2.2cqw] flex-none place-items-center rounded-full font-mono text-[.9cqw] font-bold text-[#14110c]" style={{ background: b.c }}>
                    {b.tag}
                  </span>
                  <span className="flex-1 truncate text-[1.15cqw] text-[#f6e7c1]">{b.n}</span>
                  <span className={`font-mono text-[1.1cqw] ${i % FEED.length === 0 ? "text-[#e9c46a]" : "text-[#8d7f62]"}`}>{b.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layer>

      {/* Paddles raised around the room */}
      {[
        { c: "right-[22%] bottom-[5%] w-[5.4cqw]", n: "17", d: 2.6, t: "0s" },
        { c: "right-[13%] bottom-[3%] w-[4.8cqw]", n: "08", d: 2.9, t: "-1.6s" },
        { c: "right-[4.5%] bottom-[6%] w-[5.2cqw]", n: "23", d: 3.2, t: "-3.1s" },
      ].map((p) => (
        <Layer key={p.n} d={p.d} className={p.c}>
          <svg viewBox="0 0 40 70" className="pa-paddle block w-full overflow-visible drop-shadow-[0_1cqw_1cqw_rgb(0_0_0/.6)]" style={{ animationDelay: p.t }} aria-hidden>
            <rect x="17" y="34" width="6" height="36" rx="3" fill="#3b2f1e" />
            <circle cx="20" cy="20" r="19" fill={p.n === "17" ? GOLD : CHAMPAGNE} />
            <circle cx="20" cy="20" r="15" fill="none" stroke="#14110c" strokeOpacity=".25" strokeWidth="1" />
            <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill="#14110c" style={{ fontFamily: "var(--font-display)" }}>
              {p.n}
            </text>
          </svg>
        </Layer>
      ))}
    </Scene>
  );
}
