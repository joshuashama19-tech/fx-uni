import type { Interaction } from "./types";

// Module 10 — Practical Forex Development. Batch 3 of the interactive-
// course expansion (Modules 8–10, the final batch), authored against the
// same standard as Module 1 (pilot) and Modules 2–9 (Batches 1 and 2) —
// see those files' own header comments for the full methodology.
//
// Grounding: every prompt, scenario, correct answer, and feedback line
// below is traced to a specific sentence, checklist item, or worked
// scenario in this module's own content/course/modules/module-10-
// practical-forex-development/01-content.md. Per the user's Module 10
// guidance, interactions favor practical trader-development scenarios,
// identifying appropriate next steps (L2, L8, L13, L15), reviewing a
// hypothetical trader's process for weaknesses (L2's readiness checklist,
// L9's three readiness types, L11's review-without-adherence scenario,
// L12's reactive-change scenario), applying concepts from earlier modules
// (Module 5's calendar, Module 6's risk rules, Module 7's psychology,
// Module 9's sample-size caution are all referenced exactly as the lessons
// reference them), and capstone-style, course-spanning decision making,
// especially in Lesson 14's mistake-audit recap. No interaction invents a
// broker, prop firm, or signal provider's specific terms — this module is
// explicit that such claims go stale and it names none, and no
// interaction here does either. No interaction claims any checklist,
// roadmap, or number of practice days determines personal readiness —
// every relevant feedback line preserves the module's own position that
// financial readiness is the student's own judgment, not this course's.
//
// Interaction count: 2 per lesson for most of the 15 lessons; Lesson 6
// (Recognizing Forex Scams and Fraud, which covers 14 distinct warning
// signs) and Lesson 14 (the capstone Common Beginner Mistakes recap,
// spanning the whole course) get 3 each, matching the same density
// Modules 3, 7, 9, and others used for their own especially content-dense
// lessons. Total: 32 interactions.
export const module10Interactions: Record<string, Interaction[]> = {
  "from-learning-to-application": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l1-q1",
      prompt: "Per this lesson, why isn't understanding a concept the same as executing it consistently?",
      options: [
        { key: "a", text: "They're actually the same skill, just described differently" },
        {
          key: "b",
          text: "Explaining a rule and following it under real, emotional pressure draw on different skills — consistent execution is built through repetition and review, not understanding alone",
        },
        { key: "c", text: "Execution only matters for full-time professional traders" },
        { key: "d", text: "Understanding a concept is actually harder than executing it" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own example: a trader can correctly explain their stop-loss rule and still move it under emotional pressure, because explaining and following under pressure are different skills.",
      incorrectFeedback:
        "The lesson's point: a trader can explain a rule perfectly and still fail to follow it under pressure — explaining and consistently executing draw on different skills, closed through repetition, not understanding alone.",
    },
    {
      kind: "reveal",
      id: "m10-l1-r1",
      label: "Think about it",
      prompt:
        "Why does this lesson insist on practical repetition — first backtesting, then demo practice — rather than moving straight from a written plan to live trading?",
      revealLabel: "What the lesson says",
      explanation:
        "A plan read once, or even carefully written in Module 8, isn't yet a plan a trader can execute smoothly. Repetition — first in backtesting, then in demo practice — is what turns a written set of rules into something that can actually be followed under pressure, the same way any other practiced skill becomes more reliable through repetition.",
    },
  ],

  "demo-trading-and-practice": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l2-q1",
      prompt: "Which of the following is an honest limitation of demo trading, per this lesson?",
      options: [
        { key: "a", text: "Demo accounts can't use real-time or near-real-time market prices" },
        {
          key: "b",
          text: "It doesn't reproduce the emotional pressure of risking real money, and some platforms fill demo orders with less friction than live accounts see in fast-moving conditions",
        },
        { key: "c", text: "Demo trading teaches nothing useful about execution" },
        { key: "d", text: "Demo accounts are not legal in most jurisdictions" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson states this plainly: demo trading is genuinely useful practice, but it isn't a guarantee live trading will go the same way, for exactly these two honest reasons.",
      incorrectFeedback:
        "The lesson's stated limitations: demo execution can be smoother than live execution in fast markets, and demo doesn't reproduce the emotional pressure of real money at risk — not the other options listed.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l2-q2",
      scenario:
        "A trader wants to begin structured demo practice, but hasn't yet written a complete Module 8 trading plan.",
      prompt: "Per this lesson's Demo Trading Readiness Checklist, are they ready to start?",
      options: [
        { key: "a", text: "Yes — a plan can be written later, while already demo trading" },
        {
          key: "b",
          text: "No — the checklist's first item is a written, complete trading plan; demo practice is meant to test executing that plan, not replace writing it",
        },
        { key: "c", text: "Yes, as long as they understand order types" },
        { key: "d", text: "It doesn't matter — the checklist is optional" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the Demo Trading Readiness Checklist's first confirmation is exactly this: \"My trading plan (Module 8) is written and complete.\"",
      incorrectFeedback:
        "The checklist's very first item is a written, complete trading plan — demo practice exists to test executing that plan consistently, not to substitute for writing it.",
    },
  ],

  "applying-your-trading-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l3-q1",
      prompt:
        "Per this lesson's before/during/after session structure, which of the following belongs to the \"Before\" phase?",
      options: [
        { key: "a", text: "Checking the economic calendar for scheduled releases" },
        { key: "b", text: "Executing only if every rule is actually satisfied" },
        { key: "c", text: "Recording every trade taken in the journal" },
        { key: "d", text: "Closing the session deliberately" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — checking the calendar is step 2 of the \"Before the session\" list, alongside reviewing the plan, identifying market conditions, and preparing the watchlist.",
      incorrectFeedback:
        "Checking the economic calendar belongs to the \"Before the session\" phase. The other options belong to \"During\" (executing per the rules) and \"After\" (recording trades, closing the session).",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l3-q2",
      prompt: "True or false: per this lesson, a trading plan's job is to predict what price will do next.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that a plan is a decision framework, not a prediction machine: it defines what conditions justify a trade, but doesn't remove the uncertainty any individual trade carries.",
      incorrectFeedback:
        "Actually false. The lesson states plainly that a plan doesn't predict what price will do next — it's a decision framework, defining in advance what justifies a trade and how it will be managed.",
    },
  ],

  "broker-basics-and-safety": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l4-q1",
      prompt: "Per this lesson's honest point about regulation, does being regulated guarantee a broker has no possible problems?",
      options: [
        { key: "a", text: "Yes — regulation is an absolute guarantee against every possible problem" },
        {
          key: "b",
          text: "No — regulation is a genuinely meaningful factor, but different regulators have different oversight levels, and even well-regulated firms can have legitimate account-specific disputes",
        },
        { key: "c", text: "No — regulation means essentially nothing" },
        { key: "d", text: "Only if the broker also offers a bonus for new deposits" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is direct: regulation is one important input into due diligence, not a single checkbox that removes the need for anything else.",
      incorrectFeedback:
        "The lesson's actual position: regulation is a genuinely meaningful factor, but not an absolute guarantee — different regulators have different oversight levels, and even well-regulated firms can have legitimate disputes.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l4-q2",
      prompt:
        "True or false: a badge or logo displayed on a broker's own website is sufficient verification of its regulatory status.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson calls a logo or badge on a website a claim, not verification, and points to Lesson 5's process of checking it against the regulator's own published register instead.",
      incorrectFeedback:
        "Actually false. The lesson is explicit: a logo, badge, or line of text on a website is a claim, not verification — it needs to be checked against the actual regulator's own register.",
    },
  ],

  "broker-and-platform-due-diligence": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l5-q1",
      prompt: "Per this lesson, what should a trader check a broker's claimed regulatory registration against?",
      options: [
        { key: "a", text: "Reviews and testimonials posted online" },
        {
          key: "b",
          text: "The regulator's own official public register, using the broker's exact legal entity name",
        },
        { key: "c", text: "A badge or link displayed on the broker's own website" },
        { key: "d", text: "Posts about the broker on social media" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's practical process: identify the exact legal entity name, then check it directly against the regulator's own public register, not a link on the broker's own site.",
      incorrectFeedback:
        "The lesson's process is specific: check the exact legal entity name directly against the regulator's own official register — not reviews, testimonials, social media, or a badge on the broker's own site, any of which \"could point anywhere.\"",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l5-q2",
      prompt: "True or false: this lesson recommends a specific broker as a safe, verified choice.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson explicitly does not name or recommend any specific broker, since broker terms, fees, and regulatory status all change over time.",
      incorrectFeedback:
        "Actually false. The lesson explicitly states it does not name or recommend any specific broker — the checklist is the durable part; specifics about any real broker need to be verified directly, at the time a decision is made.",
    },
  ],

  "recognizing-forex-scams-and-fraud": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l6-q1",
      scenario: "An offer promises a fixed monthly return with \"zero risk.\"",
      prompt: "What does this combination represent, per this lesson?",
      options: [
        { key: "a", text: "A normal, low-risk investment product" },
        { key: "b", text: "One of the clearest, most consistent fraud indicators covered in this course" },
        { key: "c", text: "A legitimate broker's standard marketing language" },
        { key: "d", text: "Evidence that the underlying strategy is well-tested" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — \"guaranteed returns\" and \"risk-free trading\" are both listed explicitly as core scam patterns: markets are uncertain, and trading always carries risk.",
      incorrectFeedback:
        "The lesson names this combination directly as one of its clearest scam patterns — a guaranteed, fixed return contradicts the basic reality that markets are uncertain and trading always carries risk.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l6-q2",
      scenario:
        "A trader tries to withdraw funds from a platform and repeatedly encounters shifting excuses, new fees, and delays.",
      prompt: "What does this pattern represent, per this lesson?",
      options: [
        { key: "a", text: "Normal broker processing time" },
        { key: "b", text: "One of the most reliable fraud indicators there is" },
        { key: "c", text: "Proof that the broker is well-regulated" },
        { key: "d", text: "A sign the trader should deposit more money to unlock the withdrawal" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson calls the withdrawal-excuse pattern specifically \"one of the most reliable fraud indicators there is.\"",
      incorrectFeedback:
        "The lesson names this pattern directly: shifting excuses, fees, or delays specifically when a client tries to withdraw funds is one of the most reliable fraud indicators there is.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l6-q3",
      prompt:
        "True or false: a professional-looking website and an active social media presence, on their own, establish that an offer is legitimate.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson's own beginner mistake warns against exactly this: both are inexpensive to produce and just as available to a fraudulent operation as to a legitimate one.",
      incorrectFeedback:
        "Actually false. The lesson is explicit that a professional website and active social media presence establish nothing on their own — they're inexpensive to produce and equally available to fraudulent operations.",
    },
  ],

  "signal-providers-and-copy-trading": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l7-q1",
      prompt:
        "Per this lesson, what's the real risk of relying on someone else's trade signals instead of one's own tested process?",
      options: [
        { key: "a", text: "Signals are always technically inaccurate" },
        {
          key: "b",
          text: "Signal dependency — never developing or testing independent judgment, so if the source stops or becomes unreliable, the trader has no independent skill to fall back on",
        },
        { key: "c", text: "Signal services are prohibitively expensive for beginners" },
        { key: "d", text: "Using signals is against the terms of most brokers" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson names this directly as \"the real risk\": this course teaches independent analysis specifically to avoid creating this dependency.",
      incorrectFeedback:
        "The lesson's stated real risk is dependency: never developing or testing one's own judgment, leaving no independent skill to fall back on if the signal source stops or turns out to be unreliable.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l7-q2",
      prompt:
        "Per this lesson, what's the core distinction between a signal source that helps a trader learn and one that only creates dependency?",
      options: [
        { key: "a", text: "How much the signal service costs" },
        {
          key: "b",
          text: "Whether the trader studies the reasoning behind a signal, or just blindly copies the entry",
        },
        { key: "c", text: "How many signals are sent per day" },
        { key: "d", text: "Whether the provider communicates via charts or plain text" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's core distinction: studying why a provider entered a trade builds understanding, while blindly copying the entry builds nothing and leaves no way to judge future signals.",
      incorrectFeedback:
        "The lesson's core distinction is about reasoning, not cost or volume: studying the reasoning behind a signal builds understanding; copying the entry with no understanding builds nothing.",
    },
  ],

  "prop-firms-and-evaluation-programs": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l8-q1",
      prompt: "Per this lesson, what does passing a prop-firm evaluation program actually prove?",
      options: [
        { key: "a", text: "Long-term trading ability, fully and permanently proven" },
        {
          key: "b",
          text: "One data point — performance against one specific rule set over a comparatively short period, not the same kind of evidence as Module 9's larger, more varied sample",
        },
        { key: "c", text: "That the trader's strategy needs no further testing" },
        { key: "d", text: "That the trader is now a professional trader" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit: it does not claim passing any evaluation proves long-term trading ability, and treats a pass as one data point, not a certification.",
      incorrectFeedback:
        "The lesson's stated position: passing an evaluation is one data point, not proof of long-term ability — it tests performance against one rule set over a short, defined period, not the larger sample Module 9 recommends.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l8-q2",
      scenario:
        "A trader's tested strategy requires holding positions overnight, but a specific prop firm's evaluation program restricts overnight holding entirely.",
      prompt: "Per this lesson, what should the trader check before paying for this evaluation?",
      options: [
        { key: "a", text: "Nothing — all evaluation programs are functionally identical" },
        {
          key: "b",
          text: "Whether the program's specific rules (the holding restriction, here) are even compatible with the strategy actually tested and journaled in Module 9",
        },
        { key: "c", text: "Only the headline evaluation fee" },
        { key: "d", text: "Only the advertised profit-split percentage" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's beginner mistake names this exact situation: paying for an evaluation before checking whether its rules are compatible with an already-tested strategy.",
      incorrectFeedback:
        "The lesson's point: strategy compatibility with the program's specific rules — including holding restrictions — matters more than the headline fee, and should be checked before paying.",
    },
  ],

  "real-money-readiness": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l9-q1",
      scenario:
        "A trader deeply understands every concept from Modules 1–9, but has never demo-traded and has no journal record of consistent rule adherence.",
      prompt: "Which kind of readiness, per this lesson, is this trader missing?",
      options: [
        { key: "a", text: "Knowledge readiness" },
        { key: "b", text: "Process readiness" },
        { key: "c", text: "Financial readiness" },
        { key: "d", text: "None — understanding the concepts is sufficient on its own" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own example: a trader can have strong knowledge readiness and still lack process readiness if their execution hasn't actually been tested and practiced enough to be consistent yet.",
      incorrectFeedback:
        "This trader has knowledge readiness but is missing process readiness — a written plan, backtested and demo-practiced process, and demonstrated rule adherence shown by an actual journal, not just confidence.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l9-q2",
      prompt:
        "True or false: this course provides a specific, universal number of demo trades or demo days that guarantees a trader is ready for real money.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson explicitly declines to give a universal number, calling any such fixed threshold \"a false precision this course isn't willing to offer.\"",
      incorrectFeedback:
        "Actually false. The lesson explicitly does not give a universal number of demo days or trades — individual circumstances, strategies, and available time vary too much for a single guaranteed threshold.",
    },
  ],

  "execution-discipline-in-real-conditions": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l10-q1",
      prompt: "Per this lesson, what actually reduces operational execution mistakes?",
      options: [
        { key: "a", text: "Trading faster, so less time is spent hesitating on a decision" },
        {
          key: "b",
          text: "Slowing down at the moment of execution, double-checking entered numbers, and using a fixed pre-trade checklist every time",
        },
        { key: "c", text: "Trusting memory instead of a checklist once a trader feels experienced enough" },
        { key: "d", text: "Skipping the checklist specifically when a setup feels urgent" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson lists exactly these three: slowing down, double-checking numbers, and a fixed pre-trade checklist used the same way every time.",
      incorrectFeedback:
        "The lesson's actual answer: slowing down at execution, double-checking the specific numbers entered, and using a fixed pre-trade checklist — the opposite of rushing or skipping it under time pressure.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l10-q2",
      prompt: "True or false: a consistent execution checklist eliminates execution risk entirely.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that no checklist eliminates execution risk entirely; it reduces the frequency and severity of avoidable, self-inflicted mistakes, a meaningfully different and more honest claim.",
      incorrectFeedback:
        "Actually false. The lesson states plainly that no checklist, however careful, eliminates execution risk entirely — technical failures and simple human error remain possible even with every precaution taken.",
    },
  ],

  "performance-review": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l11-q1",
      scenario:
        "A trader reviews a losing period by looking only at the win/loss numbers, without checking rule adherence or execution.",
      prompt: "Per this lesson's beginner mistake, what might this miss?",
      options: [
        { key: "a", text: "Nothing important — the numbers already tell the full story" },
        {
          key: "b",
          text: "That the losing period was actually caused by poor execution of a perfectly reasonable plan — or that a winning period involved unrecorded rule violations that simply got lucky",
        },
        { key: "c", text: "The trader's current account balance" },
        { key: "d", text: "The broker's regulatory status" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own beginner mistake, word for word: reviewing only win/loss numbers can miss exactly this kind of mismatch between plan quality and actual execution.",
      incorrectFeedback:
        "The lesson's own warning: reviewing only win/loss numbers can miss that a loss came from poor execution of a good plan, or that a win involved unrecorded rule violations that simply got lucky.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l11-q2",
      prompt:
        "Per this lesson's review cycle (Collect → Measure → Review → Identify → Change → Retest), why change only one meaningful variable at a time?",
      options: [
        { key: "a", text: "It's simply faster than changing several things at once" },
        {
          key: "b",
          text: "Changing several things at once makes it impossible to know afterward which specific change actually mattered",
        },
        { key: "c", text: "Multiple changes are not technically permitted by the course" },
        { key: "d", text: "Module 6 requires it" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson explicitly echoes Module 9's own caution here: the same discipline that applies to testing a strategy's rules applies to improving the broader process around executing them.",
      incorrectFeedback:
        "The lesson's actual reasoning: changing several things about a process at once makes it impossible to know afterward which specific change actually mattered — the same logic as Module 9's one-change-at-a-time testing discipline.",
    },
  ],

  "continuous-improvement": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l12-q1",
      scenario:
        "A trader loses one trade and immediately changes a core entry rule, without checking whether that single result fits within the normal variation their own testing already showed.",
      prompt: "What does this lesson call this pattern?",
      options: [
        { key: "a", text: "Sound, evidence-based improvement" },
        {
          key: "b",
          text: "A reactive change made from the emotional discomfort of one bad outcome, not from any real pattern in the evidence",
        },
        { key: "c", text: "Exactly what the Change → Retest → Compare → Decide cycle recommends" },
        { key: "d", text: "Required behavior after any losing trade" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own core distinction: improvement based on evidence over a meaningful period looks completely different from changing rules because of one losing trade, usually driven by emotional discomfort rather than a real pattern.",
      incorrectFeedback:
        "The lesson names this a reactive change, not evidence-based improvement — changing a core rule after one trade, without checking it against normal expected variation, is exactly the beginner mistake this lesson warns against.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l12-q2",
      prompt:
        "True or false: per this lesson, \"strategy hopping\" means abandoning a strategy after a normal losing stretch, before it's had a fair, evidence-based evaluation.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — the lesson defines strategy hopping exactly this way, listing it as one of the specific things to avoid in continuous improvement.",
      incorrectFeedback:
        "Actually true. The lesson defines \"strategy hopping\" as abandoning a strategy after a normal losing stretch, before it's had a fair, evidence-based evaluation — one of the two specific traps this lesson names.",
    },
  ],

  "building-your-personal-development-roadmap": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l13-q1",
      prompt:
        "Per this lesson's ten-stage roadmap, which stage does building a complete, specific, written set of trading rules belong to?",
      options: [
        { key: "a", text: "Stage 3 — Risk" },
        { key: "b", text: "Stage 5 — Trading Plan" },
        { key: "c", text: "Stage 6 — Backtesting" },
        { key: "d", text: "Stage 9 — Controlled Application" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — Stage 5 is defined exactly this way: \"Document a complete, specific set of rules (Module 8).\"",
      incorrectFeedback:
        "This is Stage 5 — Trading Plan, defined as documenting a complete, specific set of rules. Stage 3 is risk rules, Stage 6 is testing those rules against historical evidence.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m10-l13-q2",
      prompt:
        "True or false: per this lesson, reaching Stage 9 (Controlled Application) is something every student needs to do, on a fixed timeline.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that Stage 9 isn't something every student needs to reach on any particular timeline, or at all; that decision rests on individual evidence and financial circumstances.",
      incorrectFeedback:
        "Actually false. The lesson states plainly that Stage 9 isn't a box this roadmap tells anyone to check on a fixed timeline — it rests on the individual student's own evidence and financial circumstances.",
    },
  ],

  "common-beginner-mistakes": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l14-q1",
      prompt:
        "Per this lesson's corrective principle for \"using excessive leverage,\" what should actually govern a trader's position size?",
      options: [
        { key: "a", text: "How much leverage is technically available on the account" },
        { key: "b", text: "Planned dollar risk, per Module 6's rules" },
        { key: "c", text: "The broker's maximum allowed leverage" },
        { key: "d", text: "How confident the trader feels about the setup" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's stated corrective principle: size positions from planned dollar risk, not from how much leverage happens to be technically available.",
      incorrectFeedback:
        "The lesson's corrective principle is specific: position size should come from planned dollar risk (Module 6's rules), not from how much leverage is technically available.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l14-q2",
      prompt: "Per this lesson, what's the corrective principle for \"changing strategies constantly\"?",
      options: [
        { key: "a", text: "Switch to a new strategy immediately after any losing stretch" },
        { key: "b", text: "Apply the Change → Retest → Compare → Decide cycle instead of switching wholesale" },
        { key: "c", text: "Never change a strategy under any circumstances, ever" },
        { key: "d", text: "Only ever change strategy once per calendar year" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's stated corrective principle is applying the Change → Retest → Compare → Decide cycle (Module 9, Lesson 13), rather than switching strategies wholesale.",
      incorrectFeedback:
        "The lesson's corrective principle: apply the Change → Retest → Compare → Decide cycle instead of switching wholesale — not never changing, and not on an arbitrary fixed calendar.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m10-l14-q3",
      prompt:
        "Which of the following is explicitly named in this lesson's mistake audit as one of the clearest, most consistent fraud indicators?",
      options: [
        { key: "a", text: "A broker charging a standard spread" },
        { key: "b", text: "Trusting guaranteed-profit claims" },
        { key: "c", text: "Using a demo account before going live" },
        { key: "d", text: "Journaling every trade taken" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — \"trusting guaranteed-profit claims\" is listed explicitly, with the corrective principle to treat any guarantee claim as a red flag, not a selling point.",
      incorrectFeedback:
        "The lesson names \"trusting guaranteed-profit claims\" explicitly as one of the clearest, most consistent fraud indicators — the other options are all sound, recommended practices, not mistakes.",
    },
  ],

  "your-next-90-days": [
    {
      kind: "check",
      type: "mc",
      id: "m10-l15-q1",
      prompt: "Per this lesson, what does completing the 90-day roadmap actually determine?",
      options: [
        { key: "a", text: "That the trader should automatically begin live trading immediately afterward" },
        {
          key: "b",
          text: "Nothing automatic — the next step depends on the evidence actually gathered, financial circumstances, and personal judgment, not a fixed calendar",
        },
        { key: "c", text: "That live trading is now required within the following 30 days" },
        { key: "d", text: "That no further practice or review is needed after this point" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit that this roadmap does not say a student should automatically go live after 90 days; that decision depends on evidence, circumstances, and judgment, not a fixed calendar.",
      incorrectFeedback:
        "The lesson states directly: ninety days is a structured period for building habits, not a countdown to a predetermined outcome — what happens next depends on the evidence gathered and the student's own circumstances.",
    },
    {
      kind: "reveal",
      id: "m10-l15-r1",
      label: "Think about it",
      prompt:
        "This lesson calls \"Day 90\" a checkpoint, not a deadline. What does it deliberately avoid claiming about what should happen after Day 90?",
      revealLabel: "What the lesson says",
      explanation:
        "The roadmap deliberately does not say a student should automatically begin live trading after these 90 days. That decision depends on the evidence actually gathered, the student's own financial circumstances, their personal risk tolerance, and their own judgment — not on a fixed calendar. The course's closing message is that the LEARN → UNDERSTAND → PRACTICE → BACKTEST → JOURNAL → IMPROVE cycle doesn't end when the course does; every stage, including the last one, is something a trader keeps doing for as long as they trade.",
    },
  ],
};
