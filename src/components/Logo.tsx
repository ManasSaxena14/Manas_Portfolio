import { fullName, portfolio } from "@/data/portfolio";

// "MS" drawn as a circuit trace: a deep-V M and an angular S with chamfered
// corners, ending in a lime node, like a signal reaching its output.
// Drawn as one path so the draw-in and the hover pulse run M → S.
export const TRACE = "M7 36V13L14 25L21 13V36M27 36H38L41 33V27.5L38 24.5H30L27 21.5V16L30 13H38";
export const NODE = { cx: 40.9, cy: 13, r: 3.3 };

/**
 * The MS monogram. The trace draws itself in on load and the node lights
 * up; on hover a lime signal pulse runs the length of the trace.
 */
export function Mark({ size = 40, framed = true }: { size?: number; framed?: boolean }) {
  return (
    <span
      className={`mark relative grid shrink-0 place-items-center overflow-hidden ${
        framed
          ? "rounded-[12px] border border-line bg-[linear-gradient(150deg,#1b1b1e,#0b0b0d)] shadow-[inset_0_1px_0_rgb(255_255_255/.07)] transition-[border-color,box-shadow] duration-500 group-hover:border-accent/50 group-hover:shadow-[inset_0_1px_0_rgb(255_255_255/.08),0_0_26px_-8px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
          : ""
      }`}
      style={{ width: size, height: size }}
    >
      {/* Faint dot grid: the "circuit board" the trace is etched into */}
      {framed && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgb(255 255 255 / .07) .6px, transparent .8px)",
            backgroundSize: `${size / 6}px ${size / 6}px`,
          }}
        />
      )}
      <span className="relative block" style={{ width: size * 0.82, height: size * 0.82 }}>
        <svg viewBox="0 0 48 48" width={size * 0.82} height={size * 0.82} aria-hidden className="block overflow-visible">
          <path
            d={TRACE}
            pathLength={100}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={3.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mark-trace"
          />
          <path
            d={TRACE}
            pathLength={100}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mark-pulse"
          />
          <circle {...NODE} fill="var(--color-accent)" className="mark-node" />
        </svg>
        {/* The looping halo is an HTML ring over the node rather than an SVG
            circle: the browser can then run it on the compositor instead of
            repainting the nav every frame. Its 1-unit stroke sits on r. */}
        <span
          aria-hidden
          className="mark-halo absolute rounded-full border-solid border-accent"
          style={{
            left: `${((NODE.cx - NODE.r - 0.5) / 48) * 100}%`,
            top: `${((NODE.cy - NODE.r - 0.5) / 48) * 100}%`,
            width: `${((NODE.r * 2 + 1) / 48) * 100}%`,
            height: `${((NODE.r * 2 + 1) / 48) * 100}%`,
            borderWidth: (size * 0.82) / 48,
          }}
        />
      </span>
    </span>
  );
}

/** Nav lockup: monogram + a two-line label. Links back to the top. */
export default function Logo() {
  const [, bottom] = portfolio.logoLabel;
  return (
    <a href="#top" aria-label={`${fullName} — back to top`} className="group flex items-center gap-3 no-underline">
      <Mark />
      <span className="hidden flex-col leading-[1.25] md:flex">
        <span className="text-[15px] font-[650] tracking-[-.02em] text-ink">{fullName}</span>
        <span className="font-mono text-[9.5px] tracking-[.16em] text-dim uppercase transition-colors duration-300 group-hover:text-accent">
          AI · {bottom}
        </span>
      </span>
    </a>
  );
}
