import { Layer, Scene } from "./Scene";
import { MAP, project as toMap, WORLD_DOTS } from "./worldDots";

// Paper & ink: an editorial data poster. A dot-matrix world with the
// surveyed countries sized by food-shortage rate, the headline KPIs set like
// a newspaper, and the quartile chart pinned on top.

const INK = "#171512";
const RED = "#c63d2b";
const OLIVE = "#6b7a35";

// Surveyed countries (lon, lat) → share of households reporting shortage.
const SITES: [number, number, number][] = [
  [23, -3, 90.7], [30, -3.4, 84], [30.1, -1.9, 71], [32.4, 1.4, 72], [37.9, 0.4, 61], [34.9, -6.4, 64],
  [39.6, 8.9, 69], [34.2, -13.4, 76], [27.8, -13.6, 66], [35.4, -17.8, 71], [29.6, -19.2, 62], [-1.6, 12.3, 58],
  [-3.9, 17.4, 55], [-1, 7.9, 49], [8.1, 9.3, 53], [-14.6, 14.4, 46], [-75, -9.3, 41], [-78.3, -1.6, 36],
  [-64.8, -16.4, 45], [-84.1, 9.9, 23], [-90.3, 15.7, 48], [-86.6, 14.8, 51], [79, 22, 10.5], [84.1, 28.3, 31],
  [90.2, 23.9, 39], [106, 16.2, 26], [102.5, 19.6, 34], [104.9, 12.6, 42],
];

const project = (lon: number, lat: number) => toMap(lon, lat).map((v) => Math.round(v * 10) / 10) as [number, number];

const QUARTILES = [
  { q: "Q1", a: 77, b: 84 },
  { q: "Q2", a: 74, b: 74 },
  { q: "Q3", a: 57, b: 63 },
  { q: "Q4", a: 41, b: 54 },
];

export default function Rhomis() {
  const [drcX, drcY] = project(23, -3);
  const [indX, indY] = project(79, 22);
  return (
    <Scene className="bg-[#ebe4d3] text-[#171512]">
      {/* paper: soft vignette + a faint baseline grid */}
      <Layer d={0.2} className="inset-0">
        <span className="absolute inset-0 bg-[radial-gradient(130%_100%_at_45%_35%,transparent_55%,rgb(120_96_60/.22))]" />
        <span className="absolute inset-0 [background-image:linear-gradient(rgb(23_21_18/.045)_1px,transparent_1px)] [background-size:100%_2.5cqw]" />
        <span className="paper-grain absolute inset-0" />
        {/* a fold crease across the sheet */}
        <span className="absolute inset-0 bg-[linear-gradient(112deg,transparent_47.6%,rgb(80_60_30/.08)_49.6%,rgb(255_255_255/.2)_50.2%,transparent_53%)]" />
      </Layer>

      {/* The world */}
      <Layer d={0.9} className="top-[27%] left-[-1%] w-[102%]">
        {/* an ink scanner sweeping the survey */}
        <span className="pa-scan-x pointer-events-none absolute inset-y-[-2%] left-0 w-[5%] bg-[linear-gradient(90deg,transparent,rgb(198_61_43/.07),rgb(198_61_43/.15)_50%,transparent)]" />
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="block w-full overflow-visible" aria-hidden>
          <path d={WORLD_DOTS} stroke={INK} strokeOpacity=".24" strokeWidth="6.4" strokeLinecap="round" fill="none" />
          {SITES.map(([lon, lat, v], i) => {
            const [x, y] = project(lon, lat);
            return (
              <g key={i} className="pa-breathe" style={{ animationDelay: `${-(i * 0.37) % 4}s` }}>
                <circle
                  cx={x}
                  cy={y}
                  r={7 + v * 0.26}
                  fill={RED}
                  fillOpacity={0.18 + v / 180}
                  stroke={RED}
                  strokeOpacity=".8"
                  strokeWidth="1.5"
                  className="pa-pop"
                  style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                />
              </g>
            );
          })}
          {/* shortage flowing out from the worst-hit site */}
          {([[79, 22], [-1.6, 12.3], [34.2, -13.4], [-75, -9.3]] as [number, number][]).map(([lon, lat], i) => {
            const [x2, y2] = project(lon, lat);
            const mx = (drcX + x2) / 2;
            const my = Math.min(drcY, y2) - Math.abs(x2 - drcX) * 0.28 - 30;
            return (
              <path key={`a${i}`} d={`M${drcX} ${drcY} Q${Math.round(mx)} ${Math.round(my)} ${x2} ${y2}`} stroke={RED} strokeOpacity=".5" strokeWidth="2.2" strokeDasharray="7 9" fill="none" strokeLinecap="round" className="pa-dash" style={{ animationDelay: `${-i * 0.3}s` }} />
            );
          })}
          <circle cx={drcX} cy={drcY} r="30" fill="none" stroke={RED} strokeWidth="2.5" className="pa-ping" />
          {SITES.filter(([, , v]) => v >= 69 && v < 90).map(([lon, lat], i) => {
            const [x, y] = project(lon, lat);
            return <circle key={`p${i}`} cx={x} cy={y} r="22" fill="none" stroke={RED} strokeWidth="2" className="pa-ping" style={{ animationDelay: `${-i * 0.45}s` }} />;
          })}
          {/* call-outs */}
          <path d={`M${drcX - 28} ${drcY + 16} L${drcX - 120} ${drcY + 96} H${drcX - 300}`} stroke={INK} strokeWidth="2" fill="none" />
          <text x={drcX - 128} y={drcY + 84} textAnchor="end" fill={INK} fontSize="30" fontWeight="700" style={{ fontFamily: "var(--font-display)" }}>
            DRC <tspan fill={RED}>90.7%</tspan>
          </text>
          <path d={`M${indX + 10} ${indY - 12} L${indX + 70} ${indY - 120} H${indX + 210}`} stroke={INK} strokeWidth="2" fill="none" />
          <text x={indX + 76} y={indY - 132} fill={INK} fontSize="30" fontWeight="700" style={{ fontFamily: "var(--font-display)" }}>
            India <tspan fill={OLIVE}>10.5%</tspan>
          </text>
        </svg>
      </Layer>

      {/* Headline */}
      <Layer d={0.8} className="top-[6%] left-[5%] w-[60%]">
        <div className="flex items-center gap-[1cqw] font-mono text-[1.1cqw] tracking-[.16em] uppercase">
          <span className="bg-[#171512] px-[.7cqw] py-[.2cqw] text-[#ebe4d3]">Fig. 03</span>
          RHoMIS · 35 countries
        </div>
        <div className="mt-[1cqw] font-serif text-[5.6cqw] leading-[.92] tracking-[-.02em]">
          Who goes <em className="text-[#c63d2b]">hungry</em>,
          <br />
          and why?
        </div>
      </Layer>

      {/* Newsroom ticker */}
      <Layer d={0.4} className="inset-x-0 bottom-0 h-[3cqw]">
        <div className="size-full overflow-hidden bg-[#171512] text-[#ebe4d3]">
          <div className="pa-tick flex h-full w-max items-center whitespace-nowrap font-mono text-[1cqw] tracking-[.18em] uppercase">
            {[0, 1].map((k) => (
              <span key={k} className="flex items-center">
                {["54,873 households", "35 countries", "46 indicators", "67.7% face a shortage", "live on Tableau Public"].map((t) => (
                  <span key={t} className="flex items-center">
                    <span className="px-[2.4cqw]">{t}</span>
                    <i className="size-[.6cqw] rotate-45 bg-[#c63d2b]" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </Layer>

      {/* Tableau seal */}
      <Layer d={2.2} className="top-[5%] right-[5%] size-[12cqw]">
        <div className="pa-spin-slow relative size-full">
          <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
            <defs>
              <path id="rh-seal" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
            </defs>
            <circle cx="50" cy="50" r="49" fill={INK} />
            <text fill="#ebe4d3" fontSize="8.4" style={{ fontFamily: "var(--font-mono)" }}>
              <textPath href="#rh-seal" textLength="226" lengthAdjust="spacing">
                TABLEAU PUBLIC · LIVE DASHBOARD ·
              </textPath>
            </text>
          </svg>
        </div>
        <span className="absolute inset-0 grid place-items-center font-serif text-[3cqw] text-[#c63d2b] italic">54k</span>
      </Layer>

      {/* KPI strip, set like a newspaper */}
      <Layer d={1.5} className="bottom-[6%] left-[5%] w-[52%]">
        <div className="grid grid-cols-3 border-t-[.25cqw] border-[#171512] pt-[1cqw]">
          {[
            { v: "54,873", l: "households" },
            { v: "46", l: "indicators" },
            { v: "67.7%", l: "face shortage", red: true },
          ].map((k) => (
            <div key={k.l} className="flex flex-col gap-[.3cqw] pr-[1cqw]">
              <span className={`font-display text-[3.4cqw] leading-none font-[720] tracking-[-.04em] ${k.red ? "text-[#c63d2b]" : ""}`}>{k.v}</span>
              <span className="font-mono text-[1cqw] tracking-[.12em] text-[#171512]/60 uppercase">{k.l}</span>
            </div>
          ))}
        </div>
      </Layer>

      {/* Quartile chart */}
      <Layer d={2.4} className="right-[5%] bottom-[6%] w-[33%]">
        <div className="pa-float border-[.18cqw] border-[#171512] bg-[#f6f1e6] p-[1.4cqw] shadow-[1cqw_1cqw_0_#171512]">
          <div className="font-mono text-[1cqw] tracking-[.12em] uppercase">Shortage by yield quartile</div>
          <div className="mt-[1cqw] flex flex-col gap-[.8cqw]">
            {QUARTILES.map((b, i) => (
              <div key={b.q} className="grid grid-cols-[2.6cqw_1fr] items-center gap-[.6cqw]">
                <span className="font-mono text-[1cqw]">{b.q}</span>
                <span className="flex flex-col gap-[.25cqw]">
                  <span className="pa-grow-loop block h-[.9cqw]" style={{ width: `${b.a}%`, background: OLIVE, animationDelay: `${0.5 + i * 0.12}s` }} />
                  <span className="pa-grow-loop block h-[.9cqw]" style={{ width: `${b.b}%`, background: RED, animationDelay: `${0.62 + i * 0.12}s` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-[1cqw] flex gap-[1.4cqw] font-mono text-[.9cqw] tracking-[.1em] uppercase">
            <span className="flex items-center gap-[.4cqw]">
              <i className="size-[.8cqw]" style={{ background: OLIVE }} /> Irrigated
            </span>
            <span className="flex items-center gap-[.4cqw]">
              <i className="size-[.8cqw]" style={{ background: RED }} /> Rainfed
            </span>
          </div>
        </div>
      </Layer>
    </Scene>
  );
}
