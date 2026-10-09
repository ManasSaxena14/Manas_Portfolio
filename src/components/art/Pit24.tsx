import type { CSSProperties } from "react";
import { Layer, Scene } from "./Scene";

// Blueprint: the line as a general-arrangement drawing — eight stations in
// plan view, cars rolling through at takt, dimensioned and stamped.

const W = "#e8f1ff";
const ORANGE = "#ff9f43";
const STATIONS = ["GATE", "S1", "S2", "S3", "S4", "S5", "S6", "S7"];
const ROLE = ["queue", "foam", "rinse", "dry", "interior", "exterior", "detail", "QC"];
const X0 = 150;
const SW = 162.5; // station pitch
const BELT_Y = 420;
const BELT_H = 150;

/** Top-down car, drawn around its own origin. */
function Car() {
  return (
    <g>
      <rect x="-46" y="-26" width="92" height="52" rx="16" fill="#0b3566" stroke={W} strokeWidth="2.4" />
      <rect x="-14" y="-20" width="26" height="40" rx="6" fill="none" stroke={W} strokeOpacity=".7" strokeWidth="1.6" />
      <path d="M20 -18 Q 34 0 20 18" fill="none" stroke={W} strokeOpacity=".7" strokeWidth="1.6" />
      {[-30, 26].map((x) => (
        <g key={x}>
          <rect x={x} y="-31" width="16" height="6" rx="2" fill={W} />
          <rect x={x} y="25" width="16" height="6" rx="2" fill={W} />
        </g>
      ))}
    </g>
  );
}

export default function Pit24() {
  const end = X0 + SW * STATIONS.length;
  return (
    <Scene className="bg-[#0a3462] [background-image:linear-gradient(rgb(232_241_255/.09)_1px,transparent_1px),linear-gradient(90deg,rgb(232_241_255/.09)_1px,transparent_1px),linear-gradient(rgb(232_241_255/.04)_1px,transparent_1px),linear-gradient(90deg,rgb(232_241_255/.04)_1px,transparent_1px)] [background-size:10cqw_10cqw,10cqw_10cqw,2cqw_2cqw,2cqw_2cqw]">
      <Layer d={0.3} className="inset-0">
        <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_50%,rgb(2_14_32/.55))]" />
      </Layer>

      <Layer d={0.9} className="inset-0">
        <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full" aria-hidden style={{ fontFamily: "var(--font-mono)" }}>
          {/* sheet border */}
          <rect x="30" y="30" width="1540" height="940" fill="none" stroke={W} strokeOpacity=".55" strokeWidth="2" />
          <rect x="42" y="42" width="1516" height="916" fill="none" stroke={W} strokeOpacity=".25" strokeWidth="1" />

          {/* the belt */}
          <rect x={X0} y={BELT_Y} width={end - X0} height={BELT_H} fill={W} fillOpacity=".05" stroke={W} strokeWidth="2.4" />
          <line x1={X0} x2={end} y1={BELT_Y + BELT_H / 2} y2={BELT_Y + BELT_H / 2} stroke={W} strokeOpacity=".4" strokeDasharray="22 8 4 8" />
          {STATIONS.map((s, i) => {
            const x = X0 + i * SW;
            const people = i >= 4 && i <= 6;
            return (
              <g key={s}>
                <rect x={x + 6} y={BELT_Y - 26} width={SW - 12} height={BELT_H + 52} fill="none" stroke={i === 0 ? ORANGE : W} strokeOpacity=".75" strokeWidth="1.6" strokeDasharray="10 6" />
                <text x={x + SW / 2} y={BELT_Y - 44} textAnchor="middle" fill={i === 0 ? ORANGE : W} fontSize="24" fontWeight="600" letterSpacing="2">
                  {s}
                </text>
                <text x={x + SW / 2} y={BELT_Y + BELT_H + 56} textAnchor="middle" fill={W} fillOpacity=".6" fontSize="16" letterSpacing="1.5">
                  {ROLE[i].toUpperCase()}
                </text>
                {people &&
                  [x + 46, x + SW - 46].map((px) => (
                    <g key={px}>
                      <circle cx={px} cy={BELT_Y - 8} r="9" fill={ORANGE} />
                      <circle cx={px} cy={BELT_Y + BELT_H + 8} r="9" fill={ORANGE} />
                    </g>
                  ))}
              </g>
            );
          })}

          {/* cars rolling through at takt */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i} className="pa-car" style={{ animationDelay: `${-i * 1.6}s`, "--x": `${i * 200}px` } as CSSProperties}>
              <g transform={`translate(${X0 - 60} ${BELT_Y + BELT_H / 2})`}>
                <Car />
              </g>
            </g>
          ))}

          {/* flow + takt callout */}
          <path d={`M${end + 30} ${BELT_Y + BELT_H / 2} h70`} stroke={ORANGE} strokeWidth="3" />
          <path d={`M${end + 92} ${BELT_Y + BELT_H / 2 - 10} l14 10 l-14 10`} fill="none" stroke={ORANGE} strokeWidth="3" />
          <text x={end + 30} y={BELT_Y + BELT_H / 2 - 22} fill={ORANGE} fontSize="18" letterSpacing="2">
            FLOW
          </text>
          <path d={`M${X0 + SW * 5.5} ${BELT_Y - 30} L${X0 + SW * 5.5 + 60} 300 H${X0 + SW * 5.5 + 300}`} stroke={W} strokeWidth="1.6" fill="none" />
          <circle cx={X0 + SW * 5.5} cy={BELT_Y - 30} r="5" fill={W} />
          <text x={X0 + SW * 5.5 + 70} y="290" fill={W} fontSize="22" letterSpacing="1.5">
            ONE CAR OUT EVERY <tspan fill={ORANGE} fontWeight="700">24 s</tspan>
          </text>

          {/* dimension: 50 m */}
          <g stroke={W} strokeWidth="1.6">
            <line x1={X0} x2={X0} y1={BELT_Y + BELT_H + 74} y2={BELT_Y + BELT_H + 124} />
            <line x1={end} x2={end} y1={BELT_Y + BELT_H + 74} y2={BELT_Y + BELT_H + 124} />
            <line x1={X0} x2={X0 + 560} y1={BELT_Y + BELT_H + 108} y2={BELT_Y + BELT_H + 108} />
            <line x1={end - 560} x2={end} y1={BELT_Y + BELT_H + 108} y2={BELT_Y + BELT_H + 108} />
            <path d={`M${X0 + 16} ${BELT_Y + BELT_H + 100} L${X0} ${BELT_Y + BELT_H + 108} L${X0 + 16} ${BELT_Y + BELT_H + 116}`} fill="none" />
            <path d={`M${end - 16} ${BELT_Y + BELT_H + 100} L${end} ${BELT_Y + BELT_H + 108} L${end - 16} ${BELT_Y + BELT_H + 116}`} fill="none" />
          </g>
          <text x={(X0 + end) / 2} y={BELT_Y + BELT_H + 116} textAnchor="middle" fill={W} fontSize="24" fontWeight="600" letterSpacing="3">
            50 000
          </text>

          {/* title block */}
          <g transform="translate(1086 806)">
            <rect width="460" height="140" fill="#0a3462" stroke={W} strokeWidth="2" />
            <line x1="0" x2="460" y1="46" y2="46" stroke={W} strokeOpacity=".6" />
            <line x1="0" x2="460" y1="94" y2="94" stroke={W} strokeOpacity=".6" />
            <line x1="230" x2="230" y1="46" y2="140" stroke={W} strokeOpacity=".6" />
            <text x="16" y="32" fill={W} fontSize="22" fontWeight="700" letterSpacing="2">PIT-24 · GENERAL ARRANGEMENT</text>
            <text x="16" y="76" fill={W} fillOpacity=".65" fontSize="15" letterSpacing="1.5">DRAWN · M. SAXENA</text>
            <text x="246" y="76" fill={W} fillOpacity=".65" fontSize="15" letterSpacing="1.5">SCALE · 1:200</text>
            <text x="16" y="124" fill={W} fillOpacity=".65" fontSize="15" letterSpacing="1.5">CARS24 CAR-A-THON</text>
            <text x="246" y="124" fill={W} fillOpacity=".65" fontSize="15" letterSpacing="1.5">SHEET 1 / 1</text>
          </g>

          {/* north arrow */}
          <g transform="translate(1490 120)" stroke={W} strokeWidth="2" fill="none">
            <circle r="34" strokeOpacity=".6" />
            <path d="M0 -26 L10 14 L0 6 L-10 14 Z" fill={W} />
            <text y="-42" textAnchor="middle" fill={W} stroke="none" fontSize="18">N</text>
          </g>
        </svg>
      </Layer>

      {/* Title */}
      <Layer d={1.3} className="top-[7.5%] left-[6%]">
        <div className="font-display text-[4.4cqw] leading-none font-[760] tracking-[-.04em] text-[#ff9f43]">PIT-24</div>
        <div className="mt-[.7cqw] font-mono text-[1.15cqw] tracking-[.16em] text-[#e8f1ff]/75 uppercase">Tier 1 · 8 stations · 16 people</div>
      </Layer>

      {/* KPI table */}
      <Layer d={1.7} className="bottom-[5.5%] left-[6%] w-[42%]">
        <div className="grid grid-cols-3 border-[.16cqw] border-[#e8f1ff]/80 bg-[#0a3462]/85 font-mono text-[#e8f1ff]">
          {[
            { k: "Takt", v: "24 s", c: "#ff9f43" },
            { k: "Cars / hour", v: "144", c: "#5eead4" },
            { k: "Min / car", v: "6.4", c: "#e8f1ff" },
          ].map((m, i) => (
            <div key={m.k} className={`flex flex-col gap-[.4cqw] px-[1.2cqw] py-[.9cqw] ${i ? "border-l-[.16cqw] border-[#e8f1ff]/50" : ""}`}>
              <span className="text-[.95cqw] tracking-[.14em] text-[#e8f1ff]/60 uppercase">{m.k}</span>
              <span className="text-[2.6cqw] leading-none font-[600]" style={{ color: m.c }}>
                {m.v}
              </span>
            </div>
          ))}
        </div>
      </Layer>

      {/* Stamp */}
      <Layer d={2.4} className="top-[13%] right-[23%]">
        <div className="pa-stamp rotate-[-11deg] rounded-[.8cqw] border-[.28cqw] border-[#ff9f43] p-[.35cqw] text-[#ff9f43]">
          <div className="rounded-[.5cqw] border-[.14cqw] border-[#ff9f43] px-[1.5cqw] py-[.6cqw] text-center">
            <div className="font-display text-[3cqw] leading-none font-[800] tracking-[-.02em]">TOP 20</div>
            <div className="mt-[.3cqw] font-mono text-[.95cqw] tracking-[.2em]">NATIONAL · 2026</div>
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
