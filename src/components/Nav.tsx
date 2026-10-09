"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { pad, portfolio } from "@/data/portfolio";
import { store, useStore } from "@/lib/store";
import { ScrollTrigger } from "@/lib/gsap";
import Logo from "@/components/Logo";
import LocalTime from "@/components/LocalTime";
import { Arrow, RollLabel } from "@/components/SectionHeader";

const { nav, socials, email, resumeUrl, status } = portfolio;

export default function Nav() {
  const menuOpen = useStore((s) => s.menuOpen);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
  const bar = useRef<HTMLDivElement>(null);

  // Scroll state: background after 24px, hide on scroll-down past 420px,
  // active section = last one whose top is above 45% of the viewport.
  // Driven by ScrollTrigger (same frame as Lenis) with section positions
  // measured once per refresh, so scrolling never reads layout.
  useEffect(() => {
    let ly = window.scrollY;
    let H = window.innerHeight;
    let tops: [string, number][] = [];
    const st = { scrolled: false, hidden: false, active: "", p: -1 };
    const measure = () => {
      H = window.innerHeight;
      tops = nav.flatMap((l) => {
        const id = l.href.slice(1);
        const el = document.getElementById(id);
        return el ? [[id, el.getBoundingClientRect().top + window.scrollY] as [string, number]] : [];
      });
    };
    const update = (y: number, p: number) => {
      const sc = y > 24;
      if (sc !== st.scrolled) setScrolled((st.scrolled = sc));
      let hid = st.hidden;
      if (y > ly + 4 && y > 420 && !store.get().menuOpen) hid = true;
      else if (y < ly - 4 || y < 420) hid = false;
      if (hid !== st.hidden) setHidden((st.hidden = hid));
      ly = y;
      if (bar.current && Math.abs(p - st.p) > 1e-4) bar.current.style.transform = `scaleX(${(st.p = p)})`;
      let act = "";
      for (const [id, top] of tops) if (top - y < H * 0.45) act = id;
      if (act !== st.active) setActive((st.active = act));
    };
    measure();
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => update(self.scroll(), self.progress),
      onRefresh: (self) => {
        measure();
        update(self.scroll(), self.progress);
      },
    });
    update(window.scrollY, trigger.progress);
    return () => trigger.kill();
  }, []);

  // Lock body scroll while the menu is open; close it on desktop widths.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 1080px)");
    const onChange = () => mq.matches && store.set({ menuOpen: false });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && store.set({ menuOpen: false });
    mq.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggle = () => {
    setHidden(false);
    store.set({ menuOpen: !store.get().menuOpen });
  };

  return (
    <>
      {/* Scroll progress */}
      <div
        ref={bar}
        aria-hidden
        className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-0.5 origin-left bg-linear-to-r from-accent/40 to-accent"
        style={{ transform: "scaleX(0)" }}
      />

      <header
        className="fixed top-0 right-0 left-0 z-50 border-b"
        style={{
          transform: hidden ? "translateY(-100%)" : "none",
          transition: "transform .6s var(--ease-expo), background .4s, border-color .4s",
          background: scrolled || menuOpen ? "color-mix(in srgb, var(--color-bg) 74%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
          borderColor: scrolled ? "var(--color-line-soft)" : "transparent",
        }}
      >
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Logo />

          {/* Once the header itself is frosted, the pill's own blur would be a
              second, nested backdrop pass for no visible difference. */}
          <nav
            aria-label="Primary"
            className={`hidden gap-0.5 rounded-[13px] border border-line bg-surface/70 p-1 lg:flex ${scrolled ? "" : "backdrop-blur-md"}`}
          >
            {nav.map((l) => {
              const on = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "location" : undefined}
                  className="roll-host relative block h-[34px] rounded-[9px] px-4 text-[13.5px] font-[450] no-underline transition-colors duration-[350ms]"
                  style={{ color: on ? "var(--color-bg)" : "var(--color-ink)" }}
                >
                  {on && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[9px] bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative block h-[34px] overflow-hidden">
                    <span className="roll">
                      <span className="h-[34px] leading-[34px]">{l.label}</span>
                      <span className="h-[34px] leading-[34px]" aria-hidden>
                        {l.label}
                      </span>
                    </span>
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener"
              data-magnetic
              className="btn btn-light hidden h-[42px] px-5 text-sm md:inline-flex"
            >
              <RollLabel text="Resume" />
              <Arrow />
            </a>
            <button
              type="button"
              onClick={toggle}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex size-11 flex-col items-center justify-center gap-1.5 rounded-[11px] border border-line bg-surface p-0 lg:hidden"
            >
              <span
                className="block h-[1.5px] w-[18px] bg-ink"
                style={{
                  transform: menuOpen ? "translateY(3.75px) rotate(45deg)" : "none",
                  transition: "transform .5s var(--ease-expo)",
                }}
              />
              <span
                className="block h-[1.5px] w-[18px] bg-ink"
                style={{
                  transform: menuOpen ? "translateY(-3.75px) rotate(-45deg)" : "none",
                  transition: "transform .5s var(--ease-expo)",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} />
    </>
  );
}

function MobileMenu({ open }: { open: boolean }) {
  return (
    <div
      id="mobile-menu"
      inert={!open}
      aria-hidden={!open}
      className="fixed inset-0 z-[45] flex flex-col justify-between bg-bg-menu px-[clamp(20px,5vw,48px)] pt-28 pb-9 lg:hidden"
      style={{
        clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        transition: "clip-path .8s var(--ease-quart)",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <nav className="flex flex-col gap-1.5">
        {nav.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className="group block overflow-hidden border-b border-line-soft text-ink no-underline"
          >
            <span
              className="flex items-baseline gap-4 py-2.5"
              style={{
                transform: open ? "none" : "translateY(105%)",
                transition: `transform .8s var(--ease-expo) ${open ? 0.25 + i * 0.06 : 0}s`,
              }}
            >
              <span className="font-mono text-xs text-accent">{pad(i + 1)}</span>
              <span className="display flex-1 text-[clamp(40px,11vw,72px)] leading-none">{l.label}</span>
              <span className="text-2xl text-faint transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:text-accent">
                →
              </span>
            </span>
          </a>
        ))}
      </nav>
      <div
        className="flex flex-col gap-[18px]"
        style={{ opacity: open ? 1 : 0, transition: `opacity .6s ease ${open ? 0.45 : 0}s` }}
      >
        <div className="flex items-center justify-between font-mono text-[11px] tracking-[.14em] text-muted uppercase">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.6s ease-in-out infinite" }} />
            {status}
          </span>
          <LocalTime />
        </div>
        <a href={`mailto:${email}`} className="text-lg no-underline">
          {email}
        </a>
        <div className="flex flex-wrap gap-2.5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 items-center rounded-[10px] border border-line px-4 text-sm no-underline"
            >
              {s.label} ↗
            </a>
          ))}
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center rounded-[10px] bg-accent px-4 text-sm font-medium text-bg no-underline hover:text-bg"
          >
            Resume ↗
          </a>
        </div>
      </div>
    </div>
  );
}
