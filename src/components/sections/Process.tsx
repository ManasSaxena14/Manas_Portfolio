"use client";

import { useEffect, useRef, useState } from "react";
import { pad, plain, portfolio } from "@/data/portfolio";
import { Accent, SectionHeader, SplitWords } from "@/components/SectionHeader";
import { WORLDS } from "@/components/ProcessWorlds";
import { clamp, prefersReducedMotion, scrollToY } from "@/lib/scroll";
import { ScrollTrigger } from "@/lib/gsap";

/*
 * Process, as one continuous zoom. Four worlds are nested inside each other
 * (see ProcessWorlds): raw data → clusters → an agent → shipped products.
 * Scrolling dives the camera 18× into the centre of each world, where the
 * next one is waiting. Everything is scrubbed by the scroll, frame by frame:
 * the zoom, the titles rising word by word, the stats counting, the depth
 * gauge and the lens ripple at every hand-off. Nothing runs on a timer.
 */

const { eyebrow, heading, skipLabel, steps } = portfolio.process;
const n = steps.length;
const ZOOM = 18; // magnification between one world and the next
const DWELL = 0.5; // share of each stage spent at rest before zooming on

const smooth = (x: number) => x * x * (3 - 2 * x);

/** Scroll progress (0..1) → depth z (0..n-1): rest on each world, then dive. */
function depthFor(p: number) {
  const f = clamp(p) * n;
  const k = Math.min(n - 1, Math.floor(f));
  const u = f - k;
  return k >= n - 1 ? n - 1 : k + smooth(clamp((u - DWELL) / (1 - DWELL)));
}

/** "1,000,000" / "<50ms" / "24/24" → the same shape, scaled by t (0..1). */
function partial(value: string, t: number) {
  const m = value.match(/^([^0-9]*)([0-9][0-9,]*)(.*)$/);
  if (!m) return value;
  const [, pre, num, post] = m;
  const target = parseInt(num.replaceAll(",", ""), 10);
  const v = Math.round(target * t);
  return `${pre}${num.includes(",") ? v.toLocaleString("en-US") : v}${post}`;
}

function magnification(z: number) {
  const m = Math.pow(ZOOM, z);
  return m < 10 ? m.toFixed(1) : Math.round(m).toLocaleString("en-US");
}

export default function Process() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);
  const [cur, setCur] = useState(0);

  useEffect(() => setReduce(prefersReducedMotion()), []);

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-world]"));
    const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-pblock]"));
    const words = blocks.map((b) => Array.from(b.querySelectorAll<HTMLElement>("[data-pword]")));
    const lines = blocks.map((b) => Array.from(b.querySelectorAll<HTMLElement>("[data-pline]")));
    const nums = blocks.map((b) => b.querySelector<HTMLElement>("[data-pnum]"));
    const ripple = root.querySelector<HTMLElement>("[data-ripple]");
    const mag = root.querySelector<HTMLElement>("[data-mag]");
    const needle = root.querySelector<HTMLElement>("[data-needle]");
    const ring = root.querySelector<HTMLElement>("[data-focus]");
    let last = -1;
    let shown = 0;

    const render = (p: number) => {
      const z = depthFor(p);
      if (Math.abs(z - last) < 1e-4 && last >= 0) return;
      last = z;
      const near = Math.round(z);
      if (near !== shown) setCur((shown = near));

      // Worlds: each sits at 18^(z - j), fading in from a dot and out as it fills the screen.
      layers.forEach((el, j) => {
        const d = z - j;
        const visible = d > -1.05 && d < 1.2;
        el.style.visibility = visible ? "visible" : "hidden";
        if (!visible) return;
        const scale = reduce ? 1 : Math.pow(ZOOM, d);
        const o = reduce ? (near === j ? 1 : 0) : d < 0 ? clamp((d + 1) / 0.55) : 1 - clamp((d - 0.3) / 0.6);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        // Leaving worlds blur a little, like depth of field.
        el.style.filter = !reduce && d > 0.15 ? `blur(${Math.min(6, (d - 0.15) * 7).toFixed(2)}px)` : "none";
      });

      // Copy: each block owns the stretch around its own depth.
      blocks.forEach((b, j) => {
        const t = clamp(1 - Math.abs(z - j) * 1.9); // 1 when resting on world j
        b.style.visibility = t > 0.001 ? "visible" : "hidden";
        b.style.pointerEvents = t > 0.6 ? "auto" : "none";
        if (t <= 0.001) return;
        const dir = z < j ? 1 : -1;
        words[j].forEach((w, k) => {
          const wt = reduce ? t : clamp(t * 1.7 - k * 0.07);
          w.style.transform = `translateY(${((1 - smooth(wt)) * 105 * dir).toFixed(1)}%)`;
          w.style.opacity = wt.toFixed(3);
        });
        lines[j].forEach((l, k) => {
          const lt = reduce ? t : clamp(t * 1.6 - 0.25 - k * 0.1);
          l.style.opacity = lt.toFixed(3);
          l.style.transform = `translateY(${((1 - smooth(lt)) * 22 * dir).toFixed(1)}px)`;
          l.style.filter = lt < 1 && !reduce ? `blur(${((1 - lt) * 6).toFixed(1)}px)` : "none";
        });
        const num = nums[j];
        if (num) num.textContent = partial(steps[j].stat.v, smooth(clamp(t * 1.25)));
      });

      // Lens ripple: peaks halfway through every dive.
      if (ripple) {
        const frac = z - Math.floor(z);
        const pulse = reduce || frac === 0 ? 0 : Math.sin(frac * Math.PI);
        ripple.style.opacity = (pulse * 0.9).toFixed(3);
        ripple.style.transform = `translate(-50%, -50%) scale(${(0.4 + frac * 2.4).toFixed(3)})`;
      }
      if (ring) ring.style.transform = `translate(-50%, -50%) rotate(${(z * 90).toFixed(1)}deg) scale(${(1 - Math.sin((z % 1) * Math.PI) * 0.35).toFixed(3)})`;
      if (mag) mag.textContent = `×${magnification(z)}`;
      if (needle) needle.style.top = `${((z / (n - 1)) * 100).toFixed(2)}%`;
    };

    const trigger = ScrollTrigger.create({
      trigger: track.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);
    return () => trigger.kill();
  }, [reduce]);

  // Jump to the resting point of a stage.
  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * ((i + DWELL * 0.5) / n));
  };

  return (
    <section id="process" data-ambient className="relative pt-[clamp(80px,10vw,160px)]">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(01)" />
        <SplitWords text={heading} className="h2 max-w-[13ch]" />
      </div>

      <div ref={track} className="relative" style={{ height: `${n * 130}vh` }}>
        <div ref={stage} className="sticky top-0 h-svh overflow-hidden bg-bg">
          {/* The worlds, centred on the zoom point (right of centre on desktop) */}
          <div aria-hidden className="pw-origin absolute">
            {WORLDS.map((World, j) => (
              <div
                key={j}
                data-world
                className="absolute top-0 left-0 size-[min(118vmax,1500px)] will-change-transform"
                style={{ transform: "translate(-50%, -50%)", visibility: j === 0 ? "visible" : "hidden", opacity: j === 0 ? 1 : 0 }}
              >
                <World />
              </div>
            ))}
            {/* Focus brackets and the lens ripple, fixed at the zoom point */}
            <span data-focus className="pw-focus absolute top-0 left-0 block size-[clamp(120px,14vw,200px)]" style={{ transform: "translate(-50%, -50%)" }} />
            <span
              data-ripple
              className="absolute top-0 left-0 block size-[clamp(260px,34vw,520px)] rounded-full border border-accent/70 opacity-0"
              style={{ transform: "translate(-50%, -50%)" }}
            />
          </div>

          {/* Legibility: darken the copy side and the edges */}
          <div aria-hidden className="pw-shade pointer-events-none absolute inset-0" />

          {/* Copy */}
          <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1440px] items-end px-[clamp(20px,4vw,48px)] pt-24 pb-[clamp(28px,6vh,72px)] lg:items-center lg:pb-0">
            <div className="relative grid w-full max-w-[600px]" aria-live="polite">
              {steps.map((st, j) => (
                <div
                  key={st.label}
                  data-pblock
                  aria-hidden={j !== cur}
                  className="[grid-area:1/1] flex flex-col"
                  style={{ visibility: j === 0 ? "visible" : "hidden" }}
                >
                  <div data-pline className="flex items-center gap-3 font-mono text-[11px] tracking-[.18em] text-muted uppercase">
                    <span className="text-accent">{pad(j + 1)}</span>
                    <span className="h-px w-8 bg-accent/60" />
                    {st.label}
                  </div>
                  <h3 className="display m-0 mt-4 text-[clamp(44px,6.4vw,104px)] leading-[.92] font-[620]">
                    <span className="sr-only">{plain(st.title)}</span>
                    <span aria-hidden className="flex flex-wrap gap-x-[.22em]">
                      {st.title.split(" ").map((w, k) => (
                        <span key={k} className="inline-block overflow-hidden pb-[.08em]">
                          <span data-pword className="inline-block">
                            <Accent text={w} />
                          </span>
                        </span>
                      ))}
                    </span>
                  </h3>
                  <p data-pline className="mt-5 mb-0 max-w-[40ch] text-[clamp(16px,1.35vw,19px)] leading-[1.5] text-ink-2">
                    {st.body}
                  </p>
                  <div data-pline className="mt-6 flex items-end gap-4">
                    <span data-pnum className="display text-[clamp(40px,4.6vw,72px)] leading-[.85] font-[680] text-accent tabular-nums">
                      {st.stat.v}
                    </span>
                    <span className="max-w-[18ch] pb-1 font-mono text-[11px] leading-[1.4] tracking-[.1em] text-muted uppercase">{st.stat.l}</span>
                  </div>
                  <div data-pline className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="mr-1 font-mono text-[11px] tracking-[.14em] text-dim uppercase">Proven in</span>
                    {st.proof.map((t) => (
                      <a key={t} href="#work" className="chip pointer-events-auto no-underline">
                        {t}
                      </a>
                    ))}
                  </div>
                  <div data-pline className="mt-3 hidden flex-wrap gap-1.5 md:flex">
                    {st.tags.map((t) => (
                      <span key={t} className="font-mono text-[11px] tracking-[.08em] text-dim">
                        #{t.toLowerCase().replaceAll(" ", "-")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HUD: magnification, depth gauge (clickable), caption */}
          <div className="absolute top-[88px] right-[clamp(20px,4vw,48px)] flex flex-col items-end gap-1 font-mono text-[11px] tracking-[.14em] uppercase">
            <span className="text-dim">Magnification</span>
            <span data-mag className="display text-[clamp(26px,2.6vw,40px)] leading-none font-[650] tracking-[-.02em] text-ink tabular-nums normal-case">
              ×1.0
            </span>
            <span className="mt-1 text-accent">{steps[cur]?.figure}</span>
          </div>

          <nav
            aria-label="Process stages"
            className="absolute top-1/2 right-[clamp(20px,4vw,48px)] hidden -translate-y-1/2 items-stretch gap-4 md:flex"
          >
            <ol className="m-0 flex list-none flex-col justify-between p-0 text-right">
              {steps.map((st, j) => (
                <li key={st.label}>
                  <button
                    type="button"
                    onClick={() => go(j)}
                    aria-current={j === cur ? "step" : undefined}
                    className={`cursor-pointer border-0 bg-transparent py-3 font-mono text-[11px] tracking-[.14em] uppercase transition-colors duration-500 ${j === cur ? "text-accent" : j < cur ? "text-ink-2" : "text-dim hover:text-ink"}`}
                  >
                    {st.label} <span className="opacity-60">×{magnification(j)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <span className="relative w-px bg-line">
              <span className="absolute inset-x-0 top-[calc(12px)] bottom-[calc(12px)]">
                <span data-needle className="absolute -left-[5px] top-0 block size-[11px] -translate-y-1/2 rounded-full border-2 border-accent bg-bg" />
              </span>
            </span>
          </nav>

          <a
            href="#work"
            className="absolute right-[clamp(20px,4vw,48px)] bottom-[clamp(20px,4vh,40px)] hidden font-mono text-xs tracking-[.14em] text-muted uppercase no-underline transition-colors duration-300 hover:text-accent md:block"
          >
            {skipLabel} ↓
          </a>
        </div>
      </div>
    </section>
  );
}

