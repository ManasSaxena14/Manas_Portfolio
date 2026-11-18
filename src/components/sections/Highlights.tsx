import type { CSSProperties } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";
import CountUp from "@/components/CountUp";
import ProjectArt from "@/components/ProjectArt";

const { eyebrow, heading, featured, items, profiles } = portfolio.highlights;

export default function Highlights() {
  return (
    <section id="recognition" className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(04)" />
        <SplitWords text={heading} className="h2 max-w-[14ch]" />

        {/* The hackathon, shown wide with its blueprint scene */}
        <article
          data-spotlight
          className="relative mt-[clamp(40px,5vw,72px)] grid grid-cols-1 gap-[clamp(22px,3vw,44px)] overflow-hidden rounded-[22px] border border-line-soft bg-surface p-[clamp(20px,2.6vw,36px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        >
          <div className="flex min-w-0 flex-col gap-5">
            <div data-ambient className="hl-badge self-start">
              <svg viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
                <path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4" />
              </svg>
              <span>{featured.kicker}</span>
              <span aria-hidden className="hl-shine" />
            </div>
            <SplitWords as="h3" text={featured.title} className="display m-0 text-[clamp(30px,3.4vw,52px)] leading-[1] font-[600]" />
            <p className="m-0 max-w-[54ch] text-[15.5px] leading-[1.6] text-muted">{featured.body}</p>
            <div data-reveal="stagger" className="grid grid-cols-3 border-t border-line">
              {featured.metrics.map((m, k) => (
                <div key={m.l} className="flex flex-col gap-1 pt-3.5 pr-3" style={{ "--i": k } as CSSProperties}>
                  <CountUp value={m.v} className="display text-[clamp(22px,2.2vw,32px)] leading-none tabular-nums" />
                  <span className="font-mono text-[11px] tracking-[.08em] text-dim uppercase">{m.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {featured.links.map((l, k) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener" className={`btn ${k === 0 ? "btn-primary" : "btn-secondary"}`}>
                  <RollLabel text={l.label} />
                  <Arrow />
                </a>
              ))}
            </div>
          </div>
          <a
            href={featured.links[1]?.href ?? featured.links[0]?.href}
            target="_blank"
            rel="noopener"
            data-cursor="view"
            data-reveal="clip"
            aria-label="PIT-24 simulation"
            className="order-first block lg:order-none"
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[16px] border border-line-soft bg-bg">
              <ProjectArt kind="pit24" url="pit24-simulation.vercel.app" />
            </span>
          </a>
        </article>

        <div data-gsap-cards className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {items.map((h, i) => (
            <article
              key={h.title}
              data-spotlight
              style={{ "--i": i } as CSSProperties}
              className="group relative flex min-h-[230px] flex-col gap-4 overflow-hidden rounded-[20px] border border-line-soft bg-surface p-[clamp(22px,2.6vw,34px)] transition-[border-color,transform] duration-500 ease-expo hover:-translate-y-1 hover:border-line"
            >
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[.14em] text-muted uppercase">
                <span className="text-accent">{pad(i + 1)}</span>
                <span className="text-faint">/</span>
                <span>{h.kicker}</span>
                <span className="ml-auto text-dim normal-case tracking-[.06em]">{h.date}</span>
              </div>
              <h3 className="display m-0 text-[clamp(26px,2.6vw,38px)] leading-[1.02] font-[600]">{h.title}</h3>
              <p className="m-0 max-w-[52ch] text-[15.5px] leading-[1.6] text-muted">{h.body}</p>
              {h.links.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {h.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-secondary h-10 px-4 text-[13.5px]"
                    >
                      <RollLabel text={l.label} />
                      <Arrow />
                    </a>
                  ))}
                </div>
              )}
              <span
                aria-hidden
                data-drift
                className="pointer-events-none absolute -right-2 -bottom-6 font-serif text-[120px] leading-none text-transparent italic opacity-40 transition-opacity duration-500 [-webkit-text-stroke:1px_var(--color-line-strong)] group-hover:opacity-80"
              >
                {pad(i + 1)}
              </span>
            </article>
          ))}
        </div>

        {/* Coding profiles */}
        <div data-reveal="" className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-line-soft bg-line-soft md:grid-cols-2 lg:grid-cols-4">
          {profiles.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 bg-[#0d0d0f] px-6 py-5 no-underline transition-colors duration-300 hover:bg-surface"
            >
              <span className="flex flex-1 flex-col gap-1">
                <span className="font-mono text-[11px] tracking-[.14em] text-dim uppercase">{p.label}</span>
                <span className="text-[17px] text-ink transition-colors duration-300 group-hover:text-accent">{p.stat}</span>
              </span>
              <Arrow />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
