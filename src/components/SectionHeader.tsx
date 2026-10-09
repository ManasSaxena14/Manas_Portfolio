import { Fragment, type CSSProperties } from "react";
import { parseAccent } from "@/data/portfolio";
import Scramble from "@/components/Scramble";

/** ■ EYEBROW ──────────── (01) */
export function SectionHeader({ eyebrow, index }: { eyebrow: string; index: string }) {
  return (
    <div data-reveal="" data-ambient className="eyebrow-row">
      <span aria-hidden className="size-1.5 shrink-0 bg-accent" />
      <Scramble text={eyebrow} />
      <span className="rule" />
      <span>{index}</span>
    </div>
  );
}

/** Renders "*accent*" markup with the italic serif. */
export function Accent({ text }: { text: string }) {
  return parseAccent(text).map((r, i) =>
    r.accent ? (
      <em key={i} className="serif-i">
        {r.t}
      </em>
    ) : (
      <Fragment key={i}>{r.t}</Fragment>
    ),
  );
}

type Token = { w: string; accent: boolean; glue: boolean };

function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let prevEndsSpace = true;
  for (const run of parseAccent(text)) {
    const startsSpace = /^\s/.test(run.t);
    run.t
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, j) =>
        out.push({ w, accent: run.accent, glue: j === 0 && out.length > 0 && !startsSpace && !prevEndsSpace }),
      );
    prevEndsSpace = /\s$/.test(run.t);
  }
  return out;
}

/** Heading whose words rise one by one out of a mask when scrolled into view. */
export function SplitWords({
  text,
  as: Tag = "h2",
  className,
  style,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: CSSProperties;
}) {
  const tokens = tokenize(text);
  return (
    <Tag data-reveal="words" className={className} style={style}>
      <span className="sr-only">{text.replaceAll("*", "")}</span>
      {tokens.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && !t.glue ? " " : null}
          <span className={t.accent ? "word word-i" : "word"} aria-hidden>
            <span className={t.accent ? "serif-i" : undefined} style={{ "--i": i } as CSSProperties}>
              {t.w}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/** Button label that rolls to a second copy on hover. */
export function RollLabel({ text }: { text: string }) {
  return (
    <span className="roll-label">
      <span>
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </span>
    </span>
  );
}

const ARROWS = {
  ne: { g: "↗", x: 1, y: -1 },
  down: { g: "↓", x: 0, y: 1 },
  up: { g: "↑", x: 0, y: -1 },
  right: { g: "→", x: 1, y: 0 },
};

/** Arrow that slides out along its direction and back in on hover. */
export function Arrow({ dir = "ne" }: { dir?: keyof typeof ARROWS }) {
  const a = ARROWS[dir];
  return (
    <span className="roll-arrow" aria-hidden style={{ "--ax": a.x, "--ay": a.y } as CSSProperties}>
      <span>{a.g}</span>
      <span>{a.g}</span>
    </span>
  );
}
