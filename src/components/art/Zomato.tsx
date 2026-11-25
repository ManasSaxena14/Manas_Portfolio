import { Layer, Scene } from "./Scene";

// A food-magazine cover in tomato red. The hero is a plate seen from above:
// its rim is the online-ordering donut (365 of 681 restaurants), and the
// cover lines carry the dashboard's numbers in big cream serif.

const TOMATO = "#b8202c";
const CREAM = "#fbefe0";
const BLUSH = "#f6c9b8";

const YES = 365 / 681;

const COVER_LINES = [
  ["67,786", "ratings read"],
  ["3.42", "average rating"],
  ["₹405", "for two, on average"],
];

export default function Zomato() {
  return (
    <Scene className="bg-[radial-gradient(110%_100%_at_70%_30%,#d12a35_0%,#b8202c_45%,#8c1520_100%)]">
      {/* Paper grain and a soft vignette */}
      <Layer d={0.2} className="inset-0">
        <span className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgb(255_240_220/.07)_1px,transparent_1.2px)] [background-size:1cqw_1cqw]" />
        <span className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_50%,transparent_60%,rgb(60_5_10/.35))]" />
      </Layer>

      {/* Masthead */}
      <Layer d={1} className="top-[6%] left-[5%] right-[5%]">
        <div className="flex items-end justify-between border-b border-[#fbefe0]/35 pb-[.8cqw]">
          <span className="font-serif text-[5.4cqw] leading-[.8] italic" style={{ color: CREAM }}>
            Bengaluru, by the plate
          </span>
          <span className="font-mono text-[1cqw] tracking-[.24em] uppercase" style={{ color: BLUSH }}>
            Market analytics · Tableau
          </span>
        </div>
      </Layer>

      {/* The plate: rim = online ordering donut */}
      <Layer d={1.6} className="top-[19%] right-[7%] w-[36%]">
        <div className="relative aspect-square">
          <span className="absolute inset-[4%] rounded-full bg-[rgb(60_5_10/.4)] blur-[1.6cqw] [transform:translate(1.4cqw,2cqw)]" />
          <svg viewBox="0 0 100 100" className="relative size-full" aria-hidden>
            <circle cx="50" cy="50" r="47" fill={CREAM} />
            <circle cx="50" cy="50" r="40" fill="none" stroke={BLUSH} strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2b0f0d"
              strokeWidth="8"
              pathLength={100}
              strokeDasharray={`${Math.round(YES * 1000) / 10} 100`}
              transform="rotate(-90 50 50)"
              className="pa-gauge"
              style={{ strokeDashoffset: 78 }}
            />
            <circle cx="50" cy="50" r="33" fill="#fff8ef" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="#ead8c4" strokeWidth=".6" />
            <text x="50" y="49" textAnchor="middle" fontSize="15" fill={TOMATO} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              681
            </text>
            <text x="50" y="59" textAnchor="middle" fontSize="3.6" letterSpacing=".6" fill="#7a4a42" style={{ fontFamily: "var(--font-mono)" }}>
              RESTAURANTS
            </text>
          </svg>
          {/* Legend for the rim */}
          <div className="absolute -bottom-[6%] left-1/2 flex -translate-x-1/2 gap-[1.4cqw] font-mono text-[1cqw] whitespace-nowrap" style={{ color: CREAM }}>
            <span className="flex items-center gap-[.5cqw]">
              <i className="size-[.9cqw] rounded-full bg-[#2b0f0d]" /> Online 365
            </span>
            <span className="flex items-center gap-[.5cqw]">
              <i className="size-[.9cqw] rounded-full" style={{ background: BLUSH }} /> No online orders 316
            </span>
          </div>
        </div>
      </Layer>

      {/* Cover lines */}
      <Layer d={2.2} className="top-[25%] left-[5%] w-[44%]">
        <div className="flex flex-col gap-[1.6cqw]">
          {COVER_LINES.map(([v, l]) => (
            <div key={l}>
              <div className="font-serif text-[6cqw] leading-[.85]" style={{ color: CREAM }}>
                {v}
              </div>
              <div className="mt-[.3cqw] font-mono text-[1.05cqw] tracking-[.2em] uppercase" style={{ color: BLUSH }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </Layer>

      {/* Footer strap */}
      <Layer d={1.2} className="bottom-[6%] left-[5%] right-[5%]">
        <div className="flex items-center justify-between border-t border-[#fbefe0]/35 pt-[.8cqw] font-mono text-[1cqw] tracking-[.18em] uppercase" style={{ color: BLUSH }}>
          <span>681 restaurants · 67,786 ratings</span>
          <span>Area · cuisine · revenue category</span>
        </div>
      </Layer>
    </Scene>
  );
}
