"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { fullName, parseAccent, portfolio } from "@/data/portfolio";
import { useStore } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/scroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { GalaxyInput } from "@/components/three/HeroGalaxy";
import Scramble from "@/components/Scramble";
import LocalTime from "@/components/LocalTime";
import Terminal from "@/components/Terminal";
import Marquee from "@/components/Marquee";
import { Arrow, RollLabel } from "@/components/SectionHeader";

// Memoised: the hero re-renders as the intro and visibility change, the
// WebGL canvas only needs to when its own props do.
const HeroGalaxy = memo(dynamic(() => import("@/components/three/HeroGalaxy"), { ssr: false }));

const { firstName, lastName, roles, tagline, status, location, stack } = portfolio;

// Geist weight for the first name: at rest → directly under the cursor.
const REST = 700;
const PEAK = 900;
const REST_FVS = `"wght" ${REST}`;
const ACCENT = "#c8f25a";

/**
 * Each letter is two spans: the outer [data-l] carries the cursor
 * proximity and scroll scatter, the inner [data-li] the intro reveal,
 * so the three effects never fight over one transform.
 */
function Letters({ text }: { text: string }) {
  return Array.from(text).map((ch, i) => (
    <span key={i} data-l aria-hidden className="inline-block">
      <span data-li className="inline-block">
        {ch === " " ? " " : ch}
      </span>
    </span>
  ));
}

/** Tagline that streams in token by token, like a model generating it. */
function Stream({ text, play, delay }: { text: string; play: boolean; delay: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const toks = ref.current?.querySelectorAll<HTMLElement>(".tok");
    if (!play || !toks) return;
    const timers: number[] = [];
    let t = delay;
    toks.forEach((tok) => {
      t += 34 + Math.random() * 46;
      timers.push(window.setTimeout(() => tok.classList.add("on"), t));
    });
    timers.push(window.setTimeout(() => setTyping(false), t + 1600));
    return () => timers.forEach(clearTimeout);
  }, [play, delay]);

  return (
    <p
      ref={ref}
      data-stream
      className="m-0 max-w-[31ch] text-[clamp(19px,1.9vw,26px)] leading-[1.35] tracking-[-.01em]"
    >
      <span className="sr-only">{text.replaceAll("*", "")}</span>
      {parseAccent(text).flatMap((run, r) =>
        run.t.split(/(\s+)/).map((part, i) =>
          /^\s*$/.test(part) ? (
            part
          ) : (
            <span key={`${r}-${i}`} aria-hidden className={run.accent ? "tok serif-i" : "tok"}>
              {part}
            </span>
          ),
        ),
      )}
      <span
        className="caret"
        aria-hidden
        style={{ opacity: typing ? 1 : 0, transition: "opacity .6s", animationPlayState: typing ? "running" : "paused" }}
      />
    </p>
  );
}

/** Rotating "scroll to explore" seal; spins faster while you scroll. */
function ScrollBadge() {
  return (
    <a
      href="#process"
      data-hero-in
      data-badge
      aria-label="Scroll to explore"
      className="group absolute top-[4%] right-0 hidden size-[136px] place-items-center rounded-full no-underline lg:grid"
    >
      <svg data-badge-ring viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full overflow-visible">
        <defs>
          <path id="badge-circle" d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="none" stroke="var(--color-line)" strokeWidth=".6" />
        <text className="fill-muted font-mono text-[8px] uppercase transition-[fill] duration-500 group-hover:fill-ink">
          <textPath href="#badge-circle" textLength="243" lengthAdjust="spacing">
            Scroll to explore ◆ Data · Models · Agents ◆
          </textPath>
        </text>
      </svg>
      <span className="relative grid size-12 place-items-center rounded-full bg-accent text-lg text-bg transition-transform duration-500 ease-expo group-hover:scale-110">
        <Arrow dir="down" />
      </span>
    </a>
  );
}

export default function Hero() {
  const heroIn = useStore((s) => s.heroIn);
  const hero = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const first = useRef<HTMLSpanElement>(null);
  const last = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const input = useRef<GalaxyInput>({ mx: 0, my: 0, mOn: 0, scroll: 0, intro: 0, wave: 0, wx: 0, wy: 0 });
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(prefersReducedMotion()), []);
  useEffect(() => {
    if (heroIn) input.current.intro = 1;
  }, [heroIn]);

  // Render the galaxy (and run the terminal) only while the hero is on screen.
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The badge keeps turning only while it can be seen.
  useEffect(() => {
    if (reduce) return;
    if (active) spinRef.current?.resume();
    else spinRef.current?.pause();
  }, [active, reduce]);

  // Long names shrink to fit the width (with headroom for the cursor swell).
  useEffect(() => {
    const el = h1.current;
    if (!el) return;
    const fit = () => {
      el.style.setProperty("--fit", "1");
      const lines = el.querySelectorAll<HTMLElement>("[data-measure]");
      const widest = Math.max(...Array.from(lines, (l) => l.getBoundingClientRect().width));
      const ratio = widest > 0 ? Math.min(1, (el.clientWidth * 0.97) / (widest * 1.08)) : 1;
      el.style.setProperty("--fit", ratio.toFixed(3));
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Variable-font proximity: first-name letters swell in weight and width
  // under the cursor; last-name letters warm to lime and lift.
  useEffect(() => {
    const host = hero.current;
    const a = first.current;
    const b = last.current;
    if (!host || !a || !b || reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const fl = Array.from(a.querySelectorAll<HTMLElement>("[data-l]"));
    const ll = Array.from(b.querySelectorAll<HTMLElement>("[data-l]"));
    const fv = fl.map(() => 0);
    const lv = ll.map(() => 0);
    let mx = -1e5;
    let my = -1e5;
    let raf = 0;
    let fs = parseFloat(getComputedStyle(a).fontSize);

    const step = () => {
      raf = 0;
      const radius = fs * 1.15;
      const fr = fl.map((l) => l.getBoundingClientRect());
      const lr = ll.map((l) => l.getBoundingClientRect());
      let moving = false;
      const near = (r: DOMRect, cur: number) => {
        const d = Math.hypot(mx - (r.left + r.width / 2), (my - (r.top + r.height / 2)) * 1.3);
        const target = Math.pow(Math.max(0, 1 - d / radius), 1.5);
        const next = cur + (target - cur) * 0.16;
        if (Math.abs(target - next) > 0.002) moving = true;
        return next;
      };
      fr.forEach((r, i) => {
        const v = (fv[i] = near(r, fv[i]));
        fl[i].style.fontVariationSettings = `"wght" ${(REST + (PEAK - REST) * v).toFixed(1)}`;
      });
      lr.forEach((r, i) => {
        lv[i] = near(r, lv[i]);
        ll[i].style.setProperty("--p", lv[i].toFixed(3));
      });
      if (moving) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      kick();
    };
    const onLeave = () => {
      mx = my = -1e5;
      kick();
    };
    const onResize = () => (fs = parseFloat(getComputedStyle(a).fontSize));
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  // Scroll-out: the names drift apart while their letters scatter upward,
  // the details lift away and the galaxy blooms. The badge spins faster
  // with scroll velocity.
  useGSAP(
    () => {
      const q = gsap.utils.selector(hero);
      const spin = (spinRef.current = gsap.to(q("[data-badge-ring]"), { rotation: 360, duration: 18, ease: "none", repeat: -1, transformOrigin: "50% 50%" }));
      // One reusable tween eases the spin back to rest after each scroll
      // kick (instead of allocating a new tween on every scroll frame).
      const speed = { v: 1 };
      const settle = gsap.quickTo(speed, "v", { duration: 1.4, ease: "power2.out", onUpdate: () => spin.timeScale(speed.v) });
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            spin.pause();
            ScrollTrigger.create({
              trigger: hero.current,
              start: "top top",
              end: "bottom top",
              onUpdate: (self) => (input.current.scroll = self.progress),
            });
            return;
          }
          const fl = q("[data-first] [data-l]");
          const ll = q("[data-last] [data-l]");
          const mid = (n: number) => (n - 1) / 2;
          gsap
            .timeline({
              scrollTrigger: {
                trigger: hero.current,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
                onUpdate: (self) => {
                  input.current.scroll = self.progress;
                  const boost = Math.min(9, Math.abs(self.getVelocity()) / 260);
                  speed.v = 1 + boost;
                  spin.timeScale(speed.v);
                  settle(1, speed.v);
                },
              },
              defaults: { ease: "none" },
            })
            .to(first.current, { xPercent: -12, autoAlpha: 0.12 }, 0)
            .to(last.current, { xPercent: 12, autoAlpha: 0.12 }, 0)
            .to(fl, { yPercent: (i) => -16 - ((i * 37) % 5) * 9, rotation: (i) => (i - mid(fl.length)) * -2.6 }, 0)
            .to(ll, { yPercent: (i) => -10 - ((i * 53) % 4) * 8, rotation: (i) => (i - mid(ll.length)) * 2.2 }, 0)
            .to(q("[data-hero-details]"), { y: -70, autoAlpha: 0 }, 0)
            .to(q("[data-badge]"), { y: -120, rotation: 120, autoAlpha: 0 }, 0);
        },
      );
      return () => mm.revert();
    },
    { scope: hero },
  );

  // Intro: starts as the loader wipes away.
  useGSAP(
    () => {
      if (!heroIn) return;
      const q = gsap.utils.selector(hero);
      const firstLi = q("[data-first] [data-li]");
      const lastLi = q("[data-last] [data-li]");
      const all = [firstLi, lastLi, q("[data-hero-in]"), q("[data-hero-rule]"), q("[data-hero-grid]")];
      if (prefersReducedMotion()) {
        gsap.set(all, { clearProps: "all" });
        gsap.set(q("[data-hero-in]"), { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        // The grid opens out from behind the name like an aperture.
        .fromTo(
          q("[data-hero-grid]"),
          { clipPath: "circle(0% at 50% 42%)" },
          { clipPath: "circle(85% at 50% 42%)", duration: 2.6, ease: "power2.inOut" },
          0,
        )
        .fromTo(q("[data-hero-status]"), { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.3)
        // First name: letters tip up out of the floor, unblurring.
        .fromTo(
          firstLi,
          { y: 0, yPercent: 120, rotationX: -85, rotation: 4, filter: "blur(12px)", transformPerspective: 900, transformOrigin: "50% 100%" },
          { yPercent: 0, rotationX: 0, rotation: 0, filter: "blur(0px)", duration: 1.6, stagger: 0.07 },
          0.1,
        )
        .fromTo(
          lastLi,
          { y: 0, yPercent: 120, rotation: 10, filter: "blur(10px)", transformOrigin: "0% 100%" },
          { yPercent: 0, rotation: 0, filter: "blur(0px)", duration: 1.6, stagger: 0.06 },
          0.45,
        )
        // A signal runs through the first name once it has landed.
        .to(firstLi, { color: ACCENT, duration: 0.22, stagger: 0.06, yoyo: true, repeat: 1, ease: "power1.inOut" }, 1.45)
        .set(firstLi, { clearProps: "color,filter" })
        .set(lastLi, { clearProps: "filter" })
        .fromTo(q("[data-hero-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: "expo.inOut" }, 0.6)
        .fromTo(q("[data-hero-role]"), { autoAlpha: 0, x: -26 }, { autoAlpha: 1, x: 0, duration: 1, stagger: 0.1 }, 0.85)
        .fromTo(
          q("[data-hero-cta]"),
          { autoAlpha: 0, y: 28, scale: 0.9 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.1, ease: "back.out(1.6)" },
          1.5,
        )
        .fromTo(
          q("[data-hero-term]"),
          { autoAlpha: 0, y: 40, clipPath: "inset(100% 0% 0% 0% round 16px)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.4, clearProps: "clipPath" },
          1.6,
        )
        .fromTo(
          q("[data-badge]"),
          { autoAlpha: 0, scale: 0.3, rotation: -120 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.6 },
          1.2,
        )
        .fromTo(q("[data-hero-ticker]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.9);
    },
    { scope: hero, dependencies: [heroIn] },
  );

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = hero.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    input.current.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.current.my = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.current.mOn = 1;
    if (glow.current && window.innerWidth >= 1080)
      glow.current.style.transform = `translate(${e.clientX - r.left - r.width / 2}px, ${e.clientY - r.top - r.height * 0.45}px)`;
  };

  // Click anywhere that isn't a control: send a shockwave through the galaxy.
  const onClick = (e: MouseEvent<HTMLElement>) => {
    const el = hero.current;
    if (!el || (e.target as Element).closest("a, button")) return;
    const r = el.getBoundingClientRect();
    input.current.wx = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.current.wy = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.current.wave++;
  };

  return (
    <section
      id="top"
      ref={hero}
      data-ambient
      onMouseMove={onMove}
      onMouseLeave={() => (input.current.mOn = 0)}
      onClick={onClick}
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* 88px grid */}
      <div
        aria-hidden
        data-hero-grid
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / .035) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)",
        }}
      />

      {/* 3D neural galaxy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, #000 58%, transparent 96%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 58%, transparent 96%)",
        }}
      >
        {/* While the opening sequence runs, render once on demand (so the
            shaders compile behind it) and then idle until the portal opens. */}
        <HeroGalaxy input={input} frameloop={!active ? "never" : heroIn ? "always" : "demand"} reduce={reduce} />
      </div>

      {/* Cursor-trailing glow */}
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute top-[45%] left-1/2 -mt-[320px] -ml-[320px] size-[640px] rounded-full"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 9%, transparent), transparent 62%)",
          transition: "transform 1.4s var(--ease-expo)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-[clamp(20px,4vw,48px)] pt-[96px] pb-[clamp(24px,3vw,40px)]">
        {/* Status row */}
        <div
          data-hero-in
          data-hero-status
          className="flex items-center justify-between gap-4 font-mono text-[11px] tracking-[.14em] text-muted uppercase"
        >
          <span className="flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-accent" style={{ animation: "ping 1.8s ease-out infinite" }} />
              <span className="relative size-2 rounded-full bg-accent" />
            </span>
            <Scramble text={status} play={heroIn} delay={450} />
          </span>
          <span className="flex items-center gap-3">
            <span className="hidden md:inline">
              <Scramble text={location} play={heroIn} delay={600} />
            </span>
            <span className="hidden h-3 w-px bg-line md:block" />
            <LocalTime className="text-ink-2" />
          </span>
        </div>

        <div className="relative mt-auto flex flex-col gap-[clamp(22px,3vw,40px)] pt-8">
          <ScrollBadge />
          <h1 ref={h1} aria-label={fullName} className="m-0" style={{ "--fit": 1 } as CSSProperties}>
            <span
              ref={first}
              data-first
              style={{
                fontVariationSettings: REST_FVS,
                fontSize: "calc(clamp(64px, min(22vw, 22.5svh), 240px) * var(--fit, 1))",
              }}
              className="block pb-[.04em] font-display leading-[.86] tracking-[-.065em] whitespace-nowrap [clip-path:inset(-100%_-40%_0_-40%)]"
            >
              <span data-measure className="inline-block">
                <Letters text={firstName} />
              </span>
            </span>
            <span
              ref={last}
              data-last
              style={{ fontSize: "calc(clamp(72px, min(24.5vw, 25svh), 264px) * var(--fit, 1))" }}
              className="name-last -mt-[.06em] block pr-[.06em] pb-[.14em] text-right font-serif leading-[.86] tracking-[-.02em] whitespace-nowrap italic [clip-path:inset(-100%_-40%_0_-40%)]"
            >
              <span data-measure className="inline-block">
                <Letters text={lastName} />
              </span>
            </span>
          </h1>

          <div
            data-hero-details
            className="relative grid grid-cols-1 items-end gap-x-[clamp(24px,4vw,64px)] gap-y-7 pt-[clamp(20px,2.5vw,32px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)_minmax(0,1fr)]"
          >
            {/* Divider draws in from the left */}
            <span
              aria-hidden
              data-hero-rule
              className="absolute top-0 right-0 left-0 h-px origin-left bg-linear-to-r from-accent/70 via-line to-line"
            />
            <ul className="m-0 flex list-none flex-col gap-2 self-start p-0 font-mono text-[13px] tracking-[.1em] uppercase">
              {roles.map((r, i) => (
                <li key={r} data-hero-in data-hero-role className="flex items-center gap-3">
                  <span className="size-1.5 shrink-0 bg-accent" />
                  <Scramble text={r} play={heroIn} delay={800 + i * 140} duration={800} />
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-6">
              <Stream text={tagline} play={heroIn} delay={950} />
              <div className="flex flex-wrap gap-3">
                <span data-hero-in data-hero-cta className="inline-block">
                  <a href="#work" data-magnetic className="btn btn-primary">
                    <RollLabel text="Explore work" />
                    <Arrow dir="down" />
                  </a>
                </span>
                <span data-hero-in data-hero-cta className="inline-block">
                  <a href="#contact" className="btn btn-secondary">
                    <RollLabel text="Let's talk" />
                    <Arrow dir="right" />
                  </a>
                </span>
              </div>
            </div>

            <div data-hero-in data-hero-term className="hidden justify-end lg:flex">
              <Terminal play={heroIn && active} />
            </div>
          </div>
        </div>
      </div>

      {/* Tech ticker */}
      <div data-hero-in data-hero-ticker className="relative border-t border-line-soft bg-bg/40 py-4 backdrop-blur-sm">
        <Marquee items={stack} />
      </div>
    </section>
  );
}
