"use client";

import { Fragment, useState, type CSSProperties, type MouseEvent } from "react";
import { portfolio, slug, type StatementPart } from "@/data/portfolio";
import { store } from "@/lib/store";

/*
 * One sentence that says what I do. Each claim carries a small live drawing of
 * the thing it describes and opens the project that backs it up.
 */

const { label, parts, hint } = portfolio.statement;
const { projects, paths } = portfolio.work;
const hueOf = (title: string) => paths.find((p) => p.id === projects.find((x) => x.title === title)?.path)?.hue;

// Word positions run through the whole sentence, so it lights up in reading order.
let n = 0;
const sentence = parts.map((p) => ({ ...p, words: p.t.split(" ").map((w) => ({ w, i: n++ })) }));

const open = (title: string) => (e: MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  store.set({ project: slug(title) });
};

export default function Statement() {
  const [at, setAt] = useState<string | null>(null);
  const now = parts.find((p) => p.project && p.project === at);

  return (
    <section id="what-i-do" aria-labelledby="what-i-do-h" className="sec-pad relative">
      <div className="wrap">
        <h2 id="what-i-do-h" className="sr-only">
          {label}
        </h2>
        <p className="st" style={{ "--n": n } as CSSProperties}>
          {sentence.map((p, k) => {
            const words = p.words.map(({ w, i }, j) => (
              <Fragment key={i}>
                {j > 0 && " "}
                <span className="st-w" style={{ "--i": i } as CSSProperties}>
                  {j === 0 && p.glyph && <Glyph kind={p.glyph} />}
                  {w}
                </span>
              </Fragment>
            ));
            if (!p.project) return <Fragment key={k}>{words}</Fragment>;
            return (
              <Fragment key={k}>
                {" "}
                <a
                  href={`#work/${slug(p.project)}`}
                  onClick={open(p.project)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setAt(p.project!)}
                  onPointerLeave={() => setAt(null)}
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && setAt(p.project!)}
                  onBlur={() => setAt(null)}
                  className="st-a"
                  style={{ "--hue": hueOf(p.project) } as CSSProperties}
                >
                  {words}
                  <span className="sr-only"> ({p.project})</span>
                </a>
              </Fragment>
            );
          })}
        </p>
        <p aria-hidden className="st-hint">
          {now ? (
            <>
              <span className="text-ink">{now.project}</span>, {now.note}
            </>
          ) : (
            hint
          )}
        </p>
      </div>
    </section>
  );
}

function Glyph({ kind }: { kind: StatementPart["glyph"] }) {
  return (
    <svg data-ambient aria-hidden viewBox="0 0 72 32" className="st-g">
      <rect className="st-g-bg" width="72" height="32" rx="16" />
      {kind === "booking" && (
        // One slot, two bookings: the first keeps it, the second is turned away.
        <>
          <rect x="27" y="8" width="18" height="16" rx="3" fill="none" stroke="var(--hue)" strokeOpacity=".55" strokeDasharray="2.5 2.5" />
          <rect className="st-first" x="28.5" y="9.5" width="15" height="13" rx="2" fill="var(--hue)" />
          <rect className="st-second" x="48" y="9.5" width="15" height="13" rx="2" fill="#ff9b85" />
        </>
      )}
      {kind === "forecast" && (
        // What was measured, then what is predicted.
        <>
          <path d="M11 20 C15 12 18 12 22 18 S30 24 36 15" fill="none" stroke="var(--hue)" strokeWidth="2.4" strokeLinecap="round" />
          <path className="st-ahead" pathLength="30" d="M36 15 C42 6 46 8 50 14 S57 20 61 11" fill="none" stroke="#fafafa" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="36" cy="15" r="3" fill="var(--hue)" />
        </>
      )}
      {kind === "unsure" && (
        // Three queues, none far enough ahead to trust.
        [0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="15" y={8 + i * 6.5} width="42" height="3.4" rx="1.7" fill="#fafafa" opacity=".16" />
            <rect className="st-vote" style={{ animationDelay: `${i * -1.3}s` }} x="15" y={8 + i * 6.5} width="42" height="3.4" rx="1.7" fill="var(--hue)" />
          </g>
        ))
      )}
      {kind === "survey" && (
        // 14,330 of 54,873 households is 26%: 11 of these 42 dots.
        Array.from({ length: 42 }, (_, i) => {
          const hit = (i * 11) % 42 < 11;
          return (
            <circle
              key={i}
              className={hit ? "st-found" : undefined}
              style={hit ? { animationDelay: `${(i % 14) * 0.12}s` } : undefined}
              cx={13.6 + (i % 14) * 3.45}
              cy={9.5 + Math.floor(i / 14) * 6.5}
              r="1.25"
              fill={hit ? "var(--hue)" : "#fafafa"}
              opacity={hit ? 1 : 0.28}
            />
          );
        })
      )}
    </svg>
  );
}
