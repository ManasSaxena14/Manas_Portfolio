"use client";

import { Fragment, useEffect, useRef } from "react";
import { clamp, getScrollY, prefersReducedMotion } from "@/lib/scroll";
import { gsap } from "@/lib/gsap";

/**
 * Infinite ticker. Drifts on its own, speeds up with scroll velocity,
 * follows the scroll direction and leans into fast scrolls.
 * `big` renders the oversized manifesto style.
 */
export default function Marquee({
  items,
  big = false,
  reverse = false,
  className,
}: {
  items: string[];
  big?: boolean;
  reverse?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    const root = host.current;
    if (!el || !root || prefersReducedMotion()) return;
    const base = big ? 70 : 38; // px / s at rest
    const flip = reverse ? -1 : 1;
    let x = 0;
    let dir = -1;
    let vel = 0;
    let skew = 0;
    let running = false;
    let fresh = true;
    let lastY = getScrollY();
    // The loop point, measured on resize instead of every frame.
    let half = el.scrollWidth / 2;
    const ro = new ResizeObserver(() => (half = el.scrollWidth / 2));
    ro.observe(el);

    // Runs on GSAP's ticker, right after Lenis has moved the page, so the
    // scroll velocity it reacts to is this frame's (no one-frame lag).
    const loop = (_time: number, deltaMs: number) => {
      const dt = fresh ? 0.016 : Math.min(0.05, deltaMs / 1000);
      fresh = false;
      const y = getScrollY();
      const dy = y - lastY;
      lastY = y;
      vel += (dy / dt - vel) * 0.12;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? -1 : 1;
      x += dir * flip * (base + Math.min(1600, Math.abs(vel) * 0.4)) * dt;
      if (half > 0) {
        if (x <= -half) x += half;
        else if (x > 0) x -= half;
      }
      skew += (clamp(-vel * 0.004, -8, 8) * (big ? 1 : 0.35) - skew) * 0.1;
      el.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
    };

    // Only animate while on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        fresh = true;
        lastY = getScrollY();
        gsap.ticker.add(loop);
        running = true;
      } else if (!e.isIntersecting && running) {
        gsap.ticker.remove(loop);
        running = false;
      }
    });
    io.observe(root);
    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(loop);
    };
  }, [big, reverse]);

  const row = (copy: number) =>
    items.map((it, i) => (
      <Fragment key={`${copy}-${i}`}>
        {big ? (
          <span
            className={
              i % 3 === 1
                ? "serif-i px-[0.18em] text-[1.04em]"
                : i % 3 === 2
                  ? "display px-[0.18em] text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]"
                  : "display px-[0.18em]"
            }
          >
            {it}
          </span>
        ) : (
          <span className="px-5">{it}</span>
        )}
        {big ? (
          <span aria-hidden className="mx-[0.22em] inline-block size-[0.14em] rotate-45 bg-accent" />
        ) : (
          <span aria-hidden className="text-faint">/</span>
        )}
      </Fragment>
    ));

  return (
    <div
      ref={host}
      aria-hidden
      className={`overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] ${className ?? ""}`}
    >
      <div
        ref={track}
        className={`flex w-max items-center whitespace-nowrap will-change-transform ${
          big
            ? "text-[clamp(64px,11vw,180px)] leading-[1.02] font-semibold tracking-[-.045em]"
            : "font-mono text-[12.5px] tracking-[.16em] text-muted uppercase"
        }`}
      >
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
