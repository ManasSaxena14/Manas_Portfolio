import Image from "next/image";
import type { CSSProperties } from "react";
import shot from "@/assets/projects/aura-roast.jpg";
import { Layer, Scene } from "./Scene";

// Espresso & caramel: the real storefront, tilted on a warm roastery glow,
// with the live order tracker and the AI barista floating in front.
const ROUTE = "M8 52 C 50 52, 62 20, 104 22 S 172 10, 212 12";

export default function Aura({ url }: { url: string }) {
  return (
    <Scene className="bg-[radial-gradient(120%_95%_at_90%_0%,#7b4a22_0%,#2e190b_42%,#120904_100%)]">
      <Layer d={0.35} className="inset-0">
        <span className="absolute -top-[34%] -right-[12%] size-[64cqw] rounded-full bg-[radial-gradient(circle,rgb(217_165_91/.34),transparent_62%)]" />
        <span className="absolute -bottom-[48%] -left-[16%] size-[56cqw] rounded-full bg-[radial-gradient(circle,rgb(166_86_32/.4),transparent_64%)]" />
        <span className="absolute inset-0 bg-[radial-gradient(rgb(255_236_210/.05)_1px,transparent_1.2px)] [background-size:2.2cqw_2.2cqw] [mask-image:radial-gradient(ellipse_at_30%_60%,#000,transparent_70%)]" />
      </Layer>

      {/* The storefront */}
      <Layer d={1} className="top-[12%] left-[22%] w-[73%]">
        <div className="overflow-hidden rounded-[1.3cqw] border border-[#d9a55b]/25 bg-[#0e0905] shadow-[0_3cqw_7cqw_-1.5cqw_rgb(0_0_0/.75)] transition-transform duration-[1.2s] ease-expo [transform:perspective(150cqw)_rotateY(-11deg)_rotateX(4deg)] group-hover/shot:[transform:perspective(150cqw)_rotateY(-5deg)_rotateX(2deg)]">
          <div className="flex h-[3.3cqw] items-center gap-[.7cqw] border-b border-white/10 bg-[#1b120a] px-[1.4cqw]">
            <span className="size-[.85cqw] rounded-full bg-[#ff5f57]/80" />
            <span className="size-[.85cqw] rounded-full bg-[#febc2e]/80" />
            <span className="size-[.85cqw] rounded-full bg-[#28c840]/80" />
            <span className="mx-auto flex max-w-[70%] items-center gap-[.6cqw] truncate rounded-[.6cqw] bg-black/40 px-[1.5cqw] py-[.35cqw] font-mono text-[1.1cqw] text-[#d8c3a5]/85">
              <span className="size-[.7cqw] rounded-full bg-[#9be38a]" />
              {url}
            </span>
          </div>
          <div className="relative aspect-[16/10]">
            <Image
              src={shot}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1080px) 34vw, 70vw"
              className="object-cover object-top transition-transform duration-[1.6s] ease-expo group-hover/shot:scale-[1.04]"
            />
          </div>
        </div>
      </Layer>

      {/* Loyalty tier */}
      <Layer d={1.8} className="top-[4.5%] right-[4%]">
        <div className="pa-float flex items-center gap-[.7cqw] rounded-full border border-[#d9a55b]/40 bg-[#1f140b]/95 px-[1.4cqw] py-[.7cqw] font-mono text-[1.15cqw] tracking-[.08em] text-[#f0c987] uppercase shadow-[0_1.4cqw_3cqw_-1cqw_rgb(0_0_0/.7)] [animation-delay:-1.5s]">
          <span className="text-[1.4cqw]">★</span> Gold tier · 1,240 pts
        </div>
      </Layer>

      {/* Live order tracking */}
      <Layer d={2} className="top-[17%] left-[3.5%] w-[30%]">
        <div className="pa-float rounded-[1.3cqw] border border-[#d9a55b]/25 bg-[linear-gradient(160deg,rgb(58_36_19/.96),rgb(26_16_9/.97))] p-[1.5cqw] shadow-[0_2.6cqw_5cqw_-1.6cqw_rgb(0_0_0/.8)]">
          <div className="flex items-center justify-between font-mono text-[1.02cqw] tracking-[.12em] text-[#c9b08f] uppercase">
            <span>Order · AT-48K2</span>
            <span className="flex items-center gap-[.5cqw] text-[#9be38a]">
              <i className="pa-blink size-[.7cqw] rounded-full bg-[#9be38a]" />
              Live
            </span>
          </div>
          <div className="mt-[.9cqw] font-display text-[2.3cqw] leading-none font-[640] tracking-[-.03em] text-[#fbf3e6]">
            Out for delivery
          </div>
          <svg viewBox="0 0 220 64" className="mt-[1.1cqw] w-full overflow-visible" aria-hidden>
            <path d={ROUTE} stroke="#d9a55b" strokeOpacity=".22" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d={ROUTE} stroke="#d9a55b" strokeWidth="2" strokeDasharray="5 5" fill="none" className="pa-dash" />
            <circle cx="8" cy="52" r="4.5" fill="#120904" stroke="#d9a55b" strokeWidth="2" />
            <circle cx="212" cy="12" r="5" fill="#d9a55b" />
            <circle cx="212" cy="12" r="5" fill="none" stroke="#d9a55b" strokeWidth="1.5" className="pa-ping" />
            <circle r="4.5" fill="#fbf3e6" className="pa-courier" style={{ offsetPath: `path("${ROUTE}")` } as CSSProperties} />
          </svg>
          <div className="mt-[.7cqw] flex justify-between font-mono text-[1cqw] text-[#a8906f]">
            <span>Roastery</span>
            <span className="text-[#f0c987]">ETA 6 min</span>
          </div>
        </div>
      </Layer>

      {/* AI barista */}
      <Layer d={2.6} className="bottom-[5.5%] left-[6%] w-[37%]">
        <div className="pa-float rounded-[1.4cqw] border border-white/10 bg-[linear-gradient(170deg,rgb(36_23_13/.97),rgb(18_11_6/.98))] p-[1.5cqw] shadow-[0_3cqw_6cqw_-2cqw_rgb(0_0_0/.85)] [animation-delay:-3s]">
          <div className="flex items-center gap-[.9cqw]">
            <span className="grid size-[2.7cqw] place-items-center rounded-full bg-[#d9a55b] font-mono text-[1.05cqw] font-bold text-[#1a0f07]">AI</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[1.4cqw] font-[620] text-[#fbf3e6]">AI Barista</span>
              <span className="font-mono text-[.95cqw] tracking-[.08em] text-[#a8906f] uppercase">LLaMA 3.3 · tool calling</span>
            </span>
          </div>
          <div className="mt-[1.1cqw] ml-auto w-fit max-w-[80%] rounded-[1cqw] rounded-br-[.3cqw] bg-white/[.08] px-[1.1cqw] py-[.7cqw] text-[1.25cqw] leading-snug text-[#e9dcc9]">
            Something smooth, low acidity?
          </div>
          <div className="mt-[.7cqw] w-fit max-w-[90%] rounded-[1cqw] rounded-bl-[.3cqw] border border-[#d9a55b]/35 bg-[#d9a55b]/[.13] px-[1.1cqw] py-[.7cqw] text-[1.25cqw] leading-snug text-[#fbf3e6]">
            Try the Monsooned Malabar flat white ☕
          </div>
          <div className="mt-[.9cqw] flex items-center gap-[.6cqw] font-mono text-[.95cqw] text-[#9be38a]">
            <span>✓ search_catalogue</span>
            <span className="text-[#6f5a41]">·</span>
            <span>✓ add_to_cart</span>
            <span className="pa-typing ml-auto flex gap-[.35cqw]">
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
            </span>
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
