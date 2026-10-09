import { fullName, portfolio } from "@/data/portfolio";

// "MS" as one continuous monoline: the M's rounded arches run straight into
// the S, which ends in a lime node. One path, so the draw-in and the hover
// pulse travel M → S.
export const TRACE =
  "M5.5 36V15A3 3 0 0 1 10.9 13.2L14.25 19.6L17.6 13.2A3 3 0 0 1 23 15V36H33A5.5 6 0 0 0 33 24H31.5A5.5 6 0 0 1 31.5 12H40.5";
export const NODE = { cx: 40.5, cy: 12, r: 3.1 };

/**
 * The MS monogram. The trace draws itself in on load and the node lights
 * up; on hover a lime signal pulse runs the length of the trace.
 */
export function Mark({ size = 40, framed = true }: { size?: number; framed?: boolean }) {
  return (
    <span
      className={`mark relative grid shrink-0 place-items-center overflow-hidden ${
        framed
          ? "rounded-[30%] shadow-[0_8px_24px_-12px_rgb(0_0_0/.9)] transition-shadow duration-500 group-hover:shadow-[0_0_30px_-8px_color-mix(in_srgb,var(--color-accent)_65%,transparent)]"
          : ""
      }`}
      style={{ width: size, height: size }}
    >
      {/* Frame: a slowly turning light runs around a hairline border, over a
          glassy dark tile. The ring rotates (compositor only); the tile
          covers all but its edge. */}
      {framed && (
        <>
          <span aria-hidden className="mark-ring absolute -inset-1/2" />
          <span
            aria-hidden
            className="absolute inset-px rounded-[inherit] bg-[radial-gradient(120%_90%_at_30%_0%,#232328,#0c0c0e_70%)] shadow-[inset_0_1px_0_rgb(255_255_255/.09)]"
          />
        </>
      )}
      <span className="relative block" style={{ width: size * 0.82, height: size * 0.82 }}>
        <svg viewBox="0 0 48 48" width={size * 0.82} height={size * 0.82} aria-hidden className="block overflow-visible">
          <path
            d={TRACE}
            pathLength={100}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mark-trace"
          />
          <path
            d={TRACE}
            pathLength={100}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
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
        <span className="font-display text-[16px] font-[640] tracking-[-.015em] text-ink">{fullName}</span>
        <span className="font-mono text-[9.5px] tracking-[.16em] text-dim uppercase transition-colors duration-300 group-hover:text-accent">
          AI · {bottom}
        </span>
      </span>
    </a>
  );
}
