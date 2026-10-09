import Image from "next/image";
import type { CSSProperties } from "react";
import shot from "@/assets/projects/aura-roast.jpg";
import { Layer, Scene } from "./Scene";

// Espresso & caramel: the real storefront on a roastery glow, a phone tracking
// the courier live, a steaming latte, and the AI barista chatting in sequence.
const ROUTE = "M10 88 C 28 88, 30 62, 48 56 S 76 40, 70 26 S 84 14, 90 12";

// Beans on a slow orbit behind the scene: [angle°, radius cqw, size cqw]
const ORBIT: [number, number, number][] = [
  [10, 44, 4.2], [62, 40, 3], [118, 47, 3.8], [170, 42, 2.8], [224, 46, 4.4], [286, 41, 3.2], [330, 48, 3.6],
];

function Bean({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 32" style={{ width: `${size}cqw` }} className="block drop-shadow-[0_.8cqw_.8cqw_rgb(0_0_0/.5)]" aria-hidden>
      <ellipse cx="12" cy="16" rx="10" ry="14" fill="#3a1f0d" />
      <ellipse cx="9" cy="11" rx="4" ry="7" fill="#6b3d1b" fillOpacity=".7" />
      <path d="M12 3 C 7 11, 17 21, 12 29" stroke="#120904" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Aura({ url }: { url: string }) {
  return (
    <Scene className="bg-[radial-gradient(120%_95%_at_90%_0%,#7b4a22_0%,#2e190b_42%,#120904_100%)]">
      <Layer d={0.35} className="inset-0">
        <span className="pa-breathe absolute -top-[34%] -right-[12%] size-[64cqw] rounded-full bg-[radial-gradient(circle,rgb(217_165_91/.34),transparent_62%)]" />
        <span className="absolute -bottom-[48%] -left-[16%] size-[56cqw] rounded-full bg-[radial-gradient(circle,rgb(166_86_32/.4),transparent_64%)]" />
        <span className="absolute inset-0 bg-[radial-gradient(rgb(255_236_210/.05)_1px,transparent_1.2px)] [background-size:2.2cqw_2.2cqw] [mask-image:radial-gradient(ellipse_at_30%_60%,#000,transparent_70%)]" />
      </Layer>

      {/* Beans orbiting the whole scene */}
      <Layer d={0.8} className="inset-0">
        <span className="pa-orbit absolute top-[52%] left-[56%] block size-0">
          {ORBIT.map(([a, r, sz]) => (
            <span key={a} className="absolute top-0 left-0 block" style={{ transform: `rotate(${a}deg) translateX(${r}cqw) rotate(${-a + 40}deg)` }}>
              <Bean size={sz} />
            </span>
          ))}
        </span>
      </Layer>

      {/* The storefront */}
      <Layer d={1} className="top-[10%] left-[25%] w-[71%]">
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
          <div className="relative aspect-[16/10] overflow-hidden">
            <span className="pa-kenburns absolute inset-0 block">
              <Image
                src={shot}
                alt=""
                fill
                placeholder="blur"
                sizes="(min-width: 1080px) 34vw, 70vw"
                className="object-cover object-top [filter:saturate(1.14)_contrast(1.06)_brightness(1.03)] transition-transform duration-[1.6s] ease-expo group-hover/shot:scale-[1.04]"
              />
            </span>
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(18_9_4/.55))]" />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgb(255_244_222/.2),transparent_30%)]" />
          </div>
        </div>
      </Layer>

      {/* Loyalty tier, earning points */}
      <Layer d={1.8} className="top-[4.5%] right-[4%]">
        <div className="pa-float relative flex items-center gap-[.7cqw] rounded-full border border-[#d9a55b]/40 bg-[#1f140b]/95 px-[1.4cqw] py-[.7cqw] font-mono text-[1.15cqw] tracking-[.08em] text-[#f0c987] uppercase shadow-[0_1.4cqw_3cqw_-1cqw_rgb(0_0_0/.7)] [animation-delay:-1.5s]">
          <span className="text-[1.4cqw]">★</span> Gold tier · 1,240 pts
          <span className="pa-pop-up absolute -top-[1.2cqw] right-[1.2cqw] rounded-full bg-[#9be38a] px-[.8cqw] py-[.15cqw] text-[1cqw] font-bold text-[#0d2410]">+20</span>
        </div>
      </Layer>

      {/* Phone: live courier tracking */}
      <Layer d={2} className="top-[8%] left-[3.5%] w-[16.5cqw]">
        <div className="pa-float rounded-[2.2cqw] border border-[#d9a55b]/35 bg-[#120a05] p-[.7cqw] shadow-[0_3cqw_6cqw_-1.6cqw_rgb(0_0_0/.85)]">
          <div className="overflow-hidden rounded-[1.6cqw] bg-[linear-gradient(170deg,#2a190c,#160d06)]">
            <div className="mx-auto mt-[.7cqw] h-[.7cqw] w-[4.4cqw] rounded-full bg-black/70" />
            <div className="relative mt-[.7cqw] aspect-square overflow-hidden bg-[#1d1209]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
                {/* city blocks + roads */}
                {[
                  [4, 4, 26, 22], [36, 4, 24, 14], [66, 6, 28, 20], [4, 32, 18, 24], [30, 26, 22, 22],
                  [58, 34, 14, 20], [78, 34, 18, 28], [6, 64, 30, 14], [42, 62, 22, 18], [70, 70, 24, 22],
                ].map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#2c1a0d" />
                ))}
                {[30, 62, 94].map((v) => (
                  <line key={`v${v}`} x1={v} x2={v} y1="0" y2="100" stroke="#3a2412" strokeWidth="1.2" />
                ))}
                {[28, 58, 82].map((v) => (
                  <line key={`h${v}`} x1="0" x2="100" y1={v} y2={v} stroke="#3a2412" strokeWidth="1.2" />
                ))}
                <path d={ROUTE} stroke="#d9a55b" strokeOpacity=".25" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d={ROUTE} stroke="#f0c987" strokeWidth="1.8" strokeDasharray="4 4" fill="none" className="pa-dash" />
                <circle cx="10" cy="88" r="3.4" fill="#120904" stroke="#d9a55b" strokeWidth="1.6" />
                <circle cx="90" cy="12" r="4" fill="#d9a55b" />
                <circle cx="90" cy="12" r="4" fill="none" stroke="#d9a55b" strokeWidth="1.2" className="pa-ping" />
                <circle r="6" fill="#d9a55b" fillOpacity=".3" className="pa-courier" style={{ offsetPath: `path("${ROUTE}")` } as CSSProperties} />
                <circle r="3.2" fill="#fbf3e6" className="pa-courier" style={{ offsetPath: `path("${ROUTE}")` } as CSSProperties} />
              </svg>
            </div>
            <div className="p-[1.1cqw]">
              <div className="flex items-center justify-between font-mono text-[.85cqw] tracking-[.12em] text-[#c9b08f] uppercase">
                <span>AT-48K2</span>
                <span className="flex items-center gap-[.4cqw] text-[#9be38a]">
                  <i className="pa-blink size-[.55cqw] rounded-full bg-[#9be38a]" /> Live
                </span>
              </div>
              <div className="mt-[.5cqw] font-display text-[1.7cqw] leading-none font-[640] tracking-[-.02em] text-[#fbf3e6]">Out for delivery</div>
              <div className="mt-[.9cqw] h-[.45cqw] overflow-hidden rounded-full bg-white/10">
                <span className="pa-progress block h-full w-full rounded-full bg-[linear-gradient(90deg,#d9a55b,#f0c987)]" />
              </div>
              <div className="mt-[.6cqw] flex justify-between font-mono text-[.8cqw] tracking-[.06em] text-[#a8906f] uppercase">
                <span>Roasted</span>
                <span>Brewed</span>
                <span className="text-[#f0c987]">ETA 6 min</span>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* AI barista: the conversation plays out in sequence */}
      <Layer d={2.6} className="bottom-[5.5%] left-[6%] w-[37%]">
        <div className="pa-float rounded-[1.4cqw] border border-white/10 bg-[linear-gradient(170deg,rgb(36_23_13/.97),rgb(18_11_6/.98))] p-[1.5cqw] shadow-[0_3cqw_6cqw_-2cqw_rgb(0_0_0/.85)] [animation-delay:-3s]">
          <div className="flex items-center gap-[.9cqw]">
            <span className="grid size-[2.7cqw] place-items-center rounded-full bg-[#d9a55b] font-mono text-[1.05cqw] font-bold text-[#1a0f07]">AI</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[1.4cqw] font-[620] text-[#fbf3e6]">AI Barista</span>
              <span className="font-mono text-[.95cqw] tracking-[.08em] text-[#a8906f] uppercase">LLaMA 3.3 · tool calling</span>
            </span>
            <span className="pa-typing ml-auto flex gap-[.35cqw]">
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
              <i className="size-[.55cqw] rounded-full bg-[#d9a55b]" />
            </span>
          </div>
          <div className="pa-msg mt-[1.1cqw] ml-auto w-fit max-w-[80%] rounded-[1cqw] rounded-br-[.3cqw] bg-white/[.08] px-[1.1cqw] py-[.7cqw] text-[1.25cqw] leading-snug text-[#e9dcc9]">
            Something smooth, low acidity?
          </div>
          <div className="pa-msg mt-[.7cqw] w-fit max-w-[90%] rounded-[1cqw] rounded-bl-[.3cqw] border border-[#d9a55b]/35 bg-[#d9a55b]/[.13] px-[1.1cqw] py-[.7cqw] text-[1.25cqw] leading-snug text-[#fbf3e6] [animation-delay:1.1s]">
            Try the Monsooned Malabar flat white ☕
          </div>
          <div className="pa-msg mt-[.9cqw] flex items-center gap-[.6cqw] font-mono text-[.95cqw] text-[#9be38a] [animation-delay:2.2s]">
            <span>✓ search_catalogue</span>
            <span className="text-[#6f5a41]">·</span>
            <span>✓ add_to_cart</span>
          </div>
        </div>
      </Layer>

      {/* A steaming flat white */}
      <Layer d={2.9} className="right-[6%] bottom-[2%] w-[12cqw]">
        <svg viewBox="0 0 90 84" className="block w-full overflow-visible drop-shadow-[0_2cqw_2cqw_rgb(0_0_0/.55)]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${32 + i * 14} 30 C ${24 + i * 14} 20, ${40 + i * 14} 12, ${32 + i * 14} 0 S ${38 + i * 14} -14, ${32 + i * 14} -24`}
              stroke="#f3dcb8"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              className="pa-steam"
              style={{ animationDelay: `${-i * 1.5}s` }}
            />
          ))}
          <ellipse cx="45" cy="74" rx="40" ry="8" fill="#e6cfa8" />
          <ellipse cx="45" cy="72" rx="40" ry="8" fill="#f6e8cf" />
          <path d="M70 40 C 88 38, 88 62, 68 60" stroke="#f3e3c8" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M14 34 H76 V46 C76 62 64 72 45 72 C26 72 14 62 14 46 Z" fill="#f3e3c8" />
          <path d="M20 40 V46 C20 56 26 64 34 68" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="45" cy="34" rx="31" ry="7" fill="#6a3a1b" />
          <ellipse cx="45" cy="34" rx="25" ry="5" fill="#c9965a" />
          <path d="M45 38 C 34 31, 38 27, 45 31 C 52 27, 56 31, 45 38 Z" fill="#fbf3e6" />
        </svg>
      </Layer>

      {/* Café coverage */}
      <Layer d={2.2} className="right-[21%] bottom-[5%]">
        <div className="flex items-center gap-[.8cqw] rounded-[1cqw] border border-[#d9a55b]/30 bg-[#1f140b]/95 px-[1.3cqw] py-[.8cqw] shadow-[0_1.4cqw_3cqw_-1cqw_rgb(0_0_0/.7)]">
          <span className="grid size-[2.4cqw] place-items-center rounded-full bg-[#d9a55b] text-[1.3cqw] text-[#1a0f07]">☕</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[1.35cqw] font-[620] text-[#fbf3e6]">12 cafés</span>
            <span className="font-mono text-[.9cqw] tracking-[.1em] text-[#a8906f] uppercase">6 cities</span>
          </span>
        </div>
      </Layer>
    </Scene>
  );
}
