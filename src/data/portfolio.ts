// ─────────────────────────────────────────────────────────────
// Portfolio content. Every name, project, link and line of copy
// on the site is read from this file.
//
// Project previews are art-directed scenes (components/art), one per
// project; pick one with each project's `art` field.
//
// Headings support *accent* markup: words wrapped in asterisks are
// set in the italic serif, e.g. "Let's build something that *thinks.*"
// ─────────────────────────────────────────────────────────────

export type NavLink = { label: string; href: string };
export type Social = { label: string; handle: string; href: string };
export type Metric = { v: string; l: string };
export type Link = { label: string; href: string };

export type ProcessStep = {
  label: string;
  title: string;
  body: string;
  tags: string[];
  stat: Metric; // headline number, counted up when the step appears
  figure: string; // readout shown in the 3D figure's corner
};

export type Project = {
  category: string;
  period: string;
  title: string;
  tagline: string;
  description: string;
  bullets: { k: string; t: string }[]; // bold lead-in + supporting detail
  stack: string[];
  metrics: Metric[];
  links: Link[]; // first link is the primary action (and the image link)
  note: string;
  role: string;
  features: { t: string; d: string }[]; // four highlights shown as tiles
  art: "aura" | "finsight" | "rhomis" | "bidverse" | "pit24"; // illustrated preview
  imageLabel: string;
  highlight?: string; // optional award / recognition pill shown above the title
};

export type ExperienceItem = {
  company: string;
  role: string;
  dates: string;
  location: string;
  skills: string[]; // what the role taught: shown as the entry's only detail
};

export type CapabilityPath = {
  title: string;
  trace: string;
  description: string;
  tags: string[];
  provenIn: { label: string; href: string };
  log: string[]; // lines "typed" into the panel's live trace
};

export type Highlight = {
  kicker: string;
  title: string;
  body: string;
  date: string;
  links: Link[];
};

export type Portfolio = {
  initials: string;
  logoLabel: [string, string]; // two short lines beside the nav logo
  handle: string;
  firstName: string;
  lastName: string;
  status: string;
  timezone: string;
  tzLabel: string;
  stack: string[];
  terminal: { cmd: string; out: string[] }[];
  manifesto: string[];
  roles: string[];
  tagline: string;
  metaDescription: string;
  resumeUrl: string;
  email: string;
  location: string;
  settings: {
    showLoader: boolean; // the 0 → 100 opening sequence
    loaderEveryVisit: boolean; // false = only on the first visit of a browser session
    customCursor: boolean;
    stackedCards: boolean;
  };
  nav: NavLink[];
  socials: Social[];
  process: { eyebrow: string; heading: string; skipLabel: string; steps: ProcessStep[] };
  work: { eyebrow: string; heading: string; projects: Project[] };
  experience: { eyebrow: string; heading: string; items: ExperienceItem[] };
  highlights: {
    eyebrow: string;
    heading: string;
    items: Highlight[];
    profiles: { label: string; stat: string; href: string }[];
  };
  capabilities: { eyebrow: string; heading: string; paths: CapabilityPath[] };
  about: {
    eyebrow: string;
    avatar: string;
    facts: { k: string; v: string }[];
    lead: string;
    paragraphs: string[];
    education: { title: string; school: string; years: string; score: string }[];
    resumeLabel: string;
  };
  contact: { eyebrow: string; heading: string; intro: string };
  footer: { credit: string };
};

const GITHUB = "https://github.com/ManasSaxena14";

export const portfolio: Portfolio = {
  initials: "MS",
  logoLabel: ["AI/ML Engineer", "Dev · Data · Finance"],
  handle: "manas.saxena",
  firstName: "Manas",
  lastName: "Saxena",
  roles: ["AI/ML Engineer", "Full-Stack Developer", "Data Analyst", "Finance Enthusiast"],
  tagline:
    "I ship production-grade platforms — from ML pipelines and LLM features to *products people use.*",
  status: "Open to opportunities",
  timezone: "Asia/Kolkata", // any IANA zone — drives the live clock
  tzLabel: "IST",

  // Scrolling tech ticker under the hero
  stack: [
    "Python", "TypeScript", "Next.js", "React.js", "Node.js", "FastAPI", "Scikit-learn", "Pandas",
    "Groq · LLaMA", "PostgreSQL", "MongoDB", "Drizzle ORM", "Tableau", "Tailwind CSS", "AWS", "Vercel",
  ],

  // The hero terminal types these on a loop ("[bar]" renders a live progress bar)
  terminal: [
    { cmd: "python forecast.py --horizon 12m", out: ["8,000+ transactions [bar] fit ok", "✓ isolation forest · anomalies flagged"] },
    { cmd: "npm run typecheck", out: ["✓ strict mode · 0 errors"] },
    { cmd: "vercel deploy --prod", out: ["▲ build ok · 31 API routes", "✓ live → manas-saxena.vercel.app"] },
  ],

  // Big scrolling band between Capabilities and About
  manifesto: ["Data", "Models", "Agents", "Markets", "Products"],
  metaDescription:
    "Manas Saxena — AI/ML engineer, full-stack developer, data analyst and finance enthusiast from Delhi, India. Production-grade platforms, ML pipelines and LLM-powered products.",
  resumeUrl: "/resume.pdf",
  email: "manas140605@gmail.com",
  location: "Delhi, India",

  // Behaviour switches (from the design handoff's settings panel)
  settings: { showLoader: true, loaderEveryVisit: true, customCursor: true, stackedCards: true },

  nav: [
    { label: "Process", href: "#process" },
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],

  socials: [
    { label: "GitHub", handle: "ManasSaxena14", href: GITHUB },
    { label: "LinkedIn", handle: "manas-saxena", href: "https://www.linkedin.com/in/manas-saxena-1b3b27324" },
    { label: "LeetCode", handle: "Manas-14", href: "https://leetcode.com/u/Manas-14" },
    { label: "Codeforces", handle: "Manas14", href: "https://codeforces.com/profile/Manas14" },
  ],

  process: {
    eyebrow: "Process",
    heading: "How raw data becomes a *shipped product.*",
    skipLabel: "Skip to work",
    steps: [
      {
        label: "Data",
        title: "It begins as *noise.*",
        body: "Raw CSVs, 1,599 columns wide — cleaned until the numbers can be trusted.",
        tags: ["Python", "Pandas", "NumPy", "SQL · ETL"],
        stat: { v: "54,873", l: "rows cleaned" },
        figure: "54,873 rows · 1,599 cols",
      },
      {
        label: "Models",
        title: "The noise finds a *shape.*",
        body: "Clusters, anomalies and forecasts — validated before anyone trusts them.",
        tags: ["Scikit-learn", "Statsmodels", "K-means", "Isolation Forest"],
        stat: { v: "8,000+", l: "transactions scored" },
        figure: "k-means · isolation forest",
      },
      {
        label: "Agents",
        title: "The shape learns to *reason.*",
        body: "LLMs with tools — they search, decide and act on live data.",
        tags: ["Groq", "LLaMA 3.3 70B", "Tool calling", "Zod"],
        stat: { v: "<100ms", l: "to an AI answer" },
        figure: "llama 3.3 · tool calls",
      },
      {
        label: "Products",
        title: "Then it *ships.*",
        body: "Typed, tested and deployed — live on Vercel, used by real people.",
        tags: ["Next.js", "FastAPI", "PostgreSQL", "Vercel"],
        stat: { v: "31", l: "API routes in production" },
        figure: "31 routes · live on vercel",
      },
    ],
  },

  work: {
    eyebrow: "Featured Work",
    heading: "Five builds, each proving a *different discipline.*",
    projects: [
      {
        category: "Full-Stack · AI Commerce",
        period: "Sep 2026",
        title: "Aura Roast",
        tagline: "Specialty coffee — ordered, tracked live and recommended by an AI barista.",
        description:
          "Production ordering platform for a specialty-coffee brand: order, track your cup live, book a table and earn loyalty points across 12 cafés in 6 cities.",
        bullets: [
          { k: "Zero data loss", t: "across serverless cold starts — write-through Neon Postgres via Drizzle ORM" },
          { k: "Tool-calling AI barista", t: "on Groq LLaMA 3.3-70B that searches the menu and fills the cart" },
          { k: "Duplicate orders impossible", t: "idempotency keys, server-owned pricing and atomic seat booking" },
        ],
        stack: ["Next.js 16", "TypeScript", "Neon Postgres", "Drizzle ORM", "NextAuth v5", "Groq (LLaMA 3.3)", "Zod", "Vercel"],
        metrics: [
          { v: "31", l: "API routes" },
          { v: "24", l: "Postgres tables" },
          { v: "103", l: "automated checks" },
        ],
        links: [
          { label: "Live demo", href: "https://aura-roast-seven.vercel.app/" },
          { label: "Source", href: `${GITHUB}/AuraRoast` },
        ],
        note: "",
        role: "Solo build — architecture, backend, AI integration and UI",
        features: [
          { t: "Live tracking", d: "Courier position on a Leaflet map, routed by OSRM" },
          { t: "AI barista", d: "Tool-calling LLM that searches the menu and fills your cart" },
          { t: "Table booking", d: "Atomic seat reservations across 12 cafés" },
          { t: "Loyalty tiers", d: "Four tiers derived from an append-only points ledger" },
        ],
        art: "aura",
        imageLabel: "aura-roast-seven.vercel.app",
      },
      {
        category: "AI · FinTech",
        period: "Oct 2026",
        title: "FinSight AI",
        tagline: "A finance app that tells you what you will spend — and what to do about it.",
        description:
          "Turns your own transactions into forecasts, risk and anomaly alerts, then pairs them with a tool-using AI advisor that explains every number and cites its sources.",
        bullets: [
          { k: "14-tool AI agent with RAG", t: "streams answers with inline citations — numbers come from models, never the LLM" },
          { k: "Forecasts with 80% intervals", t: "damped Holt per category, backtested, plus Monte Carlo goal odds over 4,000 paths" },
          { k: "Add spends by voice, receipt or SMS", t: "Whisper, a vision model and statement parsing — in English, Hindi or Hinglish" },
        ],
        stack: ["React", "FastAPI", "MongoDB Atlas", "Groq (gpt-oss-120b)", "Scikit-learn", "Whisper", "three.js", "GSAP"],
        metrics: [
          { v: "14", l: "agent tools" },
          { v: "96.7%", l: "retrieval hit@1" },
          { v: "92", l: "backend tests" },
        ],
        links: [
          { label: "Live demo", href: "https://fin-sight-ai-intelligent-financial.vercel.app/" },
          { label: "Source", href: `${GITHUB}/FinSight-AI-Intelligent-Financial-Forecasting-Advisory-System` },
        ],
        note: "Backend runs on Render's free tier — the first request can take ~30s to wake.",
        role: "Solo build — ML models, AI agent, FastAPI backend and React UI",
        features: [
          { t: "AI advisor", d: "Tool-calling agent with RAG and user-confirmed actions" },
          { t: "Forecasting", d: "1–12 month per-category spend with prediction intervals" },
          { t: "Anomaly alerts", d: "Robust z-score + Isolation Forest vs your own baseline" },
          { t: "Goal planner", d: "Monte Carlo odds of hitting each savings goal on time" },
        ],
        art: "finsight",
        imageLabel: "fin-sight-ai-intelligent-financial.vercel.app",
      },
      {
        category: "Data Analytics · Visualisation",
        period: "2025",
        title: "RHoMIS Analytics",
        tagline: "54,873 farming households, one question: who goes hungry, and why?",
        description:
          "A data-visualisation capstone on the Rural Household Multi-Indicator Survey: raw data from 35 countries turned into food-security intelligence for policymakers.",
        bullets: [
          { k: "1,599 variables → 46 indicators", t: "Python ETL across 54,873 survey records and 7 food-security KPIs" },
          { k: "Drivers of hunger, quantified", t: "K-means segmentation and logistic regression on household profiles" },
          { k: "14,330 vulnerable households", t: "pinpointed for intervention in a multi-view Tableau dashboard" },
        ],
        stack: ["Python", "Pandas", "Scikit-learn", "Statsmodels", "Tableau", "SQL", "LaTeX"],
        metrics: [
          { v: "54,873", l: "households" },
          { v: "35", l: "countries" },
          { v: "7", l: "food-security KPIs" },
        ],
        links: [
          {
            label: "Tableau dashboard",
            href: "https://public.tableau.com/app/profile/manas.saxena/viz/RHoMISDASHBOARD_17774575711430/Dashboard3",
          },
          { label: "Source", href: "https://github.com/mahir-m01/Section-C_G-7_RHoMIS-Analytics" },
        ],
        note: "DVA Capstone at Newton School of Technology · submitted 28 April 2026.",
        role: "ETL pipeline & presentation lead in a team of six",
        features: [
          { t: "ETL pipeline", d: "1,599 raw variables cleaned to 46 indicators" },
          { t: "Clustering", d: "K-means vulnerability profiles of households" },
          { t: "Statistics", d: "Chi-square, Mann-Whitney and logistic regression" },
          { t: "Tableau", d: "Four interactive views published on Tableau Public" },
        ],
        art: "rhomis",
        imageLabel: "tableau public dashboard",
      },
      {
        category: "Full-Stack · Real-Time",
        period: "Oct 2026",
        title: "BidVerse",
        tagline: "An auction house that stays fair when everyone bids at once.",
        description:
          "A premium auction platform covering the full lifecycle — listing, live competitive bidding and automated commission settlement — on a security-hardened MERN stack.",
        bullets: [
          { k: "Race-free bidding", t: "server-side validation, idempotent bid upserts and auto-expiring lots" },
          { k: "Commission engine", t: "settles closed auctions automatically — pending → paid, duplicate-proof" },
          { k: "5 security layers", t: "JWT + 3-tier RBAC, Helmet, per-route rate limits and input validation" },
        ],
        stack: ["MongoDB", "Express", "React", "Node.js", "Groq (Llama 3.3)", "GSAP", "three.js", "Recharts"],
        metrics: [
          { v: "30+", l: "API endpoints" },
          { v: "3", l: "access tiers" },
          { v: "5", l: "security layers" },
        ],
        links: [
          { label: "Live demo", href: "https://bidverse-auction-platform.vercel.app/" },
          { label: "Source", href: `${GITHUB}/BIDVERSE---AUCTION-PLATFORM` },
        ],
        note: "Backend runs on Render's free tier — the first request can take ~30s to wake.",
        role: "Solo build — MERN stack, auth, AI concierge and dashboards",
        features: [
          { t: "Live bidding", d: "Server-validated bids with countdown timers" },
          { t: "Commissions", d: "Automatic settlement, payouts and audit trail" },
          { t: "AI concierge", d: "Groq Llama 3.3 70B with a luxury-house persona" },
          { t: "Governance", d: "Superadmin analytics, revenue trends, roles and suspensions" },
        ],
        art: "bidverse",
        imageLabel: "bidverse-auction-platform.vercel.app",
      },
      {
        category: "Hackathon · Operations Design",
        period: "2026",
        title: "PIT-24",
        tagline: "A cleaning line, not a cleaning bay — top 20 nationally at the Cars24 Car-a-thon.",
        description:
          "My concept for the Cars24 Car-a-thon 2026 national hackathon: used-car cleaning re-imagined as a pit-lane assembly line, backed by a solution deep-dive and an interactive simulation of throughput, crew and cost per car.",
        bullets: [
          { k: "One car every 24 seconds", t: "eight stations over 50 m — each car gets six minutes of work" },
          { k: "Interactive line simulation", t: "takt P50 / P90, clean score, labour, water and ₹ per car" },
          { k: "Top 20 nationally", t: "scenario controls for arrivals, crew variability and soil mix" },
        ],
        stack: ["Process design", "Line simulation", "Cost modelling", "Data visualisation", "Vercel"],
        metrics: [
          { v: "24s", l: "takt time" },
          { v: "144", l: "cars / hour" },
          { v: "6.4", l: "person-min / car (from 35)" },
        ],
        links: [
          { label: "Solution", href: "https://pit24-site.vercel.app/" },
          { label: "Simulation", href: "https://pit24-simulation.vercel.app/" },
        ],
        note: "",
        role: "Concept, line design, simulation and cost model",
        features: [
          { t: "Line design", d: "8 stations balanced to a 24-second takt" },
          { t: "Simulation", d: "Seeded, replayable model of crew, cars and queues" },
          { t: "Scenarios", d: "Soil routing, rework bay, peak inflow, rough crew days" },
          { t: "Unit economics", d: "Labour, water and ₹ per car at every tier" },
        ],
        art: "pit24",
        imageLabel: "pit24-simulation.vercel.app",
        highlight: "Top 20 nationally · Cars24 Car-a-thon 2026",
      },
    ],
  },

  experience: {
    eyebrow: "Experience",
    heading: "Shipping in *production*, not just in repos.",
    items: [
      {
        company: "WisBees · TimeArrow Pvt. Ltd.",
        role: "Full Stack Developer",
        dates: "Sep 2026 — Present",
        location: "Remote",
        skills: ["Full-stack development", "Dashboards", "REST APIs", "UX design", "Testing & debugging", "Product research"],
      },
      {
        company: "Finanza Club · Rishihood University",
        role: "Web Developer",
        dates: "May 2026 — Jul 2026",
        location: "Rishihood University",
        skills: ["React.js", "Performance optimisation", "Lazy loading", "Responsive design", "Workflow design"],
      },
    ],
  },

  highlights: {
    eyebrow: "Recognition",
    heading: "Beyond the *code.*",
    items: [
      {
        kicker: "National hackathon",
        title: "Top 20 · Cars24 Car-a-thon",
        body: "Conceived PIT-24, a 24-second car-cleaning line with an interactive solution and simulation — top 20 nationally out of hundreds of teams.",
        date: "2026",
        links: [
          { label: "Solution", href: "https://pit24-site.vercel.app/" },
          { label: "Simulation", href: "https://pit24-simulation.vercel.app/" },
        ],
      },
      {
        kicker: "Certification",
        title: "Naukri Young Turks",
        body: "Emerging Talent Recognition from Naukri.com, awarded in the 2025 edition of Young Turks.",
        date: "Sep 2025",
        links: [
          {
            label: "View certificate",
            href: "https://drive.google.com/file/d/1oe2XH_Jb1qrWq9vF2FvAhf0s_IzL-Bor/view?usp=sharing",
          },
        ],
      },
      {
        kicker: "Leadership",
        title: "Vice President · Finance Club",
        body: "Lead weekly financial-literacy workshops and investment simulations, own club budgeting end-to-end and mentor juniors on portfolio analysis.",
        date: "Rishihood University",
        links: [],
      },
      {
        kicker: "Leadership",
        title: "Operations Head · Esports Club",
        body: "Direct logistics, scheduling and communication for competitive esports tournaments, coordinating multiple teams for every event.",
        date: "Rishihood University",
        links: [],
      },
    ],
    profiles: [
      { label: "LeetCode", stat: "250+ problems solved", href: "https://leetcode.com/u/Manas-14" },
      { label: "Codeforces", stat: "Active competitor", href: "https://codeforces.com/profile/Manas14" },
      { label: "GitHub", stat: "25+ repositories", href: GITHUB },
    ],
  },

  capabilities: {
    eyebrow: "Capabilities",
    heading: "One engineer, *five paths.*",
    paths: [
      {
        title: "Generative AI & LLM Apps",
        trace: "Tool-call trace",
        description: "LLMs that do real work — and never break the product when the model does.",
        tags: ["Groq", "LLaMA 3.3 70B", "Tool calling", "Prompt design", "Structured output", "Zod", "FastAPI", "Fallback design"],
        provenIn: { label: "Aura Roast", href: "#work" },
        log: [
          "barista.chat(\"smooth, low acidity\")",
          "tool: search_catalogue(roast=medium) · 5 hits",
          "tool: add_to_cart(drink, qty=1) ✓",
          "fallback provider armed ✓",
        ],
      },
      {
        title: "Machine Learning & Data Science",
        trace: "Model card",
        description: "Models validated before anyone trusts them — anomalies, clusters, forecasts.",
        tags: ["Python", "Scikit-learn", "Pandas", "NumPy", "Statsmodels", "Isolation Forest", "K-means", "Regression", "Forecasting"],
        provenIn: { label: "FinSight AI", href: "#work" },
        log: [
          "load(transactions) · 8,000+ rows",
          "IsolationForest().fit(features)",
          "forecast(horizon=12 mo, by=category)",
          "anomalies → dashboard ✓",
        ],
      },
      {
        title: "Full-Stack Engineering",
        trace: "Request log",
        description: "Typed, server-rendered platforms with correctness built in.",
        tags: ["Next.js", "React.js", "TypeScript", "Node.js", "Express.js", "FastAPI", "PostgreSQL", "MongoDB", "Drizzle ORM", "NextAuth", "JWT", "Tailwind CSS"],
        provenIn: { label: "Aura Roast", href: "#work" },
        log: [
          "POST /api/orders · idempotency-key ✓",
          "UPDATE reservation_slots · atomic",
          "31 route handlers · zod-validated",
          "103 API checks passed ✓",
        ],
      },
      {
        title: "Data Analytics & Visualisation",
        trace: "ETL log",
        description: "From raw survey dumps to dashboards people act on.",
        tags: ["Tableau", "SQL", "MySQL", "Pandas", "Python ETL", "Statsmodels", "Logistic regression", "Recharts", "LaTeX"],
        provenIn: { label: "RHoMIS Analytics", href: "#work" },
        log: [
          "etl(54,873 households × 1,599 cols)",
          "→ 46 indicators · 7 KPIs",
          "logit(food_shortage ~ income + irrigation)",
          "publish(tableau_public) ✓",
        ],
      },
      {
        title: "Quant & Finance",
        trace: "Advisory log",
        description: "Data rigor, applied to money — forecasting, risk and benchmarking.",
        tags: ["Forecasting", "Risk scoring", "Anomaly detection", "Portfolio analysis", "Peer benchmarking", "Budgeting", "Investment simulation"],
        provenIn: { label: "FinSight AI", href: "#work" },
        log: [
          "health_score(user) · 0–100",
          "peer_benchmark(income_bracket)",
          "flag(unusual_spend, z > 3)",
          "advice(groq) in <100ms ✓",
        ],
      },
    ],
  },

  about: {
    eyebrow: "About",
    avatar: "/avatar.jpg",
    facts: [
      { k: "Based in", v: "Delhi, India" },
      { k: "Studying", v: "BTech, Artificial Intelligence" },
      { k: "Currently", v: "Full Stack Developer · WisBees" },
      { k: "Problem solving", v: "250+ LeetCode · Codeforces" },
    ],
    lead: "Most engineers pick a lane. I work across *the whole road.*",
    paragraphs: [
      "BTech AI student at Newton School of Technology, Rishihood University. I build full-stack products and applied ML — from database design to LLM-powered features.",
      "I care about systems that survive real users. Outside the editor, I'm VP of the Finance Club — workshops, investment simulations and the club's budget.",
    ],
    education: [
      {
        title: "BTech — Artificial Intelligence",
        school: "Newton School of Technology, Rishihood University",
        years: "2024 — Present",
        score: "CGPA 7.6",
      },
      { title: "Class XII", school: "Bansal Public School", years: "2022 — 2023", score: "77.0%" },
      { title: "Class X", school: "Jiwrajka International School", years: "2020 — 2021", score: "93.0%" },
    ],
    resumeLabel: "Download resume",
  },

  contact: {
    eyebrow: "Contact",
    heading: "Let's build something that *thinks.*",
    intro:
      "Open to AI/ML and full-stack roles, internships and freelance builds — especially anything where tech meets finance. If you've read this far, we should talk.",
  },

  footer: { credit: "designed & engineered by hand" },
};

export const fullName = `${portfolio.firstName} ${portfolio.lastName}`;
export const pad = (n: number) => String(n).padStart(2, "0");

/** Split "*accent*" markup into plain and accent runs. */
export function parseAccent(text: string) {
  return text.split("*").map((t, i) => ({ t, accent: i % 2 === 1 })).filter((r) => r.t);
}
/** The same text with the markup removed. */
export const plain = (text: string) => text.replaceAll("*", "");
