import Image from "next/image";
import { portfolio } from "@/data/portfolio";
import { Arrow, RollLabel, SectionHeader, SplitWords } from "@/components/SectionHeader";
import Cover from "@/components/Cover";

const { eyebrow, avatar, facts, lead, paragraphs, education, resumeLabel } = portfolio.about;

export default function About() {
  return (
    <section id="about" data-ambient className="sec-pad relative overflow-x-clip">
      <span aria-hidden className="ambient-blob -top-[8%] -right-[10%]" />
      <span aria-hidden className="ambient-blob ambient-blob-b bottom-[4%] -left-[14%]" />
      <div className="wrap">
        <SectionHeader eyebrow={eyebrow} index="(06)" />
        <div className="mt-[clamp(40px,5vw,72px)] grid grid-cols-1 items-start gap-[clamp(36px,5vw,80px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-6">
            <div data-reveal="clip" className="w-full max-w-[520px]">
              <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-line-soft">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={`Portrait of ${portfolio.firstName} ${portfolio.lastName}`}
                    fill
                    sizes="(min-width: 1080px) 36vw, 92vw"
                    data-parallax
                    className="object-cover"
                  />
                ) : (
                  <Cover index={0} label="portrait / avatar" className="inset-0" />
                )}
              </div>
            </div>
            <dl className="m-0 grid max-w-[520px] grid-cols-2 gap-x-6">
              {facts.map((f) => (
                <div key={f.k} data-reveal="" className="border-t border-line pt-3.5 pb-[18px]">
                  <dt className="font-mono text-[11px] tracking-[.12em] text-dim uppercase">{f.k}</dt>
                  <dd className="mt-1.5 mb-0 ml-0 text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-7">
            <SplitWords as="p" text={lead} className="display m-0 text-[clamp(34px,4.6vw,72px)] leading-none font-[560]" />
            {paragraphs.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-gsap-read
                className="m-0 max-w-[44ch] text-[clamp(18px,1.6vw,23px)] leading-[1.45] font-[520] tracking-[-.012em] text-ink-2"
              >
                {p}
              </p>
            ))}
            <div data-reveal="" className="flex flex-col">
              <span className="mb-3 font-mono text-[11px] tracking-[.14em] text-dim uppercase">Education</span>
              {education.map((e) => (
                <div
                  key={e.title}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-t border-line-soft py-4 last:border-b"
                >
                  <span className="text-[16.5px] text-ink">{e.title}</span>
                  <span className="font-mono text-[12px] tracking-[.06em] text-accent">{e.score}</span>
                  <span className="text-[14.5px] text-muted">{e.school}</span>
                  <span className="font-mono text-[11.5px] tracking-[.06em] text-dim">{e.years}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener" data-magnetic className="btn btn-light btn-lg">
                <RollLabel text={resumeLabel} />
                <Arrow dir="down" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
