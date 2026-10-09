"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";

type Mode = "" | "link" | "text" | "view";

/** Accent dot + trailing ring. Only for fine pointers. */
export default function Cursor() {
  const [on, setOn] = useState(false);
  const ring = useRef<HTMLDivElement>(null);
  const ringInner = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (portfolio.settings.customCursor && window.matchMedia("(pointer: fine)").matches) setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    document.body.classList.add("cc-cursor");
    let mx = -100, my = -100, rx = -100, ry = -100, shown = false, raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      if (!shown) {
        shown = true;
        rx = mx;
        ry = my;
        if (ring.current) ring.current.style.opacity = "1";
        if (dot.current) dot.current.style.opacity = "1";
      }
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };

    const onOver = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("a, button, input, textarea, [data-cursor]");
      const mode: Mode = t
        ? ((t.getAttribute("data-cursor") as Mode) || (t.matches("input, textarea") ? "text" : "link"))
        : "";
      const inner = ringInner.current;
      if (!inner) return;
      const scale = mode === "view" ? 2.4 : mode === "link" ? 1.6 : mode === "text" ? 0.6 : 1;
      inner.style.transform = `scale(${scale})`;
      inner.style.background =
        mode === "view" ? "var(--color-accent)" : mode === "link" ? "rgb(250 250 250 / .1)" : "transparent";
      inner.style.borderColor = mode === "view" ? "var(--color-accent)" : "rgb(250 250 250 / .5)";
      if (label.current) {
        label.current.textContent = mode === "view" ? "View" : "";
        label.current.style.opacity = mode === "view" ? "1" : "0";
      }
      if (dot.current) dot.current.style.opacity = mode === "view" ? "0" : "1";
    };

    const onLeave = () => {
      shown = false;
      if (ring.current) ring.current.style.opacity = "0";
      if (dot.current) dot.current.style.opacity = "0";
    };

    // The ring eases toward the pointer and the loop parks once it has
    // caught up, so a still mouse costs nothing per frame (e.g. while the
    // page smooth-scrolls under it). The next pointermove restarts it.
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      const settled = Math.abs(mx - rx) < 0.05 && Math.abs(my - ry) < 0.05;
      if (settled) {
        rx = mx;
        ry = my;
      }
      if (ring.current) ring.current.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("cc-cursor");
    };
  }, [on]);

  if (!on) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[200] h-0 w-0 opacity-0 transition-opacity duration-300"
      >
        <div
          ref={ringInner}
          className="absolute -top-5 -left-5 size-10 rounded-full border border-white/50"
          style={{
            transition:
              "transform .45s var(--ease-expo), background .3s, border-color .3s",
          }}
        />
        <span
          ref={label}
          className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] tracking-[.12em] whitespace-nowrap text-bg uppercase opacity-0 transition-opacity duration-[250ms]"
        />
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed -top-[3px] -left-[3px] z-[201] size-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300"
      />
    </>
  );
}
