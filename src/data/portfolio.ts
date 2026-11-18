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
  stat: Metric; // headline number, counted up with the scroll
  figure: string; // caption for the stage's zoom layer
  proof: string[]; // projects that prove this step (names from work.projects)
};

export type PathId = "dev" | "ai" | "data";

export type WorkPath = {
  id: PathId;
  index: string; // "01"
  label: string; // short tab label
  title: string; // card heading, *accent* markup
  blurb: string;
  tags: string[];
  hue: string; // the path's signal colour
  cmd: string; // the "command" shown on the path card
};

export type Project = {
  path: PathId;
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
  art: "aura" | "finsight" | "rhomis" | "bidverse" | "pit24" | "orbyt" | "hireflow" | "resolveiq" | "trafficgnn" | "fraud" | "zomato"; // illustrated preview
  imageLabel: string;
  highlight?: string; // optional award / recognition pill shown above the title
};

export type ExperienceItem = {
  company: string;
  role: string;
  dates: string;
  location: string;
  points?: { k: string; t: string }[]; // shipped impact, bold lead-in + proof
  skills: string[]; // what the role taught
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
  now: string; // current role, shown in the hero status row
  proof: Metric[]; // hero proof strip: headline numbers, each verifiable below
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
  work: { eyebrow: string; heading: string; intro: string; paths: WorkPath[]; projects: Project[] };
  experience: { eyebrow: string; heading: string; items: ExperienceItem[] };
  highlights: {
    eyebrow: string;
    heading: string;
    featured: Highlight & { metrics: Metric[] }; // the hackathon, shown wide with its scene
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
    "I build production systems end to end — multi-tenant SaaS, graph neural networks and LLM products that *survive real users.*",
  status: "Open to opportunities",
  now: "Full Stack Developer · WisBees",
  proof: [
    { v: "10", l: "live case studies" },
    { v: "441", l: "tests on one build" },
    { v: "Top 20", l: "All-India · Cars24" },
    { v: "250+", l: "LeetCode solved" },
  ],
  timezone: "Asia/Kolkata", // any IANA zone — drives the live clock
  tzLabel: "IST",

  // Scrolling tech ticker under the hero
  stack: [
    "Python", "TypeScript", "Next.js", "React", "NestJS", "Node.js", "FastAPI", "PyTorch", "XGBoost",
    "Scikit-learn", "Pandas", "RAG", "LangChain", "PostgreSQL", "Redis", "MongoDB", "Tableau", "AWS", "GitHub Actions",
  ],

  // The hero terminal types these on a loop ("[bar]" renders a live progress bar)
  terminal: [
    { cmd: "python train.py --model dcrnn+xgb", out: ["207 sensors [bar] 3 seeds", "✓ 60-min MAE −13.3% vs XGBoost"] },
    { cmd: "pnpm test --coverage", out: ["✓ 441 passed · 96.7% API coverage"] },
    { cmd: "curl -X POST /analyze", out: ["✓ Billing & Payments · 99%", "✓ escalation 82% · p95 49.8 ms"] },
    { cmd: "vercel deploy --prod", out: ["▲ build ok · 10 live projects", "✓ live → manas-saxena.vercel.app"] },
  ],

  // Big scrolling band between Capabilities and About
  manifesto: ["Data", "Models", "Agents", "Markets", "Products"],
  metaDescription:
    "Manas Saxena — AI/ML engineer, full-stack developer and data analyst from Delhi, India. Ten live case studies across software engineering, applied AI and data analytics: multi-tenant SaaS, LLM gateways, graph neural networks, RAG and Tableau dashboards.",
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
        body: "A million transactions. 54,873 survey rows, 1,599 columns wide. Cleaned, typed and profiled until the numbers can be trusted.",
        tags: ["Python ETL", "Pandas", "SQL", "Feature engineering"],
        stat: { v: "1,000,000", l: "transactions profiled" },
        figure: "raw rows · unlabelled",
        proof: ["Fraud Detection Analytics", "RHoMIS Analytics"],
      },
      {
        label: "Models",
        title: "The noise finds a *shape.*",
        body: "Clusters, forecasts and graph neural networks, held to leak-free splits and honest baselines before anyone trusts them.",
        tags: ["PyTorch", "Graph neural networks", "XGBoost", "Scikit-learn"],
        stat: { v: "24/24", l: "test days won by the graph model" },
        figure: "clusters · centroids · graph",
        proof: ["TrafficGNN", "FinSight AI"],
      },
      {
        label: "Agents",
        title: "The shape learns to *reason.*",
        body: "LLMs with retrieval and tools: they search, cite, route and refuse when the evidence isn't there.",
        tags: ["RAG", "Tool calling", "LLM gateways", "SHAP"],
        stat: { v: "<50ms", l: "p95 to triage a ticket" },
        figure: "llm core · 6 tools",
        proof: ["ResolveIQ", "Orbyt", "FinSight AI"],
      },
      {
        label: "Products",
        title: "Then it *ships.*",
        body: "Typed, tested and deployed. Ten live builds, one with 441 tests and 96.7% API coverage behind it.",
        tags: ["Next.js", "NestJS", "PostgreSQL", "Vercel"],
        stat: { v: "10", l: "live builds, one link each" },
        figure: "10 products · 3 paths",
        proof: ["HireFlow", "Aura Roast", "BidVerse"],
      },
    ],
  },

  work: {
    eyebrow: "Featured Work",
    heading: "Three disciplines. *Pick a path.*",
    intro: "Every build below is live, grouped by the discipline it proves. Choose a path to walk through its case studies.",
    paths: [
      {
        id: "dev",
        index: "01",
        label: "Software Engineering",
        title: "Full-Stack & *Systems Engineering*",
        blurb: "Multi-tenant platforms, concurrency-safe backends and infrastructure designed to survive real traffic.",
        tags: ["System Design", "Next.js", "NestJS", "PostgreSQL", "Redis", "TypeScript"],
        hue: "#c8f25a",
        cmd: "deploy --prod",
      },
      {
        id: "ai",
        index: "02",
        label: "AI / ML Engineering",
        title: "Applied AI & *Machine Learning*",
        blurb: "Graph neural networks, calibrated classifiers, RAG and tool-using agents — evaluated honestly, shipped behind tested APIs.",
        tags: ["Deep learning", "Graph neural networks", "RAG", "PyTorch", "XGBoost", "MLOps"],
        hue: "#7dd3fc",
        cmd: "model.fit()",
      },
      {
        id: "data",
        index: "03",
        label: "Data Analytics",
        title: "Data Analytics & *Business Intelligence*",
        blurb: "Millions of raw rows turned into risk signals, statistical models and dashboards decision-makers act on.",
        tags: ["Tableau", "Python ETL", "Pandas", "Statistical modelling", "Fraud analytics", "SQL"],
        hue: "#f5b26b",
        cmd: "etl --publish",
      },
    ],
    projects: [
      {
        path: "dev",
        category: "Full-Stack · Multi-Tenant SaaS",
        period: "Oct 2026",
        title: "HireFlow",
        tagline: "One hiring platform, two sides — and both boards stay in sync.",
        description:
          "A two-sided hiring platform and ATS. Job seekers track every application on one board, companies run hiring on another, and when a recruiter moves a candidate, the candidate's own card moves with it.",
        bullets: [
          { k: "Double bookings impossible", t: "a PostgreSQL exclusion constraint rejects overlapping interviews — verified at 20 concurrent bookings" },
          { k: "One database does it all", t: "Postgres holds the data, 7 pg-boss job queues and full-text search — no Redis or broker to run" },
          { k: "441 tests, p95 under 25 ms", t: "96.7% API coverage in CI; 50 concurrent users load-tested with k6 and zero errors" },
        ],
        stack: ["System Design", "Next.js 16", "NestJS", "PostgreSQL", "Kysely", "pg-boss", "Neon Auth", "Playwright", "k6"],
        metrics: [
          { v: "441", l: "automated tests" },
          { v: "96.7%", l: "API line coverage" },
          { v: "4", l: "RBAC roles" },
        ],
        links: [
          { label: "Live demo", href: "https://hire-flow-opal-five.vercel.app" },
          { label: "Source", href: `${GITHUB}/HireFlow` },
        ],
        note: "API runs on Render's free tier — the first request can take up to a minute to wake.",
        role: "Solo build — system design, NestJS API, worker, Next.js app and CI",
        features: [
          { t: "Synced boards", d: "A recruiter's move updates the seeker's card, history and alerts" },
          { t: "Interview booking", d: "Free-time search across five calendars and signed self-booking links" },
          { t: "Resume match", d: "PDF or Word scored 0–100 by TF-IDF, with skills found and missing" },
          { t: "Tenant isolation", d: "Role checked on every route; an immutable, database-enforced audit log" },
        ],
        art: "hireflow",
        imageLabel: "hire-flow-opal-five.vercel.app",
      },
      {
        path: "dev",
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
        path: "ai",
        category: "Applied AI · NLP · MLOps",
        period: "Nov 2026",
        title: "ResolveIQ",
        tagline: "Support tickets answered, routed and risk-scored in a single call.",
        description:
          "An AI support-ticket intelligence platform. For every ticket it drafts a cited reply from the help center, predicts the right queue and scores the chance of escalation — and shows its evidence, so the agent stays in charge.",
        bullets: [
          { k: "Grounded RAG replies", t: "ChromaDB + BM25 fused by reciprocal rank, citations to the page, a refusal rule and a prompt-injection guard" },
          { k: "Explainable escalation risk", t: "calibrated XGBoost (PR-AUC 0.75 vs 0.39 base rate) with the top three SHAP reasons per ticket" },
          { k: "Production MLOps", t: "FastAPI at 49.8 ms p95, MLflow model registry, drift reports with a retrain rule, 88% coverage in CI" },
        ],
        stack: ["Python", "FastAPI", "DistilBERT", "XGBoost", "SHAP", "ChromaDB", "MLflow", "React"],
        metrics: [
          { v: "86.6%", l: "high-priority caught" },
          { v: "49.8ms", l: "API p95 latency" },
          { v: "16,337", l: "tickets trained on" },
        ],
        links: [{ label: "Source", href: `${GITHUB}/ResolveIQ` }],
        note: "Live demo coming soon — the Hugging Face Spaces deployment is in progress.",
        role: "Solo build — RAG pipeline, classifier, risk model, API and React app",
        features: [
          { t: "Draft reply", d: "Hybrid retrieval with page-level citations; nothing is sent automatically" },
          { t: "Ticket routing", d: "Fine-tuned DistilBERT with a review flag for uncertain tickets" },
          { t: "Risk + reasons", d: "Cost-tuned alert threshold and SHAP explanations per ticket" },
          { t: "Monitoring", d: "Request log without ticket text, drift detection and feedback" },
        ],
        art: "resolveiq",
        imageLabel: "resolveiq · analyze",
      },
      {
        path: "ai",
        category: "Deep Learning · Graph Neural Networks",
        period: "Nov 2026",
        title: "TrafficGNN",
        tagline: "Spatio-temporal traffic forecasting with graph neural networks.",
        description:
          "Forecasts freeway speed 5–60 minutes ahead for 207 Los Angeles sensors (METR-LA) under one leak-free protocol — proving that models which see the road network beat strong per-sensor baselines, and where that gain comes from.",
        bullets: [
          { k: "Hybrid model, best of the study", t: "DCRNN + an XGBoost residual corrector cuts 60-minute error 13.3% vs XGBoost" },
          { k: "Statistically significant", t: "the graph model wins on all 24 test days — day-level bootstrap and Diebold-Mariano, p < 0.0001" },
          { k: "Faithful and interpretable", t: "DCRNN port within 1.5% of published results; graph attention shifts downstream before jams" },
        ],
        stack: ["PyTorch", "Graph neural networks", "DCRNN", "GATv2", "XGBoost", "Statistical testing", "Streamlit"],
        metrics: [
          { v: "13.3%", l: "lower 60-min error" },
          { v: "207", l: "road sensors" },
          { v: "24/24", l: "test days won" },
        ],
        links: [
          { label: "Live dashboard", href: "https://trafficflowamldl.streamlit.app" },
          { label: "Source", href: `${GITHUB}/TrafficFlowControl_AIML-DL_T036` },
        ],
        note: "Team of five · Newton School of Technology · with an IEEE-format research paper.",
        role: "Leak-free preprocessing, baselines, the hybrid model, significance tests and reports",
        features: [
          { t: "Leak-free splits", d: "Chronological 70/10/20 with purged boundary windows" },
          { t: "Six baselines", d: "Persistence to XGBoost on one 46-feature table" },
          { t: "Graph models", d: "STGAT attention and DCRNN diffusion over the road graph" },
          { t: "Hybrid corrector", d: "XGBoost learns DCRNN's residual — lowest error at every horizon" },
        ],
        art: "trafficgnn",
        imageLabel: "trafficflowamldl.streamlit.app",
      },
      {
        path: "ai",
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
        path: "data",
        category: "Fraud Analytics · Business Intelligence",
        period: "Apr 2026",
        title: "Fraud Detection Analytics",
        tagline: "One million transactions. $12.52M of fraud, isolated and explained.",
        description:
          "An end-to-end fraud analytics pipeline over 1M transactions and 50,000 accounts across three years: Python ETL, statistical analysis and network analysis, delivered as an interactive Tableau monitoring dashboard.",
        bullets: [
          { k: "$12.52M fraud isolated", t: "17,143 fraudulent transactions — 1.71% of total volume — profiled by type, time and account" },
          { k: "Where the risk lives", t: "card-not-present drives 34.9% of fraud; crypto (5.3%) and money transfer (4.1%) carry the highest rates" },
          { k: "Actionable security signal", t: "40% of fraud lands between midnight and 5 AM, and accounts without 2FA take ~40% of cases" },
        ],
        stack: ["Python", "Pandas", "NumPy", "SciPy", "Network analysis", "Tableau", "Git LFS"],
        metrics: [
          { v: "1M", l: "transactions" },
          { v: "17,143", l: "fraud cases" },
          { v: "$12.52M", l: "fraud isolated" },
        ],
        links: [
          {
            label: "Tableau dashboard",
            href: "https://public.tableau.com/app/profile/manas.saxena/viz/FraudDetectionAnalysis_17774564367470/FraudMonitoringDashboard",
          },
          { label: "Source", href: `${GITHUB}/TransactionsFraudDetection_Tableau` },
        ],
        note: "",
        role: "ETL pipeline, feature engineering, statistical analysis and the Tableau dashboard",
        features: [
          { t: "ETL pipeline", d: "Modular Python: parsing, dedup, typed features, Git LFS data" },
          { t: "Behaviour features", d: "Velocity, amount-to-average ratios and off-hours flags" },
          { t: "Fraud rings", d: "7,411 account links scanned for shared devices and IPs" },
          { t: "Monitoring", d: "KPIs, day and hour fraud patterns, filterable in Tableau" },
        ],
        art: "fraud",
        imageLabel: "tableau public · fraud monitoring",
      },
      {
        path: "data",
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
        path: "data",
        category: "Market Analytics · Tableau",
        period: "Nov 2026",
        title: "Zomato Market Analytics",
        tagline: "What makes a Bengaluru restaurant rate well — and earn well?",
        description:
          "An interactive Tableau dashboard over 681 Bengaluru restaurants and 67,786 customer ratings, slicing the market by area, cuisine, online ordering and revenue tier to show where demand and quality concentrate.",
        bullets: [
          { k: "Market at a glance", t: "681 restaurants, 67,786 ratings, a 3.42 average rating and ₹405 average cost for two" },
          { k: "Four live filters", t: "area, online ordering, revenue category and cuisine re-slice every view at once" },
          { k: "Demand mapped", t: "top areas, the ten leading cuisines and online-order adoption (365 of 681) side by side" },
        ],
        stack: ["Tableau", "Data cleaning", "Univariate analysis", "Calculated fields", "Dashboard design"],
        metrics: [
          { v: "681", l: "restaurants" },
          { v: "67,786", l: "ratings analysed" },
          { v: "3.42", l: "average rating" },
        ],
        links: [
          {
            label: "Tableau dashboard",
            href: "https://public.tableau.com/app/profile/manas.saxena/viz/ZomatoAnalysisDashboard_17943725317610/Univariateanalysis",
          },
        ],
        note: "",
        role: "Solo — data preparation, analysis and dashboard design",
        features: [
          { t: "KPI strip", d: "Restaurants, ratings, average rating and cost for two" },
          { t: "Rating spread", d: "Distribution of ratings with its trend line" },
          { t: "Cuisine demand", d: "Bubble view of the ten most-voted cuisines" },
          { t: "Revenue tiers", d: "High, medium and low revenue restaurants compared" },
        ],
        art: "zomato",
        imageLabel: "tableau public · zomato analysis",
      },
      {
        path: "dev",
        category: "Full-Stack · Real-Time",
        period: "Feb 2026",
        title: "BidVerse",
        tagline: "An auction house that stays fair when everyone bids at once.",
        description:
          "A premium auction platform covering the full lifecycle — listing, live competitive bidding and automated commission settlement — on a security-hardened MERN stack.",
        bullets: [
          { k: "Race-free bidding", t: "atomic writes resolve simultaneous equal bids to one winner and a single HTTP 409" },
          { k: "Commission engine", t: "auto-closes expired lots and settles a 10% commission — idempotent via a compound unique index" },
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
        path: "dev",
        category: "Infrastructure · System Design",
        period: "Nov 2025",
        title: "Orbyt",
        tagline: "One OpenAI-compatible endpoint in front of every model provider.",
        description:
          "A self-hosted LLM gateway: point any OpenAI SDK client at /v1/chat/completions and Orbyt routes, retries and falls back across providers — with keys, limits and live traces in its own dashboard.",
        bullets: [
          { k: "Drop-in OpenAI compatibility", t: "any OpenAI SDK client works unchanged, with bring-your-own-key and pluggable provider adapters" },
          { k: "Routes by cost and latency", t: "a Redis key pool, model fallback chains and exponential-backoff retries with jitter over 40+ error classes" },
          { k: "Real-time SSE tracing", t: "a Clerk-secured dashboard with SHA-256-hashed API keys and RPM / TPM rate limits" },
        ],
        stack: ["System Design", "TypeScript", "Turborepo", "Next.js", "Redis", "Server-Sent Events", "Clerk", "OpenAI SDK"],
        metrics: [
          { v: "5", l: "apps in the monorepo" },
          { v: "7", l: "shared packages" },
          { v: "40+", l: "error classes handled" },
        ],
        links: [
          { label: "Live demo", href: "https://openrouter-clone-dashboard.vercel.app" },
          { label: "Source", href: `${GITHUB}/openrouter-clone` },
        ],
        note: "",
        role: "Co-builder — gateway routing, fallbacks, provider adapters and tracing UI",
        features: [
          { t: "Fallback chains", d: "A failed model hands the request to the next in line" },
          { t: "Smart routing", d: "Providers chosen by cost and latency from a Redis pool" },
          { t: "Live traces", d: "Every request streamed to the dashboard over SSE" },
          { t: "Key security", d: "SHA-256-hashed keys with per-key RPM / TPM limits" },
        ],
        art: "orbyt",
        imageLabel: "openrouter-clone-dashboard.vercel.app",
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
        points: [
          { k: "Groww / Zerodha-style advisory platform", t: "Next.js, TypeScript and PostgreSQL — 14 pages, 12 APIs" },
          { k: "Portfolio scanner", t: "parses CAS PDFs and broker CSV / XLSX into 10 analyses on AMFI NAV data" },
          { k: "Grounded RAG copilot", t: "BM25 + Postgres search, 14 eval cases, with a guard against ungrounded numbers" },
          { k: "SEBI approval workflow", t: "3-role review in Payload CMS, 7 financial calculators, 172 Vitest tests" },
        ],
        skills: ["Next.js", "PostgreSQL", "RAG", "Payload CMS", "Vitest", "Financial data"],
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
    featured: {
      kicker: "National hackathon · Achievement",
      title: "Top 20 all-India · Cars24 Car-a-thon 2026",
      body: "Designed PIT-24: used-car cleaning re-imagined as a pit-lane assembly line — eight stations, one car every 24 seconds — backed by a solution deep-dive and a 3D, replayable simulation of throughput, crew and cost per car.",
      date: "2026",
      metrics: [
        { v: "24s", l: "takt time" },
        { v: "144", l: "cars / hour" },
        { v: "Top 20", l: "nationally" },
      ],
      links: [
        { label: "Solution", href: "https://pit24-site.vercel.app/" },
        { label: "Simulation", href: "https://pit24-simulation.vercel.app/" },
      ],
    },
    items: [
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
        body: "Organised FinSetu, an India–US finance collaboration with CWC University, plus a Zerodha-partnered quiz and weekly financial-literacy workshops. Owned the club budget.",
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
      { label: "Kaggle", stat: "Notebooks & datasets", href: "https://www.kaggle.com/manasviveksaxena" },
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
        tags: ["RAG", "Tool calling", "Groq", "LLaMA 3.3 70B", "ChromaDB", "LLM gateways", "Structured output", "Fallback design"],
        provenIn: { label: "Aura Roast", href: "#work" },
        log: [
          "barista.chat(\"smooth, low acidity\")",
          "tool: search_catalogue(roast=medium) · 5 hits",
          "tool: add_to_cart(drink, qty=1) ✓",
          "fallback provider armed ✓",
        ],
      },
      {
        title: "Machine Learning & Deep Learning",
        trace: "Model card",
        description: "Models validated before anyone trusts them — leak-free splits, honest baselines, significance tests.",
        tags: ["Python", "PyTorch", "Graph neural networks", "XGBoost", "Scikit-learn", "DistilBERT", "SHAP", "Forecasting", "MLflow"],
        provenIn: { label: "TrafficGNN", href: "#work" },
        log: [
          "load(METR-LA) · 207 sensors × 34,272 steps",
          "split(70/10/20, purge_boundaries=True)",
          "fit(DCRNN) + xgb_residual() · 3 seeds",
          "MAE@60 −13.3% · 24/24 days, p < 0.0001 ✓",
        ],
      },
      {
        title: "Full-Stack Engineering",
        trace: "Request log",
        description: "Typed, server-rendered platforms with correctness built in.",
        tags: ["System Design", "Next.js", "React.js", "TypeScript", "NestJS", "Node.js", "Express.js", "PostgreSQL", "Redis", "MongoDB", "Kysely", "JWT"],
        provenIn: { label: "HireFlow", href: "#work" },
        log: [
          "POST /api/v1/interviews · exclusion constraint ✓",
          "20 concurrent bookings → 1 slot, 19 refused",
          "pg-boss · 7 queues · idempotent jobs",
          "441 tests · p95 23 ms @ 50 users ✓",
        ],
      },
      {
        title: "Data Analytics & Visualisation",
        trace: "ETL log",
        description: "From raw survey dumps to dashboards people act on.",
        tags: ["Tableau", "SQL", "Pandas", "Python ETL", "Statsmodels", "Logistic regression", "Fraud analytics", "Network analysis"],
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
      { k: "Studying", v: "BTech, Computer Science & AI" },
      { k: "Currently", v: "Full Stack Developer · WisBees" },
      { k: "Problem solving", v: "250+ LeetCode · Codeforces" },
    ],
    lead: "Most engineers pick a lane. I work across *the whole road.*",
    paragraphs: [
      "BTech Computer Science & AI student at Newton School of Technology, Rishihood University. I build full-stack products and applied ML — from schema and system design to LLM-powered features.",
      "I care about systems that survive real users. Outside the editor, I'm VP of the Finance Club — workshops, investment simulations and the club's budget.",
    ],
    education: [
      {
        title: "BTech — Computer Science & AI",
        school: "Newton School of Technology, Rishihood University",
        years: "2024 — 2028",
        score: "CGPA 7.2",
      },
      { title: "Class XII", school: "Bansal Public School", years: "2022 — 2023", score: "74.0%" },
      { title: "Class X", school: "Jiwrajka International School", years: "2020 — 2021", score: "92.0%" },
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
