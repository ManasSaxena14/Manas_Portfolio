import { Layer, Scene } from "./Scene";

// Indigo night: one gateway orb in orbit. A client call enters from the left,
// the orb routes it across providers on the right — one fails, the fallback
// chain catches it — and every hop streams into a live SSE trace.

const VIOLET = "#a78bfa";
const CYAN = "#67e8f9";

const PROVIDERS = [
  { n: "provider-a", ms: "212ms", w: 62, c: CYAN, s: "ok" },
  { n: "provider-b", ms: "timeout", w: 100, c: "#f87171", s: "fail" },
  { n: "provider-c", ms: "148ms", w: 44, c: "#86efac", s: "fallback" },
  { n: "provider-d", ms: "390ms", w: 82, c: VIOLET, s: "idle" },
];

const TRACE = [
  { t: "00.000", e: "request", d: "POST /v1/chat/completions", c: "#c4b5fd" },
  { t: "00.004", e: "route", d: "pool → provider-b · $0.12/M", c: "#67e8f9" },
  { t: "02.010", e: "error", d: "upstream_timeout · retry 1", c: "#fca5a5" },
  { t: "02.290", e: "fallback", d: "chain → provider-c", c: "#fde68a" },
  { t: "02.438", e: "stream", d: "data: {delta} × 64", c: "#86efac" },
  { t: "02.611", e: "done", d: "200 · 812 tok · 148ms", c: "#86efac" },
];

// Routes from the orb (50,50) out to each provider row on the right.
const ROUTES = ["M50 50 C66 50 70 22 92 22", "M50 50 C66 50 70 41 92 41", "M50 50 C66 50 70 60 92 60", "M50 50 C66 50 70 79 92 79"];

export default function Orbyt() {
  return (
    <Scene className="bg-[radial-gradient(90%_85%_at_45%_45%,#1e1b4b_0%,#0d0b24_45%,#05040d_100%)]">
      {/* Star field + faint grid */}
      <Layer d={0.25} className="inset-0">
        <span className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgb(167_139_250/.07)_1px,transparent_1px),linear-gradient(90deg,rgb(167_139_250/.07)_1px,transparent_1px)] [background-size:4cqw_4cqw] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" />
        {Array.from({ length: 22 }, (_, i) => (
          <i
            key={i}
            className="pa-twinkle absolute size-[.3cqw] rounded-full bg-white"
            style={{ left: `${(i * 37) % 97}%`, top: `${(i * 53) % 93}%`, animationDelay: `${-i * 0.37}s` }}
          />
        ))}
      </Layer>

      {/* Routes: the orb fans requests out to providers */}
      <Layer d={0.6} className="inset-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <path d="M8 50 C24 50 34 50 50 50" stroke={VIOLET} strokeOpacity=".5" strokeWidth=".35" strokeDasharray="1.2 1.4" fill="none" className="pa-dash" />
          {ROUTES.map((d, i) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={PROVIDERS[i].c}
              strokeOpacity={i === 3 ? 0.18 : 0.55}
              strokeWidth=".3"
              strokeDasharray={i === 1 ? "0.6 1" : "1.2 1.4"}
              className={i === 3 ? undefined : "pa-dash"}
            />
          ))}
          <circle r=".9" fill="#fff">
            <animateMotion dur="3.2s" repeatCount="indefinite" path="M8 50 C24 50 34 50 50 50" />
          </circle>
          <circle r=".8" fill="#86efac">
            <animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path={ROUTES[2]} />
          </circle>
          <circle r=".7" fill={CYAN}>
            <animateMotion dur="4.1s" begin=".6s" repeatCount="indefinite" path={ROUTES[0]} />
          </circle>
        </svg>
      </Layer>

      {/* Client call */}
      <Layer d={1.6} className="top-[33%] left-[3.5%] w-[24%]">
        <div className="pa-float rounded-[1.2cqw] border border-[#a78bfa]/30 bg-[#0d0b24]/90 p-[1.2cqw] font-mono text-[1cqw] leading-[1.7] shadow-[0_2.4cqw_4.8cqw_-1.6cqw_rgb(0_0_0/.9)]">
          <div className="mb-[.6cqw] flex items-center gap-[.5cqw] text-[.9cqw] tracking-[.14em] text-[#8b85b8] uppercase">
            <i className="size-[.55cqw] rounded-full bg-[#86efac]" /> any OpenAI SDK
          </div>
          <div className="text-[#8b85b8]">
            client.<span className="text-[#c4b5fd]">chat</span>.<span className="text-[#c4b5fd]">completions</span>
          </div>
          <div className="text-[#e0e7ff]">
            .create({"{"} <span className="text-[#67e8f9]">model</span>:
          </div>
          <div className="pl-[1cqw] text-[#fde68a]">&quot;orbyt/auto&quot;</div>
          <div className="text-[#e0e7ff]">{"}"})</div>
        </div>
      </Layer>

      {/* The gateway orb */}
      <Layer d={1} className="top-[24%] left-[37%] w-[26%]">
        <div className="relative aspect-square">
          <span className="pa-breathe absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgb(167_139_250/.4),transparent_62%)]" />
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <g className="pa-spin-slow" style={{ transformOrigin: "100px 100px" }}>
              <ellipse cx="100" cy="100" rx="96" ry="34" fill="none" stroke={VIOLET} strokeOpacity=".45" strokeWidth="1" transform="rotate(-18 100 100)" />
              <circle cx="190" cy="72" r="4" fill={CYAN} />
            </g>
            <g className="pa-sweep" style={{ transformOrigin: "100px 100px", animationDirection: "reverse" }}>
              <ellipse cx="100" cy="100" rx="88" ry="30" fill="none" stroke={CYAN} strokeOpacity=".3" strokeWidth="1" transform="rotate(32 100 100)" />
              <circle cx="22" cy="120" r="3" fill={VIOLET} />
            </g>
            <defs>
              <radialGradient id="orbyt-core" cx="38%" cy="34%" r="70%">
                <stop offset="0" stopColor="#ede9fe" />
                <stop offset=".35" stopColor="#a78bfa" />
                <stop offset=".8" stopColor="#3b2a8c" />
                <stop offset="1" stopColor="#1e1b4b" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="46" fill="url(#orbyt-core)" />
            <circle cx="100" cy="100" r="46" fill="none" stroke="#c4b5fd" strokeOpacity=".5" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-[2.4cqw] font-[720] tracking-[-.02em] text-white drop-shadow-[0_.4cqw_1cqw_rgb(30_27_75/.9)]">
              /v1
            </span>
          </div>
          <span className="absolute -bottom-[6%] left-1/2 -translate-x-1/2 rounded-full border border-[#a78bfa]/40 bg-[#0d0b24]/95 px-[1.2cqw] py-[.35cqw] font-mono text-[1cqw] tracking-[.18em] whitespace-nowrap text-[#c4b5fd] uppercase">
            Gateway · routing
          </span>
        </div>
      </Layer>

      {/* Provider pool */}
      <Layer d={2} className="top-[11%] right-[3.5%] w-[24%]">
        <div className="mb-[.8cqw] flex justify-between font-mono text-[.95cqw] tracking-[.14em] text-[#8b85b8] uppercase">
          <span>Redis key pool</span>
          <span className="text-[#67e8f9]">cost · latency</span>
        </div>
        <div className="flex flex-col gap-[1.1cqw]">
          {PROVIDERS.map((p) => (
            <div
              key={p.n}
              className={`rounded-[.9cqw] border px-[1cqw] py-[.8cqw] ${
                p.s === "fallback" ? "border-[#86efac]/50 bg-[#86efac]/[.07]" : p.s === "fail" ? "border-[#f87171]/40 bg-[#f87171]/[.05]" : "border-white/[.08] bg-white/[.03]"
              }`}
            >
              <div className="flex items-center gap-[.6cqw] font-mono text-[1cqw]">
                <i className="size-[.6cqw] flex-none rounded-full" style={{ background: p.c }} />
                <span className="flex-1 text-[#e0e7ff]">{p.n}</span>
                <span style={{ color: p.c }}>{p.s === "fail" ? "✕ " : p.s === "fallback" ? "↺ " : ""}{p.ms}</span>
              </div>
              <div className="mt-[.6cqw] h-[.35cqw] overflow-hidden rounded-full bg-white/[.06]">
                <div className="pa-grow h-full origin-left rounded-full" style={{ width: `${p.w}%`, background: p.c, opacity: p.s === "idle" ? 0.4 : 0.85 }} />
              </div>
            </div>
          ))}
        </div>
      </Layer>

      {/* Live SSE trace */}
      <Layer d={1.3} className="bottom-[6%] left-[30%] w-[40%]">
        <div className="rounded-[1.2cqw] border border-[#a78bfa]/25 bg-[#0d0b24]/90 p-[1.1cqw] shadow-[0_2cqw_4cqw_-1.6cqw_rgb(0_0_0/.9)]">
          <div className="flex items-center justify-between font-mono text-[.95cqw] tracking-[.14em] text-[#8b85b8] uppercase">
            <span className="flex items-center gap-[.5cqw]">
              <i className="pa-blink size-[.55cqw] rounded-full bg-[#f87171]" /> Live trace · SSE
            </span>
            <span className="text-[#86efac]">200 OK</span>
          </div>
          <div className="relative mt-[.8cqw] h-[9.4cqw] overflow-hidden">
            <div className="pa-feed flex flex-col">
              {[...TRACE, ...TRACE].map((r, i) => (
                <div key={i} className="flex h-[4.7cqw] flex-none flex-col justify-center gap-[.2cqw] border-b border-white/[.05] font-mono text-[1cqw]">
                  <span className="flex gap-[.8cqw]">
                    <span className="text-[#5b5690]">{r.t}</span>
                    <span style={{ color: r.c }}>{r.e}</span>
                  </span>
                  <span className="truncate text-[#c7c3e8]">{r.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
