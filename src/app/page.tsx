import Cursor from "@/components/Cursor";
import Interactions from "@/components/Interactions";
import Loader from "@/components/Loader";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Footer from "@/components/sections/Footer";
import GsapEffects from "@/components/GsapEffects";
import Hero from "@/components/sections/Hero";
import Highlights from "@/components/sections/Highlights";
import Process from "@/components/sections/Process";
import Work from "@/components/sections/Work";
import { portfolio } from "@/data/portfolio";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <Interactions />
      <GsapEffects />
      <Loader />
      <Cursor />
      <Nav />
      {/* The page is a card lifted over the footer: as it scrolls away, the
          footer is revealed from underneath (see Footer). */}
      <main className="relative z-[1] rounded-b-[clamp(28px,4vw,56px)] border-b border-line-soft bg-bg shadow-[0_40px_80px_-30px_rgb(0_0_0/.9)]">
        <Hero />
        <Process />
        <Work />
        <Experience />
        <Highlights />
        <Capabilities />
        {/* Manifesto band: two rows drifting in opposite directions */}
        <section
          aria-label={portfolio.manifesto.join(", ")}
          data-gsap-band
          className="flex flex-col gap-2 overflow-hidden pt-[clamp(72px,10vw,150px)]"
        >
          <div data-band-row>
            <Marquee items={portfolio.manifesto} big />
          </div>
          <div data-band-row>
            <Marquee items={[...portfolio.manifesto].reverse()} big reverse className="opacity-60" />
          </div>
        </section>
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
