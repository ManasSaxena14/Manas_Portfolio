"use client";

import { useEffect, useRef } from "react";
import { fullName, portfolio } from "@/data/portfolio";
import { prefersReducedMotion } from "@/lib/scroll";

const whoami = `${fullName} — ${portfolio.roles[0]} & ${portfolio.roles[portfolio.roles.length - 1]}`.toLowerCase();
const SCRIPT = [{ cmd: "whoami", out: [whoami] }, ...portfolio.terminal];
const MAX_ROWS = 8;

/**
 * A glass terminal that types a train → test → deploy session on a loop.
 * Everything is written straight to the DOM (textContent only), so typing
 * never re-renders React.
 */
export default function Terminal({ play }: { play: boolean }) {
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = body.current;
    if (!host || !play) return;
    const fast = prefersReducedMotion();
    let dead = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((res) => timers.push(window.setTimeout(res, fast ? 0 : ms)));

    const caret = document.createElement("span");
    caret.className = "caret";

    const row = (cls = "") => {
      const d = document.createElement("div");
      d.className = `min-h-[1.6em] shrink-0 ${cls}`;
      host.appendChild(d);
      while (host.children.length > MAX_ROWS) host.firstElementChild?.remove();
      return d;
    };
    const span = (text: string, cls = "") => {
      const s = document.createElement("span");
      if (cls) s.className = cls;
      s.textContent = text;
      return s;
    };
    const prompt = (r: HTMLElement) => r.append(span("~ ", "text-accent"), span("$ ", "text-faint"));

    const output = async (text: string) => {
      const r = row("text-dim");
      if (text.includes("[bar]")) {
        const [pre, post] = text.split("[bar]");
        const bar = span("▱▱▱▱▱▱▱▱▱▱", "text-accent");
        r.append(span(pre), bar, span(post));
        for (let k = 1; k <= 10; k++) {
          if (dead) return;
          bar.textContent = "▰".repeat(k) + "▱".repeat(10 - k);
          await sleep(95);
        }
      } else if (/^[✓▲]/.test(text)) {
        r.append(span(text[0], "text-accent"), span(text.slice(1), "text-ink-2"));
      } else r.textContent = text;
    };

    const run = async () => {
      while (!dead) {
        host.replaceChildren();
        for (const step of SCRIPT) {
          const r = row("text-ink");
          prompt(r);
          const typed = span("");
          r.append(typed, caret);
          for (const ch of step.cmd) {
            if (dead) return;
            typed.textContent += ch;
            await sleep(24 + Math.random() * 58);
          }
          await sleep(300);
          for (const line of step.out) {
            if (dead) return;
            await output(line);
            await sleep(160);
          }
          await sleep(620);
        }
        const idle = row();
        prompt(idle);
        idle.append(caret);
        if (fast) return; // reduced motion: show the session once, no loop
        await sleep(4200);
      }
    };
    run();
    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
  }, [play]);

  return (
    <div aria-hidden className="glass relative w-full max-w-[440px] overflow-hidden rounded-[14px]" data-spotlight>
      <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 flex-1 truncate font-mono text-[11px] tracking-[.06em] text-dim">
          {portfolio.initials.toLowerCase()}@portfolio: ~/lab
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[.14em] text-faint uppercase">
          <span className="size-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.6s ease-in-out infinite" }} />
          live
        </span>
      </div>
      <div
        ref={body}
        className="flex h-[168px] flex-col justify-end overflow-hidden px-4 py-3 font-mono text-[12.5px] leading-[1.6] break-words"
      />
    </div>
  );
}
