"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { fullName, portfolio, slug } from "@/data/portfolio";
import { store, useStore } from "@/lib/store";

/*
 * Quick search (Cmd/Ctrl+K or "/") and the 30-second summary. Both are native
 * <dialog>s, so focus trapping, Escape and the backdrop come from the browser.
 */

const { nav, socials, email, resumeUrl, brief, work } = portfolio;
const HUE = Object.fromEntries(work.paths.map((p) => [p.id, p.hue])) as Record<string, string>;

const close = () => store.set({ dialog: null });

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    return false;
  }
}

export default function Dialogs() {
  const which = useStore((s) => s.dialog);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!store.get().loaderDone) return;
      const typing = (e.target as Element | null)?.closest?.("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        store.set({ dialog: store.get().dialog === "search" ? null : "search", menuOpen: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (which === "search") return <Search />;
  if (which === "brief") return <Brief />;
  return null;
}

function Shell({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const opener = document.activeElement as HTMLElement | null;
    if (!d.open) d.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
      // Give focus back once the dialog has really gone.
      queueMicrotask(() => !d.isConnected && !d.contains(opener) && opener?.focus({ preventScroll: true }));
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={close}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      data-lenis-prevent
      className={`dlg ${className}`}
    >
      {children}
    </dialog>
  );
}

/* ───────────── quick search ───────────── */

type Item = { group: string; title: string; hint: string; text: string; hue?: string; run: () => void | Promise<void> };

const go = (id: string) => {
  close();
  requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)?.click());
};
const open = (href: string) => {
  close();
  window.open(href, "_blank", "noopener");
};

function Search() {
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const [note, setNote] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const uid = useId();

  const all = useMemo<Item[]>(() => {
    const skillsOf = (t: string) => portfolio.skills.items.filter((s) => s.proof.includes(t)).map((s) => s.name).join(" ");
    return [
      ...work.projects.map((p) => ({
        group: "Projects",
        title: p.title,
        hint: p.tagline,
        text: `${p.title} ${p.category} ${p.tagline} ${p.stack.join(" ")} ${skillsOf(p.title)}`,
        hue: HUE[p.path],
        run: () => store.set({ dialog: null, project: slug(p.title) }),
      })),
      ...nav.map((l) => ({ group: "Go to", title: l.label, hint: "Section", text: `${l.label} section`, run: () => go(l.href.slice(1)) })),
      { group: "Actions", title: "Read the 30-second summary", hint: "For recruiters", text: "summary brief recruiter hire about", run: () => store.set({ dialog: "brief" }) },
      { group: "Actions", title: "Open the resume", hint: "PDF", text: "resume cv pdf download", run: () => open(resumeUrl) },
      {
        group: "Actions",
        title: "Copy email address",
        hint: email,
        text: "copy email contact mail",
        run: async () => setNote((await copyEmail()) ? "Email address copied" : `Copy didn't work. The address is ${email}`),
      },
      ...socials.map((s) => ({ group: "Actions", title: `Open ${s.label}`, hint: s.handle, text: `${s.label} ${s.handle} profile`, run: () => open(s.href) })),
    ];
  }, []);

  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((i) => words.every((w) => i.text.toLowerCase().includes(w)));
  }, [q, all]);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [at, hits]);

  return (
    <Shell label="Search this site" className="dlg-search">
      <div className="flex items-center gap-3 border-b border-line px-5">
        <svg viewBox="0 0 20 20" className="size-5 flex-none text-muted" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.2 13.2L17 17" />
        </svg>
        <input
          autoFocus
          role="combobox"
          aria-expanded
          aria-controls={`${uid}-l`}
          aria-activedescendant={hits[at] ? `${uid}-${at}` : undefined}
          aria-label="Search projects, skills and sections"
          placeholder="Search projects, skills, sections"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAt(0);
            setNote("");
          }}
          onKeyDown={(e) => {
            if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key) || e.nativeEvent.isComposing) return;
            e.preventDefault();
            if (e.key === "Enter") hits[at]?.run();
            else if (hits.length) setAt((a) => (a + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length);
          }}
          className="h-16 min-w-0 flex-1 border-0 bg-transparent text-[18px] text-ink"
        />
        <button type="button" onClick={close} className="dlg-x">
          Close
        </button>
      </div>
      <ul ref={list} id={`${uid}-l`} role="listbox" aria-label="Results" className="m-0 max-h-[min(58svh,480px)] list-none overflow-y-auto overscroll-contain p-2">
        {hits.map((it, i) => (
          <li key={it.group + it.title} role="presentation">
            {it.group !== hits[i - 1]?.group && <p className="m-0 px-3 pt-3 pb-1.5 text-[14px] text-dim">{it.group}</p>}
            <div
              id={`${uid}-${i}`}
              role="option"
              aria-selected={i === at}
              onPointerMove={() => i !== at && setAt(i)}
              onClick={() => it.run()}
              className="dlg-opt"
            >
              {it.hue && <span aria-hidden className="size-2.5 flex-none rounded-full" style={{ background: it.hue }} />}
              <span className="flex-none font-medium text-ink">{it.title}</span>
              <span className="min-w-0 flex-1 truncate text-right text-[14px] text-dim">{it.hint}</span>
            </div>
          </li>
        ))}
        {!hits.length && <li className="px-3 py-8 text-muted">Nothing matches “{q}”. Try a skill such as PostgreSQL, or a project name.</li>}
      </ul>
      <p aria-live="polite" className="m-0 flex min-h-12 items-center border-t border-line px-5 text-[14px] text-muted">
        {note || (
          <>
            {hits.length} {hits.length === 1 ? "result" : "results"}
            <span className="hidden fine:inline">. Arrow keys to move, Enter to open.</span>
          </>
        )}
      </p>
    </Shell>
  );
}

/* ───────────── 30-second summary ───────────── */

function Brief() {
  const [copied, setCopied] = useState<"" | "yes" | "no">("");
  return (
    <Shell label={brief.title} className="dlg-brief">
      <div className="flex items-start justify-between gap-6">
        <h2 className="display m-0 text-[clamp(30px,4vw,48px)] leading-[1] font-[660]">{brief.title}</h2>
        <button type="button" onClick={close} className="dlg-x" autoFocus>
          Close
        </button>
      </div>
      <dl className="m-0 mt-7 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-[16px] leading-[1.5]">
        {brief.lines.map((l) => (
          <div key={l.k} className="contents">
            <dt className="text-dim">{l.k}</dt>
            <dd className="m-0 text-ink-2">{l.v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="m-0 mt-8 mb-1 text-[16px] font-medium text-dim">Start with these three</h3>
      <ul className="m-0 list-none p-0">
        {brief.picks.map((p) => {
          const proj = work.projects.find((x) => x.title === p.title);
          return (
            <li key={p.title}>
              <button type="button" onClick={() => store.set({ dialog: null, project: slug(p.title) })} className="dlg-pick">
                <span aria-hidden className="mt-2 size-2.5 flex-none rounded-full" style={{ background: proj && HUE[proj.path] }} />
                <span>
                  <span className="block font-display text-[21px] leading-tight font-[640] text-ink">{p.title}</span>
                  <span className="mt-1 block text-[16px] leading-[1.5] text-muted">{p.why}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-7 flex flex-wrap gap-2.5">
        <a href={resumeUrl} target="_blank" rel="noopener" className="btn btn-primary">
          Open resume
        </a>
        <button type="button" onClick={async () => setCopied((await copyEmail()) ? "yes" : "no")} className="btn btn-secondary">
          {copied === "yes" ? "Email copied" : "Copy email"}
        </button>
        <a href={socials.find((s) => s.label === "LinkedIn")?.href} target="_blank" rel="noopener" className="btn btn-secondary">
          LinkedIn
        </a>
      </div>
      <p aria-live="polite" className="m-0 mt-3 min-h-6 text-[15px] text-muted">
        {copied === "no" ? `Copy didn't work. The address is ${email}` : copied === "yes" ? `${fullName}, ${email}` : ""}
      </p>
    </Shell>
  );
}
