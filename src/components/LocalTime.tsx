"use client";

import { useEffect, useState } from "react";
import { portfolio } from "@/data/portfolio";

/** Ticking wall clock in the owner's timezone (renders a placeholder on the server). */
export default function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    let fmt: Intl.DateTimeFormat;
    const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: portfolio.timezone });
    } catch {
      fmt = new Intl.DateTimeFormat("en-GB", opts);
    }
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {time} {portfolio.tzLabel}
    </span>
  );
}
