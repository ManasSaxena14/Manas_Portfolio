"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/*
 * The Process story's one picture: an interviewer's calendar that changes as
 * the steps go by. Two bookings collide at 11:00, a rule removes one, the API
 * answers, then 20 requests race for the slot and only one gets it. The rule,
 * the error code and the 1-of-20 result are HireFlow's own (migration
 * 006_scheduling.sql and scheduler.test.ts).
 */

const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
const SLOT = 2; // 11:00
const RACERS = 20;
const CHECKS = ["Lint and types", "Migrations up, down, up", "441 tests", "Production build"];

type Race = { phase: "idle" | "running" | "done"; winner: number };

export default function BookingStage({ step }: { step: number }) {
  const slot = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const anims = useRef<Animation[]>([]);
  const timer = useRef(0);
  const [race, setRace] = useState<Race>({ phase: "idle", winner: -1 });

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
  }, []);

  // Everyone heads for 11:00. One goes in; the rest are turned back.
  const run = useCallback(() => {
    stop();
    const winner = Math.floor(Math.random() * RACERS);
    const target = slot.current?.getBoundingClientRect();
    if (!target || prefersReducedMotion()) {
      setRace({ phase: "done", winner });
      return;
    }
    setRace({ phase: "running", winner });
    dots.current.forEach((dot, i) => {
      if (!dot) return;
      const r = dot.getBoundingClientRect();
      const dx = target.left + target.width / 2 - r.left - r.width / 2;
      const dy = target.top + target.height / 2 - r.top - r.height / 2;
      const there = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      const frames: Keyframe[] =
        i === winner
          ? [{ transform: "none" }, { transform: there, opacity: 1, offset: 0.55 }, { transform: there, opacity: 0 }]
          : [{ transform: "none" }, { transform: `${there} scale(.9)`, offset: 0.55 }, { transform: "none" }];
      anims.current.push(
        dot.animate(frames, { duration: 1100, delay: (i * 37) % 180, easing: "cubic-bezier(.77,0,.175,1)", fill: i === winner ? "forwards" : "none" }),
      );
    });
    timer.current = window.setTimeout(() => setRace({ phase: "done", winner }), 760);
  }, [stop]);

  // The race runs when its step arrives, and resets when the reader leaves it.
  useEffect(() => {
    if (step !== 3) {
      stop();
      setRace({ phase: "idle", winner: -1 });
      return;
    }
    const t = window.setTimeout(run, 450);
    return () => window.clearTimeout(t);
  }, [step, run, stop]);

  useEffect(() => stop, [stop]);

  const raceDone = race.phase === "done";
  const booked = step === 1 || step === 2 || step === 4 || (step === 3 && raceDone);
  const clash = step === 0;

  return (
    <div className="bs flex h-full flex-col overflow-hidden rounded-[18px]">
      <div className="flex items-baseline justify-between px-[clamp(14px,2vw,26px)] pt-[clamp(12px,1.8vw,22px)] pb-2">
        <span className="font-display text-[clamp(19px,2vw,28px)] leading-none font-[680] tracking-[-.02em]">Thursday</span>
        <span className="text-[13px] text-[var(--bs-muted)]">One interviewer</span>
      </div>

      {/* Calendar */}
      <div className="relative flex min-h-0 flex-1 flex-col px-[clamp(14px,2vw,26px)]">
        {HOURS.map((h, i) => (
          <div key={h} className={`min-h-0 flex-1 border-t border-[var(--bs-line)] ${i < 1 || i > 3 ? "hidden lg:flex" : "flex"}`}>
            <span className={`w-[52px] flex-none pt-1.5 text-[12.5px] tabular-nums ${i === SLOT ? "font-semibold text-[var(--bs-ink)]" : "text-[var(--bs-muted)]"}`}>{h}</span>
            <div ref={i === SLOT ? slot : undefined} className="relative min-w-0 flex-1 py-1">
              {(i === 0 || i === 4) && <Block tone="busy" label="Interview" />}
              {i === SLOT && (
                <>
                  <span className="absolute inset-y-1 inset-x-0 rounded-[8px] border border-dashed border-[var(--bs-line-strong)]" />
                  <span className={`bs-block absolute inset-y-1 left-0 ${clash ? "right-[36%] opacity-100" : booked ? "right-0 opacity-100" : "right-0 scale-[.97] opacity-0"}`}>
                    <Block tone={clash ? "clash" : "ok"} label={clash ? "Recruiter" : "Booked"} />
                  </span>
                  <span className={`bs-block absolute inset-y-1 right-0 left-[36%] ${clash ? "opacity-100" : "translate-x-6 scale-[.97] opacity-0"}`}>
                    <Block tone="clash" label="Candidate" end />
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* What is happening, one panel per step */}
      <div className="relative h-[46%] flex-none border-t border-[var(--bs-line)] bg-[var(--bs-panel)] lg:h-[36%]">
        <Panel on={step === 0}>
          <p className="m-0 font-display text-[clamp(22px,2.6vw,38px)] leading-[1.05] font-[680] tracking-[-.02em] text-[var(--bs-bad-ink)]">Booked twice</p>
          <p className="m-0 mt-2 max-w-[34ch] text-[15px] leading-[1.5] lg:text-[17px] text-[var(--bs-muted)]">Both people were told yes. Only one can be right.</p>
        </Panel>

        <Panel on={step === 1}>
          <p className="m-0 mb-2.5 text-[13px] text-[var(--bs-muted)]">006_scheduling.sql</p>
          <pre className="m-0 overflow-x-auto font-mono text-[clamp(12px,1.2vw,17px)] leading-[1.65] text-[var(--bs-ink)]">
            <code>
              {"CONSTRAINT no_interviewer_overlap\n"}
              <mark className="bs-mark">EXCLUDE USING gist</mark>
              {"\n  (interviewer_id WITH =,\n   during WITH &&)\nWHERE (status = 'scheduled')"}
            </code>
          </pre>
        </Panel>

        <Panel on={step === 2}>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            <Answer who="First request" code="201" text="Interview booked" ok />
            <Answer who="Second request" code="409" text="SLOT_TAKEN" />
          </ul>
        </Panel>

        <Panel on={step === 3}>
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="grid grid-cols-10 gap-[clamp(5px,.7vw,9px)]">
              {Array.from({ length: RACERS }, (_, i) => {
                const state = raceDone ? (i === race.winner ? "won" : "lost") : "wait";
                return (
                  <span
                    key={i}
                    ref={(el) => {
                      dots.current[i] = el;
                    }}
                    data-state={state}
                    className="bs-dot grid aspect-square place-items-center rounded-full text-[clamp(8.5px,.8vw,11px)] font-semibold tabular-nums"
                  >
                    {state === "lost" ? "409" : state === "won" ? "201" : i + 1}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p aria-live="polite" className="m-0 text-[clamp(15px,1.3vw,19px)] font-semibold text-[var(--bs-ink)]">
                {raceDone ? "1 booked, 19 refused" : "20 requests, one slot"}
              </p>
              <button type="button" onClick={run} disabled={race.phase === "running"} className="bs-btn">
                Run the race again
              </button>
            </div>
          </div>
        </Panel>

        <Panel on={step === 4}>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-[clamp(5px,1.2svh,10px)] p-0 md:grid-cols-2">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-center gap-2.5 text-[15px] text-[var(--bs-ink)] lg:text-[17px]">
                <svg viewBox="0 0 20 20" className="size-5 flex-none" aria-hidden>
                  <circle cx="10" cy="10" r="10" fill="var(--bs-ok)" />
                  <path d="M5.8 10.3l2.8 2.8 5.6-6" fill="none" stroke="#16181d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
          <p className="m-0 mt-[clamp(6px,1.4svh,16px)] text-[15px] font-semibold text-[var(--bs-ink)] lg:text-[17px]">Live on Vercel and Render</p>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!on}
      inert={!on}
      className={`bs-panel absolute inset-0 px-[clamp(14px,2vw,26px)] py-[clamp(12px,1.6vw,22px)] ${on ? "opacity-100" : "translate-y-2 opacity-0"}`}
    >
      {children}
    </div>
  );
}

function Block({ tone, label, end }: { tone: "busy" | "ok" | "clash"; label: string; end?: boolean }) {
  return (
    <span data-tone={tone} className={`bs-fill flex h-full items-center rounded-[8px] px-3 text-[13px] font-semibold ${end ? "justify-end" : ""}`}>
      <span className="truncate">{label}</span>
    </span>
  );
}

function Answer({ who, code, text, ok }: { who: string; code: string; text: string; ok?: boolean }) {
  return (
    <li className="flex items-center gap-3.5 rounded-[10px] border border-[var(--bs-line)] bg-[var(--bs-sheet)] px-3.5 py-2.5">
      <span className={`flex-none rounded-[6px] px-2 py-0.5 font-mono text-[13px] font-semibold text-[#16181d] ${ok ? "bg-[var(--bs-ok)]" : "bg-[var(--bs-bad)]"}`}>{code}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] font-semibold text-[var(--bs-ink)]">{text}</span>
        <span className="text-[13px] text-[var(--bs-muted)]">{who}</span>
      </span>
    </li>
  );
}
