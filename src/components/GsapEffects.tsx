"use client";

import { gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Page-wide GSAP scroll effects, driven by data attributes so sections
 * stay declarative:
 *   [data-parallax]       image drifts inside its frame
 *   [data-gsap-read]      paragraph words brighten as you read down
 *   [data-gsap-cards]     child cards flip up in a stagger
 *   [data-gsap-band]      manifesto rows tilt and slide into place
 * Everything is motion-safe: reduced-motion visitors get the static page.
 */
export default function GsapEffects() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    mm.add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -7, scale: 1.16 },
          {
            yPercent: 7,
            scale: 1.06,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-cards]").forEach((grid) => {
        const cards = Array.from(grid.children) as HTMLElement[];
        // The cards' CSS hover transitions would smear GSAP's frames.
        gsap.set(cards, { transition: "none" });
        gsap.from(cards, {
          autoAlpha: 0,
          y: 80,
          rotationX: -22,
          transformPerspective: 1100,
          transformOrigin: "50% 0%",
          duration: 1.3,
          stagger: 0.12,
          clearProps: "transform,visibility,transition",
          scrollTrigger: { trigger: grid, start: "top 82%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-band]").forEach((band) => {
        const rows = band.querySelectorAll<HTMLElement>("[data-band-row]");
        gsap.fromTo(
          rows,
          { rotation: (i) => (i ? 3 : -3), xPercent: (i) => (i ? -8 : 8), scale: 0.92, autoAlpha: 0.2 },
          {
            rotation: 0,
            xPercent: 0,
            scale: 1,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: band, start: "top bottom", end: "center 55%", scrub: 0.8 },
          },
        );
      });

      // Reading highlight: split once the fonts are in, then scrub each
      // word from dim to bright across the paragraph's pass up the screen.
      document.fonts.ready.then(() => {
        gsap.utils.toArray<HTMLElement>("[data-gsap-read]").forEach((p) => {
          const split = SplitText.create(p, { type: "words" });
          splits.push(split);
          gsap.fromTo(
            split.words,
            { color: "#4a4a52" },
            {
              color: "#e4e4e7",
              stagger: 0.1,
              ease: "none",
              scrollTrigger: { trigger: p, start: "top 88%", end: "bottom 60%", scrub: 0.5 },
            },
          );
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      splits.forEach((s) => s.revert());
      mm.revert();
    };
  });

  return null;
}
