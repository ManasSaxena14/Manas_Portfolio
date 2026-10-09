"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * Root of a project scene. Sized by its parent (any aspect), it is a size
 * container so everything inside scales in `cqw` like an image would.
 * Its CSS animations only run while it is on screen ([data-live]), and its
 * layers rise in from their depth the first time it scrolls into view.
 */
export function Scene({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-live", e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-enter]", ref.current);
        gsap.from(layers, {
          autoAlpha: 0,
          y: (_, el: HTMLElement) => 26 + Number(el.dataset.d ?? 1) * 22,
          scale: 0.94,
          duration: 1.4,
          stagger: 0.09,
          ease: "expo.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-scene className={`scene ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * A depth layer. The outer box is positioned by `className` and drifts with
 * the pointer by `d` (deeper = further); the inner box takes the entrance
 * tween, so the two transforms never collide.
 */
export function Layer({
  d = 1,
  className,
  style,
  children,
}: {
  d?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`pl absolute ${className ?? ""}`} style={{ "--d": d, ...style } as CSSProperties}>
      <div data-enter data-d={d} className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
}
