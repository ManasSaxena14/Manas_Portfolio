"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { store } from "@/lib/store";
import { getLenis, prefersReducedMotion, scrollToY, setLenis } from "@/lib/scroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Page-wide behaviours with no UI of their own:
 * Lenis smooth scroll, in-page anchor scrolling, [data-reveal]
 * scroll reveals and [data-magnetic] buttons.
 */
export default function Interactions() {
  // Smooth scroll, paused while the loader runs or the mobile menu is open.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
    setLenis(lenis);
    // One clock for everything: GSAP's ticker drives Lenis, and every Lenis
    // scroll updates ScrollTrigger in the same frame, so scrubbed animations
    // never lag the page by a frame.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const sync = () => {
      const s = store.get();
      if (s.menuOpen || !s.loaderDone) lenis.stop();
      else lenis.start();
    };
    sync();
    const unsub = store.subscribe(sync);
    return () => {
      unsub();
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Anchor links: smooth-scroll, closing the mobile menu first if open.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute("href")!.slice(1);
      e.preventDefault();
      const go = () => {
        const el = id && id !== "top" ? document.getElementById(id) : null;
        const top = el ? el.getBoundingClientRect().top + window.scrollY - (id === "process" ? 0 : 8) : 0;
        scrollToY(top);
      };
      if (store.get().menuOpen) {
        store.set({ menuOpen: false });
        window.setTimeout(go, 350);
      } else go();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Scroll reveal: once, threshold .12, bottom margin -6%.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    // Typing terminals, scrambles and ticking clocks mutate the DOM
    // constantly: only rescan (at most once a frame) when something that is
    // or contains a [data-reveal] element was actually added.
    let pending = 0;
    const holdsReveal = (n: Node) =>
      n.nodeType === 1 && ((n as Element).matches("[data-reveal]") || !!(n as Element).querySelector("[data-reveal]"));
    const mo = new MutationObserver((records) => {
      if (pending || !records.some((r) => Array.prototype.some.call(r.addedNodes, holdsReveal))) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(pending);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Looping ambient animations ([data-ambient]) only run while on screen,
  // so off-screen ones never cost a style recalc or repaint per frame.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.target.toggleAttribute("data-live", en.isIntersecting)),
      { rootMargin: "120px" },
    );
    document.querySelectorAll("[data-ambient]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Magnetic buttons (fine pointers only).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let current: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      // Cursor spotlight on cards: feed the pointer position to the CSS.
      const spot = target?.closest?.<HTMLElement>("[data-spotlight], [data-glow]");
      // Measure everything before writing anything, so the browser never has
      // to recalculate styles in the middle of the handler.
      const mr = m?.getBoundingClientRect();
      const sr = spot?.getBoundingClientRect();
      if (current && current !== m) current.style.transform = "";
      if (m && mr) {
        const x = (e.clientX - mr.left - mr.width / 2) * 0.28;
        const y = (e.clientY - mr.top - mr.height / 2) * 0.38;
        m.style.transform = `translate(${x}px, ${y}px)`;
      }
      current = m;
      if (spot && sr) {
        spot.style.setProperty("--mx", `${e.clientX - sr.left}px`);
        spot.style.setProperty("--my", `${e.clientY - sr.top}px`);
      }
    };
    const onLeave = () => {
      if (current) current.style.transform = "";
      current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Keep Lenis' cached page height and ScrollTrigger positions fresh
  // when fonts or layout settle.
  useEffect(() => {
    let t = 0;
    const ro = new ResizeObserver(() => {
      getLenis()?.resize();
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  return null;
}
