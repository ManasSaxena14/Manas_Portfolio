"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";
import BookingStage from "@/components/BookingStage";

/*
 * Process, told through one real feature. The steps scroll past at the
 * reader's own pace while a single calendar (BookingStage) stays in view and
 * changes with them. Nothing captures the scroll.
 */

const { eyebrow, heading, intro, steps, source, live } = portfolio.process;

export default function Process() {
  const list = useRef<HTMLOListElement>(null);
  const [step, setStep] = useState(0);

  // The active step is whichever one crosses a reading line: mid-screen beside
  // the calendar on desktop, below the calendar on phones.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1080px)");
    let io: IntersectionObserver | undefined;
    const watch = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          if (hit) setStep(Number((hit.target as HTMLElement).dataset.step));
        },
        { rootMargin: mq.matches ? "-50% 0px -50% 0px" : "-78% 0px -22% 0px" },
      );
      Array.from(el.children).forEach((c) => io!.observe(c));
    };
    watch();
    mq.addEventListener("change", watch);
    return () => {
      mq.removeEventListener("change", watch);
      io?.disconnect();
    };
  }, []);

  return (
    <section id="process" data-ambient className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(01)" />
        <SplitWords text={heading} className="h2 max-w-[13ch]" />
        <p data-reveal="" className="mt-6 mb-0 max-w-[54ch] text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-muted">
          {intro}
        </p>

        <div className="mt-[clamp(32px,4vw,56px)] flex flex-col lg:grid lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,6vw,104px)]">
          {/* Calendar: pinned under the nav on phones, beside the steps on desktop */}
          <div className="sticky top-0 z-10 h-[calc(50svh+84px)] min-h-[444px] bg-bg pt-[84px] lg:top-[104px] lg:order-last lg:h-[calc(100svh-144px)] lg:max-h-[760px] lg:min-h-0 lg:self-start lg:bg-transparent lg:pt-0">
            <BookingStage step={step} />
          </div>

          <ol ref={list} className="m-0 list-none p-0 lg:pb-[6svh]">
            {steps.map((st, i) => (
              <li
                key={st.label}
                data-step={i}
                aria-current={i === step ? "step" : undefined}
                className="flex min-h-[46svh] flex-col justify-start pt-8 pb-10 lg:min-h-[72svh] lg:justify-center lg:py-0"
              >
                <p className={`m-0 text-[15px] transition-colors duration-300 ${i === step ? "text-accent" : "text-dim"}`}>
                  {i + 1}. {st.label}
                </p>
                <h3
                  className={`display mt-3 mb-0 max-w-[13ch] text-[clamp(32px,3.7vw,58px)] leading-[1] font-[640] transition-colors duration-300 ${i === step ? "text-ink" : "text-dim"}`}
                >
                  {st.title}
                </h3>
                <p className={`mt-4 mb-0 max-w-[42ch] text-[17px] leading-[1.6] transition-colors duration-300 ${i === step ? "text-soft" : "text-dim"}`}>
                  {st.body}
                </p>
                {i === 3 && (
                  <a href={source.href} target="_blank" rel="noopener" className="btn btn-secondary mt-6 self-start">
                    <RollLabel text={source.label} />
                    <Arrow />
                  </a>
                )}
                {i === 4 && (
                  <a href={live.href} target="_blank" rel="noopener" className="btn btn-primary mt-6 self-start">
                    <RollLabel text={live.label} />
                    <Arrow />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
