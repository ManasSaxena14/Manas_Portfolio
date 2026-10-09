"use client";

import { useEffect, useRef } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { SectionHeader, SplitWords } from "@/components/SectionHeader";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const { eyebrow, heading, items } = portfolio.experience;

export default function Experience() {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  // Accent fill tracks 65% of the viewport; nodes light up as it reaches them.
  // ScrollTrigger supplies the progress; node offsets are measured once per
  // refresh, so scrolling only writes.
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const nodes = Array.from(ol.querySelectorAll<HTMLElement>("[data-node]"));
    const on = nodes.map(() => false);
    let ys: number[] = [];
    let height = 1;
    let lastP = -1;
    const measure = () => {
      height = ol.offsetHeight || 1;
      ys = nodes.map((n) => (n.parentElement?.offsetTop ?? 0) + n.offsetTop + 5);
    };
    const update = (p: number) => {
      if (fill.current && Math.abs(p - lastP) > 1e-4) fill.current.style.transform = `scaleY(${(lastP = p)})`;
      const reach = p * height;
      nodes.forEach((n, i) => {
        const lit = ys[i] <= reach;
        if (lit !== on[i]) n.toggleAttribute("data-on", (on[i] = lit));
      });
    };
    measure();
    const trigger = ScrollTrigger.create({
      trigger: ol,
      start: "top 65%",
      end: "bottom 65%",
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => {
        measure();
        update(self.progress);
      },
    });
    update(trigger.progress);
    return () => trigger.kill();
  }, []);

  // Each role slides in from the timeline: dates first, then the card,
  // a lime rule under the role, and the skills popping in one by one.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-xp]", section.current).forEach((item) => {
          const q = gsap.utils.selector(item);
          gsap
            .timeline({ scrollTrigger: { trigger: item, start: "top 80%", once: true } })
            .from(q("[data-xp-meta]"), { autoAlpha: 0, x: -30, duration: 1 }, 0)
            .from(q("[data-xp-card]"), { autoAlpha: 0, x: 60, rotationY: -8, transformPerspective: 1200, duration: 1.3, clearProps: "transform" }, 0.05)
            .from(q("[data-xp-rule]"), { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.35)
            .from(q("[data-xp-skill]"), { autoAlpha: 0, y: 16, scale: 0.7, duration: 0.7, stagger: 0.07, ease: "back.out(2.2)" }, 0.5);
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="experience" className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(03)" />
        <SplitWords text={heading} className="h2 max-w-[14ch]" />

        <ol ref={list} className="relative mt-[clamp(48px,6vw,96px)] mb-0 list-none pl-7 lg:pl-0">
          <span aria-hidden className="absolute top-2 bottom-0 left-1.5 block w-px bg-line lg:left-[240px]">
            <span ref={fill} className="absolute inset-0 block origin-top bg-accent" style={{ transform: "scaleY(0)" }} />
          </span>

          {items.map((e, i) => (
            <li
              key={e.company + e.dates}
              data-xp
              className="relative grid grid-cols-1 gap-y-4 pb-[clamp(40px,5vw,72px)] lg:grid-cols-[240px_minmax(0,1fr)]"
            >
              <span
                data-node
                aria-hidden
                className="group absolute top-1.5 -left-[27px] size-[11px] rounded-full border-2 border-accent bg-bg transition-[background,box-shadow] duration-500 data-[on]:bg-accent data-[on]:shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-accent)_16%,transparent)] lg:left-[235px]"
              >
                <span className="absolute -inset-0.5 hidden rounded-full border border-accent group-data-[on]:block group-data-[on]:animate-[node-ping_1.6s_var(--ease-expo)_1]" />
              </span>

              <div data-xp-meta className="flex flex-col gap-1.5 pr-6 font-mono text-xs tracking-[.1em] text-muted uppercase">
                <span className="text-ink">{e.dates}</span>
                <span>{e.location}</span>
              </div>

              <div className="lg:pl-14">
                <article
                  data-xp-card
                  data-spotlight
                  className="group/xp relative max-w-[820px] overflow-hidden rounded-[20px] border border-line-soft bg-surface/60 p-[clamp(22px,2.8vw,38px)] transition-[border-color] duration-500 hover:border-line"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-4 right-4 font-serif text-[clamp(96px,10vw,150px)] leading-none text-transparent italic opacity-50 transition-opacity duration-500 select-none [-webkit-text-stroke:1px_var(--color-line-strong)] group-hover/xp:opacity-90"
                  >
                    {pad(i + 1)}
                  </span>
                  <h3 className="display relative m-0 max-w-[18ch] text-[clamp(30px,3.4vw,50px)] leading-[.98] font-[650]">
                    {e.company}
                  </h3>
                  <p className="relative mt-3 mb-0 inline-flex flex-col gap-2 text-[clamp(17px,1.4vw,20px)] font-[560] text-accent">
                    {e.role}
                    <span data-xp-rule aria-hidden className="block h-px origin-left bg-linear-to-r from-accent to-transparent" />
                  </p>

                  <div className="relative mt-[clamp(20px,2.4vw,30px)] flex flex-col gap-3">
                    <span className="mono-label text-dim">Skills learned</span>
                    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                      {e.skills.map((s) => (
                        <li
                          key={s}
                          data-xp-skill
                          className="chip h-[34px] gap-2 px-3.5 text-[12.5px] font-medium text-ink-2"
                        >
                          <span aria-hidden className="text-accent">
                            +
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
