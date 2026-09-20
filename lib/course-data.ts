// ---------------------------------------------------------------------------
// CENTRAL EDITABLE CONTENT
// ---------------------------------------------------------------------------
// Every string a marketer/founder might want to change lives in this file.
// Components read from here instead of hard-coding copy, so pricing,
// curriculum, FAQ, bonuses, etc. can all be updated without touching JSX.
// Anything marked "PLACEHOLDER" is intentionally generic and must be
// replaced with real, verified information before launch.
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: "FX University",
  shortName: "FXU",
  tagline: "A structured, beginner-friendly Forex education course.",
  url: "https://fxuniversity.online",
  supportEmail: "support@fxuniversity.online", // PLACEHOLDER
};

// Single source of truth for the student-count claim, read by
// <StudentCount /> everywhere it appears. This is a genuine, fixed figure —
// update it here when the real number changes. It is NOT a live/visitor
// counter, and it says "trained," never "active" or "profitable."
export const studentProof = {
  count: 5000,
  // Formats a plain number as "5,000+" — kept as a function so the "+"
  // convention lives in one place.
  displaySuffix: "+",
};

export const nav = {
  links: [
    { label: "Curriculum", href: "#curriculum" },
    { label: "What You Get", href: "#what-you-get" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  ctaLabel: "Get Started",
  ctaHref: "#pricing",
};

export const announcement = {
  text: "New cohort enrollment is open — structured lessons, beginner to intermediate.",
  ctaLabel: "See what's included",
  ctaHref: "#curriculum",
  dismissible: true,
};

export const hero = {
  eyebrow: "Beginner Forex Education",
  headline: "You don't need more free content. You need a clear path.",
  subheadline:
    "A structured course that takes you from not knowing where to start to understanding how the market actually moves — how to read it, manage risk, and trade with a plan instead of guesswork. Built in order, so every lesson builds on the last.",
  bullets: [
    "Built for complete beginners — no prior trading knowledge required",
    "One structured path, not scattered videos and contradictory posts",
    "Focused on understanding the market, not chasing signals",
  ],
  ctaPrimary: { label: "Get Course Access", href: "#pricing" },
  ctaSecondary: { label: "View Curriculum", href: "#curriculum" },
  disclaimerNote:
    "Educational course only. Trading Forex involves substantial risk of loss.",
};

export const problems = {
  eyebrow: "If this sounds familiar",
  headline: "Most beginners don't fail because they lack effort.",
  subheadline:
    "They fail because they never learned the market in a structured way. These are the most common problems beginner traders run into.",
  items: [
    {
      title: "Not knowing where to start",
      description:
        "There's too much scattered information online, and no clear order to learn it in.",
    },
    {
      title: "Confusing terminology",
      description:
        "Pips, lots, spreads, leverage — the vocabulary alone can feel like a second language.",
    },
    {
      title: "Randomly entering trades",
      description:
        "Opening positions based on a feeling or a tip, with no real reason behind the entry.",
    },
    {
      title: "Poor risk management",
      description:
        "Risking too much on a single trade, with no plan for what happens if it goes wrong.",
    },
    {
      title: "Emotional trading",
      description:
        "Letting fear, excitement, or frustration decide the next move instead of a plan.",
    },
    {
      title: "Following signals blindly",
      description:
        "Copying someone else's trades without understanding why the trade was taken.",
    },
    {
      title: "No structured learning path",
      description:
        "Jumping between free videos and posts with no clear beginner-to-intermediate progression.",
    },
  ],
};

export const solution = {
  eyebrow: "How The Course Is Built",
  headline: "One structured path, from fundamentals to a working trading plan.",
  description:
    "Instead of piecing together random videos and posts, you follow a single course built in order — starting with how the market actually works, moving through chart reading and analysis, and ending with risk management, psychology, and a trading plan you build yourself.",
  points: [
    "Learn concepts in the order they build on each other",
    "Every module includes examples, exercises, and practical checklists",
    "Designed to build understanding, not dependence on signals",
  ],
};

// The course's process/philosophy — emphasizes method over outcome.
// No promise of profit anywhere in this copy, by design.
export const courseProcess = {
  eyebrow: "The Process",
  headline: "What makes this course different isn't the topics. It's the process.",
  subheadline:
    "Most free content stops at theory. This course is built around a repeatable process, so you finish with a way of working — not just a list of things you've watched.",
  steps: [
    {
      title: "Learn",
      description: "Understand each concept in plain language before moving on.",
    },
    {
      title: "Understand",
      description: "See why it works with real chart examples, not just definitions.",
    },
    {
      title: "Practice",
      description: "Apply it through exercises and checklists built into the module.",
    },
    {
      title: "Backtest",
      description: "Test the idea against historical charts before risking anything.",
    },
    {
      title: "Journal",
      description: "Record what happened and why, honestly, in your own words.",
    },
    {
      title: "Improve",
      description: "Review your journal and refine your plan based on your own data.",
    },
  ],
  note: "The goal isn't to promise results. It's to teach you a process you can rely on and keep improving.",
};

export const benefits = {
  eyebrow: "What You'll Walk Away With",
  headline: "Practical skills, not just theory.",
  items: [
    {
      title: "Understand how Forex works",
      description: "The mechanics of currency pairs, pricing, and how trades actually execute.",
    },
    {
      title: "Read charts confidently",
      description: "Recognize trends, ranges, support and resistance without second-guessing.",
    },
    {
      title: "Understand market structure",
      description: "See how price moves in swings and phases instead of random noise.",
    },
    {
      title: "Apply technical analysis",
      description: "Use indicators and tools as support — not as the whole strategy.",
    },
    {
      title: "Read price action",
      description: "Interpret candles and patterns to understand what buyers and sellers are doing.",
    },
    {
      title: "Understand fundamentals",
      description: "Know which news and events actually move currency pairs, and why.",
    },
    {
      title: "Manage risk properly",
      description: "Size positions and set stops so no single trade can hurt your account.",
    },
    {
      title: "Understand trading psychology",
      description: "Recognize emotional patterns that lead to bad decisions — and how to avoid them.",
    },
    {
      title: "Build a trading plan",
      description: "Put rules on paper for entries, exits, and risk, instead of improvising.",
    },
    {
      title: "Backtest and journal",
      description: "Test ideas against historical data and track your own results honestly.",
    },
  ],
};

// Identity-level outcomes — knowledge, process and discipline only.
// Deliberately makes no profit or income claims.
export const outcomes = {
  eyebrow: "Who You Become",
  headline: "This course isn't about watching more content. It's about becoming a different kind of trader.",
  subheadline:
    "Not a promise of profit — a change in how you approach the market. Here's the shift most students are aiming for by the end.",
  before: {
    title: "Where most beginners start",
    items: [
      "Jumping between free videos with no clear order",
      "Entering trades on a feeling or a tip",
      "No real plan for risk, entries, or exits",
      "Reacting emotionally to wins and losses",
    ],
  },
  after: {
    title: "What the course builds toward",
    items: [
      "A structured understanding of how the market works",
      "The ability to read charts and explain your own reasoning",
      "A written plan with real risk management behind it",
      "A process for reviewing and improving, instead of guessing",
    ],
  },
};

// Objection handling: "why pay for a course when free content exists?"
export const whyStructured = {
  eyebrow: "A Fair Question",
  headline: "Why pay for a course when there's free content everywhere?",
  description:
    "Free Forex content isn't the problem — there's a huge amount of it, and some of it is genuinely good. The problem is that it's scattered across hundreds of videos and posts, often contradicts itself, and rarely follows a beginner-to-intermediate order. You end up with fragments, not a foundation.",
  points: [
    {
      title: "Order",
      description: "Every concept is taught in the sequence it needs to be understood in — nothing assumes knowledge you don't have yet.",
    },
    {
      title: "Consistency",
      description: "One course, one voice, no contradicting advice from ten different creators.",
    },
    {
      title: "Application",
      description: "Each module pairs theory with exercises and checklists, so you practice it, not just watch it.",
    },
  ],
  closing:
    "You can keep searching for the next free video, or you can follow a path that's already been put in order for you.",
};

export type CurriculumModule = {
  number: number;
  title: string;
  description: string;
  topics: string[];
};

export const curriculum = {
  eyebrow: "Course Curriculum",
  headline: "10 modules, built in order.",
  subheadline:
    "Each module builds on the last — from understanding what Forex is, to developing your own structured approach to the market.",
  modules: [
    {
      number: 1,
      title: "Forex Fundamentals",
      description:
        "The foundation everything else is built on: what the Forex market is and how it actually functions.",
      topics: [
        "What the Forex market is and who actually trades in it",
        "Currency pairs explained: base vs. quote currency",
        "Majors, minors, and exotics — and how they differ",
        "Pips and pipettes: how price movement is measured",
        "Lot sizes: standard, mini, micro, and what they mean for risk",
        "Spreads and the bid/ask price, in plain terms",
        "Leverage and margin — how they work, and the risk they add",
        "Trading sessions and market participants (banks, brokers, retail traders)",
        "Order types: market, limit, and stop orders explained",
      ],
    },
    {
      number: 2,
      title: "Reading & Understanding Charts",
      description: "Learn to look at a chart and understand what it's actually showing you.",
      topics: [
        "Candlesticks and OHLC (open, high, low, close) explained",
        "Choosing and switching between timeframes",
        "Identifying trends, highs, and lows",
        "Support and resistance: how to spot real levels",
        "Understanding market structure at a glance",
        "Breakouts vs. false breakouts — telling them apart",
        "Reading the same chart across multiple timeframes",
      ],
    },
    {
      number: 3,
      title: "Technical Analysis",
      description: "The tools traders use to study price behavior and support their decisions.",
      topics: [
        "Drawing trendlines correctly (and avoiding the common mistakes)",
        "Moving averages and how to use them as a trend filter",
        "RSI: reading momentum and overbought/oversold conditions",
        "MACD: what it shows and how to read it",
        "Fibonacci retracements for spotting potential reaction zones",
        "Common chart patterns and candlestick patterns",
        "Confluence: combining tools instead of relying on one",
        "The limitations of indicators — what they can't tell you",
      ],
    },
    {
      number: 4,
      title: "Price Action",
      description: "Reading raw price movement instead of relying only on indicators.",
      topics: [
        "Reading price movement without indicators",
        "Market structure: highs, lows, and structural shifts",
        "Supply and demand zones explained",
        "Liquidity concepts and why price often reacts where it does",
        "Break of structure (BOS) and change of character (CHOCH)",
        "Planning entries based on structure, not guesswork",
        "Setting a stop loss and take profit with a reason behind each",
        "Applying price action across multiple timeframes",
      ],
    },
    {
      number: 5,
      title: "Fundamental Analysis",
      description: "Understanding the economic events and data that move currency pairs.",
      topics: [
        "Interest rates and why they move currencies",
        "Inflation and what rising or falling inflation signals",
        "Employment data and why it matters to traders",
        "CPI and NFP: what these reports are and why they're watched closely",
        "GDP and broader economic health indicators",
        "How central banks influence the market",
        "Reading an economic calendar and prioritizing major events",
        "Geopolitics and unscheduled news",
        "Combining fundamentals with your technical analysis",
      ],
    },
    {
      number: 6,
      title: "Risk Management",
      description:
        "The single most important skill for staying in the game long enough to improve. Includes worked, practical numerical examples throughout.",
      topics: [
        "Deciding how much to risk per trade — with worked examples",
        "Position sizing: calculating lot size from your risk and stop loss",
        "Setting a stop loss and take profit with real numbers",
        "Risk-to-reward ratios, explained with real trade examples",
        "Understanding drawdown and why it compounds",
        "How leverage and margin affect your real risk",
        "Handling losing streaks without blowing up your account",
        "Capital preservation as the actual first goal",
      ],
    },
    {
      number: 7,
      title: "Trading Psychology",
      description: "Managing the mental side of trading — often the hardest part.",
      topics: [
        "Fear and how it leads to hesitation or early exits",
        "Greed and how it leads to oversized, undisciplined trades",
        "FOMO: recognizing it in the moment",
        "Revenge trading — what it is and how it starts",
        "Overtrading and why more trades isn't more progress",
        "Impatience and jumping in before your setup is ready",
        "Confirmation bias: only seeing what supports what you want to see",
        "Building real discipline, patience, and emotional control",
      ],
    },
    {
      number: 8,
      title: "Building a Trading Plan",
      description:
        "Turning everything you've learned into a written set of personal rules, using a practical trading-plan framework included in this module.",
      topics: [
        "Defining your trading style and the markets you'll focus on",
        "Choosing your timeframes and weekly schedule",
        "Writing down your setups and entry criteria",
        "Defining exit rules before you're in the trade",
        "Setting your personal risk rules in writing",
        "Building a routine around your trading sessions",
        "Running a structured weekly review",
        "The trading-plan framework: filling in your own plan step by step",
      ],
    },
    {
      number: 9,
      title: "Backtesting & Trading Journal",
      description:
        "Testing ideas honestly and tracking your own progress over time, using a practical journal framework included in this module.",
      topics: [
        "What backtesting is and why it matters before risking real money",
        "Testing a set of rules against historical charts",
        "Collecting your own data instead of relying on assumptions",
        "Win rate and average win/loss, explained simply",
        "Risk/reward and expectancy — what they tell you together",
        "Understanding drawdown from your own test results",
        "Forward testing on a demo account before going live",
        "The trading-journal framework: what to record after every trade",
      ],
    },
    {
      number: 10,
      title: "Practical Forex Development",
      description:
        "Bringing it all together with practical tasks that reinforce the full course.",
      topics: [
        "Applying the full course on a demo account before anything else",
        "What to look for in a broker, and basic broker-safety checks",
        "Recognizing common Forex scams and red flags",
        "Signal dependency — and why the course avoids creating it",
        "An honest look at prop firms and what they actually involve",
        "Turning the course into a repeatable weekly process",
        "Common beginner mistakes and how to avoid repeating them",
        "Continuous improvement: what to revisit as you progress",
      ],
    },
  ] satisfies CurriculumModule[],
};

export const audienceFit = {
  forYou: {
    headline: "Who this is for",
    items: [
      "Complete beginners who want to learn Forex properly, from the start",
      "People who've tried trading before but never had a structured path",
      "Traders who struggle with discipline and consistency",
      "Anyone who wants to understand the market instead of blindly following signals",
    ],
  },
  notForYou: {
    headline: "Who this is not for",
    items: [
      "Anyone looking for guaranteed profits or a get-rich-quick system",
      "Anyone expecting instant results with no study or practice",
      "Anyone who wants someone else to trade for them",
      "Anyone unwilling to spend time learning the fundamentals first",
    ],
  },
};

export const whatYouGet = {
  eyebrow: "Everything Inside",
  headline: "Here's exactly what you're getting — and why each part matters.",
  subheadline:
    "Not a list of module names. This is the actual value inside the course, and the reason each piece is there.",
  items: [
    {
      title: "Complete Forex fundamentals",
      description: "So you're never lost on basic terminology again — everything after this builds on it.",
    },
    {
      title: "Chart reading, taught from zero",
      description: "The skill that makes every other lesson usable — without it, analysis is just noise.",
    },
    {
      title: "Technical analysis",
      description: "Tools to support your decisions with evidence, instead of guessing at what price will do.",
    },
    {
      title: "Price action",
      description: "Learn to read what buyers and sellers are actually doing on the chart in front of you.",
    },
    {
      title: "Fundamental analysis",
      description: "Understand which news events matter and why, so surprise volatility stops catching you off guard.",
    },
    {
      title: "Risk management",
      description: "The single skill that decides whether you're still trading in a year — sizing, stops, and protecting your account.",
    },
    {
      title: "Trading psychology",
      description: "Recognize the emotional patterns that cause good traders to make bad decisions.",
    },
    {
      title: "Trading-plan development",
      description: "Turn everything you've learned into written rules, so decisions stop being improvised.",
    },
    {
      title: "Backtesting",
      description: "Test an idea against history before you ever risk it — confidence built on evidence, not hope.",
    },
    {
      title: "Trading journal framework",
      description: "A simple structure for recording your own trades honestly, so you can actually improve.",
    },
    {
      title: "Practical exercises in every module",
      description: "So you apply each concept instead of just reading about it.",
    },
    {
      title: "Checklists & frameworks",
      description: "Quick, practical references you can use before every session — not just once and forgotten.",
    },
    {
      title: "Common beginner mistakes to avoid",
      description: "Learn from mistakes other beginners already made, instead of repeating them yourself.",
    },
    {
      title: "Secure, personal course access",
      description: "Protected access to your material, usable on mobile, tablet, or desktop.",
    },
  ],
};

export const coursePreview = {
  eyebrow: "Course Experience",
  headline: "A clean, focused reading experience.",
  subheadline:
    "Placeholder previews below — real course screenshots will replace these once the material is finalized.",
  items: [
    { title: "Module overview screens", description: "Clear structure for every module and lesson." },
    { title: "Visual examples", description: "Annotated chart examples to reinforce each concept." },
    { title: "Checklists & exercises", description: "Practical tasks at the end of each section." },
  ],
};

export const bonuses = {
  eyebrow: "Bonuses",
  headline: "Additional resources", // PLACEHOLDER — finalize once bonuses are confirmed
  subheadline:
    "Bonus content is still being finalized. This section is a placeholder — real bonuses and their details will be added here before launch. No values or claims are listed until confirmed.",
  items: [
    { title: "Bonus 1 — Title pending", description: "Description to be added." },
    { title: "Bonus 2 — Title pending", description: "Description to be added." },
    { title: "Bonus 3 — Title pending", description: "Description to be added." },
  ],
};

// The cost of staying unstructured — urgency built from real consequences,
// never from countdowns, fake stock levels, or manufactured deadlines.
export const opportunityCost = {
  eyebrow: "The Real Cost",
  headline: "The cost isn't the price of the course. It's the time you spend staying confused.",
  subheadline:
    "Every week spent jumping between free videos, copying signals, and guessing at entries is a week not spent building a real skill. Here's what that usually looks like.",
  items: [
    { title: "Wasted time", description: "Hours spent watching scattered content that never adds up to a full picture." },
    { title: "Random learning", description: "Picking up isolated tips with no idea how they fit together." },
    { title: "Emotional decisions", description: "Trading on impulse because there's no plan to fall back on." },
    { title: "Repeated beginner mistakes", description: "Making the same avoidable errors that a structured path would have flagged early." },
    { title: "No trading plan", description: "Still improvising entries and exits after months of 'learning'." },
    { title: "Constantly chasing the next strategy", description: "Jumping to a new idea every time the last one doesn't work instantly." },
  ],
  closing:
    "You can keep searching for random Forex information, or you can follow a structured learning path built to take you from beginner to intermediate in order.",
};

// The displayed price and billing note are NOT defined here — they come from
// lib/content.ts's getDisplayPrice() (derived from the same env vars that
// drive the actual Paystack charge, so display and charge can never drift
// apart) and getSiteContent() (admin-editable via /admin/content) via
// components/PricingSection.tsx. There is deliberately no "original price"
// / discount-badge field: this course has one real price, and a struck-
// through anchor price would be a fabricated discount claim.
export const pricing = {
  eyebrow: "Enrollment",
  headline: "One course. One price. Full access.",
  subheadline:
    "Everything from the fundamentals to a full trading plan, in one structured course — here's exactly what's included.",
  couponPlaceholder: "Have a coupon code?",
  ctaLabel: "Get Course Access",
  ctaHref: "/get-started",
  features: [
    "All 10 modules — fundamentals through to a full trading plan",
    "Practical exercises, checklists, and worked examples in every module",
    "Backtesting walkthrough and a trading-journal framework",
    "Secure, personal course access on mobile and desktop",
    "Bonus resources, added here once finalized",
  ],
  paymentNote: "Payments are processed securely through Paystack.",
};

export const howItWorks = {
  eyebrow: "How It Works",
  headline: "Three simple steps.",
  steps: [
    {
      step: 1,
      title: "Create your account",
      description: "Sign up with your basic details in under a minute.",
    },
    {
      step: 2,
      title: "Complete payment",
      description: "Choose your payment method and confirm your enrollment.",
    },
    {
      step: 3,
      title: "Get secure access",
      description: "Log in to your personal, protected course access right away.",
    },
  ],
};

// FAQ ITEMS are no longer defined here: they're admin-managed in Supabase
// (supabase/migrations/0005_admin_cms.sql, managed at /admin/faqs) and
// fetched at request time by components/FAQSection.tsx. Only the section's
// heading copy (design content) stays here.
export const faq = {
  eyebrow: "Frequently Asked Questions",
  headline: "Common questions, answered honestly.",
};

// Social proof (section #16). Pairs the genuine student-count claim with
// honest trust signals. Deliberately does not mention results/profit.
export const trust = {
  eyebrow: "Trusted By Thousands",
  headline: "Built to be honest, not hyped.",
  studentProofNote:
    "That figure means students who have been trained through the course — not that all of them are currently active, and not a claim about who became profitable.",
  subheadline:
    "We'd rather under-promise than exaggerate anywhere on this page.",
  points: [
    {
      title: "Original course content",
      description: "Written from scratch specifically for this course — not copied from other sources.",
    },
    {
      title: "Secure checkout & access",
      description: "Your payment and course access are handled through protected, access-controlled systems.",
    },
    {
      title: "Clear, honest marketing",
      description: "No fake urgency, no fake scarcity, no fake numbers, and no guaranteed-profit claims.",
    },
  ],
};

// Testimonials (section #17) — a separate section from the trust/social
// proof block above. The individual testimonial ITEMS are no longer defined
// here: they're admin-managed in Supabase (supabase/migrations/0005_admin_cms.sql,
// managed at /admin/testimonials) and fetched at request time by
// components/TestimonialsSection.tsx, which renders nothing at all until a
// genuine, published testimonial exists — never a placeholder shown to
// visitors as real. Only the section's heading copy (design content, not
// data) stays here, same as every other section heading in this file.
export const testimonials = {
  eyebrow: "Testimonials",
  headline: "What students say.",
  subheadline: "Real feedback from students who have gone through the course.",
};

export const riskDisclaimer = {
  headline: "Risk Disclaimer",
  body: [
    "Trading Forex (foreign exchange) involves substantial risk of loss and is not suitable for every investor. Leverage can work against you as well as for you, and it is possible to lose more than your initial investment.",
    "This course is provided strictly for educational purposes. It does not constitute financial, investment, or trading advice, and no content in this course or on this page should be interpreted as a recommendation to buy, sell, or hold any financial instrument.",
    "Past educational examples are for illustration only and are not indicative of future results. You are solely responsible for your own trading decisions. Consider your financial situation carefully, and seek advice from a licensed financial professional if needed before trading with real funds.",
  ],
};

// Headline/subheadline/button label are admin-editable (site_content table,
// /admin/content) via lib/content.ts's getSiteContent() — the values below
// are only its hardcoded fallback defaults (SITE_CONTENT_DEFAULTS), kept in
// sync by hand. ctaHref is layout, not copy, so it stays here.
export const finalCta = {
  ctaHref: "#pricing",
};

export const footer = {
  columns: [
    {
      title: "Course",
      links: [
        { label: "Curriculum", href: "#curriculum" },
        { label: "What You Get", href: "#what-you-get" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: `mailto:${siteConfig.supportEmail}` },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" }, // PLACEHOLDER page
        { label: "Terms of Service", href: "/terms" }, // PLACEHOLDER page
        { label: "Risk Disclaimer", href: "#risk-disclaimer" },
      ],
    },
  ],
  disclaimerNote:
    "Trading Forex involves substantial risk of loss and is not suitable for all investors. This site provides educational content only and is not financial advice.",
};
