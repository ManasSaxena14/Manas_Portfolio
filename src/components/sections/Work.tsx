"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { pad, portfolio, type Project } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";
import CountUp from "@/components/CountUp";
import ProjectArt from "@/components/ProjectArt";
import { clamp } from "@/lib/scroll";
import { ScrollTrigger } from "@/lib/gsap";

const { eyebrow, heading, projects } = portfolio.work;
const stacking = portfolio.settings.stackedCards;

export default function Work() {
  const list = useRef<HTMLDivElement>(null);

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
    };

    const update = (y: number) => {
      cards.forEach((_, i) => {
        const inner = inners[i];
        const shade = shades[i];
        if (!inner) return;
        // The next card's top in the viewport, while it slides up to stick.
        const t =
          mq.matches && i < cards.length - 1
            ? clamp(1 - (tops[i + 1] - y - (92 + (i + 1) * 18)) / (H * 0.85)) // 92 + n·18 matches --st
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
    <section id="work" className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(02)" />
        <SplitWords text={heading} className="h2 max-w-[16ch]" />
      </div>
      <div
        ref={list}
        className={`mx-auto mt-[clamp(40px,5vw,72px)] flex max-w-[1480px] flex-col gap-5 px-[clamp(12px,2.4vw,40px)] ${stacking ? "stack:gap-8" : ""}`}
      >
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ p, i, total }: { p: Project; i: number; total: number }) {
  const num = pad(i + 1);
  const [primary, ...rest] = p.links;

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
      style={{ "--st": `${92 + i * 18}px` } as CSSProperties}
    >
      <div
        data-spotlight
        className={`relative grid origin-top grid-cols-1 gap-[clamp(24px,3.5vw,56px)] rounded-[22px] border border-line-soft bg-surface p-[clamp(20px,3vw,44px)] shadow-[0_-24px_60px_-24px_rgb(0_0_0/.75)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${stacking ? "stack:min-h-[calc(100svh-124px)] stack:will-change-transform" : ""}`}
      >
        {/* Own layers (stacked layout): the per-frame scale and dim are then
            composited on the GPU instead of repainting the whole card. */}
        <div
          data-shade
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-black opacity-0 ${stacking ? "stack:will-change-[opacity]" : ""}`}
        />

        {/* Copy */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs tracking-[.12em] text-muted uppercase">
            <span className="text-accent">
              {num} / {pad(total)}
            </span>
            <span className="text-faint">/</span>
            <span>{p.category}</span>
            <span className="ml-auto rounded-md border border-line px-2 py-0.5 text-[11px] text-dim">{p.period}</span>
          </div>
          <div>
            <SplitWords as="h3" text={p.title} className="display m-0 text-[clamp(38px,4.6vw,72px)] leading-[.95]" />
            <p className="mt-3.5 mb-0 max-w-[36ch] text-[clamp(18px,1.6vw,22px)] leading-[1.35] text-chip">
              {p.tagline}
            </p>
          </div>
          <p className="m-0 max-w-[58ch] text-[15.5px] leading-[1.6] text-muted">{p.description}</p>
          <div data-reveal="stagger" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {p.features.map((f, k) => (
              <div
                key={f.t}
                style={{ "--i": k } as CSSProperties}
                className="group/f flex flex-col gap-1 rounded-[12px] border border-line-soft bg-bg/50 px-3.5 py-3 transition-[border-color,background-color] duration-300 hover:border-accent/40 hover:bg-accent/[.04]"
              >
                <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em] text-ink uppercase">
                  <span className="text-accent">{pad(k + 1)}</span>
                  {f.t}
                </span>
                <span className="text-[13.5px] leading-[1.45] text-muted">{f.d}</span>
              </div>
            ))}
          </div>
          <ul data-reveal="stagger" className="m-0 flex list-none flex-col gap-2.5 p-0">
            {p.bullets.map((b, k) => (
              <li key={b} className="group/b flex gap-3 text-[15px] leading-normal text-ink-2 transition-colors duration-500 hover:text-ink" style={{ "--i": k } as CSSProperties}>
                <span className="mt-[.6em] size-1.5 flex-none bg-accent transition-transform duration-500 ease-expo group-hover/b:scale-150" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
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
                <span className="size-1.5 flex-none -translate-y-px bg-accent" />
                {p.note}
              </p>
            )}
          </div>
        </div>

        {/* Visual + metrics */}
        <div className="order-first flex min-w-0 flex-col gap-[18px] lg:order-none">
          <a
            href={primary?.href ?? "#"}
            target="_blank"
            rel="noopener"
            data-cursor="view"
            aria-label={`${p.title} — ${primary?.label ?? "open"}`}
            data-reveal="clip"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="group/shot relative block no-underline"
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[16px] border border-line-soft bg-bg shadow-[0_30px_60px_-30px_rgb(0_0_0/.8)]">
              <span
                role="img"
                aria-label={`${p.title} preview`}
                className="absolute inset-0 block transition-transform duration-[1.2s] ease-expo group-hover/shot:scale-[1.015]"
              >
                <ProjectArt kind={p.art} url={p.imageLabel} />
              </span>
              <span className="pointer-events-none absolute bottom-4 left-4 z-10 flex translate-y-2 items-center gap-2 rounded-lg bg-accent px-3 py-1.5 font-mono text-[11px] font-medium tracking-[.1em] text-bg uppercase opacity-0 shadow-[0_8px_24px_-8px_rgb(0_0_0/.6)] transition-[opacity,transform] duration-500 ease-expo group-hover/shot:translate-y-0 group-hover/shot:opacity-100">
                {primary?.label ?? "Open"} ↗
              </span>
            </span>
          </a>
          <div data-reveal="stagger" className="grid grid-cols-3 border-t border-line">
            {p.metrics.map((m, k) => (
              <div key={m.l} className="flex flex-col gap-1 pt-3.5 pr-3" style={{ "--i": k } as CSSProperties}>
                <CountUp value={m.v} className="display text-[clamp(24px,2.4vw,36px)] leading-none tabular-nums" />
                <span className="font-mono text-[11px] tracking-[.08em] text-dim uppercase">{m.l}</span>
              </div>
            ))}
          </div>
          <div data-reveal="stagger" className="flex flex-wrap gap-1.5">
            {p.stack.map((t, k) => (
              <span key={t} className="chip chip-sm" style={{ "--i": k } as CSSProperties}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
