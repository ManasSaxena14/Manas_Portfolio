import type Lenis from "lenis";

// Shared Lenis instance so any component can scroll or pause the page.
let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

/**
 * Current scroll position without touching the DOM. Reading window.scrollY
 * flushes any pending style and layout, so per-frame code reads Lenis' value.
 */
export const getScrollY = () => (lenis ? lenis.scroll : window.scrollY);

export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function scrollToY(top: number) {
  if (lenis) lenis.scrollTo(top, { duration: 1.5, easing: easeOutExpo });
  else window.scrollTo({ top, behavior: "smooth" });
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.body.style.overflow = locked ? "hidden" : "";
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
