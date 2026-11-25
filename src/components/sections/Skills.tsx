"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { portfolio, slug, tone } from "@/data/portfolio";
import { SectionHeader, SplitWords } from "@/components/SectionHeader";
import { store } from "@/lib/store";

/*
 * Skill evidence map. Skills on the left, projects on the right, one line for
 * every real use. Point at, focus or choose either side to trace its proof.
 * On phones the lines go and the project list narrows to the matches instead.
 */

const { eyebrow, heading, intro, items } = portfolio.skills;
const { projects, paths } = portfolio.work;
const HUE = Object.fromEntries(paths.map((p) => [p.id, p.hue])) as Record<string, string>;
const used = paths.flatMap((path) => projects.filter((p) => p.path === path.id && items.some((s) => s.proof.includes(p.title))));
const groups = [...new Set(items.map((s) => s.group))].map((g) => ({ g, skills: items.filter((s) => s.group === g) }));

type Pick = { kind: "skill" | "project"; key: string } | null;
type Edge = { skill: string; project: string; d: string; hue: string };

export default function Skills() {
  const board = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [chosen, setChosen] = useState<Pick>(null);
  const [near, setNear] = useState<Pick>(null);
  const pick = near ?? chosen;

  // Line geometry, measured when the board changes size and never on scroll.
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const at = (sel: string, side: "left" | "right") => {
        const r = el.querySelector(sel)!.getBoundingClientRect();
        return [Math.round(r[side] - box.left), Math.round(r.top - box.top + r.height / 2)];
      };
      setEdges(
        items.flatMap((s) =>
          s.proof.map((title) => {
            const [x1, y1] = at(`[data-skill="${slug(s.name)}"]`, "right");
            const [x2, y2] = at(`[data-proj="${slug(title)}"]`, "left");
            const c = (x2 - x1) * 0.55;
            return { skill: s.name, project: title, hue: HUE[projects.find((p) => p.title === title)!.path], d: `M${x1} ${y1}C${x1 + c} ${y1} ${x2 - c} ${y2} ${x2} ${y2}` };
          }),
        ),
      );
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lit = useMemo(() => {
    if (!pick) return null;
    if (pick.kind === "skill") return { skills: new Set([pick.key]), projects: new Set(items.find((s) => s.name === pick.key)?.proof) };
    return { skills: new Set(items.filter((s) => s.proof.includes(pick.key)).map((s) => s.name)), projects: new Set([pick.key]) };
  }, [pick]);

  const toggle = (p: NonNullable<Pick>) => setChosen((c) => (c?.kind === p.kind && c.key === p.key ? null : p));
  const hover = (p: NonNullable<Pick>) => ({
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setNear(p),
    onPointerLeave: () => setNear(null),
  });

  const status = !pick
    ? `${items.length} skills across ${used.length} projects`
    : pick.kind === "skill"
      ? `${pick.key}: ${[...lit!.projects].join(", ")}`
      : `${pick.key}: ${lit!.skills.size} ${lit!.skills.size === 1 ? "skill" : "skills"}`;

  return (
    <section id="skills" style={tone("violet")} className="sec-pad relative">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(05)" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SplitWords text={heading} className="h2 max-w-[12ch]" />
          <p data-reveal="" className="m-0 max-w-[42ch] text-[17px] leading-[1.6] text-muted lg:pb-3">
            {intro}
          </p>
        </div>

        <p aria-live="polite" className="sk-status mt-[clamp(32px,4vw,56px)] mb-3 flex min-h-14 items-center justify-between gap-4 bg-bg text-[17px] leading-[1.35] font-medium text-ink max-lg:sticky max-lg:top-0 max-lg:z-10 lg:justify-start">
          {status}
          {chosen && (
            <button type="button" onClick={() => setChosen(null)} className="sk-clear">
              Show all
            </button>
          )}
        </p>

        <div ref={board} className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,.62fr)_minmax(0,1fr)] lg:gap-0">
          <svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block">
            {edges.map((e) => {
              const on = lit ? lit.skills.has(e.skill) && lit.projects.has(e.project) : null;
              return <path key={e.skill + e.project} d={e.d} className="sk-line" data-on={on ?? undefined} data-off={on === false || undefined} stroke={e.hue} />;
            })}
          </svg>

          <div className="flex flex-col gap-6 lg:gap-4">
            {groups.map(({ g, skills }) => (
              <div key={g}>
                <h3 className="m-0 mb-1.5 text-[15px] font-medium text-dim">{g}</h3>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 lg:flex-col lg:gap-0">
                  {skills.map((s) => {
                    const p = { kind: "skill", key: s.name } as const;
                    return (
                      <li key={s.name}>
                        <button
                          type="button"
                          data-skill={slug(s.name)}
                          aria-pressed={chosen?.kind === "skill" && chosen.key === s.name}
                          data-lit={lit ? lit.skills.has(s.name) : undefined}
                          onClick={() => toggle(p)}
                          onFocus={(e) => e.target.matches(":focus-visible") && setNear(p)}
                          onBlur={() => setNear(null)}
                          {...hover(p)}
                          className="sk-skill"
                        >
                          {s.name}
                          <span className="text-dim tabular-nums">{s.proof.length}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <ul className="m-0 flex list-none flex-col justify-between gap-2 p-0 lg:col-start-3">
            {used.map((p) => {
              const k = { kind: "project", key: p.title } as const;
              return (
                <li key={p.title} className={lit && !lit.projects.has(p.title) && pick?.kind === "skill" ? "max-lg:hidden" : ""}>
                  <button
                    type="button"
                    data-proj={slug(p.title)}
                    data-lit={lit ? lit.projects.has(p.title) : undefined}
                    style={{ "--hue": HUE[p.path] } as React.CSSProperties}
                    onClick={() => store.set({ project: slug(p.title) })}
                    onFocus={(e) => e.target.matches(":focus-visible") && setNear(k)}
                    onBlur={() => setNear(null)}
                    {...hover(k)}
                    className="sk-proj"
                  >
                    <span aria-hidden className="size-2.5 flex-none rounded-full bg-[var(--hue)]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-display text-[19px] leading-tight font-[620] text-ink">{p.title}</span>
                      <span className="truncate text-[14px] text-muted">{p.category.replaceAll(" · ", ", ")}</span>
                    </span>
                    <span className="sk-open">Open</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
