import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { fullName, portfolio } from "@/data/portfolio";
import { siteUrl } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

// Geist is variable (100–900): the hero name swells in weight under the cursor.
const geist = Geist({ subsets: ["latin"], variable: "--nf-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--nf-geist-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
      className={`${geist.variable} ${geistMono.variable} ${serif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
