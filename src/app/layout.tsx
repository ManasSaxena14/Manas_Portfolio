import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { fullName, portfolio } from "@/data/portfolio";
import { siteUrl } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

// Self-hosted variable fonts (npm @fontsource packages), so the build never
// depends on reaching Google Fonts.
// Bricolage Grotesque: characterful display face (wght 200–800). The hero
// name swells in weight under the cursor.
const display = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--nf-display",
  display: "swap",
});
// Geist stays as the clean UI/body face.
const geist = localFont({
  src: "../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--nf-geist",
  display: "swap",
});
// JetBrains Mono for every label, chip and terminal line.
const mono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--nf-mono",
  display: "swap",
});
// Instrument Serif italic for the accent words.
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--nf-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${fullName} — ${portfolio.roles[0]}`, template: `%s — ${fullName}` },
  description: portfolio.metaDescription,
  applicationName: `${fullName} — Portfolio`,
  authors: [{ name: fullName, url: siteUrl }],
  creator: fullName,
  keywords: [
    fullName,
    "AI/ML engineer",
    "full-stack developer",
    "data analyst",
    "Next.js",
    "React",
    "Python",
    "machine learning",
    "LLM",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${fullName} — Portfolio`,
    title: `${fullName} — Portfolio`,
    description: portfolio.metaDescription,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${fullName} — Portfolio`,
    description: portfolio.metaDescription,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "Za561qmNZq0osecXDcYOUfVq33w1vw2UtZPauBftvqM",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

// Runs before first paint: marks JS as available so [data-reveal]
// elements start hidden (no-JS visitors still see everything), and hides
// the loader early when it will be skipped (turned off, once-per-session and
// already seen, or reduced motion).
const { showLoader, loaderEveryVisit } = portfolio.settings;
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{var seen=sessionStorage.getItem('loader-seen')==='1';if(${!showLoader}||(${!loaderEveryVisit}&&seen)||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('skip-loader')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${geist.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
