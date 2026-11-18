import { Layer, Scene } from "./Scene";

// Deep space, cinematic and nearly empty. The gateway is a planet rising from
// the bottom edge with a violet atmosphere; model providers are moons on
// tilted orbits around it; a request streaks in like a comet, and when one
// moon goes dark the next in the fallback chain lights up.

const VIOLET = "#a78bfa";
const CYAN = "#67e8f9";

// Moons on two tilted orbits: [orbit, angle°, label, size cqw, state]
const MOONS: [number, number, string, number, "ok" | "down" | "fallback"][] = [
  [0, 196, "provider-a", 2.2, "ok"],
  [0, 318, "provider-b", 1.8, "down"],
  [1, 236, "provider-c", 2.6, "fallback"],
  [1, 292, "provider-d", 1.6, "ok"],
];

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 61) % 100,
  y: (i * 37) % 70,
  s: i % 7 === 0 ? 0.36 : 0.2,
  d: -(i % 9) * 0.45,
}));

export default function Orbyt() {
  return (
    <Scene className="bg-[radial-gradient(120%_90%_at_50%_100%,#1a1240_0%,#07051a_42%,#020208_100%)]">
      {/* Star field */}
      <Layer d={0.2} className="inset-0">
        {STARS.map((s, i) => (
          <i
            key={i}
            className={`absolute rounded-full bg-white ${i % 3 === 0 ? "pa-twinkle" : ""}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}cqw`, height: `${s.s}cqw`, opacity: 0.7, animationDelay: `${s.d}s` }}
          />
        ))}
      </Layer>

      {/* Comet: a request streaking in toward the gateway */}
      <Layer d={0.6} className="inset-0">
        <span className="ob-comet absolute top-[8%] right-[6%] block h-[.35cqw] w-[16cqw] origin-right rounded-full bg-[linear-gradient(90deg,transparent,rgb(103_232_249/.9))]" />
      </Layer>

      {/* The gateway planet, rising from the bottom edge */}
      <Layer d={0.9} className="-bottom-[70%] left-1/2 w-[78cqw] -translate-x-1/2">
        <div className="relative aspect-square">
          <span className="pa-breathe absolute -inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(167_139_250/.5)_62%,transparent_70%)] blur-[1.4cqw]" />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,#ddd6fe_0%,#8b5cf6_5%,#4c1d95_13%,#1e0b4b_26%,#0a0520_44%,#04020d_70%)] shadow-[inset_0_.6cqw_1.4cqw_rgb(221_214_254/.35)]" />
          <span className="absolute inset-0 rounded-full opacity-40 [background-image:repeating-linear-gradient(170deg,transparent_0_2.2cqw,rgb(196_181_253/.12)_2.2cqw_2.4cqw)] [mask-image:radial-gradient(circle_at_50%_10%,#000_20%,transparent_55%)]" />
        </div>
      </Layer>

      {/* Orbits + moons */}
      <Layer d={1.2} className="inset-0">
        <svg viewBox="0 0 100 62.5" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <ellipse cx="50" cy="67" rx="47" ry="16" fill="none" stroke={VIOLET} strokeOpacity=".35" strokeWidth=".18" transform="rotate(-8 50 67)" />
          <ellipse cx="50" cy="67" rx="41" ry="27" fill="none" stroke={CYAN} strokeOpacity=".22" strokeWidth=".18" strokeDasharray=".8 .8" transform="rotate(10 50 67)" />
        </svg>
        {MOONS.map(([o, a, label, size, state]) => {
          const rad = (a * Math.PI) / 180;
          const [rx, ry, rot] = o === 0 ? [47, 16, -8] : [41, 27, 10];
          const ex = rx * Math.cos(rad);
          const ey = ry * Math.sin(rad);
          const r = (rot * Math.PI) / 180;
          const x = 50 + ex * Math.cos(r) - ey * Math.sin(r);
          const y = ((67 + ex * Math.sin(r) + ey * Math.cos(r)) / 62.5) * 100;
          const color = state === "down" ? "#3b3561" : state === "fallback" ? "#86efac" : CYAN;
          return (
            <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${Math.round(x * 100) / 100}%`, top: `${Math.round(y * 100) / 100}%` }}>
              <span
                className={`block rounded-full ${state === "fallback" ? "ob-wake" : ""}`}
                style={{
                  width: `${size}cqw`,
                  height: `${size}cqw`,
                  background: `radial-gradient(circle at 35% 30%, #fff, ${color} 45%, #0b0820 100%)`,
                  boxShadow: state === "down" ? "none" : `0 0 2cqw .2cqw ${color}55`,
                }}
              />
              <span className="absolute top-full left-1/2 mt-[.5cqw] -translate-x-1/2 font-mono text-[.95cqw] whitespace-nowrap" style={{ color: state === "down" ? "#6b6496" : "#c7c3ee" }}>
                {label}
                {state === "down" ? " · down" : state === "fallback" ? " · fallback ✓" : ""}
              </span>
            </div>
          );
        })}
      </Layer>

      {/* Title set like a mission patch */}
      <Layer d={1.8} className="top-[9%] left-[6%]">
        <div className="font-mono text-[1cqw] tracking-[.3em] text-[#a5a1d6] uppercase">Self-hosted LLM gateway</div>
        <div className="mt-[.6cqw] font-display text-[6cqw] leading-[.9] font-[760] tracking-[-.04em] text-white">Orbyt</div>
        <div className="mt-[1cqw] inline-flex items-center gap-[.6cqw] rounded-full border border-white/15 bg-white/[.04] px-[1.1cqw] py-[.35cqw] font-mono text-[1.05cqw] text-[#d9d6ff]">
          <i className="pa-blink size-[.6cqw] rounded-full" style={{ background: "#86efac" }} />
          POST /v1/chat/completions
        </div>
      </Layer>
    </Scene>
  );
}
