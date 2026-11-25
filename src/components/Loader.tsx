"use client";

import { useEffect, useRef, useState } from "react";
import { HUES, portfolio } from "@/data/portfolio";
import { store } from "@/lib/store";
import { prefersReducedMotion, scrollToY } from "@/lib/scroll";

const LANES = HUES.length;
const INK = "#fafafa";

const SETTLE = 0.9; // s: longest wait for steady frames before anything moves
const UNFURL = 0.8; // s: seven dots open into seven strands
const GATHER = 0.95; // s: the strands write the name, left to right
const SWEEP = 1.15; // s: the page shows through and the points spiral off into the galaxy
const MAX = 4; // s: longest wait for the network before opening anyway

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const out = (t: number) => 1 - Math.pow(1 - t, 4);
const glide = (t: number) => (1 - Math.cos(Math.PI * Math.pow(t, 0.8))) / 2;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Name = { image: HTMLCanvasElement; points: Float32Array };

/** The hero's own name, read off the page: a solid image and `n` points inside it. */
function readName(W: number, H: number, dpr: number, n: number): Name | null {
  const probe = document.createElement("i");
  probe.style.cssText = "display:inline-block;width:0;height:0";
  const glyphs: { ch: string; x: number; y: number; font: string; color: string }[] = [];
  for (const box of document.querySelectorAll<HTMLElement>("#top h1 [data-measure]")) {
    box.append(probe); // an empty inline-block sits on the baseline
    const y = probe.getBoundingClientRect().bottom;
    probe.remove();
    const st = getComputedStyle(box);
    const wght = /"wght"\s+([\d.]+)/.exec(st.fontVariationSettings)?.[1] ?? st.fontWeight;
    const font = `${st.fontStyle} ${wght} ${st.fontSize} ${st.fontFamily}`;
    for (const l of box.querySelectorAll<HTMLElement>("[data-l]"))
      glyphs.push({ ch: l.textContent ?? "", x: l.getBoundingClientRect().left, y, font, color: st.color });
  }
  if (!glyphs.length) return null;

  const paint = (scale: number) => {
    const image = document.createElement("canvas");
    image.width = Math.round(W * scale);
    image.height = Math.round(H * scale);
    const c = image.getContext("2d", scale === 1 ? { willReadFrequently: true } : undefined);
    if (!c) return null;
    c.scale(scale, scale);
    for (const g of glyphs) {
      c.font = g.font;
      c.fillStyle = g.color;
      c.fillText(g.ch, g.x, g.y);
    }
    return { image, c };
  };
  const flat = paint(1);
  const sharp = paint(dpr);
  if (!flat || !sharp) return null;

  // An even, lightly jittered grid, spaced so that about n points fit the ink.
  const { data } = flat.c.getImageData(0, 0, W, H);
  let ink = 0;
  for (let i = 3; i < data.length; i += 16) if (data[i] > 128) ink++;
  if (!ink) return null;
  const step = Math.sqrt((ink * 4) / n);
  const pts: number[] = [];
  for (let y = step / 2; y < H; y += step)
    for (let x = step / 2; x < W; x += step) {
      const px = x + (Math.random() - 0.5) * step * 0.8;
      const py = y + (Math.random() - 0.5) * step * 0.8;
      if (data[((py | 0) * W + (px | 0)) * 4 + 3] > 128) pts.push(px, py);
    }
  return pts.length ? { image: sharp.image, points: new Float32Array(pts) } : null;
}

/**
 * Opening sequence: seven dots, one for each colour on the site, unfurl into
 * seven strands that settle from noise into a signal. They keep flowing while
 * the page really loads (fonts, assets and the 3D galaxy code), then write the
 * name exactly where the hero sets it. A soft front sweeps across: the real
 * letters take over and the points let go into the galaxy. Click or press any
 * key to skip ahead.
 */
export default function Loader() {
  const [phase, setPhase] = useState<"run" | "gone">("run");
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const seeds = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  // Decided once per mount: the ref survives StrictMode's double effect run.
  const skipAll = useRef<boolean | null>(null);

  useEffect(() => {
    if (skipAll.current === null) {
      let seen = false;
      try {
        seen = sessionStorage.getItem("loader-seen") === "1";
        sessionStorage.setItem("loader-seen", "1");
      } catch {
        /* private mode: treat as a first visit */
      }
      const { showLoader, loaderEveryVisit } = portfolio.settings;
      // Very late hydration (the CSS failsafe may have hidden it already).
      skipAll.current = !showLoader || prefersReducedMotion() || (!loaderEveryVisit && seen) || performance.now() > 9000;
    }
    const el = root.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (skipAll.current || !el || !cv || !ctx) {
      setPhase("gone");
      store.set({ loaderDone: true });
      const id = window.setTimeout(() => store.set({ heroIn: true }), 60);
      return () => clearTimeout(id);
    }

    el.style.animation = "none"; // JS has it: cancel the no-JS failsafe
    window.scrollTo(0, 0);
    const html = document.documentElement;
    html.style.overflow = "hidden";

    // ── readiness: fonts, page assets and the hero's 3D code ──
    let skip = false;
    let parts = 0;
    const loaded = new Promise<void>((res) =>
      document.readyState === "complete" ? res() : window.addEventListener("load", () => res(), { once: true }),
    );
    const jobs = [document.fonts?.ready, loaded, import("@/components/three/HeroGalaxy").catch(() => null)];
    jobs.forEach((j) => Promise.resolve(j).then(() => parts++));
    let fonts = false;
    // Two frames on, so the hero has fitted its name to the final fonts.
    document.fonts?.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => (fonts = true))));

    // ── points ──
    let W = 0;
    let H = 0;
    let dpr = 1;
    let mid = 0;
    let dot = 2;
    let name: Name | null = null;
    const N = window.innerWidth < 720 ? 2600 : 6500;
    const at = new Float32Array(N).map((_, i) => (i + 0.5) / N); // place along the strand, 0–1
    const lane = new Uint8Array(N).map(() => Math.random() * LANES);
    const rnd = new Float32Array(N).map(() => Math.random());
    const fuzz = new Float32Array(N).map(() => (Math.random() + Math.random() + Math.random() - 1.5) * 1.4);
    const tx = new Float32Array(N);
    const ty = new Float32Array(N);
    const lag = new Float32Array(N);
    const landed = new Float32Array(N * 2); // scratch: points already in place this frame
    const sx = new Float32Array(LANES);
    const sy = new Float32Array(LANES);
    const buckets = HUES.map((_, j) => Array.from(lane.keys()).filter((i) => lane[i] === j));

    const aim = () => {
      name = readName(W, H, dpr, N);
      if (!name) return;
      // Pair strands with letters by x, loosely, so points mostly lift straight up or down.
      const p = name.points;
      const m = p.length / 2;
      const order = Array.from({ length: N }, (_, i) => i % m);
      const key = order.map((k) => p[k * 2] + (Math.random() - 0.5) * W * 0.3);
      const rank = Array.from(order.keys()).sort((a, b) => key[a] - key[b]);
      let lo = Infinity;
      let hi = -Infinity;
      for (let k = 0; k < m; k++) {
        lo = Math.min(lo, p[k * 2]);
        hi = Math.max(hi, p[k * 2]);
      }
      rank.forEach((r, i) => {
        tx[i] = p[order[r] * 2];
        ty[i] = p[order[r] * 2 + 1];
        lag[i] = ((tx[i] - lo) / (hi - lo)) * 0.52 + rnd[i] * 0.1;
      });
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = el.clientWidth;
      H = el.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      mid = H / 2;
      dot = W < 720 ? 1.5 : 2;
      Array.from(seeds.current?.children ?? []).forEach((s, j) => {
        const r = s.getBoundingClientRect();
        sx[j] = r.left + r.width / 2;
        sy[j] = r.top + r.height / 2;
      });
      const rule = document.querySelector("[data-hero-rule]")?.parentElement?.getBoundingClientRect();
      if (rule && line.current && rule.top < H) {
        line.current.style.cssText += `;top:${rule.top}px;bottom:auto;left:${rule.left}px;width:${rule.width}px`;
      }
      if (name) aim();
    };
    resize();
    window.addEventListener("resize", resize);

    // Where point i rides its strand: seven waves that cross and drift.
    let px = 0;
    let py = 0;
    const ride = (i: number, t: number, open: number) => {
      const j = lane[i];
      const u = at[i];
      const reach = clamp(open * 1.7 - Math.abs(u - 0.5) * 1.4); // opens from the middle out
      const e = out(reach);
      const v = u * 1.08 - 0.04;
      const pinch = Math.sin(Math.PI * clamp(v));
      const a = v * 5.2 - t * 1.5 + j * 0.52;
      const wave = Math.sin(a) * 0.62 + Math.sin(v * 9.1 + t * 0.9 - j * 1.3) * 0.38;
      const noise = fuzz[i] * (4 + 150 * Math.pow(1 - clamp(open * 1.05), 2) * e);
      const x = v * W;
      const y = mid + wave * Math.min(H * 0.2, W * 0.32) * (0.25 + 0.75 * pinch) + noise;
      px = sx[j] + fuzz[i] * 3.2 * (1 - e) + (x - sx[j]) * e;
      py = sy[j] + (rnd[i] - 0.5) * 6 * (1 - e) + (y - sy[j]) * e;
    };

    // ── main loop ──
    const t0 = performance.now();
    let last = t0;
    let clock = 0;
    let open = 0;
    let started = false;
    let writing = false;
    let calm = 0;
    let write = 0;
    let sweep = 0;
    let bar = 0;
    let handed = false;
    let raf = 0;

    const finish = () => {
      html.style.overflow = "";
      setPhase("gone");
      store.set({ loaderDone: true });
      // A shared deep link (/#contact) lands on its section once open.
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id && id !== "top" ? document.getElementById(id) : null;
      if (target) scrollToY(target.getBoundingClientRect().top + window.scrollY);
    };

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Short trails: each frame rubs out part of the one before.
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = sweep > 0 ? 1 : 1 - Math.pow(1e-7, dt);
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      const front = -0.6 * W + glide(sweep) * 1.6 * W; // where the page is already fully clear
      const solid = name ? clamp((write - 0.76) / 0.2) : 0;

      if (name && solid > 0) {
        ctx.save();
        ctx.globalAlpha = solid;
        ctx.beginPath();
        ctx.rect(Math.max(0, front), 0, W, H);
        ctx.clip();
        ctx.drawImage(name.image, 0, 0, W, H);
        ctx.restore();
      }

      let white = 0;
      ctx.globalAlpha = 0.9;
      for (let j = 0; j < LANES; j++) {
        ctx.fillStyle = HUES[j];
        for (const i of buckets[j]) {
          const k = name ? clamp((write - lag[i]) / 0.38) : 0;
          if (k < 1) {
            ride(i, clock, open);
            if (k > 0) {
              const e = inOut(k);
              const arc = Math.sin(Math.PI * k) * (rnd[i] - 0.5) * 70;
              px += (tx[i] - px) * e + arc;
              py += (ty[i] - py) * e - Math.abs(arc) * 0.6;
            }
          } else {
            px = tx[i];
            py = ty[i];
          }
          if (sweep > 0) {
            // Let go as the front passes and spiral into the galaxy's core.
            const go = clamp((glide(sweep) * 1.75 - px / W) / 0.75 - rnd[i] * 0.2);
            if (go > 0) {
              const d = go * go * (3 - 2 * go);
              const ox = px - W / 2 + fuzz[i] * 160 * Math.sin(Math.PI * d);
              const oy = py - mid + (rnd[i] - 0.6) * 260 * Math.sin(Math.PI * d);
              const turn = d * (0.9 + rnd[i] * 1.5);
              const pull = 1 - d * 0.8;
              px = W / 2 + (ox * Math.cos(turn) - oy * Math.sin(turn)) * pull;
              py = mid + (ox * Math.sin(turn) + oy * Math.cos(turn)) * pull;
            } else if (k === 1) continue; // still part of the solid letter
            const s = dot * 1.25 * (1 - go * go * go);
            if (s > 0.2) ctx.fillRect(px - s / 2, py - s / 2, s, s);
            continue;
          }
          if (k > 0.94) {
            landed[white++] = px;
            landed[white++] = py;
          } else ctx.fillRect(px - dot / 2, py - dot / 2, dot, dot);
        }
      }
      ctx.fillStyle = INK;
      for (let i = 0; i < white; i += 2) ctx.fillRect(landed[i] - dot / 2, landed[i + 1] - dot / 2, dot, dot);
    };

    const loop = (now: number) => {
      const frame = (now - last) / 1000;
      const dt = Math.min(0.05, frame);
      last = now;
      const rate = skip ? 4 : 1;
      const t = (now - t0) / 1000;
      const ready = parts === jobs.length && fonts;
      // Hydration and the galaxy's shaders block the main thread at first. The
      // dots pulse on the compositor meanwhile; move on once frames are steady.
      calm = ready && frame < 0.024 ? calm + 1 : 0;
      if (!started && (calm > 3 || t > SETTLE || skip)) {
        started = true;
        if (fonts) aim();
        if (seeds.current) seeds.current.style.visibility = "hidden"; // now drawn on the canvas
        last = performance.now();
      }
      if (!started) {
        raf = requestAnimationFrame(loop);
        return;
      }
      clock += dt;
      const done = ready || skip || t > MAX;
      open = clamp(open + (dt * rate) / UNFURL);
      if (open >= 1 && done && !writing) {
        writing = true;
        if (fonts && !name) aim(); // without them the hero brings its own name in instead
      }
      if (writing) write = name ? clamp(write + (dt * rate) / GATHER) : 1;
      if (write >= 0.96 && !handed) {
        handed = true;
        store.set({ assembled: !!name, heroIn: true });
        if (hint.current) hint.current.style.opacity = "0";
      }
      if (handed) sweep = clamp(sweep + (dt * (skip ? 2 : 1)) / SWEEP);

      const real = Math.min(open, 0.15 + (0.85 * parts) / jobs.length) * 0.5 + write * 0.5;
      bar += (real - bar) * (1 - Math.exp(-dt * 12));
      if (line.current) line.current.style.transform = `scaleX(${(handed ? 1 : bar).toFixed(4)})`;
      if (sheet.current && sweep > 0) sheet.current.style.transform = `translate3d(${(glide(sweep) * 100).toFixed(3)}%, 0, 0)`;
      draw(dt);
      if (sweep >= 1) finish();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((now) => {
      last = now;
      loop(now);
    });

    const onSkip = () => {
      skip = true;
    };
    el.addEventListener("click", onSkip);
    window.addEventListener("keydown", onSkip);

    return () => {
      cancelAnimationFrame(raf);
      html.style.overflow = "";
      el.removeEventListener("click", onSkip);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div ref={root} aria-hidden data-loader className="ld fixed inset-0 z-[100] overflow-hidden select-none">
      <div ref={sheet} className="ld-sheet" />
      <canvas ref={canvas} className="absolute inset-0 size-full" />
      <div ref={seeds} className="ld-seeds">
        {HUES.map((c, i) => (
          <i key={c} style={{ background: c, animationDelay: `${i * 0.09}s` }} />
        ))}
      </div>
      <span ref={line} className="ld-line" />
      <span ref={hint} className="ld-hint">
        <span className="hidden md:inline">Click or press any key to skip</span>
        <span className="md:hidden">Tap to skip</span>
      </span>
    </div>
  );
}
