import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / .035) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-7 text-center">
        <span className="group inline-flex">
          <Mark size={52} />
        </span>
        <p className="m-0 font-mono text-xs tracking-[.16em] text-muted uppercase">Error 404 · signal lost</p>
        <h1 className="display m-0 text-[clamp(64px,14vw,180px)] leading-[.85] font-[700]">
          4<em className="serif-i">0</em>4
        </h1>
        <p className="m-0 max-w-[34ch] text-lg text-soft">This page drifted out of the galaxy. The rest of the portfolio is right where you left it.</p>
        <Link href="/" className="btn btn-primary">
          Back to the portfolio →
        </Link>
      </div>
    </main>
  );
}
