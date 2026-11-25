import { Layer, Scene } from "./Scene";

// Long-exposure photograph of a freeway at night. Light trails sweep through
// the frame (white headlights one way, red tail lights the other); where the
// trails bunch and burn red, a jam is forming, and the sensor rings along the
// road pulse as the slowdown travels upstream. One number, set large.

// The freeway's centre line, sweeping from the bottom-left into the distance.
const LANES = [
  { d: "M-4 64 C 22 52, 38 30, 62 22 S 92 12, 108 9", c: "#fff4e0", w: 0.55, o: 0.85, dur: "4.2s" },
  { d: "M-4 67 C 23 55, 40 33, 63 25 S 93 15, 108 12", c: "#ffe2b0", w: 0.4, o: 0.7, dur: "5.4s" },
  { d: "M-4 71 C 25 59, 42 37, 64 29 S 94 19, 108 16", c: "#ff3b3b", w: 0.55, o: 0.85, dur: "7.2s" },
  { d: "M-4 74 C 26 62, 43 40, 65 32 S 95 22, 108 19", c: "#ff6b4a", w: 0.4, o: 0.65, dur: "8.6s" },
];

// Sensors along the road (in the 100 × 62.5 frame), downstream last.
const SENSORS = [
  [14, 59], [27, 50], [38, 40], [50, 31.5], [62, 26], [74, 21.5], [86, 17.5],
];

export default function MetroFlow() {
  return (
    <Scene className="bg-[radial-gradient(120%_100%_at_70%_20%,#1a1410_0%,#0a0807_45%,#030202_100%)]">
      {/* City glow on the horizon and haze */}
      <Layer d={0.2} className="inset-0">
        <span className="absolute -top-[20%] right-[-10%] h-[60%] w-[80%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_170_90/.22),transparent)] blur-[2cqw]" />
        <span className="absolute inset-x-0 top-[38%] h-[30%] bg-[linear-gradient(180deg,transparent,rgb(255_140_80/.06),transparent)]" />
        {Array.from({ length: 26 }, (_, i) => (
          <i
            key={i}
            className="absolute rounded-full bg-[#ffd9a0]"
            style={{ left: `${40 + ((i * 37) % 58)}%`, top: `${6 + ((i * 23) % 22)}%`, width: ".25cqw", height: ".25cqw", opacity: 0.25 + (i % 4) * 0.12 }}
          />
        ))}
      </Layer>

      {/* Light trails */}
      <Layer d={0.8} className="inset-0">
        <svg viewBox="0 0 100 62.5" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <filter id="tg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation=".6" />
            </filter>
          </defs>
          {/* Asphalt band */}
          <path d="M-4 69 C 24 57, 41 35, 64 27 S 94 17, 108 14" stroke="#0d0a08" strokeWidth="11" strokeOpacity=".8" fill="none" />
          {LANES.map((l) => (
            <g key={l.d}>
              {/* Continuous exposure haze, then long bright streaks moving through it */}
              <path d={l.d} stroke={l.c} strokeWidth={l.w * 3.4} strokeOpacity={l.o * 0.3} fill="none" filter="url(#tg-glow)" />
              <path d={l.d} stroke={l.c} strokeWidth={l.w * 0.7} strokeOpacity={l.o * 0.45} fill="none" />
              <path d={l.d} stroke={l.c} strokeWidth={l.w * 1.15} strokeOpacity={l.o} strokeLinecap="round" fill="none" strokeDasharray="28 6 16 9 34 7" className="tg-trail" style={{ animationDuration: l.dur }} />
            </g>
          ))}
          {/* The jam: trails bunch up and burn red mid-frame */}
          <path d="M44 37 C 50 33.5, 56 30, 62 27.5" stroke="#ff2d2d" strokeWidth="2.6" strokeOpacity=".45" fill="none" filter="url(#tg-glow)" className="tg-jam" />
        </svg>
      </Layer>

      {/* Sensor rings, pulsing as the slowdown travels upstream */}
      <Layer d={1.3} className="inset-0">
        {SENSORS.map(([x, y], i) => (
          <span
            key={i}
            className="tg-sensor absolute block size-[1.6cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-[.18cqw] border-[#9ff3c4] bg-[#030202]/70"
            style={{ left: `${x}%`, top: `${(y / 62.5) * 100}%`, animationDelay: `${(SENSORS.length - 1 - i) * 0.35}s` }}
          />
        ))}
      </Layer>

      {/* One number, set large, in the dark sky */}
      <Layer d={2} className="top-[8%] left-[5%]">
        <div className="font-mono text-[1cqw] tracking-[.28em] text-[#d8c7b4]/80 uppercase">60-min forecast error vs XGBoost</div>
        <div className="mt-[.4cqw] font-serif text-[10cqw] leading-[.85] text-[#fff4e0] italic">−13.3%</div>
        <div className="mt-[.8cqw] flex items-center gap-[1.2cqw] font-mono text-[1cqw] text-[#d8c7b4]/80">
          <span>DCRNN + XGBoost hybrid</span>
          <span className="h-px w-[3cqw] bg-[#d8c7b4]/40" />
          <span>207 detectors · METR-LA</span>
        </div>
      </Layer>

      {/* Quiet legend, bottom right */}
      <Layer d={1.6} className="right-[5%] bottom-[7%]">
        <div className="flex flex-col items-end gap-[.5cqw] font-mono text-[.95cqw] text-[#d8c7b4]/75">
          <span className="flex items-center gap-[.6cqw]">
            detector <i className="size-[1cqw] rounded-full border-[.15cqw] border-[#9ff3c4]" />
          </span>
          <span className="flex items-center gap-[.6cqw]">
            jam travelling upstream <i className="h-[.4cqw] w-[2cqw] rounded-full bg-[#ff2d2d]" />
          </span>
        </div>
      </Layer>
    </Scene>
  );
}
