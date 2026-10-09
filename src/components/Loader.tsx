"use client";

import { useEffect, useRef, useState } from "react";
import { fullName, portfolio } from "@/data/portfolio";
import { store } from "@/lib/store";
import { prefersReducedMotion, scrollToY } from "@/lib/scroll";
import { gsap } from "@/lib/gsap";
import { NODE, TRACE } from "@/components/Logo";
import LocalTime from "@/components/LocalTime";

const ROWS = portfolio.process.steps[0]?.stat.v ?? "54,873";
const PHASES = [
  { at: 0, label: "Initialising runtime" },
  { at: 0.15, label: "Loading model weights" },
  { at: 0.35, label: "Compiling shaders" },
  { at: 0.56, label: `Training on ${ROWS} rows` },
  { at: 0.8, label: "Hydrating interface" },
];
const MIN = 2.7; // s: the count is never rushed…
const MAX = 7.5; // s: …and never waits longer than this on a slow network
const TICKS = 24;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const LIME = "#c8f25a";
const LINE = "#27272a";

// Bursts and hesitations, like a real boot rather than one smooth tween.
const PACE: [number, number][] = [[0, 0], [0.2, 0.16], [0.32, 0.22], [0.56, 0.55], [0.68, 0.6], [0.86, 0.87], [1, 1]];
function paced(t: number) {
  for (let i = 1; i < PACE.length; i++) {
    const [t1, v1] = PACE[i];
    if (t <= t1) {
      const [t0, v0] = PACE[i - 1];
      const k = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * k * k * (3 - 2 * k);
    }
  }
  return 1;
}

function phaseAt(p: number) {
  if (p >= 1) return PHASES.length;
  let i = 0;
  while (i + 1 < PHASES.length && p >= PHASES[i + 1].at) i++;
  return i;
}

type Mote = { a: number; r0: number; w: number; s: number; lime: boolean; k: number; tw: number; x: number; y: number };

/**
 * Opening sequence. Noise spirals in and condenses into a ring while the MS
 * trace draws itself and an odometer rolls 000 → 100, paced like a real boot
 * and gated on real readiness (fonts, page assets and the 3D galaxy code).
 * At 100 the node ignites and a portal opens from the centre into the hero,
 * whose intro starts mid-reveal. Click or press any key to skip ahead.
 */
export default function Loader() {
  const [phase, setPhase] = useState<"run" | "gone">("run");
  const [stage, setStage] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ring = useRef<SVGSVGElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const node = useRef<SVGCircleElement>(null);
  const ticks = useRef<SVGGElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cols = useRef<(HTMLSpanElement | null)[]>([]);
  const wraps = useRef<(HTMLSpanElement | null)[]>([]);
  // Decided once per mount: the ref survives StrictMode's double effect run.
  const skipAll = useRef<boolean | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    if (skipAll.current === null) {
      let seen = false;
      try {
        seen = sessionStorage.getItem("loader-seen") === "1";
        sessionStorage.setItem("loader-seen", "1");
      } catch {
        /* private mode: treat as a first visit */
      }
      const { showLoader, loaderEveryVisit } = portfolio.settings;
      // Very late hydration (the CSS failsafe may have hidden it already).
      skipAll.current = !showLoader || prefersReducedMotion() || (!loaderEveryVisit && seen) || performance.now() > 9000;
    }
    if (skipAll.current) {
      setPhase("gone");
      store.set({ loaderDone: true });
      timers.push(window.setTimeout(() => store.set({ heroIn: true }), 60));
      return () => timers.forEach(clearTimeout);
    }

    const el = root.current;
    const sheet = layer.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !sheet || !cv || !ctx) return;
    el.style.animation = "none"; // JS has it: cancel the no-JS failsafe
    window.scrollTo(0, 0);
    const html = document.documentElement;
    html.style.overflow = "hidden";

    // ── readiness: fonts, page assets and the hero's 3D code ──
    let alive = true;
    let ready = false;
    let skip = false;
    const loaded = new Promise<void>((res) =>
      document.readyState === "complete" ? res() : window.addEventListener("load", () => res(), { once: true }),
    );
    Promise.all([document.fonts?.ready, loaded, import("@/components/three/HeroGalaxy").catch(() => null)]).then(() => {
      if (alive) ready = true;
    });

    // ── particles ──
    let W = 0;
    let H = 0;
    let dpr = 1;
    let maxR = 0;
    let ringR = 100;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      maxR = Math.hypot(W, H) / 2;
      const box = ring.current?.getBoundingClientRect();
      if (box?.width) ringR = (box.width * 100) / 240;
    };
    resize();
    window.addEventListener("resize", resize);

    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes: Mote[] = Array.from({ length: W < 720 ? 140 : 240 }, () => ({
      a: rand() * Math.PI * 2,
      r0: 0.32 + rand() * 0.95,
      w: (0.06 + rand() * 0.2) * (rand() < 0.86 ? 1 : -1),
      s: 0.6 + rand() * rand() * 1.8,
      lime: rand() < 0.28,
      k: 1.15 + rand() * 1.05,
      tw: rand() * Math.PI * 2,
      x: NaN,
      y: NaN,
    }));
    let exitE = 0;
    const draw = (dt: number, p: number, now: number) => {
      const cx = W / 2;
      const cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      const conv = p * p * (3 - 2 * p);
      const burst = 1 - Math.pow(1 - exitE, 3);
      for (const m of motes) {
        m.a += m.w * dt * (1 + 3.2 * conv + 5 * exitE);
        let r = m.r0 * maxR + (m.k * ringR - m.r0 * maxR) * conv;
        if (exitE > 0) r += (m.r0 * maxR * 2.4 - r) * burst;
        const x = cx + Math.cos(m.a) * r;
        const y = cy + Math.sin(m.a) * r;
        const tw = 0.55 + 0.45 * Math.sin(now * 0.0021 + m.tw);
        const alpha = (0.22 + 0.62 * conv) * tw * (1 - exitE);
        if (alpha > 0.01) {
          ctx.strokeStyle = m.lime ? `rgba(200,242,90,${alpha.toFixed(3)})` : `rgba(250,250,250,${(alpha * 0.8).toFixed(3)})`;
          ctx.lineWidth = m.s;
          ctx.beginPath();
          ctx.moveTo(Number.isNaN(m.x) ? x : m.x, Number.isNaN(m.y) ? y : m.y);
          ctx.lineTo(x + 0.01, y);
          ctx.stroke();
        }
        m.x = x;
        m.y = y;
      }
    };

    // ── the count ──
    const tickEls = Array.from(ticks.current?.children ?? []) as SVGLineElement[];
    let lit = -1;
    let cur = 0;
    let lead = [true, true];
    let frame = 0;
    const render = (p: number) => {
      const v = p * 100;
      const ones = v % 10;
      const tens = Math.floor(v / 10) + Math.max(0, (v % 10) - 9);
      const hund = Math.floor(v / 100) + Math.max(0, (v % 100) - 99);
      [hund, tens % 11, ones].forEach((d, i) => {
        const c = cols.current[i];
        if (c) c.style.transform = `translate3d(0, ${(-d).toFixed(3)}em, 0)`;
      });
      const nextLead = [v < 99.5, v < 9.5];
      nextLead.forEach((isLead, i) => {
        if (isLead !== lead[i] && wraps.current[i]) wraps.current[i]!.style.opacity = isLead ? "0.16" : "1";
      });
      lead = nextLead;
      arc.current?.setAttribute("stroke-dashoffset", (100 - v).toFixed(2));
      trace.current?.setAttribute("stroke-dashoffset", (100 - v).toFixed(2));
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (glow.current) glow.current.style.opacity = (0.2 + 0.8 * p).toFixed(3);
      const n = Math.floor(p * TICKS + 1e-6);
      if (n !== lit) {
        lit = n;
        tickEls.forEach((t, i) => t.setAttribute("stroke", i < n ? LIME : LINE));
      }
      const s = phaseAt(p);
      if (s !== cur) setStage((cur = s));
      // Spinners move as the phases advance, so look them up live.
      if (++frame % 4 === 0)
        el.querySelectorAll<HTMLElement>("[data-ld-spin]").forEach((sp) => (sp.textContent = SPIN[(frame >> 2) % SPIN.length]));
    };

    // ── the portal ──
    let tl: gsap.core.Timeline | null = null;
    const open = () => {
      const q = gsap.utils.selector(el);
      const hole = { r: 0 };
      const ex = { e: 0 };
      const maxHole = Math.hypot(W, H) / 2 + 80;
      tl = gsap
        .timeline({
          onComplete: () => {
            html.style.overflow = "";
            setPhase("gone");
            store.set({ loaderDone: true });
            // A shared deep link (/#contact) lands on its section once open.
            const id = decodeURIComponent(window.location.hash.slice(1));
            const target = id && id !== "top" ? document.getElementById(id) : null;
            if (target) scrollToY(target.getBoundingClientRect().top + window.scrollY);
          },
        })
        .set(q("[data-ld-out], .ld-in"), { animation: "none" }, 0)
        .fromTo(node.current, { scale: 0, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.55, ease: "back.out(3)" }, 0)
        .fromTo(
          q("[data-ld-halo]"),
          { scale: 1, opacity: 0.9, transformOrigin: "50% 50%" },
          { scale: 3.6, opacity: 0, duration: 0.95, stagger: 0.16, ease: "power2.out" },
          0.04,
        )
        .to(arc.current, { attr: { "stroke-width": 4 }, duration: 0.22, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0)
        .to(glow.current, { scale: 1.3, duration: 0.7, ease: "power2.out" }, 0)
        .to(q(".ld-num"), { color: LIME, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0)
        .to(q("[data-ld-out]"), { yPercent: -120, autoAlpha: 0, duration: 0.62, stagger: 0.03, ease: "expo.in" }, 0.24)
        .to(center.current, { scale: 1.55, autoAlpha: 0, duration: 0.85, ease: "expo.in" }, 0.32)
        .call(() => sheet.classList.add("ld-open"), [], 0.44)
        .to(
          hole,
          {
            r: maxHole,
            duration: 1.3,
            ease: "expo.inOut",
            onUpdate: () => {
              el.style.setProperty("--hole", `${hole.r.toFixed(1)}px`);
              const rm = rim.current;
              if (!rm) return;
              rm.style.width = rm.style.height = `${(hole.r * 2).toFixed(1)}px`;
              // The rim fades in once the hole is wide enough to read as a
              // portal, and out as it clears the screen.
              const fadeIn = Math.min(1, Math.max(0, (hole.r - 50) / 140));
              const fadeOut = 1 - Math.min(1, Math.max(0, (hole.r / maxHole - 0.72) / 0.28));
              rm.style.opacity = (fadeIn * fadeOut).toFixed(3);
            },
          },
          0.44,
        )
        .to(ex, { e: 1, duration: 1.4, ease: "power1.out", onUpdate: () => (exitE = ex.e) }, 0.44)
        .call(() => store.set({ heroIn: true }), [], 0.64);
    };

    // ── main loop ──
    const t0 = performance.now();
    let last = t0;
    let shown = 0;
    let opened = false;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const timeP = paced(Math.min(1, t / MIN));
      const done = ready || skip || t > MAX;
      // Waiting on the network: hold near the end and creep, never stall dead.
      const hold = Math.min(0.9, timeP) + (t > MIN ? 0.06 * (1 - Math.exp(-(t - MIN) / 2)) : 0);
      const target = skip ? 1 : done ? timeP : Math.min(timeP, hold);
      shown += (target - shown) * (1 - Math.exp(-dt * (skip ? 12 : 9)));
      if (target >= 1 && shown > 0.997) shown = 1;
      if (!opened) render(shown);
      draw(dt, shown, now);
      if (shown >= 1 && !opened) {
        opened = true;
        render(1);
        open();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onSkip = () => {
      skip = true;
    };
    el.addEventListener("click", onSkip);
    window.addEventListener("keydown", onSkip);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      tl?.kill();
      html.style.overflow = "";
      el.removeEventListener("click", onSkip);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (phase === "gone") return null;
  const label = stage < PHASES.length ? PHASES[stage].label : "Ready — opening";
  return (
    <div ref={root} aria-hidden data-loader className="ld fixed inset-0 z-[100] overflow-hidden select-none">
      {/* The sheet is what the portal cuts through; the rim rides its edge, unmasked. */}
      <div ref={layer} className="ld-layer absolute inset-0 overflow-hidden bg-bg-loader">
        <div className="ld-grid pointer-events-none absolute inset-0" />
        <div
          ref={glow}
          className="pointer-events-none absolute top-1/2 left-1/2 size-[min(92vmin,860px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_242_90/.17),rgb(200_242_90/.045)_45%,transparent)]"
          style={{ opacity: 0.2 }}
        />
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* Centre: a progress ring around the MS trace, which draws as it loads */}
        <div ref={center} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg ref={ring} viewBox="0 0 240 240" className="ld-in block size-[clamp(168px,26vmin,250px)] overflow-visible">
            <circle cx="120" cy="120" r="100" fill="none" stroke={LINE} strokeWidth="1.2" />
            <circle cx="120" cy="120" r="84" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="1.5 7" className="ld-spin-slow" />
            <g ref={ticks}>
              {Array.from({ length: TICKS }, (_, i) => {
                const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
                const r2 = (v: number) => Math.round(v * 100) / 100;
                return (
                  <line
                    key={i}
                    x1={r2(120 + Math.cos(a) * 108)}
                    y1={r2(120 + Math.sin(a) * 108)}
                    x2={r2(120 + Math.cos(a) * (i % 6 === 0 ? 118 : 114))}
                    y2={r2(120 + Math.sin(a) * (i % 6 === 0 ? 118 : 114))}
                    stroke={LINE}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            <circle
              ref={arc}
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke={LIME}
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset="100"
              transform="rotate(-90 120 120)"
            />
            <g transform="translate(69.6 69.6) scale(2.1)">
              <path
                ref={trace}
                d={TRACE}
                pathLength={100}
                fill="none"
                stroke="#fafafa"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
              <circle data-ld-halo {...NODE} fill="none" stroke={LIME} strokeWidth=".7" opacity="0" />
              <circle data-ld-halo {...NODE} fill="none" stroke={LIME} strokeWidth=".7" opacity="0" />
              <circle ref={node} {...NODE} fill={LIME} opacity="0" />
            </g>
          </svg>
        </div>

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-[clamp(20px,4vw,48px)]">
          <div data-ld-out className="ld-in flex flex-col gap-1">
            <span className="text-[15px] font-[650] tracking-[-.02em] text-ink">{fullName}</span>
            <span className="font-mono text-[10.5px] tracking-[.16em] text-dim uppercase">Portfolio · ©{new Date().getFullYear()}</span>
          </div>
          <div data-ld-out className="ld-in flex flex-col items-end gap-1 font-mono text-[10.5px] tracking-[.16em] text-dim uppercase [animation-delay:.08s]">
            <LocalTime className="text-ink-2" />
            <span>{portfolio.location}</span>
          </div>
        </div>

        {/* Bottom: phase + odometer, and the boot log */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 px-[clamp(20px,4vw,48px)] pb-[clamp(44px,4.6vw,58px)]">
          <div data-ld-out className="flex flex-col gap-3">
            <span className="ld-in flex items-center gap-2.5 font-mono text-[11px] tracking-[.16em] text-dim uppercase [animation-delay:.12s]">
              <span data-ld-spin className="text-accent">
                ⠋
              </span>
              <span key={stage} className="ld-swap">
                {label}
              </span>
            </span>
            <div className="ld-in ld-num flex items-start font-display text-[clamp(92px,17vw,264px)] leading-none font-[640] tracking-[-.035em] text-ink tabular-nums [animation-delay:.16s]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  ref={(e) => {
                    wraps.current[i] = e;
                  }}
                  className="ld-col relative -mr-[.02em] inline-block h-[1em] overflow-hidden transition-opacity duration-500"
                  style={{ opacity: i < 2 ? 0.16 : 1 }}
                >
                  <span
                    ref={(e) => {
                      cols.current[i] = e;
                    }}
                    className="flex flex-col"
                  >
                    {DIGITS.map((d, k) => (
                      <span key={k} className="block h-[1em]">
                        {d}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
              <span className="mt-[.1em] ml-[.08em] font-serif text-[.3em] font-normal tracking-normal text-accent italic">%</span>
            </div>
          </div>

          <ul data-ld-out className="ld-in m-0 mb-3 hidden w-[min(390px,34vw)] list-none flex-col gap-1.5 p-0 font-mono text-[12px] tracking-[.04em] md:flex [animation-delay:.2s]">
            {PHASES.map((ph, i) => (
              <li key={ph.label} className="flex items-center gap-2 transition-opacity duration-300" style={{ opacity: i <= stage ? 1 : 0.22 }}>
                <span className="text-faint">›</span>
                <span className={i < stage ? "text-ink-2" : "text-dim"}>{ph.label}</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap text-faint">{"·".repeat(60)}</span>
                {i < stage ? (
                  <span key="ok" className="text-accent">
                    ok
                  </span>
                ) : i === stage ? (
                  <span key="spin" data-ld-spin className="text-accent">
                    ⠋
                  </span>
                ) : (
                  <span key="wait" className="text-faint">
                    --
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress hairline */}
        <div data-ld-out className="absolute inset-x-0 bottom-0 h-px bg-line">
          <span ref={bar} className="block h-full origin-left bg-accent shadow-[0_0_12px_rgb(200_242_90/.6)]" style={{ transform: "scaleX(0)" }} />
        </div>

        <span
          data-ld-out
          className="ld-hint absolute bottom-[clamp(10px,1.4vw,16px)] left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[.18em] whitespace-nowrap text-faint uppercase"
        >
          <span className="hidden md:inline">Click or press any key to skip</span>
          <span className="md:hidden">Tap to skip</span>
        </span>
      </div>

      <div
        ref={rim}
        className="pointer-events-none absolute top-1/2 left-1/2 size-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent opacity-0 shadow-[0_0_36px_6px_rgb(200_242_90/.45),inset_0_0_36px_6px_rgb(200_242_90/.3)]"
      />
    </div>
  );
}
