import Image from "next/image";
import shot from "@/assets/projects/hireflow.jpg";
import { Layer, Scene } from "./Scene";

// Warm linen studio. The real HireFlow app floats as a dark window, while on
// the desk a stack of coral-edged index cards (candidates) fans out, the top
// card lifting toward the board, and an interview ticket stub, stamped
// "booked", leans against it. Light and tactile: the only paper-and-coral
// preview on the page.

const CORAL = "#ff4d2e";
const INK = "#231a16";
const MUTED = "#8b7b70";

const CARDS = [
  { n: "Data Analyst", c: "Tessera", s: "Applied", r: -7, x: -0.6, y: 2.4 },
  { n: "QA Engineer", c: "Meridian", s: "Applied", r: -2.5, x: 0.4, y: 1.2 },
  { n: "Backend Dev", c: "Quill", s: "Interview", r: 2, x: 1.2, y: 0 },
];

export default function HireFlow({ url }: { url: string }) {
  return (
    <Scene className="bg-[radial-gradient(120%_100%_at_15%_10%,#fbf7f1_0%,#f2ebe1_50%,#e6dccd_100%)]">
      {/* Linen grain + a soft coral wash from the right */}
      <Layer d={0.25} className="inset-0">
        <span className="absolute inset-0 opacity-70 [background-image:repeating-linear-gradient(0deg,rgb(120_90_60/.035)_0_1px,transparent_1px_3px),repeating-linear-gradient(90deg,rgb(120_90_60/.03)_0_1px,transparent_1px_4px)]" />
        <span className="pa-breathe absolute -right-[18%] -bottom-[40%] size-[70cqw] rounded-full bg-[radial-gradient(circle,rgb(255_77_46/.22),transparent_62%)]" />
      </Layer>

      {/* The real app, as a dark window on the light desk */}
      <Layer d={1} className="top-[9%] right-[4%] w-[66%]">
        <div className="overflow-hidden rounded-[1.4cqw] border border-black/40 bg-[#14100f] shadow-[0_3.4cqw_6cqw_-2cqw_rgb(60_30_15/.55),0_1cqw_2cqw_-1cqw_rgb(60_30_15/.4)] transition-transform duration-[1.2s] ease-expo [transform:perspective(160cqw)_rotateY(-9deg)_rotateX(3deg)] group-hover/shot:[transform:perspective(160cqw)_rotateY(-4deg)_rotateX(1deg)]">
          <div className="flex h-[3.1cqw] items-center gap-[.65cqw] border-b border-white/[.07] bg-[#1d1716] px-[1.3cqw]">
            <span className="size-[.8cqw] rounded-full bg-[#ff5f57]/85" />
            <span className="size-[.8cqw] rounded-full bg-[#febc2e]/85" />
            <span className="size-[.8cqw] rounded-full bg-[#28c840]/85" />
            <span className="mx-auto flex max-w-[70%] items-center gap-[.6cqw] truncate rounded-[.6cqw] bg-black/40 px-[1.4cqw] py-[.3cqw] font-mono text-[1.05cqw] text-[#e9d9cf]/80">
              <span className="size-[.65cqw] rounded-full" style={{ background: CORAL }} />
              {url}
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            <span className="pa-kenburns absolute inset-0 block">
              <Image
                src={shot}
                alt=""
                fill
                placeholder="blur"
                sizes="(min-width: 1080px) 32vw, 66vw"
                className="object-cover object-top transition-transform duration-[1.6s] ease-expo group-hover/shot:scale-[1.04]"
              />
            </span>
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgb(255_240_230/.14),transparent_32%)]" />
          </div>
        </div>
      </Layer>

      {/* Candidate index cards on the desk */}
      <Layer d={1.9} className="top-[30%] left-[6%] w-[27%]">
        <div className="relative">
          {CARDS.map((c, i) => (
            <div
              key={c.n}
              className={`${i === 0 ? "relative" : "absolute inset-x-0 top-0"} rounded-[.8cqw] border border-[#d9cbbb] bg-[#fffdf9] p-[1.2cqw] shadow-[0_1.4cqw_2.6cqw_-1.2cqw_rgb(80_50_30/.45)] ${i === CARDS.length - 1 ? "hf-lift" : ""}`}
              style={{ transform: `translate(${c.x}cqw, ${c.y}cqw) rotate(${c.r}deg)`, zIndex: i }}
            >
              <span className="absolute inset-x-0 top-0 h-[.5cqw] rounded-t-[.8cqw]" style={{ background: i === CARDS.length - 1 ? CORAL : "#e8c7b8" }} />
              <div className="flex items-center justify-between font-mono text-[.9cqw] tracking-[.14em] uppercase" style={{ color: MUTED }}>
                <span>Candidate</span>
                <span style={{ color: i === CARDS.length - 1 ? CORAL : MUTED }}>{c.s}</span>
              </div>
              <div className="mt-[.8cqw] font-display text-[2.1cqw] leading-[1.05] font-[700] tracking-[-.02em]" style={{ color: INK }}>
                {c.n}
              </div>
              <div className="mt-[.3cqw] text-[1.2cqw]" style={{ color: MUTED }}>
                {c.c} · Remote
              </div>
              <div className="mt-[1.1cqw] flex flex-col gap-[.55cqw]">
                <span className="h-px w-full bg-[#e7ddd1]" />
                <span className="h-px w-full bg-[#e7ddd1]" />
                <span className="h-px w-2/3 bg-[#e7ddd1]" />
              </div>
            </div>
          ))}
        </div>
      </Layer>

      {/* Interview ticket stub */}
      <Layer d={2.6} className="bottom-[6%] left-[30%] w-[18%]">
        <div className="pa-float relative overflow-hidden rounded-[.9cqw] bg-[#231a16] p-[1.2cqw] text-[#fbefe8] shadow-[0_1.8cqw_3.2cqw_-1.4cqw_rgb(60_30_15/.6)] [animation-delay:-2s]">
          <span className="absolute top-1/2 -left-[.9cqw] size-[1.8cqw] -translate-y-1/2 rounded-full bg-[#ece3d7]" />
          <span className="absolute top-1/2 -right-[.9cqw] size-[1.8cqw] -translate-y-1/2 rounded-full bg-[#ece3d7]" />
          <div className="font-mono text-[.85cqw] tracking-[.16em] uppercase opacity-60">Interview</div>
          <div className="mt-[.4cqw] font-display text-[2.4cqw] leading-none font-[720]">Thu 11:00</div>
          <div className="mt-[.8cqw] border-t border-dashed border-white/20 pt-[.7cqw] font-mono text-[.9cqw] opacity-70">no double booking</div>
          <span className="pa-stamp absolute top-[.8cqw] right-[1cqw] rotate-[-12deg] rounded-[.4cqw] border-[.2cqw] px-[.6cqw] py-[.1cqw] font-mono text-[.95cqw] font-bold tracking-[.12em] uppercase" style={{ borderColor: CORAL, color: CORAL }}>
            Booked
          </span>
        </div>
      </Layer>
    </Scene>
  );
}
