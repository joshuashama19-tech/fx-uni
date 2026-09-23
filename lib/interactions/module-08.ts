import type { Interaction } from "./types";

// Module 8 — Building a Trading Plan. Batch 3 of the interactive-course
// expansion (Modules 8–10, the final batch), authored against the same
// standard as Module 1 (pilot) and Modules 2–7 (Batches 1 and 2) — see
// those files' own header comments for the full methodology.
//
// Grounding: every prompt, scenario, correct answer, and feedback line
// below is traced to a specific sentence, scenario, worksheet, or checklist
// item in this module's own content/course/modules/module-08-building-a-
// trading-plan/01-content.md. Per the user's Module 8 guidance, interactions
// favor actively constructing and evaluating a trading plan rather than
// recalling definitions: choosing appropriate components (L1–L4),
// distinguishing rules from vague intentions (L1, L5, L6), scenario-based
// plan decisions reused directly from the lesson's own worked scenarios
// (L5's incomplete-setup scenario, L9's news-before-entry scenario, L10's
// outside-session scenario, L11's unclear-stop-loss scenario, L13's
// losing-streak and rule-conflict scenarios), identifying missing plan
// components (L12), and recognizing contradictions inside a plan (L13).
// No numerical calculation is invented here — Module 8 explicitly defers
// all risk math to Module 6 and all backtesting methodology to Module 9,
// and no interaction below repeats or invents that math.
//
// Interaction count: 2 per lesson across all 14 lessons (28 total),
// matching the density of Modules 5–7. No lesson needed to be reduced to a
// single interaction — every lesson in this module centers on a distinct,
// testable plan-building decision.
export const module08Interactions: Record<string, Interaction[]> = {
  "what-is-a-trading-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l1-q1",
      prompt: "Which of the following is a rule, not an intention, per this lesson?",
      options: [
        { key: "a", text: "\"I want to trade based on trend and structure.\"" },
        {
          key: "b",
          text: "\"I enter only when price closes beyond a marked swing high in the direction of higher-timeframe structure.\"",
        },
        { key: "c", text: "\"I try to manage my risk carefully.\"" },
        { key: "d", text: "\"I plan to get better at reading charts.\"" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is specific enough to check, after the fact, whether it was actually followed. The other three are intentions: reasonable goals, but not checkable rules.",
      incorrectFeedback:
        "The lesson's own example of a rule (versus an intention) is the swing-high/BOS statement — specific enough to check afterward whether it was followed. The others describe goals or feelings, not checkable conditions.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l1-q2",
      scenario:
        "A trader has a sound strategy — specific, well-defined entry criteria — but has never written down risk rules, a schedule, or no-trade conditions.",
      prompt: "Per this lesson, does this trader have a complete trading plan?",
      options: [
        { key: "a", text: "Yes — a good strategy is the same thing as a complete plan" },
        {
          key: "b",
          text: "No — a plan is broader than a strategy; it also needs risk rules, behavioral rules, a schedule, news rules, and no-trade conditions",
        },
        { key: "c", text: "Yes, as long as the strategy has a high win rate" },
        { key: "d", text: "It's impossible to say without knowing the strategy's win rate" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit that a trader can have a sound strategy and still lack a complete plan if the surrounding structure (risk, behavior, schedule, news, no-trade rules) isn't written down.",
      incorrectFeedback:
        "The lesson draws this distinction directly: a strategy is just the market-reading logic. A complete plan includes the strategy plus risk rules, behavioral rules, schedule, news rules, and no-trade conditions.",
    },
  ],

  "choosing-your-trading-style": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l2-q1",
      scenario:
        "A trader works a full-time job and can only realistically check charts once, in the evening.",
      prompt:
        "Based on this lesson's style comparison table, which style (or styles) best fits this constraint?",
      options: [
        { key: "a", text: "Scalping" },
        { key: "b", text: "Day trading" },
        { key: "c", text: "Swing trading or position trading" },
        { key: "d", text: "Any style — time available has no bearing on style choice" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — swing trading (moderate, periodic checking) and position trading (low, infrequent checking) both fit a schedule that can't accommodate real-time, constant monitoring, unlike scalping or day trading.",
      incorrectFeedback:
        "Per the lesson's table, scalping and day trading demand real-time attention during specific sessions. A schedule limited to one evening check fits swing trading or position trading instead.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l2-q2",
      prompt: "True or false: this course claims that one trading style is superior to the others.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson states directly that it does not claim any one style is superior; a profitable swing trader and a profitable day trader are both possible outcomes of sound process applied to a fitting style.",
      incorrectFeedback:
        "Actually false. The lesson explicitly does not claim any style is superior — each suits different life circumstances, and what matters is the style actually fitting the trader running it.",
    },
  ],

  "choosing-markets-and-currency-pairs": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l3-q1",
      prompt:
        "Per this lesson, what's a legitimate reason for a beginner to limit their watchlist to one or a few pairs?",
      options: [
        { key: "a", text: "It's a requirement enforced by every broker" },
        {
          key: "b",
          text: "It lets a trader actually get to know a pair's typical behavior, session patterns, and typical spread, instead of dividing attention across many charts",
        },
        { key: "c", text: "Minor and exotic pairs are not legal to trade" },
        { key: "d", text: "A wider watchlist guarantees worse results" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's point is about attention and depth of knowledge, not a rule or a guarantee: fewer pairs means each one gets studied more carefully.",
      incorrectFeedback:
        "The lesson's actual reasoning: a shorter, deliberate watchlist lets a trader actually learn a pair's typical behavior and spread, rather than diluting attention across many charts, news calendars, and setups at once.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l3-q2",
      scenario:
        "A trader holds long positions in two currency pairs that share the same base currency and tend to move in a closely related way.",
      prompt: "Per this lesson, what should the trader account for?",
      options: [
        { key: "a", text: "Nothing — each open position is completely independent risk" },
        {
          key: "b",
          text: "The combined risk may be larger than it first appears — this is exactly what a plan's maximum-simultaneous-exposure rule accounts for",
        },
        { key: "c", text: "Correlated pairs automatically double the position's potential profit" },
        { key: "d", text: "This situation isn't addressed anywhere in the course" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson ties this directly to Module 6, Lesson 12's \"maximum simultaneous exposure\" field: correlated positions can mean more combined risk than it first appears.",
      incorrectFeedback:
        "The lesson's point: holding several correlated positions at once can mean more combined risk than it first appears — exactly what a plan's maximum-simultaneous-exposure rule is meant to account for.",
    },
  ],

  "choosing-timeframes": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l4-q1",
      scenario: "A swing trader defines Context = daily chart, and Setup = 4-hour chart.",
      prompt:
        "Per this lesson's Context → Setup → Entry framework, which timeframe should typically supply the Entry trigger?",
      options: [
        { key: "a", text: "The daily chart, same as Context" },
        { key: "b", text: "The 4-hour chart, same as Setup" },
        { key: "c", text: "A shorter timeframe than Setup — for example, the 1-hour chart" },
        { key: "d", text: "The weekly chart" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — the lesson's own worked example uses exactly this structure: daily for Context, 4-hour for Setup, 1-hour for Entry — the Entry timeframe is typically the shortest one the plan uses.",
      incorrectFeedback:
        "In the lesson's own worked example, Entry uses a shorter timeframe than Setup — for a swing trader using daily/4-hour for Context/Setup, Entry was the 1-hour chart.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l4-q2",
      prompt:
        "True or false: switching to a different timeframe mid-analysis, specifically because it shows a picture supporting a decision already made, is consistent with a written plan.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson names this \"timeframe shopping\" (the same mistake Module 4, Lesson 11 warned about) and says it undermines the entire point of a written, repeatable plan.",
      incorrectFeedback:
        "Actually false. The lesson calls this \"timeframe shopping\" and is explicit that it undermines a written, repeatable plan — timeframes should be fixed in the plan and used consistently, not chosen fresh to fit a decision already made.",
    },
  ],

  "defining-your-trading-setup": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l5-q1",
      scenario:
        "A trader's written setup requires three things: bullish higher-timeframe structure, a pullback to a marked demand zone, and a confirming bullish candle at that zone. On a specific trade, the first two conditions are present, but the confirming candle — a required condition — hasn't formed yet.",
      prompt: "Per this lesson, is the trade valid right now?",
      options: [
        { key: "a", text: "Yes — two out of three conditions is close enough" },
        {
          key: "b",
          text: "No — since the confirming candle is a required condition, the setup isn't valid until it forms, regardless of how promising the other two conditions look",
        },
        { key: "c", text: "Yes, as long as the trader reduces their position size" },
        { key: "d", text: "It depends on how long the trader has been waiting" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is exactly the lesson's own scenario: a required condition that hasn't been met means the trade isn't yet valid, no matter how much pressure the other two conditions create to treat it as \"close enough.\"",
      incorrectFeedback:
        "The lesson's own analysis: since the confirming candle is a required condition in this trader's setup, the trade is not yet valid — a trader following their plan waits for it or lets the trade go.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l5-q2",
      prompt:
        "True or false: a rule like \"the chart looks good\" can be checked objectively and consistently, the same way by two different traders.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that vague rules like this cannot be checked objectively after the fact; two different days or two different traders could read the same chart differently.",
      incorrectFeedback:
        "Actually false. The lesson states that vague language like \"looks good\" cannot be checked objectively — a setup needs to be defined in observable terms to be checked the same way every time.",
    },
  ],

  "entry-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l6-q1",
      prompt:
        "Which of the following is an actual, checkable entry rule, per this lesson's rewrite example?",
      options: [
        { key: "a", text: "\"Enter when momentum looks strong.\"" },
        {
          key: "b",
          text: "\"Enter when RSI crosses above 50 on the entry timeframe, following a confirmed bullish BOS on the setup timeframe.\"",
        },
        { key: "c", text: "\"Enter when it seems like the right moment.\"" },
        { key: "d", text: "\"Enter when the setup feels ready.\"" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own rewritten version: specific enough that any two readings of the same chart would reach the same conclusion about whether the rule was met.",
      incorrectFeedback:
        "The lesson's rewrite example is the RSI/BOS version — specific and observable. The others describe a feeling, not a checkable market condition, exactly the mistake this lesson warns against.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l6-q2",
      prompt: "Per this lesson's example Entry Checklist, which step comes first?",
      options: [
        { key: "a", text: "Market context confirmed" },
        { key: "b", text: "Stop-loss location defined" },
        { key: "c", text: "News/calendar checked" },
        { key: "d", text: "Execute, or pass" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the checklist begins with confirming market context (Lesson 4's \"Context\" step), before moving on to setup conditions, the entry trigger, and everything else.",
      incorrectFeedback:
        "The checklist's first step is confirming market context — the other items (stop-loss location, news check, and the final execute-or-pass decision) all come later in the same eight-step sequence.",
    },
  ],

  "stop-loss-take-profit-and-exit-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l7-q1",
      prompt: "Per this lesson, where should a stop loss conceptually belong?",
      options: [
        { key: "a", text: "At a fixed number of pips, used the same way on every trade" },
        {
          key: "b",
          text: "At the point that proves the original trade idea wrong, tied to the setup's own structural logic",
        },
        { key: "c", text: "Wherever feels safe once the trade is already open" },
        { key: "d", text: "As far away as possible, to reduce the chance of being stopped out" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — per Module 4, Lesson 10 and this lesson's own restatement, a stop belongs at the point that proves the trade idea wrong, identified by the setup's own logic — not a fixed distance used regardless of setup.",
      incorrectFeedback:
        "The lesson is specific: a stop loss belongs at the point that proves the original trade idea wrong, tied to the setup's own structural logic — not a fixed pip distance or a feeling once the trade is open.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l7-q2",
      scenario: "A plan states: \"moved to breakeven once price reaches a 1:1 ratio.\"",
      prompt: "What kind of exit rule does this describe, per this lesson?",
      options: [
        { key: "a", text: "A trailing stop" },
        { key: "b", text: "A fixed structural target" },
        { key: "c", text: "A time-based exit" },
        { key: "d", text: "A partial exit" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — a trailing stop moves in the trade's favor as price moves favorably, and the lesson gives this exact example of a specific, written trailing rule rather than \"moved when it feels safe.\"",
      incorrectFeedback:
        "This describes a trailing stop — a stop that moves to lock in progress as the trade moves favorably. The lesson's own example is written just this specifically: \"moved to breakeven once price reaches a 1:1 ratio.\"",
    },
  ],

  "risk-rules-inside-the-trading-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l8-q1",
      prompt: "Per this lesson's core principle, when should a trading plan define risk?",
      options: [
        { key: "a", text: "After the trade is entered, based on how it's performing" },
        { key: "b", text: "Before the trade is entered" },
        { key: "c", text: "Only for trades that feel unusually significant" },
        { key: "d", text: "Risk doesn't need to be written into the plan at all" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's core principle is stated plainly: the trading plan should define risk before the trade is entered.",
      incorrectFeedback:
        "The lesson's stated principle: risk must be defined before the trade is entered — decided in a calm moment in advance, not re-decided trade by trade or after the fact.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l8-q2",
      prompt:
        "True or false: this lesson prescribes a single universal risk percentage that every trader's plan must use.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson explicitly does not override Module 6, Lesson 2's position that 0.5%, 1%, and 2% are all commonly used starting points, not a single correct answer.",
      incorrectFeedback:
        "Actually false. The lesson explicitly does not prescribe a universal risk percentage — it only adds that whatever number a trader chooses belongs written into the plan, decided in advance.",
    },
  ],

  "fundamental-and-news-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l9-q1",
      scenario:
        "A trader's setup meets every one of their entry criteria, but a high-impact economic release is scheduled in twenty minutes. Their written plan includes the rule: \"no new entries within 30 minutes of a high-impact release for the traded currency.\"",
      prompt: "What should the trader do?",
      options: [
        { key: "a", text: "Enter anyway, since the setup itself is fully valid" },
        {
          key: "b",
          text: "Pass on this entry — not because the setup is invalid, but because the plan's written news rule applies here",
        },
        { key: "c", text: "Enter with double the usual position size to capture the extra volatility" },
        { key: "d", text: "Wait exactly until the release before deciding, since no rule applies yet" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own scenario: the decision is already made by the written rule, decided calmly in advance, rather than being an in-the-moment judgment call under time pressure.",
      incorrectFeedback:
        "The lesson's own analysis: with a written rule like this one, the trader passes on the entry — not because the setup was invalid, but because the plan's news rule, decided calmly in advance, applies here.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l9-q2",
      prompt:
        "True or false: this lesson prescribes one universally correct way for a plan to handle scheduled news, such as always avoiding news windows entirely.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson lists several legitimate approaches (avoiding news windows, waiting for volatility to settle, including news in the setup itself, treating news as context) without prescribing one as universally correct.",
      incorrectFeedback:
        "Actually false. The lesson lists multiple legitimate approaches to handling news and is explicit that it doesn't prescribe one as universally correct — what matters is that a plan states, in writing, which approach it uses.",
    },
  ],

  "trading-schedule-and-routine": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l10-q1",
      scenario:
        "A trader's written plan focuses on the London/New York session overlap. A setup that appears to meet their criteria forms several hours later, during a session their plan doesn't cover.",
      prompt: "Per this lesson, what should the trader do, absent a specific written exception?",
      options: [
        { key: "a", text: "Take the trade — a valid setup should always be taken regardless of session" },
        {
          key: "b",
          text: "Pass on it — the plan defines when to trade, not just what, and this session wasn't specifically planned for",
        },
        { key: "c", text: "Take the trade, but only if it's been an especially quiet day" },
        { key: "d", text: "Ask another trader whether the session matters" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — per the lesson's own scenario, the plan defines when to trade as well as what. Trading outside the chosen session introduces conditions the trader hasn't specifically planned for, so passing is the schedule working as intended.",
      incorrectFeedback:
        "The lesson's own analysis: the setup either falls under a specific written exception or it doesn't qualify — not because the setup is necessarily invalid, but because the chosen schedule hasn't planned for that session's conditions.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l10-q2",
      prompt:
        "Which phase of this lesson's Before/During/After schedule includes \"reviewing adherence — did today's decisions actually follow the written plan?\"",
      options: [
        { key: "a", text: "Before Session" },
        { key: "b", text: "During Session" },
        { key: "c", text: "After Session" },
        { key: "d", text: "None of these phases — adherence isn't reviewed on a schedule" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — the After Session phase includes recording trades taken, reviewing adherence, noting rule violations, and deliberately closing the session.",
      incorrectFeedback:
        "This belongs to the After Session phase, alongside recording what was traded (or the decision not to trade) and noting any specific rule violations.",
    },
  ],

  "no-trade-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l11-q1",
      scenario:
        "A trader identifies what otherwise looks like a promising setup, but the nearby price structure doesn't offer a clean, logical point to place an invalidation-based stop — nearby swing points are either too close or too vague to represent genuine invalidation.",
      prompt: "Per this lesson, what should the trader do?",
      options: [
        { key: "a", text: "Enter anyway, and place the stop wherever seems roughly reasonable" },
        {
          key: "b",
          text: "Pass on the trade — \"stop-loss location is unclear\" is explicitly listed as a valid no-trade condition",
        },
        { key: "c", text: "Enter with no stop loss at all, since none of the nearby levels work" },
        { key: "d", text: "Enter, but only tell other traders about it afterward" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own scenario: an unclear stop-loss location isn't a minor technicality to work around, it's a specific, valid reason to pass on an otherwise interesting-looking setup.",
      incorrectFeedback:
        "The lesson's own analysis: if a clean invalidation point can't be identified, the trade's risk can't be properly defined either — \"stop-loss location is unclear\" is listed explicitly as a valid no-trade condition.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l11-q2",
      prompt:
        "True or false: declining a trade under a written no-trade condition guarantees that trade would have lost.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that this isn't framed as guaranteed protection against loss; declining under a no-trade condition just means the decision was made deliberately, using the plan, rather than by default.",
      incorrectFeedback:
        "Actually false. The lesson states plainly that declining a trade under a no-trade condition doesn't guarantee that trade would have lost — it means the decision was made deliberately, not that the outcome is known in advance.",
    },
  ],

  "building-the-complete-trading-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l12-q1",
      scenario:
        "A trader's written plan includes trading style, markets, timeframes, a setup definition, entry rules, stop-loss rules, and risk rules — but says nothing about when the trader should NOT trade.",
      prompt: "Per this lesson's 14-component list, what's missing from this plan?",
      options: [
        { key: "a", text: "No-trade rules" },
        { key: "b", text: "Trading objective" },
        { key: "c", text: "Take-profit/exit rules" },
        { key: "d", text: "Timeframes" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — this plan has style, markets, timeframes, setup, entry, and risk rules covered, but nothing addressing when not to trade — component 12 in the lesson's full list.",
      incorrectFeedback:
        "The scenario already covers style, markets, timeframes, setup, entry, and risk rules. What's missing is no-trade rules — component 12 of this lesson's 14-part list.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m8-l12-q2",
      prompt:
        "True or false: per this lesson's beginner mistake, a plan is only as complete as its weakest section, since a gap in any one area is exactly where an undisciplined decision tends to slip through.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — the lesson warns specifically against filling in the interesting sections (setup, entry rules) thoroughly while leaving others (news rules, no-trade conditions, review process) vague or blank.",
      incorrectFeedback:
        "Actually true. The lesson's own beginner mistake: filling in some sections thoroughly while leaving others vague — a plan is only as complete as its weakest section.",
    },
  ],

  "testing-and-improving-your-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l13-q1",
      scenario:
        "A trader's plan has produced three losing trades in a row, all of which followed the written rules correctly. The trader feels a strong urge to change the setup definition or loosen the entry criteria right now.",
      prompt: "Per this lesson, is this the right moment to change the plan's rules?",
      options: [
        { key: "a", text: "Yes — three losses in a row is clear evidence the rules need fixing" },
        {
          key: "b",
          text: "No — a short losing streak that followed the rules correctly isn't, by itself, evidence the rules are the problem; that's too small a sample to draw a firm conclusion from",
        },
        { key: "c", text: "Yes, but only if the trader also increases their risk percentage" },
        { key: "d", text: "It doesn't matter — plans should never be changed once written" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit: a short losing streak is not, by itself, evidence a plan's rules are the problem. Controlled changes come from actual evidence over a meaningful sample, not reacting to three trades out of frustration.",
      incorrectFeedback:
        "The lesson's own analysis: a short losing streak that followed the rules correctly is a normal outcome, not evidence the rules are wrong — changing rules reflexively here is called \"strategy hopping,\" the opposite of what this lesson recommends.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m8-l13-q2",
      scenario:
        "A trader's entry rule calls for immediate action once a trigger appears. Separately, their news rule would have excluded that exact time window. Reviewed section by section, neither rule looked like a problem on its own.",
      prompt: "What does this situation illustrate, per this lesson?",
      options: [
        {
          key: "a",
          text: "A conflicting pair of rules that only surfaces by reviewing the whole plan together, not just section by section",
        },
        { key: "b", text: "Nothing — different sections of a plan never need to be checked against each other" },
        { key: "c", text: "Proof that the plan is already fully consistent" },
        { key: "d", text: "Evidence that news rules should be removed from every plan" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the lesson names this exact pattern: two rules pulling in different directions that only surface when the whole plan is reviewed together, not section by section.",
      incorrectFeedback:
        "The lesson's point is that conflicting rules like this — an entry rule and a news rule pulling in different directions — only surface by reviewing the whole plan together, not by checking each section in isolation.",
    },
  ],

  "your-first-complete-trading-plan": [
    {
      kind: "check",
      type: "mc",
      id: "m8-l14-q1",
      prompt: "Per this lesson's step-by-step guided build, what is the first step?",
      options: [
        { key: "a", text: "Revisit Lesson 2 and confirm your trading style" },
        { key: "b", text: "Write your risk rules" },
        { key: "c", text: "Run the Final Trading Plan Audit" },
        { key: "d", text: "Write your psychology/behavior rules" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the guided build starts by confirming trading style, then works through markets, timeframes, setup, entry, exits, risk, news, schedule, no-trade rules, and psychology rules in that order, ending with the audit.",
      incorrectFeedback:
        "The build's first step is confirming your trading style (revisiting Lesson 2) — everything else in the 14-step sequence, including risk rules and the final audit, comes after.",
    },
    {
      kind: "reveal",
      id: "m8-l14-r1",
      label: "Think about it",
      prompt:
        "The Final Trading Plan Audit deliberately does not end with \"my plan is finished and proven.\" Why not, per this lesson?",
      revealLabel: "What the lesson says",
      explanation:
        "The audit's last question is \"which rules still need testing, specifically?\" — a deliberate choice. A completed, audited plan is a proper first draft: specific enough to actually follow and test, not a validated system. Module 9 is where that exact plan gets tested against real evidence, its results tracked, and improvements made based on what's found — not on assumption or feeling.",
    },
  ],
};
