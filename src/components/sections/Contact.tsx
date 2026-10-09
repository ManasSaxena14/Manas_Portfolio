"use client";

import { useRef, useState, type FormEvent } from "react";
import { portfolio } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";

const { eyebrow, heading, intro } = portfolio.contact;
const { email, socials } = portfolio;

type Field = "name" | "email" | "subject" | "message";
type Form = Record<Field, string>;

const FIELDS: { key: Exclude<Field, "message">; label: string; type: string; ph: string }[] = [
  { key: "name", label: "Name", type: "text", ph: "Your name" },
  { key: "email", label: "Email", type: "email", ph: "you@company.com" },
  { key: "subject", label: "Subject", type: "text", ph: "What is this about?" },
];

const inputCls =
  "peer w-full rounded-none border-0 border-b bg-transparent pt-2.5 pb-3 text-lg text-ink outline-none transition-[border-color] duration-300";

/** Amber underline that draws in from the left while its field has focus. */
const FocusLine = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute right-0 bottom-0 left-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-expo peer-focus:scale-x-100"
  />
);

export default function Contact() {
  const [form, setForm] = useState<Form>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number>(0);

  const set = (k: Field) => (e: { target: { value: string } }) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: "" }));
    if (status !== "idle" && status !== "sending") setStatus("idle");
  };

  const copy = () => {
    const done = () => {
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, done);
    else done();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) err.name = "Please add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) err.email = "Please add a valid email.";
    if (!form.message.trim()) err.message = "Please write a short message.";
    if (Object.keys(err).length) {
      setErrors(err);
      setStatus("idle");
      return;
    }

    setStatus("sending");
    const name = form.name.trim();
    const from = form.email.trim();
    const subject = form.subject.trim() || `Portfolio enquiry from ${name}`;
    const message = form.message.trim();

    // 1 · Deliver straight to the inbox (FormSubmit, no backend needed).
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email: from, _replyto: from, _subject: subject, message, _template: "table", _captcha: "false" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) === "true") {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
        return;
      }
    } catch {
      /* network or service issue: fall through to compose */
    }

    // 2 · Fallback: open a pre-filled draft (Gmail in the browser, else the mail app).
    const body = `${message}\n\n— ${name} (${from})`;
    const gmail =
      `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(email)}` +
      `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const win = window.open(gmail, "_blank");
    if (win) win.opener = null;
    else window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("error");
  };

  const borderFor = (k: Field) => ({ borderColor: errors[k] ? "var(--color-error)" : undefined });

  return (
    <section id="contact" data-ambient className="relative pt-[clamp(96px,13vw,180px)] pb-[clamp(48px,6vw,80px)]">
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(07)" />
        <SplitWords
          text={heading}
          className="mt-7 mb-0 max-w-[13ch] font-display text-[clamp(48px,8.6vw,148px)] leading-[.92] font-[560] [font-stretch:104%] tracking-[-.05em]"
        />

        <div className="mt-[clamp(48px,6vw,88px)] grid grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <p data-reveal="" className="m-0 max-w-[44ch] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-soft">
              {intro}
            </p>
            <div data-reveal="" className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={`mailto:${email}`}
                className="font-display text-[clamp(24px,2.8vw,40px)] font-[560] tracking-[-.03em] break-all underline decoration-line-strong decoration-1 underline-offset-8 transition-[color,text-decoration-color] duration-300 hover:decoration-accent"
              >
                {email}
              </a>
              <button
                type="button"
                onClick={copy}
                className="h-9 rounded-[10px] border border-line bg-transparent px-3.5 font-mono text-[11px] tracking-[.12em] text-chip uppercase transition-[background] duration-300 hover:bg-white/[.06]"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <ul data-reveal="" className="m-0 list-none border-b border-line p-0">
              {socials.map((s) => (
                <li key={s.label} className="border-t border-line">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="flex min-h-[68px] items-center gap-4 no-underline transition-[padding,color] duration-500 ease-expo hover:pl-3"
                  >
                    <span className="flex-1 text-[19px]">{s.label}</span>
                    <span className="font-mono text-[13px] text-dim">{s.handle}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form
            data-reveal=""
            noValidate
            onSubmit={submit}
            data-spotlight
            className="relative flex flex-col gap-[26px] rounded-[20px] border border-line-soft bg-surface p-[clamp(24px,3vw,44px)]"
          >
            {/* Breathing glow: the peak border + shadow, faded in and out by
                opacity alone so it runs on the compositor (see .form-glow). */}
            <span aria-hidden className="form-glow" />
            {FIELDS.map((f) => (
              <label key={f.key} className="flex flex-col gap-2">
                <span className="font-mono text-[11px] tracking-[.14em] text-muted uppercase">{f.label}</span>
                <span className="relative block">
                  <input
                    type={f.type}
                    name={f.key}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    placeholder={f.ph}
                    aria-invalid={!!errors[f.key]}
                    autoComplete={f.key === "subject" ? "off" : f.key}
                    className={`${inputCls} border-line-strong`}
                    style={borderFor(f.key)}
                  />
                  <FocusLine />
                </span>
                {errors[f.key] && <span className="text-[13px] text-error">{errors[f.key]}</span>}
              </label>
            ))}
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-[.14em] text-muted uppercase">Message</span>
              <span className="relative block">
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell me about the project, role or idea"
                  aria-invalid={!!errors.message}
                  className={`${inputCls} block resize-y border-line-strong`}
                  style={borderFor("message")}
                />
                <FocusLine />
              </span>
              {errors.message && <span className="text-[13px] text-error">{errors.message}</span>}
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-primary btn-lg px-7 disabled:opacity-60"
              >
                <RollLabel text={status === "sending" ? "Sending…" : "Send message"} />
                <Arrow dir="right" />
              </button>
              {status === "sent" && (
                <span
                  role="status"
                  className="flex items-center gap-2 text-sm text-soft"
                  style={{ animation: "rise .6s var(--ease-expo)" }}
                >
                  <span className="text-accent">✓</span> Message sent — I'll get back to you soon.
                </span>
              )}
              {status === "error" && (
                <span role="status" className="text-sm text-soft">
                  Couldn't send directly — a pre-filled email draft has opened instead.
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
