"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { Accent, SectionHeader, SplitWords } from "@/components/SectionHeader";
import { clamp, prefersReducedMotion, scrollToY } from "@/lib/scroll";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { PARTICLES } from "@/components/three/constants";
import Scramble from "@/components/Scramble";
import type { ProcessInput } from "@/components/three/ProcessScene";

// Memoised so a step change (which re-renders this section) never
// re-renders the WebGL canvas.
const ProcessScene = memo(dynamic(() => import("@/components/three/ProcessScene"), { ssr: false }));

const { eyebrow, heading, skipLabel, steps } = portfolio.process;
const n = steps.length;

// Scroll f (0..n) → shape (0..3). Each hand-off is centred on the step
// boundary, where the title swaps, and eased across ±0.2 of a step.
function morphFor(f: number) {
  const g = f - 0.5;
  if (g <= 0) return 0;
  const i = Math.floor(g);
  const x = clamp((g - i - 0.3) / 0.4);
  return Math.min(3, Math.min(n - 1, i + x * x * (3 - 2 * x)));
}

/** Counts "54,873" / "<100ms" / "8,000+" up from zero inside `el`. */
function countUp(el: Element, value: string) {
  const m = value.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
  if (!m) return null;
  const [, pre, num, post] = m;
  const grouped = num.includes(",");
  const target = parseFloat(num.replaceAll(",", ""));
  const o = { v: 0 };
  return gsap.to(o, {
    v: target,
    duration: 1.4,
    ease: "expo.out",
    onUpdate: () => {
      el.textContent = `${pre}${grouped ? Math.round(o.v).toLocaleString("en-US") : Math.round(o.v)}${post}`;
    },
  });
}

/** Corner bracket of the figure's HUD frame. */
function Corner({ className }: { className: string }) {
  return <span aria-hidden className={`pointer-events-none absolute size-[18px] border-accent/70 ${className}`} />;
}

export default function Process() {
  const section = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const input = useRef<ProcessInput>({ morph: 0, mx: 0, my: 0 });
  const prev = useRef(0);
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(prefersReducedMotion()), []);

  // Scroll progress across the sticky track (0 → 1), from ScrollTrigger so it
  // updates in the same frame as the smooth scroll without reading layout.
  useEffect(() => {
    let cur = 0;
    let lastFill = -1;
    let lastText = "";
    const update = (prog: number) => {
      const f = prog * n;
      const i = Math.min(n - 1, Math.floor(f));
      if (i !== cur) setIdx((cur = i));
      if (fill.current && Math.abs(prog - lastFill) > 1e-4) fill.current.style.transform = `scaleX(${(lastFill = prog)})`;
      input.current.morph = morphFor(f);
      const text = `t = ${prog.toFixed(2)}`;
      if (readout.current && text !== lastText) readout.current.textContent = lastText = text;
    };
    const onMove = (e: PointerEvent) => {
      input.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      input.current.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const trigger = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px" });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      trigger.kill();
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  // Split every step title into characters once the fonts are in.
  const splits = useRef<SplitText[]>([]);
  useGSAP(
    () => {
      const titles = gsap.utils.toArray<HTMLElement>("[data-ptitle]", section.current);
      let alive = true;
      document.fonts.ready.then(() => {
        if (!alive) return;
        splits.current = titles.map((t) => SplitText.create(t, { type: "words,chars", charsClass: "pchar" }));
      });
      return () => {
        alive = false;
        splits.current.forEach((s) => s.revert());
        splits.current = [];
      };
    },
    { scope: section },
  );

  // Keep the nav pill under the active step (also on resize).
  useEffect(() => {
    const place = (animate: boolean) => {
      const btn = navRef.current?.querySelectorAll<HTMLElement>("[data-pbtn]")[idx];
      if (!btn || !pill.current) return;
      gsap.to(pill.current, {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: animate && !reduce ? 0.7 : 0,
        ease: "expo.out",
        overwrite: true,
      });
    };
    place(true);
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [idx, reduce]);

  // Step change: the old panel slips away, the new one builds itself —
  // title characters tip up, the line unblurs, the stat counts, tags pop.
  useGSAP(
    () => {
      const from = prev.current;
      prev.current = idx;
      if (from === idx) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", section.current);
      const out = panels[from];
      const inn = panels[idx];
      if (!out || !inn) return;
      if (reduce) {
        gsap.set(out, { autoAlpha: 0 });
        gsap.set(inn, { autoAlpha: 1, y: 0 });
        return;
      }
      const dir = idx > from ? 1 : -1;
      const q = gsap.utils.selector(inn);
      const chars = q(".pchar");
      gsap.killTweensOf(panels);
      gsap.to(out, { autoAlpha: 0, y: -34 * dir, duration: 0.45, ease: "power2.in", overwrite: true });
      const tl = gsap.timeline({ delay: 0.18 });
      tl.set(inn, { autoAlpha: 1, y: 0 })
        .fromTo(
          chars.length ? chars : q("[data-ptitle]"),
          { yPercent: 90 * dir, rotationX: -75 * dir, autoAlpha: 0, transformPerspective: 600, transformOrigin: "50% 100%" },
          { yPercent: 0, rotationX: 0, autoAlpha: 1, duration: 0.9, stagger: 0.022, ease: "expo.out" },
          0,
        )
        // The title unblurs as a whole: one blur pass on the GPU instead of
        // one per character layer, for the same look as the letters land.
        .fromTo(q("[data-ptitle]"), { filter: "blur(8px)" }, { filter: "blur(0px)", duration: 1.1, ease: "expo.out", clearProps: "filter" }, 0)
        .fromTo(q("[data-pbody]"), { autoAlpha: 0, y: 18, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, 0.2)
        .fromTo(q("[data-pstat]"), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.3)
        .fromTo(q(".chip"), { autoAlpha: 0, y: 14, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "back.out(2)" }, 0.4);
      const num = q("[data-pnum]")[0];
      const counter = num && countUp(num, steps[idx].stat.v);
      if (counter) tl.add(counter, 0.3);
      // The figure blinks lime as the particles start to re-form.
      if (flash.current) gsap.fromTo(flash.current, { opacity: 0.55 }, { opacity: 0, duration: 1.2, ease: "power2.out" });
    },
    { scope: section, dependencies: [idx, reduce] },
  );

  // Clicking a step scrolls to the middle of its stretch of the track.
  const go = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / n));
  };

  const cur = steps[idx];

  return (
    <section ref={section} id="process" data-ambient className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(01)" />
        <SplitWords text={heading} className="h2 max-w-[13ch]" />
      </div>

      <div ref={wrap} className="relative" style={{ height: `${Math.max(1, n) * 100 + 60}vh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="mx-auto grid h-full max-w-[1440px] grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(18px,3vw,56px)] px-[clamp(20px,4vw,48px)] pt-[84px] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-1 lg:pt-24 lg:pb-10">
            {/* Copy */}
            <div className="flex min-h-0 flex-col justify-between gap-5">
              {/* Step nav: a lime pill slides to the active step */}
              <div
                ref={navRef}
                className="relative flex self-start rounded-[13px] border border-line bg-surface/70 p-1 backdrop-blur-md"
              >
                <span ref={pill} aria-hidden className="absolute top-1 bottom-1 left-0 w-0 rounded-[9px] bg-accent" />
                {steps.map((st, i) => (
                  <button
                    key={st.label}
                    type="button"
                    data-pbtn
                    aria-current={i === idx ? "step" : undefined}
                    onClick={() => go(i)}
                    className="relative flex h-[34px] items-center gap-1.5 rounded-[9px] border-0 bg-transparent px-[clamp(8px,1.2vw,14px)] font-mono text-[11px] tracking-[.1em] uppercase transition-colors duration-500"
                    style={{ color: i === idx ? "var(--color-bg)" : i < idx ? "var(--color-ink)" : "var(--color-dim)" }}
                  >
                    <span className="opacity-60">{pad(i + 1)}</span>
                    <span className={i === idx ? "inline" : "hidden sm:inline"}>{st.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative grid" aria-live="polite">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-[.4em] right-0 font-serif text-[clamp(120px,15vw,240px)] leading-none text-transparent italic select-none [-webkit-text-stroke:1px_var(--color-line)] lg:-right-4"
                >
                  <span key={idx} className="block" style={{ animation: "rise .9s var(--ease-expo)" }}>
                    {pad(idx + 1)}
                  </span>
                </span>
                {steps.map((st, i) => (
                  <div
                    key={st.label}
                    data-panel
                    aria-hidden={i !== idx}
                    className="[grid-area:1/1]"
                    style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
                  >
                    <h3 data-ptitle className="display m-0 max-w-[11ch] text-[clamp(40px,5.6vw,92px)] leading-[.95] font-[600]">
                      <Accent text={st.title} />
                    </h3>
                    <p
                      data-pbody
                      className="mt-[clamp(12px,1.4vw,20px)] mb-0 max-w-[26ch] text-[clamp(17px,1.55vw,22px)] leading-[1.3] font-[580] tracking-[-.015em] text-ink-2"
                    >
                      {st.body}
                    </p>
                    <div data-pstat className="mt-[clamp(14px,2vw,28px)] flex items-end gap-4">
                      <span
                        data-pnum
                        className="display text-[clamp(40px,4.4vw,68px)] leading-[.85] font-[680] text-accent tabular-nums"
                      >
                        {st.stat.v}
                      </span>
                      <span className="mono-label max-w-[14ch] pb-1 leading-[1.4] text-muted">{st.stat.l}</span>
                    </div>
                    <div className="mt-[clamp(14px,2vw,26px)] hidden flex-wrap gap-2 md:flex">
                      {st.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress: one track with a tick per step */}
              <div className="flex flex-col gap-3">
                <div className="relative h-0.5 bg-line">
                  <span ref={fill} className="absolute inset-0 block origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
                  {steps.map((st, i) => (
                    <span
                      key={st.label}
                      aria-hidden
                      className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[background,border-color,box-shadow] duration-500"
                      style={{
                        left: `${((i + 0.5) / n) * 100}%`,
                        background: i <= idx ? "var(--color-accent)" : "var(--color-bg)",
                        borderColor: i <= idx ? "var(--color-accent)" : "var(--color-line-strong)",
                        boxShadow: i === idx ? "0 0 0 4px color-mix(in srgb, var(--color-accent) 18%, transparent)" : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-xs tracking-[.14em] uppercase">
                  <span ref={readout} className="text-faint">
                    t = 0.00
                  </span>
                  <a href="#work" className="text-muted no-underline transition-colors duration-300 hover:text-accent">
                    {skipLabel} ↓
                  </a>
                </div>
              </div>
            </div>

            {/* 3D figure in a HUD frame */}
            <div
              className="relative order-first min-h-0 overflow-hidden rounded-[20px] border border-line-soft lg:order-none"
              style={{ background: "radial-gradient(ellipse at 50% 60%, #151518, #0c0c0e)" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage: "radial-gradient(rgb(255 255 255 / .06) 1px, transparent 1.2px)",
                  backgroundSize: "26px 26px",
                  maskImage: "radial-gradient(ellipse at 50% 50%, #000 40%, transparent 85%)",
                  WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 40%, transparent 85%)",
                }}
              />
              <ProcessScene input={input} active={active} reduce={reduce} />
              <div
                ref={flash}
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{ background: "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 70%)" }}
              />
              <span aria-hidden className="hud-scan pointer-events-none absolute inset-0" />
              <Corner className="top-3 left-3 border-t border-l" />
              <Corner className="top-3 right-3 border-t border-r" />
              <Corner className="bottom-3 left-3 border-b border-l" />
              <Corner className="right-3 bottom-3 border-r border-b" />

              <div className="mono-label pointer-events-none absolute top-5 right-9 left-9 flex justify-between text-muted">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.6s ease-in-out infinite" }} />
                  fig. {pad(idx + 1)} · live
                </span>
                <span className="text-ink-2">{cur.label}</span>
              </div>
              <div className="mono-label pointer-events-none absolute right-9 bottom-5 left-9 flex items-end justify-between gap-4 normal-case">
                <span className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-2 text-accent">
                    <span className="size-1.5 bg-accent" />
                    <Scramble text={cur.figure} play={active} duration={700} />
                  </span>
                  <span className="text-faint">n = {PARTICLES.toLocaleString("en-US")} points</span>
                </span>
                <span className="text-faint">
                  {pad(idx + 1)} / {pad(n)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
