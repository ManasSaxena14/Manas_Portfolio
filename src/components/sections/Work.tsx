"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { pad, portfolio, type PathId, type Project, type WorkPath } from "@/data/portfolio";
import { Accent, Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";
import CountUp from "@/components/CountUp";
import ProjectArt from "@/components/ProjectArt";
import { clamp, prefersReducedMotion, scrollToY } from "@/lib/scroll";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const { eyebrow, heading, intro, paths, projects } = portfolio.work;
const stacking = portfolio.settings.stackedCards;
const byPath = (id: PathId) => projects.filter((p) => p.path === id);

/*
 * Work, as three paths. A trunk line draws down the page as you scroll and
 * forks into the three disciplines; picking one lights its branch, then the
 * page glides down to that path's projects. A tab bar below switches paths
 * in place: the current cards fold away and the next set rises in.
 */
export default function Work() {
  const [active, setActive] = useState<PathId | null>(null); // what the user picked
  const [shown, setShown] = useState<PathId | null>(null); // what the list renders (lags while folding out)
  const stage = useRef<HTMLDivElement>(null);
  const listWrap = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const choose = (id: PathId, from: "card" | "tab") => {
    if (busy.current) return;
    const goToStage = () => {
      const el = stage.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      // From a card, always glide down; from the tabs only if they scrolled away.
      if (from === "card" || el.getBoundingClientRect().top < 0) scrollToY(top);
    };
    setActive(id);
    if (id === shown) return goToStage();
    const cards = listWrap.current?.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards?.length || prefersReducedMotion()) {
      setShown(id);
      requestAnimationFrame(goToStage);
      return;
    }
    busy.current = true;
    goToStage();
    gsap.to(cards, {
      autoAlpha: 0,
      y: -40,
      scale: 0.97,
      duration: 0.45,
      ease: "power3.in",
      stagger: 0.05,
      onComplete: () => {
        busy.current = false;
        setShown(id);
      },
    });
  };

  return (
    <section id="work" className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(02)" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SplitWords text={heading} className="h2 max-w-[14ch]" />
          <p data-reveal="" className="m-0 max-w-[40ch] text-[15.5px] leading-[1.6] text-muted lg:pb-3">
            {intro}
          </p>
        </div>
        <PathSelector active={active} onChoose={(id) => choose(id, "card")} />
      </div>

      <div ref={stage} className="scroll-mt-24">
        {shown ? (
          <>
            <PathBar active={active ?? shown} onChoose={(id) => choose(id, "tab")} />
            <div ref={listWrap}>
              <ProjectList key={shown} path={paths.find((p) => p.id === shown)!} />
            </div>
          </>
        ) : (
          <div className="wrap">
            <p className="mt-10 flex items-center justify-center gap-3 font-mono text-xs tracking-[.14em] text-dim uppercase">
              <span className="wp-nudge text-accent">↑</span> Choose a path to open its projects
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── the fork + three path cards ───────────── */

// Branch geometry, in a 1200 × 150 box: one trunk splitting into three lanes
// that land on the centres of the three cards.
const TRUNK = "M600 0 V46";
const BRANCHES = ["M600 46 C600 98 200 78 200 150", "M600 46 V150", "M600 46 C600 98 1000 78 1000 150"];

function PathSelector({ active, onChoose }: { active: PathId | null; onChoose: (id: PathId) => void }) {
  const root = useRef<HTMLDivElement>(null);

  // The fork's sparks and the cards' diagrams are SMIL: pause them off screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.querySelectorAll("svg").forEach((s) => (e.isIntersecting ? s.unpauseAnimations() : s.pauseAnimations())),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The fork draws itself as it scrolls up the screen, then the cards rise
  // in from depth, one per lane.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<SVGPathElement>("[data-draw]", root.current);
        gsap.fromTo(
          lines,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 88%", end: "top 38%", scrub: 0.6 },
          },
        );
        const cards = gsap.utils.toArray<HTMLElement>("[data-path-card]", root.current);
        gsap.set(cards, { transition: "none" });
        gsap.from(cards, {
          autoAlpha: 0,
          y: 90,
          rotationX: -18,
          transformPerspective: 1200,
          transformOrigin: "50% 0%",
          duration: 1.4,
          stagger: 0.14,
          clearProps: "transform,opacity,visibility,transition",
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-[clamp(40px,5vw,72px)]">
      {/* The fork (desktop: lanes line up with the three columns) */}
      <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className="hidden h-[clamp(90px,9vw,150px)] w-full overflow-visible md:block" aria-hidden>
        {[TRUNK, ...BRANCHES].map((d) => (
          <path key={`b${d}`} d={d} fill="none" stroke="var(--color-line)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ))}
        <path data-draw d={TRUNK} pathLength={1} strokeDasharray="1 1" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {BRANCHES.map((d, i) => {
          const p = paths[i];
          const on = active === p.id;
          return (
            <g key={d}>
              <path
                data-draw
                d={d}
                pathLength={1}
                strokeDasharray="1 1"
                fill="none"
                stroke={p.hue}
                strokeOpacity={active && !on ? 0.18 : 0.75}
                strokeWidth={on ? 2.6 : 1.6}
                vectorEffect="non-scaling-stroke"
                className="transition-[stroke-opacity,stroke-width] duration-700"
              />
              {(!active || on) && (
                <circle r="4" fill={p.hue} className="wp-spark">
                  <animateMotion dur={on ? "1.6s" : "3.4s"} begin={`${i * 0.5}s`} repeatCount="indefinite" path={`${TRUNK} ${d.replace("M600 46", "L600 46")}`} />
                </circle>
              )}
            </g>
          );
        })}
        <circle cx="600" cy="46" r="5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>

      <div role="group" aria-label="Choose a path" className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {paths.map((p) => (
          <PathCard key={p.id} p={p} active={active} onChoose={onChoose} />
        ))}
      </div>
    </div>
  );
}

function PathCard({ p, active, onChoose }: { p: WorkPath; active: PathId | null; onChoose: (id: PathId) => void }) {
  const list = byPath(p.id);
  const on = active === p.id;
  const dim = active !== null && !on;
  return (
    <button
      type="button"
      data-path-card
      data-spotlight
      aria-pressed={on}
      onClick={() => onChoose(p.id)}
      style={{ "--hue": p.hue } as CSSProperties}
      className={`wp-card group relative flex min-h-[420px] cursor-pointer flex-col overflow-hidden rounded-[22px] border bg-surface p-[clamp(22px,2.4vw,32px)] text-left transition-[border-color,transform,opacity,box-shadow] duration-700 ease-expo hover:-translate-y-1.5 ${
        on
          ? "border-[var(--hue)] shadow-[0_30px_80px_-40px_var(--hue)]"
          : "border-line-soft hover:border-[color-mix(in_srgb,var(--hue)_55%,transparent)]"
      } ${dim ? "opacity-55 hover:opacity-100" : ""}`}
    >
      {/* Hue wash that blooms from the top on hover / when chosen */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(80%_70%_at_50%_0%,color-mix(in_srgb,var(--hue)_16%,transparent),transparent_70%)] transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      />

      <span className="relative flex items-center gap-2.5 font-mono text-[11px] tracking-[.14em] text-muted uppercase">
        <span className="text-[var(--hue)]">Path {p.index}</span>
        <span className="text-faint">/</span>
        <span>
          {pad(list.length)} {list.length === 1 ? "project" : "projects"}
        </span>
        <span
          className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-500 ${on ? "border-[var(--hue)] bg-[var(--hue)] text-bg" : "border-line text-dim"}`}
        >
          {on ? "Open" : p.cmd}
        </span>
      </span>

      <span data-ambient className="relative mt-6 mb-5 block h-[86px]">
        <PathGlyph id={p.id} />
      </span>

      <span className="display relative block text-[clamp(28px,2.5vw,38px)] leading-[1] font-[600]">
        <Accent text={p.title} />
      </span>
      <span className="relative mt-3 block max-w-[36ch] text-[14.5px] leading-[1.55] text-muted">{p.blurb}</span>

      <span className="relative mt-5 flex flex-col border-t border-line-soft">
        {list.map((pr) => (
          <span key={pr.title} className="flex items-baseline gap-3 border-b border-line-soft py-2.5 font-mono text-[12px]">
            <span className="text-[var(--hue)]">↳</span>
            <span className="text-ink-2">{pr.title}</span>
            <span className="ml-auto truncate text-[11px] text-dim">{pr.category.split("·").pop()?.trim()}</span>
          </span>
        ))}
      </span>

      <span className="relative mt-4 flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <span key={t} className={`chip chip-sm ${t === "System Design" ? "border-[var(--hue)] text-ink" : ""}`}>
            {t}
          </span>
        ))}
      </span>

      <span className="relative mt-auto flex items-center justify-between pt-6 font-mono text-xs tracking-[.12em] uppercase">
        <span className={on ? "text-[var(--hue)]" : "text-ink"}>{on ? "Viewing path" : "Enter path"}</span>
        <span className="grid size-10 place-items-center rounded-full border border-line transition-[background-color,border-color,color,transform] duration-500 ease-expo group-hover:translate-y-0.5 group-hover:border-[var(--hue)] group-hover:bg-[var(--hue)] group-hover:text-bg">
          ↓
        </span>
      </span>
    </button>
  );
}

/** A small living diagram per discipline: a service graph, a neural net, a chart. */
function PathGlyph({ id }: { id: PathId }) {
  if (id === "dev")
    return (
      <svg viewBox="0 0 240 86" className="h-full w-auto overflow-visible" aria-hidden>
        <g fill="none" stroke="var(--hue)" strokeOpacity=".55" strokeWidth="1.2" strokeDasharray="4 5" className="wp-flow">
          <path d="M34 43 H96" />
          <path d="M126 43 C150 43 150 16 176 16" />
          <path d="M126 43 C150 43 150 70 176 70" />
          <path d="M206 16 V70" />
        </g>
        {[
          { x: 4, y: 29, t: "client" },
          { x: 96, y: 29, t: "api" },
          { x: 176, y: 2, t: "redis" },
          { x: 176, y: 56, t: "pg" },
        ].map((n, i) => (
          <g key={n.t}>
            <rect x={n.x} y={n.y} width="30" height="28" rx="7" fill="var(--color-bg)" stroke="var(--hue)" strokeOpacity={i === 1 ? 1 : 0.5} />
            <text x={n.x + 15} y={n.y + 17.5} textAnchor="middle" fontSize="8" fill="var(--color-muted)" style={{ fontFamily: "var(--font-mono)" }}>
              {n.t}
            </text>
          </g>
        ))}
        <circle r="3" fill="var(--hue)">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M34 43 H96 M126 43 C150 43 150 16 176 16" />
        </circle>
      </svg>
    );
  if (id === "ai") {
    const L = [[18, 43], [18, 15], [18, 71]];
    const M = [[96, 8], [96, 32], [96, 56], [96, 80]];
    const R = [[174, 30], [174, 58]];
    return (
      <svg viewBox="0 0 240 86" className="h-full w-auto overflow-visible" aria-hidden>
        <g stroke="var(--hue)" strokeWidth=".8">
          {L.flatMap(([x1, y1], a) => M.map(([x2, y2], b) => <line key={`l${a}${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className="wp-syn" style={{ animationDelay: `${(a + b) * 0.22}s` }} />))}
          {M.flatMap(([x1, y1], a) => R.map(([x2, y2], b) => <line key={`r${a}${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className="wp-syn" style={{ animationDelay: `${0.7 + (a + b) * 0.22}s` }} />))}
          <line x1="174" y1="30" x2="226" y2="43" className="wp-syn" style={{ animationDelay: "1.4s" }} />
          <line x1="174" y1="58" x2="226" y2="43" className="wp-syn" style={{ animationDelay: "1.5s" }} />
        </g>
        {[...L, ...M, ...R].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="var(--color-bg)" stroke="var(--hue)" strokeWidth="1.2" className="wp-node" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
        <circle cx="226" cy="43" r="7" fill="var(--hue)" className="wp-node" />
      </svg>
    );
  }
  const bars = [34, 52, 28, 66, 44, 78, 58];
  return (
    <svg viewBox="0 0 240 86" className="h-full w-auto overflow-visible" aria-hidden>
      <line x1="0" y1="84" x2="232" y2="84" stroke="var(--color-line-strong)" />
      {bars.map((h, i) => (
        <rect key={i} x={6 + i * 32} y={84 - h} width="18" height={h} rx="3" fill="var(--hue)" fillOpacity={i === 5 ? 0.95 : 0.35} className="wp-bar" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
      <path d="M15 52 L47 36 L79 58 L111 22 L143 42 L175 10 L207 28" fill="none" stroke="var(--color-ink)" strokeOpacity=".7" strokeWidth="1.3" strokeDasharray="3 4" className="wp-flow" />
    </svg>
  );
}

/* ───────────── path tab bar ───────────── */

function PathBar({ active, onChoose }: { active: PathId; onChoose: (id: PathId) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const p = paths.find((x) => x.id === active)!;
  const count = byPath(active).length;

  // The pill slides under whichever tab is active.
  useLayoutEffect(() => {
    const measure = () => {
      const btn = track.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!btn) return;
      setPill({ x: btn.offsetLeft, w: btn.offsetWidth });
      // On narrow screens the bar scrolls sideways: keep the active tab in view.
      const t = track.current!;
      t.scrollTo({ left: btn.offsetLeft - (t.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <div className="wrap mt-[clamp(48px,6vw,96px)]" style={{ "--hue": p.hue } as CSSProperties}>
      <div className="flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <div key={active} className="wp-swap flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="font-mono text-xs tracking-[.14em] whitespace-nowrap text-[var(--hue)] uppercase">Path {p.index}</span>
          <span className="display text-[clamp(24px,2.4vw,34px)] leading-none font-[600]">
            <Accent text={p.title} />
          </span>
          <span className="font-mono text-xs whitespace-nowrap text-dim">
            {pad(count)} {count === 1 ? "build" : "builds"}
          </span>
        </div>
        <div
          ref={track}
          role="tablist"
          aria-label="Project paths"
          className="relative flex max-w-full self-start overflow-x-auto overscroll-x-contain rounded-full border border-line bg-surface p-1 [scrollbar-width:none] md:flex-none md:self-auto [&::-webkit-scrollbar]:hidden"
        >
          {pill && (
            <span
              aria-hidden
              className="absolute top-1 bottom-1 rounded-full bg-[var(--hue)] transition-[transform,width,background-color] duration-700 ease-expo"
              style={{ width: pill.w, transform: `translateX(${pill.x - 4}px)`, left: 4 }}
            />
          )}
          {paths.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              data-tab={x.id}
              aria-selected={x.id === active}
              onClick={() => onChoose(x.id)}
              className={`relative z-[1] cursor-pointer rounded-full px-4 py-2 font-mono text-[11.5px] tracking-[.1em] whitespace-nowrap uppercase transition-colors duration-500 ${x.id === active ? "text-bg" : "text-muted hover:text-ink"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── one path's projects ───────────── */

function ProjectList({ path }: { path: WorkPath }) {
  const list = useRef<HTMLDivElement>(null);
  const items = byPath(path.id);

  // The set rises in as a deck, each card from a little further down.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(gsap.utils.toArray<HTMLElement>("[data-card]", list.current), {
          autoAlpha: 0,
          y: (i: number) => 90 + i * 40,
          rotationX: -10,
          transformPerspective: 1400,
          transformOrigin: "50% 0%",
          duration: 1.3,
          stagger: 0.12,
          clearProps: "transform,opacity,visibility",
          onComplete: () => ScrollTrigger.refresh(),
        });
      });
      return () => mm.revert();
    },
    { scope: list },
  );

  // As the next card slides over, the current one recedes: scale down and dim.
  useEffect(() => {
    const el = list.current;
    if (!stacking || !el) return;
    const mq = window.matchMedia("(min-width: 1080px) and (min-height: 700px)");
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    const inners = cards.map((c) => c.firstElementChild as HTMLElement | null);
    const shades = cards.map((c) => c.querySelector<HTMLElement>("[data-shade]"));
    const last = cards.map(() => -1);
    let tops: number[] = [];
    let sts: number[] = cards.map((_, i) => 92 + i * 18);
    let H = window.innerHeight;

    // Where each card sits in the flow before it sticks. Summed from the
    // list's top (sticky cards keep their space), so it never depends on
    // whether a card happens to be stuck when this runs.
    const measure = () => {
      H = window.innerHeight;
      const gap = parseFloat(getComputedStyle(el).rowGap) || 0;
      let y = el.getBoundingClientRect().top + window.scrollY;
      tops = cards.map((c) => {
        const top = y;
        y += c.offsetHeight + gap;
        return top;
      });
      // A card taller than the screen must scroll fully into view before it
      // pins, so its sticky top goes negative: it sticks only once its bottom
      // edge is 24px above the bottom of the viewport. Nothing gets covered.
      sts = cards.map((c, i) => {
        const base = 92 + i * 18;
        const st = mq.matches ? Math.min(base, H - c.offsetHeight - 24) : base;
        c.style.setProperty("--st", `${Math.round(st)}px`);
        return st;
      });
    };

    const update = (y: number) => {
      cards.forEach((_, i) => {
        const inner = inners[i];
        const shade = shades[i];
        if (!inner) return;
        // The next card's top in the viewport, while it slides up to stick.
        const t =
          mq.matches && i < cards.length - 1
            ? clamp(1 - (tops[i + 1] - y - sts[i + 1]) / (H * 0.85))
            : 0;
        if (Math.abs(t - last[i]) < 1e-4) return;
        last[i] = t;
        inner.style.transform = t > 0 ? `scale(${1 - t * 0.06})` : "";
        if (shade) shade.style.opacity = String(t * 0.5);
      });
    };

    measure();
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => update(self.scroll()),
      onRefresh: (self) => {
        measure();
        update(self.scroll());
      },
    });
    update(window.scrollY);
    return () => trigger.kill();
  }, []);

  return (
    <div
      ref={list}
      className={`mx-auto mt-8 flex max-w-[1480px] flex-col gap-5 px-[clamp(12px,2.4vw,40px)] ${stacking ? "stack:gap-8" : ""}`}
    >
      {items.map((p, i) => (
        <ProjectCard key={p.title} p={p} i={i} total={items.length} hue={path.hue} />
      ))}
    </div>
  );
}

/** "Live" when the project has something to open, otherwise source-only. */
const isLive = (p: Project) => p.links.some((l) => /live|dashboard/i.test(l.label));

/** Solo or team, read from the role line and note so the data stays single-sourced. */
function scopeOf(p: Project) {
  const t = `${p.role} ${p.note}`;
  if (/^Solo/i.test(p.role)) return "Solo build";
  if (/co-?builder|co-?built/i.test(t)) return "Co-built";
  const team = t.match(/team of (\w+)/i);
  if (team) return `Team of ${({ two: 2, three: 3, four: 4, five: 5, six: 6 } as Record<string, number>)[team[1].toLowerCase()] ?? team[1]}`;
  return null;
}

function ProjectCard({ p, i, total, hue }: { p: Project; i: number; total: number; hue: string }) {
  const num = pad(i + 1);
  const [primary, ...rest] = p.links;
  const live = isLive(p);
  const scope = scopeOf(p);

  // The scene's layers drift against the pointer, each by its depth.
  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--ty", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = (e: PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--tx", "0");
    e.currentTarget.style.setProperty("--ty", "0");
  };

  return (
    <article
      data-card
      className={`relative ${stacking ? "stack:sticky stack:top-[var(--st)]" : ""}`}
      style={{ "--st": `${92 + i * 18}px`, "--hue": hue } as CSSProperties}
    >
      <div
        data-spotlight
        className={`relative flex origin-top flex-col overflow-hidden rounded-[22px] border border-line-soft bg-surface shadow-[0_-24px_60px_-24px_rgb(0_0_0/.75)] ${stacking ? "stack:min-h-[calc(100svh-124px)] stack:will-change-transform" : ""}`}
      >
        {/* Own layer (stacked layout): the per-frame dim is composited on the GPU. */}
        <div
          data-shade
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-black opacity-0 ${stacking ? "stack:will-change-[opacity]" : ""}`}
        />
        {/* Path hairline along the top edge */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--hue)_30%,var(--hue)_70%,transparent)] opacity-70" />

        {/* Header bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-soft px-[clamp(20px,3vw,44px)] py-4 font-mono text-[11px] tracking-[.14em] text-muted uppercase">
          <span className="text-[var(--hue)]">
            {num} / {pad(total)}
          </span>
          <span className="text-faint">/</span>
          <span className="text-ink-2">{p.category}</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${live ? "border-[#86efac]/35 text-[#86efac]" : "border-line text-dim"}`}
            >
              <span className={`size-1.5 rounded-full ${live ? "bg-[#86efac]" : "bg-faint"}`} />
              {live ? "Live" : "Demo soon"}
            </span>
            {scope && <span className="rounded-full border border-line px-2.5 py-1 text-dim">{scope}</span>}
            <span className="rounded-full border border-line px-2.5 py-1 text-dim">{p.period}</span>
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-[clamp(24px,3.5vw,56px)] p-[clamp(20px,3vw,44px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Story */}
          <div className="flex min-w-0 flex-col gap-5">
            {p.highlight && (
              <div className="hl-badge self-start">
                <span>{p.highlight}</span>
                <span aria-hidden className="hl-shine" />
              </div>
            )}
            <div>
              <SplitWords as="h3" text={p.title} className="display m-0 text-[clamp(36px,4.2vw,66px)] leading-[.95]" />
              <p className="mt-3.5 mb-0 max-w-[34ch] text-[clamp(18px,1.55vw,22px)] leading-[1.35] text-chip">{p.tagline}</p>
            </div>
            <p className="m-0 max-w-[56ch] text-[15.5px] leading-[1.65] text-muted">{p.description}</p>

            {/* Impact: three bold headlines, each with one line of proof */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-[.14em] text-dim uppercase">Impact</span>
              <ol data-reveal="stagger" className="m-0 flex list-none flex-col p-0">
                {p.bullets.map((b, k) => (
                  <li
                    key={b.k}
                    style={{ "--i": k } as CSSProperties}
                    className="group/b relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-line-soft py-3.5 last:border-b"
                  >
                    <span aria-hidden className="absolute top-[-1px] left-0 h-px w-0 bg-[var(--hue)] transition-[width] duration-700 ease-expo group-hover/b:w-full" />
                    <span className="pt-[3px] font-mono text-[11px] tracking-[.1em] text-[var(--hue)]">{pad(k + 1)}</span>
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-[clamp(17px,1.45vw,20px)] leading-[1.2] font-[640] tracking-[-.012em] text-ink transition-transform duration-500 ease-expo group-hover/b:translate-x-1">
                        {b.k}
                      </span>
                      <span className="text-[14px] leading-[1.5] text-muted">{b.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-auto flex flex-col gap-3.5 pt-2">
              <div className="flex flex-wrap gap-2.5">
                {primary && (
                  <a href={primary.href} target="_blank" rel="noopener" data-magnetic className="btn btn-primary">
                    <RollLabel text={primary.label} />
                    <Arrow />
                  </a>
                )}
                {rest.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" className="btn btn-secondary">
                    <RollLabel text={l.label} />
                    <Arrow />
                  </a>
                ))}
              </div>
              <p className="m-0 flex items-baseline gap-2.5 font-mono text-xs leading-normal text-muted">
                <span className="text-faint uppercase">Role</span>
                {p.role}
              </p>
              {p.note && (
                <p className="m-0 flex items-baseline gap-2.5 font-mono text-xs leading-normal text-dim">
                  <span className="size-1.5 flex-none -translate-y-px bg-[var(--hue)]" />
                  {p.note}
                </p>
              )}
            </div>
          </div>

          {/* Evidence. On phones it dissolves into the grid so the order reads
              preview → story → metrics, instead of all the evidence first. */}
          <div className="flex min-w-0 flex-col gap-5 max-lg:contents">
            <a
              href={primary?.href ?? "#"}
              target="_blank"
              rel="noopener"
              data-cursor="view"
              aria-label={`${p.title} — ${primary?.label ?? "open"}`}
              data-reveal="clip"
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              className="group/shot relative block no-underline max-lg:order-first"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[16px] border border-line-soft bg-bg shadow-[0_30px_60px_-30px_rgb(0_0_0/.8)]">
                <span
                  role="img"
                  aria-label={`${p.title} preview`}
                  className="absolute inset-0 block transition-transform duration-[1.2s] ease-expo group-hover/shot:scale-[1.015]"
                >
                  <ProjectArt kind={p.art} url={p.imageLabel} />
                </span>
                <span className="pointer-events-none absolute bottom-4 left-4 z-10 flex translate-y-2 items-center gap-2 rounded-lg bg-[var(--hue)] px-3 py-1.5 font-mono text-[11px] font-medium tracking-[.1em] text-bg uppercase opacity-0 shadow-[0_8px_24px_-8px_rgb(0_0_0/.6)] transition-[opacity,transform] duration-500 ease-expo group-hover/shot:translate-y-0 group-hover/shot:opacity-100">
                  {primary?.label ?? "Open"} ↗
                </span>
              </span>
            </a>

            <div data-reveal="stagger" className="grid grid-cols-3 border-y border-line max-lg:order-last">
              {p.metrics.map((m, k) => (
                <div
                  key={m.l}
                  className={`flex flex-col gap-1.5 py-4 ${k > 0 ? "border-l border-line-soft pl-4" : "pr-4"}`}
                  style={{ "--i": k } as CSSProperties}
                >
                  <CountUp value={m.v} className="display text-[clamp(24px,2.4vw,36px)] leading-none tabular-nums" />
                  <span className="font-mono text-[11px] leading-[1.35] tracking-[.08em] text-dim uppercase">{m.l}</span>
                </div>
              ))}
            </div>

            {/* Inside the build: a divided list, not boxes inside the card */}
            <div className="flex flex-col gap-2 max-lg:order-last">
              <span className="font-mono text-[11px] tracking-[.14em] text-dim uppercase">Inside the build</span>
              <dl data-reveal="stagger" className="m-0 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {p.features.map((f, k) => (
                  <div key={f.t} style={{ "--i": k } as CSSProperties} className="flex flex-col gap-0.5 border-t border-line-soft py-2.5">
                    <dt className="flex items-center gap-2 text-[14px] font-medium text-ink-2">
                      <span aria-hidden className="size-1 rounded-full bg-[var(--hue)]" />
                      {f.t}
                    </dt>
                    <dd className="m-0 text-[13px] leading-[1.45] text-muted">{f.d}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div data-reveal="stagger" className="mt-auto flex flex-wrap gap-1.5 max-lg:order-last">
              {p.stack.map((t, k) => (
                <span
                  key={t}
                  className={`chip chip-sm ${t === "System Design" ? "border-[var(--hue)] text-ink" : ""}`}
                  style={{ "--i": k } as CSSProperties}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
