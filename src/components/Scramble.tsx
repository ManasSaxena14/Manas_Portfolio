"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#$%&*+=";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Text that decodes out of random glyphs, like a model resolving its output.
 * Plays when `play` turns true, or when scrolled into view if `play` is
 * omitted. `hover` replays it on pointer enter. Use on monospaced text so
 * the width never jitters.
 */
export default function Scramble({
  text,
  play,
  delay = 0,
  duration = 900,
  hover = false,
  className,
}: {
  text: string;
  play?: boolean;
  delay?: number;
  duration?: number;
  hover?: boolean;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const cancel = useRef<() => void>(() => {});
  const [seen, setSeen] = useState(false);

  const start = useCallback(
    (wait: number) => {
      const node = el.current;
      if (!node || prefersReducedMotion()) return;
      cancel.current();
      const chars = Array.from(text);
      // Each character locks in at its own moment, roughly left to right.
      const at = chars.map((_, i) => (i / Math.max(1, chars.length)) * 0.7 + Math.random() * 0.3);
      const noise = () => chars.map((c) => (c === " " ? c : glyph())).join("");
      node.textContent = noise();
      let raf = 0;
      let t0 = 0;
      let frame = 0;
      const tick = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.min(1, (now - t0) / duration);
        if (frame++ % 2 === 0)
          node.textContent = chars.map((c, i) => (c === " " || p >= at[i] ? c : glyph())).join("");
        if (p < 1) raf = requestAnimationFrame(tick);
        else node.textContent = text;
      };
      const timer = window.setTimeout(() => (raf = requestAnimationFrame(tick)), wait);
      cancel.current = () => {
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        node.textContent = text;
      };
    },
    [text, duration],
  );

  // Without an explicit `play`, start the first time it scrolls into view.
  useEffect(() => {
    if (play !== undefined || !el.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el.current);
    return () => io.disconnect();
  }, [play]);

  useEffect(() => {
    if (play ?? seen) start(delay);
  }, [play, seen, delay, start]);

  useEffect(() => () => cancel.current(), []);

  return (
    <span className={className} onPointerEnter={hover ? () => start(0) : undefined}>
      <span className="sr-only">{text}</span>
      <span ref={el} aria-hidden>
        {text}
      </span>
    </span>
  );
}
