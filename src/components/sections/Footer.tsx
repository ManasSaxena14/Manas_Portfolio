"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fullName, portfolio } from "@/data/portfolio";
import { Mark } from "@/components/Logo";
import LocalTime from "@/components/LocalTime";
import { Accent, Arrow, RollLabel } from "@/components/SectionHeader";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const { firstName, lastName, socials, status, footer, email, nav, resumeUrl, location } = portfolio;

// A circuit trace across the footer; corners carry little solder pads.
const SIGNAL = "M0 40 H250 L280 12 H520 L548 40 H800 L826 66 H1090 L1116 40 H1600";
const PADS: [number, number][] = [[250, 40], [520, 12], [800, 40], [1090, 66], [1116, 40]];

const SITEMAP = [{ label: "Home", href: "#top" }, ...nav];

/**
 * Giant name, fitted to the full width. Every letter is its own gradient
 * clip, so letters can rise in one by one, lift toward the cursor, and
 * still share one lime "torch" (--mx/--my, offset by each letter's --ox/--oy).
 */
function Wordmark() {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const b = box.current;
    const t = text.current;
    if (!b || !t) return;
    const letters = Array.from(t.querySelectorAll<HTMLElement>("[data-wl]"));
    const fit = () => {
      t.style.fontSize = "100px";
      const w = t.scrollWidth;
      if (w > 0) t.style.fontSize = `${(100 * b.clientWidth * 0.98) / w}px`;
      letters.forEach((l) => {
        l.style.setProperty("--ox", `${l.offsetLeft}px`);
        l.style.setProperty("--oy", `${l.offsetTop}px`);
      });
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(b);

    // Letters near the pointer lift a little (fine pointers only).
    if (!window.matchMedia("(pointer: fine)").matches) return () => ro.disconnect();
    let raf = 0;
    let px = -1e5;
    const lift = () => {
      raf = 0;
      const radius = b.clientWidth * 0.12;
      // All reads first, then all writes: one style pass instead of one per letter.
      const centres = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      letters.forEach((l, i) => {
        const v = Math.max(0, 1 - Math.abs(px - centres[i]) / radius);
        l.style.translate = `0 ${(-v * v * 9).toFixed(2)}%`;
      });
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      if (!raf) raf = requestAnimationFrame(lift);
    };
    const onLeave = () => {
      px = -1e5;
      if (!raf) raf = requestAnimationFrame(lift);
    };
    b.addEventListener("pointermove", onMove);
    b.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      b.removeEventListener("pointermove", onMove);
      b.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const letters = (word: string) =>
    Array.from(word).map((ch, i) => (
      <span key={i} data-wl className="wm-l inline-block">
        {ch}
      </span>
    ));

  return (
    <div ref={box} aria-hidden className="relative select-none">
      <p ref={text} data-glow className="relative m-0 inline-block translate-y-[14%] leading-[.8] whitespace-nowrap">
        <span className="display font-[760]">{letters(firstName)}</span>
        <span className="font-serif font-normal tracking-[-.02em] italic">
          {" "}
          {letters(lastName)}
        </span>
      </p>
    </div>
  );
}

/** Magnetic round button with a slowly turning text ring. */
function BackToTop() {
  return (
    <a href="#top" data-magnetic aria-label="Back to top" className="group relative grid size-[84px] flex-none place-items-center rounded-full no-underline">
      <svg viewBox="0 0 100 100" aria-hidden className="f-ring absolute inset-0 size-full overflow-visible">
        <defs>
          <path id="f-ring-path" d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" />
        </defs>
        <text className="fill-dim font-mono text-[9px] uppercase transition-[fill] duration-500 group-hover:fill-ink">
          <textPath href="#f-ring-path" textLength="240" lengthAdjust="spacing">
            Back to top · Back to top ·
          </textPath>
        </text>
      </svg>
      <span className="relative grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-[background,border-color,color] duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
        <Arrow dir="up" />
      </span>
    </a>
  );
}

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // Replay the monogram's draw-in when the footer first comes up.
      ScrollTrigger.create({ trigger: root.current, start: "top 80%", once: true, onEnter: () => setSeen(true) });

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Curtain: the content starts tucked up under the page and slides
        // down into place as the page lifts away.
        gsap.fromTo(
          q("[data-f-inner]"),
          { yPercent: -24, opacity: 0.35 },
          { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } },
        );
        gsap.from(q("[data-f-col]"), {
          autoAlpha: 0,
          y: 46,
          duration: 1.2,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
        gsap.fromTo(
          q("[data-f-signal]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: q("[data-f-line]")[0], start: "top 95%", end: "top 55%", scrub: 0.6 } },
        );
        gsap.from(q("[data-f-pad]"), {
          scale: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "back.out(3)",
          scrollTrigger: { trigger: q("[data-f-line]")[0], start: "top 70%", once: true },
        });
        gsap.fromTo(
          q("[data-wl]"),
          { yPercent: 108, rotate: 7 },
          {
            yPercent: 0,
            rotate: 0,
            ease: "none",
            stagger: 0.035,
            scrollTrigger: { trigger: q("[data-wm]")[0], start: "top bottom", end: "bottom bottom", scrub: 0.7 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer ref={root} data-ambient className="relative z-0 overflow-hidden bg-[#070708]">
      {/* Ambient: a lime glow rising from the floor over a fading dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-[45%] left-1/2 h-[85%] w-[110%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_11%,transparent),transparent)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/.05)_1px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,transparent,#000_45%)]" />
      </div>

      <div data-f-inner className="relative">
        <div className="wrap pt-[clamp(72px,9vw,140px)]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 md:gap-x-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,.55fr)_minmax(0,.65fr)_minmax(0,.9fr)]">
            {/* Call to action */}
            <div data-f-col className="col-span-2 flex flex-col gap-7 md:col-span-3 lg:col-span-1">
              <span className="group inline-flex self-start">
                <Mark key={seen ? "on" : "off"} size={56} />
              </span>
              <h2 className="display m-0 max-w-[13ch] text-[clamp(36px,4.2vw,64px)] leading-[.95] font-[620]">
                <Accent text="Have an idea? *Let's make it real.*" />
              </h2>
              <a href={`mailto:${email}`} className="group/em inline-flex items-center gap-3.5 self-start text-[clamp(18px,1.6vw,23px)] tracking-[-.01em] no-underline">
                <span className="relative">
                  {email}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-expo group-hover/em:scale-x-100" />
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-line-strong transition-[background,border-color,color] duration-300 group-hover/em:border-accent group-hover/em:bg-accent group-hover/em:text-bg">
                  <Arrow />
                </span>
              </a>
            </div>

            {/* Sitemap */}
            <nav data-f-col aria-label="Footer" className="flex flex-col gap-4">
              <h3 className="f-label">Sitemap</h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {SITEMAP.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="group/l inline-flex items-center gap-2 text-[16px] text-ink-2 no-underline hover:text-accent">
                      <span className="h-px w-0 bg-accent transition-[width] duration-500 ease-expo group-hover/l:w-3" />
                      <RollLabel text={l.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Elsewhere */}
            <div data-f-col className="flex flex-col gap-4">
              <h3 className="f-label">Elsewhere</h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener" className="group/s inline-flex items-center gap-2 text-[16px] text-ink-2 no-underline hover:text-accent">
                      <RollLabel text={s.label} />
                      <span className="text-dim transition-colors duration-300 group-hover/s:text-accent">
                        <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right now */}
            <div data-f-col className="col-span-2 flex flex-col gap-4 md:col-span-1">
              <h3 className="f-label">Right now</h3>
              <div className="flex flex-col gap-1">
                <LocalTime className="font-display text-[clamp(30px,2.8vw,42px)] leading-none font-[620] tracking-[-.03em] text-ink" />
                <span className="font-mono text-[11px] tracking-[.14em] text-dim uppercase">{location}</span>
              </div>
              <span className="flex items-center gap-2.5 font-mono text-[11px] tracking-[.14em] text-ink-2 uppercase">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 rounded-full bg-accent" style={{ animation: "ping 1.8s ease-out infinite" }} />
                  <span className="relative size-2 rounded-full bg-accent" />
                </span>
                {status}
              </span>
              <a href={resumeUrl} target="_blank" rel="noopener" className="btn btn-secondary mt-1 h-10 self-start px-4 text-[14px]">
                <RollLabel text="Resume" />
                <Arrow dir="down" />
              </a>
            </div>
          </div>

          {/* Signal trace */}
          <div data-f-line className="relative mt-[clamp(56px,7vw,104px)] h-[clamp(36px,4vw,60px)]">
            <svg viewBox="0 0 1600 80" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
              <path d={SIGNAL} pathLength={1} data-f-signal fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" strokeDasharray="1" vectorEffect="non-scaling-stroke" />
              <path d={SIGNAL} pathLength={1} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="f-pulse" />
            </svg>
            {PADS.map(([x, y], i) => (
              <span
                key={i}
                data-f-pad
                aria-hidden
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-[#070708]"
                style={{ left: `${(x / 1600) * 100}%`, top: `${(y / 80) * 100}%` } as CSSProperties}
              />
            ))}
          </div>

          {/* Wordmark */}
          <div data-wm className="mt-[clamp(8px,2vw,24px)] overflow-hidden">
            <Wordmark />
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line-soft py-5 font-mono text-[11px] tracking-[.12em] text-dim uppercase">
            <p className="m-0">
              © {new Date().getFullYear()} {fullName}
            </p>
            <p className="m-0 hidden md:block">
              {footer.credit} · Next.js · GSAP · three.js
            </p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
