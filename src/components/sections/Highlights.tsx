import type { CSSProperties } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";

const { eyebrow, heading, items, profiles } = portfolio.highlights;

export default function Highlights() {
  return (
    <section id="recognition" className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(04)" />
        <SplitWords text={heading} className="h2 max-w-[14ch]" />

        <div data-gsap-cards className="mt-[clamp(40px,5vw,72px)] grid grid-cols-1 gap-3 md:grid-cols-2">
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
                className="pointer-events-none absolute -right-2 -bottom-6 font-serif text-[120px] leading-none text-transparent italic opacity-40 transition-opacity duration-500 [-webkit-text-stroke:1px_var(--color-line-strong)] group-hover:opacity-80"
              >
                {pad(i + 1)}
              </span>
            </article>
          ))}
        </div>

        {/* Coding profiles */}
        <div data-reveal="" className="mt-3 grid grid-cols-1 overflow-hidden rounded-[20px] border border-line-soft sm:grid-cols-3">
          {profiles.map((p, i) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener"
              className={`group flex items-center gap-4 bg-surface/60 px-6 py-5 no-underline transition-colors duration-300 hover:bg-surface ${
                i > 0 ? "border-t border-line-soft sm:border-t-0 sm:border-l" : ""
              }`}
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
