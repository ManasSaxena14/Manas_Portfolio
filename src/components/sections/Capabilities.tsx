"use client";

import { useEffect, useRef, useState } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { SectionHeader, SplitWords } from "@/components/SectionHeader";
import { clamp, prefersReducedMotion, scrollToY } from "@/lib/scroll";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const { eyebrow, heading, paths } = portfolio.capabilities;
const n = paths.length;
const total = pad(n);

// One line glyph per domain (64 × 64), drawn in when its path comes up:
// a neural net, clustered points with a fit, a stack, a chart, candlesticks.
const GLYPHS: { d: string[]; dots?: [number, number][] }[] = [
  {
    d: ["M12 20L32 12M12 20L32 32M12 44L32 32M12 44L32 52M32 12L52 32M32 32L52 32M32 52L52 32", "M52 6v8M48 10h8"],
    dots: [[12, 20], [12, 44], [32, 12], [32, 32], [32, 52], [52, 32]],
  },
  {
    d: ["M6 56L58 10", "M10 44a7 7 0 1 0 14 0a7 7 0 1 0-14 0", "M30 30a8 8 0 1 0 16 0a8 8 0 1 0-16 0"],
    dots: [[14, 42], [19, 47], [17, 40], [35, 28], [41, 33], [39, 26], [52, 50]],
  },
  { d: ["M32 8L56 20L32 32L8 20Z", "M8 31L32 43L56 31", "M8 42L32 54L56 42"] },
  { d: ["M6 56H58", "M14 52V38M26 52V30M38 52V34M50 52V20", "M10 30L24 21L36 25L54 10"], dots: [[54, 10]] },
  { d: ["M14 10V54M30 16V56M46 6V44", "M10 20h8v20h-8z", "M26 28h8v16h-8z", "M42 12h8v22h-8z", "M54 26l4-4l4 4"] },
];

function Glyph({ i }: { i: number }) {
  const g = GLYPHS[i % GLYPHS.length];
  return (
    <svg data-glyph viewBox="0 0 64 64" aria-hidden className="size-[clamp(44px,4.6vw,64px)] flex-none overflow-visible text-accent">
      {g.d.map((d, k) => (
        <path key={k} d={d} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" />
      ))}
      {g.dots?.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="2.6" fill="currentColor" />
      ))}
    </svg>
  );
}

/** Agent-style log whose lines stream in whenever its panel is shown. */
function TraceLog({ lines, play }: { lines: string[]; play: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    if (!play) return;
    const timers = lines.map((_, i) => window.setTimeout(() => setShown(i + 1), 320 + i * 380));
    return () => timers.forEach(clearTimeout);
  }, [play, lines]);

  return (
    <div className="rounded-[12px] border border-line-soft bg-bg/70 px-4 py-3.5 font-mono text-[12px] leading-[1.75]">
      {lines.map((l, i) => {
        const ok = l.endsWith("✓");
        return (
          <div
            key={l}
            className="flex gap-3 whitespace-pre"
            style={{
              opacity: i < shown ? 1 : 0,
              transform: i < shown ? "none" : "translateX(-8px)",
              transition: "opacity .45s ease, transform .6s var(--ease-expo)",
            }}
          >
            <span className="text-faint">{pad(i + 1)}</span>
            <span className={`min-w-0 truncate ${ok ? "text-ink-2" : "text-dim"}`}>{ok ? l.slice(0, -1).trimEnd() : l}</span>
            {ok && <span className="text-accent">✓</span>}
          </div>
        );
      })}
      <div className="h-[1.75em]" style={{ opacity: play && shown < lines.length ? 1 : 0, transition: "opacity .3s" }}>
        <span className="text-accent">›</span>{" "}
        {/* Parked once the log is done and the prompt has faded out. */}
        <span className="caret" style={{ animationPlayState: play && shown < lines.length ? "running" : "paused" }} />
      </div>
    </div>
  );
}

export default function Capabilities() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const dashes = useRef<(HTMLSpanElement | null)[]>([]);
  const prev = useRef(0);
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(prefersReducedMotion()), []);

  // Scroll position across the pinned track picks the path; each path's
  // progress line fills as you scroll through it.
  useEffect(() => {
    let cur = 0;
    const last = new Array<number>(n).fill(-1);
    const update = (prog: number) => {
      const f = prog * n;
      const i = Math.min(n - 1, Math.floor(f));
      if (i !== cur) setIdx((cur = i));
      for (let k = 0; k < n; k++) {
        const v = clamp(f - k);
        if (Math.abs(v - last[k]) < 1e-4) continue;
        last[k] = v;
        const t = `scaleX(${v})`;
        if (fills.current[k]) fills.current[k]!.style.transform = t;
        if (dashes.current[k]) dashes.current[k]!.style.transform = t;
      }
    };
    // Same frame as the smooth scroll, positions cached by ScrollTrigger.
    const trigger = ScrollTrigger.create({
      trigger: track.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.2 });
    if (track.current) io.observe(track.current);
    return () => {
      trigger.kill();
      io.disconnect();
    };
  }, []);

  // Split the titles into characters once the fonts are in.
  const splits = useRef<SplitText[]>([]);
  useGSAP(
    () => {
      const titles = gsap.utils.toArray<HTMLElement>("[data-cap-title]", section.current);
      let alive = true;
      document.fonts.ready.then(() => {
        if (!alive) return;
        splits.current = titles.map((t) => SplitText.create(t, { type: "words,chars", charsClass: "cchar" }));
      });
      return () => {
        alive = false;
        splits.current.forEach((s) => s.revert());
        splits.current = [];
      };
    },
    { scope: section },
  );

  // Path change: the old panel slips away; the new one draws its glyph,
  // tips its title in, unblurs the line and cascades the skills.
  useGSAP(
    () => {
      const from = prev.current;
      prev.current = idx;
      if (from === idx) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-cap-panel]", section.current);
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
      const chars = q(".cchar");
      const dots = q("[data-glyph] circle");
      gsap.killTweensOf(panels);
      gsap.to(out, { autoAlpha: 0, y: -40 * dir, scale: 0.97, duration: 0.45, ease: "power2.in", overwrite: true });
      const tl = gsap
        .timeline({ delay: 0.16 })
        .fromTo(inn, { autoAlpha: 0, y: 46 * dir, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0)
        .fromTo(q("[data-glyph] path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: "power2.inOut" }, 0.05);
      if (dots.length)
        tl.fromTo(dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, stagger: 0.04, ease: "back.out(3)" }, 0.4);
      tl.fromTo(
          chars.length ? chars : q("[data-cap-title]"),
          { yPercent: 90 * dir, rotationX: -70 * dir, autoAlpha: 0, transformPerspective: 600, transformOrigin: "50% 100%" },
          { yPercent: 0, rotationX: 0, autoAlpha: 1, duration: 0.85, stagger: 0.018, ease: "expo.out" },
          0.08,
        )
        .fromTo(q("[data-cap-desc]"), { autoAlpha: 0, y: 16, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, 0.22)
        .fromTo(q("[data-cap-skill]"), { autoAlpha: 0, y: 12, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.03, ease: "back.out(2)" }, 0.32);
    },
    { scope: section, dependencies: [idx, reduce] },
  );

  // Clicking a path scrolls to the middle of its stretch of the track.
  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / n));
  };

  return (
    <section ref={section} id="capabilities" data-ambient className="relative pt-[clamp(64px,9vw,120px)]">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index={`${total} paths`} />
        <SplitWords text={heading} className="h2 max-w-[12ch]" />
      </div>

      <div ref={track} className="relative" style={{ height: `${n * 85 + 40}vh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="mx-auto grid h-full max-w-[1440px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-[clamp(14px,2.4vw,40px)] px-[clamp(20px,4vw,48px)] pt-[88px] pb-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:pt-20 lg:pb-10">
            {/* Index of paths */}
            <nav aria-label="Capability paths" className="min-w-0">
              <ol className="m-0 hidden list-none flex-col border-b border-line p-0 lg:flex">
                {paths.map((pt, i) => {
                  const on = i === idx;
                  return (
                    <li key={pt.title} className="relative border-t border-line">
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={on ? "step" : undefined}
                        className="flex w-full items-center gap-5 border-0 bg-transparent py-[clamp(14px,2.4vh,26px)] text-left"
                        style={{ font: "inherit" }}
                      >
                        <span className="font-mono text-xs text-accent">{pad(i + 1)}</span>
                        <span
                          className="flex-1 font-display text-[clamp(22px,2.1vw,32px)] leading-[1.1] font-[560] tracking-[-.03em] [font-stretch:104%] transition-[color,transform] duration-500 ease-expo"
                          style={{
                            color: on ? "var(--color-ink)" : i < idx ? "var(--color-dim)" : "#52525b",
                            transform: on ? "translateX(10px)" : "none",
                          }}
                        >
                          {pt.title}
                        </span>
                        <span className="font-mono text-[11px] tracking-[.08em] text-faint">{pad(pt.tags.length)}</span>
                        <span
                          className="text-accent transition-[opacity,transform] duration-500 ease-expo"
                          style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateX(-8px)" }}
                        >
                          ▸
                        </span>
                      </button>
                      <span aria-hidden className="absolute -bottom-px left-0 z-[1] h-px w-full overflow-hidden">
                        <span
                          ref={(el) => {
                            fills.current[i] = el;
                          }}
                          className="block h-full w-full origin-left bg-accent"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 mb-0 hidden font-mono text-[11px] tracking-[.14em] text-faint uppercase lg:block">
                ↓ Scroll through all {n} paths
              </p>

              {/* Phones & tablets: segmented progress */}
              <div className="flex flex-col gap-3 lg:hidden">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                  {paths.map((pt, i) => (
                    <button
                      key={pt.title}
                      type="button"
                      aria-label={pt.title}
                      onClick={() => go(i)}
                      className="relative h-1 overflow-hidden rounded-full border-0 bg-line p-0"
                    >
                      <span
                        ref={(el) => {
                          dashes.current[i] = el;
                        }}
                        className="absolute inset-0 block origin-left bg-accent"
                        style={{ transform: "scaleX(0)" }}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between font-mono text-[11px] tracking-[.14em] uppercase">
                  <span className="text-accent">
                    {pad(idx + 1)} / {total}
                  </span>
                  <span className="text-muted">{paths[idx].trace}</span>
                </div>
              </div>
            </nav>

            {/* Panels */}
            <div className="relative grid min-h-0" aria-live="polite">
              {paths.map((pt, i) => (
                <article
                  key={pt.title}
                  data-cap-panel
                  data-spotlight
                  aria-hidden={i !== idx}
                  className="relative flex min-h-0 flex-col gap-[clamp(12px,2vh,22px)] self-center overflow-hidden rounded-[22px] border border-line-soft bg-surface p-[clamp(20px,3vw,44px)] [grid-area:1/1] lg:self-stretch"
                  style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -bottom-10 font-serif text-[clamp(140px,16vw,250px)] leading-none text-transparent italic select-none [-webkit-text-stroke:1px_var(--color-line)]"
                  >
                    {pad(i + 1)}
                  </span>
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="hidden items-center gap-2.5 pt-1 font-mono text-xs tracking-[.14em] text-muted uppercase lg:flex">
                      <span className="size-[7px] rounded-full bg-accent" style={{ animation: "pulse 1.8s ease-in-out infinite" }} />
                      Path {pad(i + 1)} / {total} — {pt.trace}
                    </div>
                    <Glyph i={i} />
                  </div>
                  <h3 data-cap-title className="display relative m-0 text-[clamp(30px,3.6vw,56px)] leading-none font-[600]">
                    {pt.title}
                  </h3>
                  <p
                    data-cap-desc
                    className="relative m-0 max-w-[30ch] text-[clamp(18px,1.7vw,25px)] leading-[1.28] font-[600] tracking-[-.02em] text-ink"
                  >
                    {pt.description}
                  </p>
                  <div className="relative flex flex-col gap-2.5">
                    <span className="mono-label text-dim">
                      Skills · <span className="text-accent">{pt.tags.length}</span>
                    </span>
                    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 md:gap-2">
                      {pt.tags.map((t) => (
                        <li
                          key={t}
                          data-cap-skill
                          className="chip h-[26px] border-line px-2 text-[11px] font-medium text-ink-2 md:h-[30px] md:px-[11px] md:text-[12px]"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative [@media(max-height:760px)]:hidden">
                    <TraceLog lines={pt.log} play={active && i === idx} />
                  </div>
                  <a
                    href={pt.provenIn.href}
                    className="relative mt-auto inline-flex items-center gap-2.5 self-start border-t border-line pt-4 font-mono text-xs tracking-[.12em] text-accent uppercase no-underline hover:text-ink"
                  >
                    ▸ Proven in — {pt.provenIn.label}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
