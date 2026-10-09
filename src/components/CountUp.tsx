"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * Counts the numeric part of a metric up from zero the first time it
 * scrolls into view ("<120ms", "92.7%", "3M"). Non-numeric values render as-is.
 * Server HTML always carries the final value.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    const m = value.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
    if (!node || !m || prefersReducedMotion()) return;
    const [, pre, num, post] = m;
    const grouped = num.includes(",");
    const target = parseFloat(num.replaceAll(",", ""));
    const decimals = (num.split(".")[1] || "").length;
    const fmt = (v: number) =>
      `${pre}${grouped ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals)}${post}`;
    let raf = 0;
    node.textContent = fmt(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const tick = () => {
          const p = Math.min(1, (performance.now() - t0) / dur);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          node.textContent = fmt(target * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = value;
    };
  }, [value]);

  return (
    <span ref={el} className={className}>
      {value}
    </span>
  );
}
