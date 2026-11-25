# Portfolio

**Live:** [manas-saxena.vercel.app](https://manas-saxena.vercel.app/)

A dark, editorial developer portfolio with a WebGL layer: built from the
Claude Design handoff in `design_handoff_portfolio/` (reference files in
`reference/`).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
three.js + React Three Fiber · GSAP (ScrollTrigger) · Framer Motion · Lenis.

**Type:** Bricolage Grotesque (variable weight) for display, Geist for body/UI,
JetBrains Mono for labels, Instrument Serif *italic* for accent words. All
self-hosted from npm `@fontsource` packages — no Google Fonts request at build.

**Colour:** zinc neutrals (`#09090b` base) with a single lime accent
(`#c8f25a`). All tokens live at the top of `src/app/globals.css`; change
`--color-accent` there to re-theme the whole site, including the 3D scenes'
UI chrome.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build
```

## Deploy

**Vercel (recommended, free):**
1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) → *Add New → Project* → import the repo.
3. Keep the defaults (framework: Next.js, build: `next build`) and click **Deploy**.

Or from the terminal: `npm i -g vercel && vercel --prod`.

Requires Node.js 20.9+. No environment variables are needed: on Vercel the
production URL is picked up automatically for canonical links, the sitemap and
share cards. With a custom domain, set `NEXT_PUBLIC_SITE_URL`
(e.g. `https://manassaxena.dev`) in the project's environment variables.

**Ships with:** share cards (`opengraph-image.jpg`, `twitter-image.jpg`), an
Apple touch icon, a web manifest, `robots.txt`, `sitemap.xml`, a styled 404 and
security headers (see `next.config.ts`).

**Contact form:** messages are delivered by [FormSubmit](https://formsubmit.co)
to the email in `src/data/portfolio.ts`. The very first submission sends an
activation email to that address — click the link once and every message after
that arrives in your inbox.

## Editing content

Every word, link and number on the site comes from **`src/data/portfolio.ts`**.
The current content is placeholder copy.

| What | Where in `portfolio.ts` |
|---|---|
| Name, initials, logo label, roles, tagline, email | top-level fields |
| Availability, timezone for the live clock | `status`, `timezone`, `tzLabel` |
| Tech ticker, hero terminal session, manifesto band | `stack`, `terminal`, `manifesto` |
| Process story (intro, 5 steps, links) | `process` |
| Work paths (3) and projects (10: metrics, links, notes, `path`) | `work.paths`, `work.projects` |
| Jobs / internships (impact points + skills) | `experience.items` |
| Skills and the projects that prove them | `skills.items` |
| 30-second summary | `brief` |
| Accent colour per section | `SECTION_TONES` (and `tone()` on the section) |
| Bio, facts, portrait | `about` |
| Opening sequence (on/off, every visit or once per session), custom cursor, stacking cards | `settings` |

**Images:** project previews are art-directed scenes in `src/components/art`
(pick one per project with its `art` field; Aura Roast uses the real storefront
screenshot in `src/assets/projects`). The About portrait is `about.avatar`
(a file in `public/`).

**Accent words:** wrap words in asterisks in any heading to set them in the
italic serif, e.g. `"Let's build something that *thinks.*"`.

**Resume:** add `public/resume.pdf` (all Resume buttons link to `/resume.pdf`).

## What's built

- **Logo:** MS monogram drawn as a circuit trace (a deep-V M and a chamfered
  S) ending in a lime signal node. It draws itself in on load, the node pings,
  and a signal pulse runs the trace on hover. `src/app/icon.svg` is the favicon.
- **Opening sequence (Loader):** seven dots, one for each colour on the site,
  unfurl into seven strands that settle from noise into a signal. They keep
  flowing while the page really loads (fonts, assets and the 3D galaxy code;
  never more than 4 s), then write the name exactly where the hero sets it. A
  soft front sweeps across, the real letters take over and the points spiral
  into the galaxy's core. Canvas 2D, no extra libraries. Click or press any key
  to skip; deep links (`/#contact`) land on their section afterwards. Plays
  once per browser session (`settings.loaderEveryVisit`); skipped for reduced
  motion, where the hero simply appears.
- **Hero:** a 3D neural galaxy (custom GLSL): 11k particles plus a constellation
  of nodes and edges with signals travelling along them. It spirals in, bends
  away from the cursor and blooms apart on scroll. The first name swells in
  weight and width under the cursor (variable font), the italic last name warms
  to amber letter by letter. A GSAP intro timeline opens the grid like an
  aperture, tips each letter up out of the floor, runs a lime signal through
  the first name and draws the divider. The camera flies in as the galaxy
  forms, the core glows, and a shockwave ring rolls through the disc on intro
  and wherever you click. On scroll the letters scatter and a rotating
  "scroll to explore" seal spins faster with velocity. Status row with decoding text and a live clock,
  roles that decode, a tagline that streams in like LLM tokens, CTAs, a glass
  terminal typing a train → test → deploy session, and a velocity-reactive
  tech ticker.
- **Process:** one real feature from problem to release
  (`src/components/BookingStage.tsx`). Five steps scroll past while a single
  calendar stays in view: two bookings collide, HireFlow's own exclusion
  constraint removes one, the API answers 409, and 20 requests race for the
  slot (visitors can rerun it). Nothing captures the scroll.
- **Work:** three paths (Full-Stack & Systems Engineering, Applied AI & Machine
  Learning, Data Analytics & Business Intelligence). A scroll-drawn fork leads to
  three path cards; choosing one opens that path's projects as sticky stacking
  cards that scale and dim as the next card covers them. Each project has its own art-directed preview (`src/components/art`),
  so no two look alike: Aura Roast is the real storefront on an espresso glow
  with a live order tracker and AI-barista chat; FinSight is emerald glass with
  a forecast cone; RHoMIS is a paper data poster with a dot-matrix world map;
  BidVerse is a velvet auction stage with a spotlit watch; PIT-24 (featured in
  Recognition) is a blueprint with cars rolling through at takt; HireFlow is two
  plum hiring boards moving in sync; Orbyt is an indigo LLM gateway in orbit;
  ResolveIQ fans one ticket into reply, queue and risk; MetroFlow runs a jam
  wave upstream across a sensor graph; the fraud and Zomato scenes are their
  Tableau dashboards redrawn. Layers drift with the pointer
  by depth, rise in on scroll, and only animate while on screen.
- **Experience:** scroll-filled timeline; each role is a card with only the
  company, role and skills learned, sliding in with the skills popping one by one.
- **Skills:** an evidence map. Skills on one side, projects on the other, a
  line for every real use; choosing either side traces its proof, and a project
  opens its case study. Lines are measured on resize, never on scroll.
- **Quick search** (Cmd/Ctrl+K or `/`) and a **30-second summary**, both native
  dialogs (`src/components/Dialogs.tsx`). Every project has a link, such as
  `/#work/metroflow`.
- **Colour:** each section wears its own accent and the nav follows
  (`SECTION_TONES` in `portfolio.ts`).
- **Scroll effects:** parallax, drifting numerals, the reading fade and the
  manifesto band are native CSS scroll timelines, off the main thread.
- **Manifesto band:** two giant marquee rows (solid, italic, outline) drifting
  in opposite directions, speeding up and leaning with scroll velocity; the
  rows tilt and slide into place as the band scrolls in.
- **About / Contact:** clip-wipe portrait with scroll parallax, two short
  paragraphs that brighten as you read down, copy-email button, and a
  validated form with animated focus underlines, delivered by FormSubmit
  (falls back to a pre-filled email draft).
- **Footer:** revealed from under the page like a curtain (the page lifts away
  on rounded corners). Contact CTA, sitemap, socials, live clock and status, a
  circuit trace that draws itself with a pulse running along it, a giant name
  whose letters rise in one by one and lift toward the cursor under a lime
  "torch", and a magnetic back-to-top seal.
- Global: Lenis smooth scroll driven by GSAP's ticker (one clock for scroll
  and every ScrollTrigger), masked word reveals, decoding eyebrows, rolling
  button labels and arrows, custom cursor, magnetic buttons, spring-animated
  active-section tab, focus rings, reduced-motion support.

## Structure

```
src/
  app/            layout (fonts, metadata), page, globals.css (design tokens)
  data/           portfolio.ts  ← edit this
  lib/            gsap.ts (plugin registration), scroll.ts (Lenis), store.ts
  components/     Nav, Logo, Loader, Cursor, Interactions, GsapEffects, SectionHeader,
                  Scramble, Terminal, Marquee, LocalTime, Cover, CountUp
    sections/     Hero, Process, Work, Experience, Skills, About, Contact, Footer
    art/          project previews (Scene/Layer + one scene per project)
    three/        HeroGalaxy, ProcessScene (WebGL, lazy-loaded)
```
