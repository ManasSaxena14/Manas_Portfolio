import { Layer, Scene } from "./Scene";

// Noir. A matte black payment card lies under a single overhead light while a
// red scan line sweeps it; a "flagged" stamp lands on the card-not-present
// transaction. To the right the case is set like a ledger page: the headline
// loss in large serif, the findings as ruled lines. Black, bone and one red.

const RED = "#e5383b";
const BONE = "#ece6dc";
const ASH = "#8f877c";

const LEDGER = [
  ["Transactions reviewed", "1,000,000"],
  ["Fraud cases", "17,143"],
  ["Card not present", "34.9%"],
  ["Between 00:00 – 05:00", "40%"],
  ["Crypto fraud rate", "5.3%"],
];

export default function Fraud() {
  return (
    <Scene className="bg-[radial-gradient(70%_80%_at_30%_40%,#22201d_0%,#121110_45%,#060606_100%)]">
      {/* Overhead light cone and grain */}
      <Layer d={0.2} className="inset-0">
        <span className="absolute -top-[10%] left-[6%] h-[120%] w-[50%] bg-[linear-gradient(180deg,rgb(236_230_220/.1),transparent_70%)] [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
        <span className="absolute inset-0 opacity-[.35] [background-image:radial-gradient(rgb(236_230_220/.06)_1px,transparent_1.2px)] [background-size:.9cqw_.9cqw]" />
      </Layer>

      {/* The card, under the scan */}
      <Layer d={1.4} className="top-[20%] left-[7%] w-[44%]">
        <div className="relative aspect-[1.586] [transform:perspective(120cqw)_rotateX(18deg)_rotateZ(-8deg)]">
          <div className="absolute inset-0 overflow-hidden rounded-[2cqw] bg-[linear-gradient(135deg,#2a2826_0%,#121110_55%,#1d1b19_100%)] shadow-[0_3cqw_5cqw_-1.6cqw_rgb(0_0_0/.9),inset_0_0_0_.12cqw_rgb(236_230_220/.08)]">
            {/* Brushed texture */}
            <span className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(100deg,transparent_0_.4cqw,rgb(255_255_255/.03)_.4cqw_.5cqw)]" />
            {/* Chip */}
            <span className="absolute top-[30%] left-[9%] h-[22%] w-[15%] rounded-[.6cqw] bg-[linear-gradient(135deg,#d9c48f,#8f7a45)] [box-shadow:inset_0_0_0_.15cqw_rgb(0_0_0/.25)]">
              <span className="absolute inset-x-[30%] inset-y-0 border-x border-black/25" />
              <span className="absolute inset-x-0 top-1/2 border-t border-black/25" />
            </span>
            <span className="absolute top-[62%] left-[9%] font-mono text-[2.1cqw] tracking-[.22em]" style={{ color: BONE }}>
              •••• •••• •••• 4821
            </span>
            <span className="absolute bottom-[10%] left-[9%] font-mono text-[1.1cqw] tracking-[.2em] uppercase" style={{ color: ASH }}>
              Card not present · 03:12
            </span>
            {/* Scan beam */}
            <span className="fr-scan absolute inset-x-0 top-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgb(229_56_59/.32)_80%,rgb(229_56_59/.9)_100%)]" />
          </div>
          {/* Stamp */}
          <span className="pa-stamp absolute -right-[4%] -bottom-[8%] rotate-[-10deg] rounded-[.6cqw] border-[.3cqw] px-[1.2cqw] py-[.4cqw] font-mono text-[1.8cqw] font-bold tracking-[.18em] uppercase" style={{ borderColor: RED, color: RED }}>
            Flagged
          </span>
        </div>
      </Layer>

      {/* The ledger */}
      <Layer d={2} className="top-[10%] right-[6%] w-[38%]">
        <div className="font-mono text-[1cqw] tracking-[.26em] uppercase" style={{ color: ASH }}>
          Case file · 2022 – 2024
        </div>
        <div className="mt-[.8cqw] font-serif text-[7.4cqw] leading-[.85] italic" style={{ color: BONE }}>
          $12.52M
        </div>
        <div className="mt-[.6cqw] font-mono text-[1.05cqw]" style={{ color: RED }}>
          fraud isolated · 1.71% of transactions
        </div>
        <div className="mt-[2cqw] flex flex-col">
          {LEDGER.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-t border-[#ece6dc]/12 py-[.75cqw] last:border-b">
              <span className="text-[1.25cqw]" style={{ color: ASH }}>
                {k}
              </span>
              <span className="font-mono text-[1.25cqw] tabular-nums" style={{ color: BONE }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </Layer>
    </Scene>
  );
}
