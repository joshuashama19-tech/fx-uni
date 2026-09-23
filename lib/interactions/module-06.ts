import type { Interaction } from "./types";

// Module 6 — Risk Management. Batch 2 of the interactive-course expansion
// (Modules 5–7), authored against the same standard as Module 1 (pilot) and
// Modules 2–5 (Batches 1 and 2 so far) — see those files' own header
// comments for the full methodology.
//
// Grounding: every prompt, scenario, correct answer, and feedback line below
// is traced to a specific sentence or worked example in this module's own
// content/course/modules/module-06-risk-management/01-content.md. Per the
// user's explicit Module 6 instruction, calculation-heavy lessons (Risk Per
// Trade, Position Sizing, Practical Position-Sizing Calculations, Take
// Profit & Risk/Reward, Expectancy, Drawdown, Leverage & Margin) get real,
// hand-verified calculations rather than purely definitional questions.
// Several calculations reuse the lesson's own worked numbers (e.g. Lesson
// 3's 20-pip/$10/$1,000-account example, Lesson 9's losing-streak table);
// others introduce fresh-but-consistent numbers, independently verified
// below, to test genuine application of the formula rather than recall of
// a specific figure the student may have simply memorized:
//   L2: $1,500 account, 2% risk -> $1,500 * 0.02 = $30
//   L5: $4,000 account, 1.5% risk, 30-pip stop, $1/pip -> risk $60,
//       position size = $60 / (30 * $1) = 2.00 mini lots
//   L6: risk $25, reward $100 -> ratio $100/$25 = 1:4;
//       breakeven win rate for 1:4 = 1 / (1 + 4) = 20%
//   L7: win rate 45%, avg win $40, loss rate 55%, avg loss $30 ->
//       (0.45 * 40) - (0.55 * 30) = 18 - 16.5 = +$1.50 per trade
//   L8: 40% loss -> required recovery = 1/(1-0.40) - 1 = 1/0.60 - 1
//       = 1.6667 - 1 = 66.7%
//   L10: 0.8 standard lots (80,000 units) at 1.25000 -> notional
//        80,000 * 1.25 = $100,000; at 1:200 leverage, margin =
//        $100,000 / 200 = $500
// No calculation here implies a technique eliminates risk, and no
// interaction invents a numerical assumption that contradicts the lesson's
// own stated figures or pip-value disclaimer.
//
// Interaction count is deliberately close to Module 5's rhythm — most
// lessons get 2 interactions; Lesson 12 (Building Your Own Risk Rules) gets
// only 1, because it is a personal template-completion exercise with a
// single conceptual point (why the course won't dictate universal values),
// not a lesson with several distinct testable ideas.
export const module06Interactions: Record<string, Interaction[]> = {
  "introduction-to-risk-management": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l1-q1",
      prompt:
        "Two traders read the exact same chart correctly and take the exact same trade idea, but end up with very different results. Per this lesson, what's the most likely reason?",
      options: [
        { key: "a", text: "One of them used a better broker" },
        {
          key: "b",
          text: "They risked different percentages of their account on the idea",
        },
        { key: "c", text: "One of them had access to real-time news" },
        { key: "d", text: "One of them traded on a demo account" },
      ],
      correctKey: "b",
      correctFeedback:
        "Right — the lesson's own example is one trader risking 1% and the other 25% on the identical, correct view. Risk management is the layer that turns a view into a properly sized trade.",
      incorrectFeedback:
        "Not quite. The lesson's own example: two traders with the exact same correct chart read get very different results because one risked 1% of their account and the other risked 25% — the difference is position sizing, not the idea itself.",
    },
    {
      kind: "reveal",
      id: "m6-l1-r1",
      label: "Think about it",
      prompt:
        "Before moving on: why might risk management matter more than which pattern, indicator, or fundamental signal you used to find a trade idea?",
      revealLabel: "What the lesson says",
      explanation:
        "Every tool from Modules 2–5 — chart reading, indicators, price action, fundamentals — helps you form a view. None of them tell you how big a position to take based on that view. Risk management is described as the missing layer that turns an idea into a properly sized trade, which is why the lesson calls it one of the most practically useful modules in the whole course.",
    },
  ],

  "risk-per-trade": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l2-q1",
      label: "Calculation",
      prompt:
        "A trader has a $1,500 account and decides to risk 2% per trade. What is their maximum planned loss on this trade, in dollars?",
      options: [
        { key: "a", text: "$15" },
        { key: "b", text: "$30" },
        { key: "c", text: "$150" },
        { key: "d", text: "$3" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — $1,500 × 0.02 = $30, following the same chain as the lesson's own $1,000 × 0.01 = $10 example.",
      incorrectFeedback:
        "Not quite. Money at risk = account size × risk %: $1,500 × 0.02 = $30.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m6-l2-q2",
      prompt:
        "True or false: because risk per trade is set as a percentage, the dollar amount at risk stays exactly the same no matter how the account balance changes.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — that's the whole point of using a percentage: the dollar amount automatically scales up or down as the balance changes, without the trader having to remember to update a fixed number.",
      incorrectFeedback:
        "Actually false. A percentage automatically scales with the account — as the balance changes, the dollar amount at risk changes with it. A fixed dollar amount is what would stay the same regardless of balance.",
    },
  ],

  "stop-loss-invalidation": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l3-q1",
      scenario:
        "A trader planned a 20-pip stop, risking $10 (1% of a $1,000 account). As price approaches the stop, rather than accept the loss, they move the stop another 20 pips farther away.",
      prompt: "What has happened to their risk on this trade?",
      options: [
        {
          key: "a",
          text: "Risk stays $10 — it's still the same trade idea",
        },
        {
          key: "b",
          text: "Risk doubles to $20 (2% of the account), without a new deliberate decision to accept that higher risk",
        },
        {
          key: "c",
          text: "Risk decreases, since the stop is now farther from ordinary noise",
        },
        { key: "d", text: "Risk becomes impossible to calculate" },
      ],
      correctKey: "b",
      correctFeedback:
        "Exactly right — this is the lesson's own example. Moving the stop another 20 pips farther away silently doubles the position's risk to $20 (2%), without the trader ever making a fresh decision to accept that higher risk.",
      incorrectFeedback:
        "Not quite. The lesson works this exact example: moving the stop another 20 pips farther away doubles the risk from $10 (1%) to $20 (2%) — the position's risk changed even though nothing about the trade idea did.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m6-l3-q2",
      prompt:
        "True or false: a placed stop-loss order guarantees execution at exactly the requested price, even during fast-moving news events.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — in fast-moving markets, price can move past a stop level before the order fills, closing the position at the next available price instead. That gap is slippage.",
      incorrectFeedback:
        "Actually false. During genuinely fast-moving markets — major news or a weekend gap — price can move past a stop-loss level before the order fills. The position still closes, but at the next available price, not necessarily the exact one requested. That gap is called slippage.",
    },
  ],

  "position-sizing": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l4-q1",
      prompt:
        "Which of the following does NOT directly affect the pip value of a position, per this lesson?",
      options: [
        { key: "a", text: "The currency pair" },
        { key: "b", text: "The position size" },
        { key: "c", text: "The account currency" },
        { key: "d", text: "The trader's stop-loss distance in pips" },
      ],
      correctKey: "d",
      correctFeedback:
        "Right — pip value depends on the currency pair, position size, account currency, and exchange rate. Stop-loss distance is a separate input, multiplied by pip value later in the position-size formula, but it doesn't change what the pip value itself is.",
      incorrectFeedback:
        "Not quite. The lesson lists exactly four things pip value depends on: the currency pair, position size, account currency, and exchange rate. Stop-loss distance in pips is a separate variable in the position-sizing formula, not a factor in pip value itself.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m6-l4-q2",
      prompt:
        "True or false: the pip-value figures used in this module's own examples (like $1 per pip on a mini lot) are a simplified teaching assumption, not numbers to trade with directly.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — the lesson is explicit that its examples use a clearly stated, simplified assumption so the math stays visible, and that a live platform calculates the exact, current pip value for the trader's actual account and position.",
      incorrectFeedback:
        "Actually true. The lesson explicitly says to treat its pip-value figures as a teaching device, not a number to trade with directly — a real platform calculates the exact current pip value for your specific pair, size, and account.",
    },
  ],

  "practical-position-sizing-calculations": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l5-q1",
      label: "Calculation",
      scenario:
        "Account = $4,000. Risk = 1.5%. Stop loss = 30 pips. Pip value assumption = $1 per pip (mini lot).",
      prompt: "What position size does this trader's own risk rule support?",
      options: [
        { key: "a", text: "0.50 mini lots" },
        { key: "b", text: "1.50 mini lots" },
        { key: "c", text: "2.00 mini lots" },
        { key: "d", text: "4.00 mini lots" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct: risk amount = $4,000 × 0.015 = $60. Position size = $60 ÷ (30 pips × $1/pip) = $60 ÷ $30 = 2.00 mini lots. Same chain as the lesson's own worked example, just with different inputs.",
      incorrectFeedback:
        "Work it in two steps. Risk amount = $4,000 × 0.015 = $60. Position size = risk amount ÷ (stop pips × pip value) = $60 ÷ (30 × $1) = $60 ÷ $30 = 2.00 mini lots.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m6-l5-q2",
      prompt:
        "In the lesson's own comparison, Example 1 used a $1,000 account and Example 3 used a $5,000 account — both with 1% risk and a 20-pip stop. Account size was 5× larger in Example 3. What happened to the resulting position size?",
      options: [
        {
          key: "a",
          text: "It also scaled by 5×, from 0.50 mini lots to 2.50 mini lots",
        },
        {
          key: "b",
          text: "It stayed the same, since the risk percentage didn't change",
        },
        { key: "c", text: "It decreased, since a larger account is riskier" },
        { key: "d", text: "It can't be determined from this information" },
      ],
      correctKey: "a",
      correctFeedback:
        "Exactly — 0.50 mini lots versus 2.50 mini lots, scaling by the same 5× factor as the account size. Position size is a direct result of the risk decision and stop distance, not an independent guess.",
      incorrectFeedback:
        "Not quite. The lesson shows position size scaling by exactly the same factor as account size: 0.50 mini lots (Example 1) became 2.50 mini lots (Example 3) — a 5× increase matching the 5× larger account.",
    },
  ],

  "take-profit-risk-reward": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l6-q1",
      label: "Calculation",
      scenario: "A trader's planned risk is $25. Their planned reward is $100.",
      prompt: "What is the risk-to-reward ratio of this trade?",
      options: [
        { key: "a", text: "1:2" },
        { key: "b", text: "1:3" },
        { key: "c", text: "1:4" },
        { key: "d", text: "1:5" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — $100 ÷ $25 = 4, so the ratio is 1:4, following the same reward-over-risk calculation as the lesson's own $40 ÷ $20 = 1:2 example.",
      incorrectFeedback:
        "Divide reward by risk: $100 ÷ $25 = 4, so the ratio is 1:4.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m6-l6-q2",
      label: "Calculation",
      prompt:
        "Using this lesson's breakeven win-rate formula (1 ÷ (1 + Risk-to-Reward Ratio)), what win rate does a trader need just to break even at a 1:4 risk-to-reward ratio?",
      options: [
        { key: "a", text: "20%" },
        { key: "b", text: "25%" },
        { key: "c", text: "33.33%" },
        { key: "d", text: "50%" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — 1 ÷ (1 + 4) = 1 ÷ 5 = 20%. The higher the risk-to-reward ratio, the lower the win rate needed to break even, exactly as the lesson's 1:1/1:2/1:3 table shows.",
      incorrectFeedback:
        "Apply the formula: 1 ÷ (1 + Risk-to-Reward Ratio) = 1 ÷ (1 + 4) = 1 ÷ 5 = 20%.",
    },
  ],

  expectancy: [
    {
      kind: "check",
      type: "mc",
      id: "m6-l7-q1",
      label: "Calculation",
      scenario:
        "A trader's stats: win rate 45%, average win $40, loss rate 55%, average loss $30.",
      prompt: "What is this trader's expectancy per trade?",
      options: [
        { key: "a", text: "+$1.50 per trade" },
        { key: "b", text: "−$1.50 per trade" },
        { key: "c", text: "+$6.50 per trade" },
        { key: "d", text: "+$10.00 per trade" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct: (0.45 × $40) − (0.55 × $30) = $18 − $16.50 = +$1.50 per trade — a small but genuinely positive expectancy, the same kind of calculation as the lesson's own three worked examples.",
      incorrectFeedback:
        "Work the formula piece by piece: (Win Rate × Average Win) − (Loss Rate × Average Loss) = (0.45 × $40) − (0.55 × $30) = $18 − $16.50 = +$1.50 per trade.",
    },
    {
      kind: "reveal",
      id: "m6-l7-r1",
      label: "Think about it",
      prompt:
        "Expectancy is only meaningful as an average \"over a large enough number of trades.\" What does that actually mean for judging your results after just 5 or 10 trades?",
      revealLabel: "What the lesson says",
      explanation:
        "The lesson compares expectancy to a casino's edge: it only shows up over many hands, not any single one. A single trade is either a full win, a full loss, or something close to but not exactly one of those because of slippage — so a handful of trades is not enough to know whether a strategy's real expectancy is positive or negative. The lesson's own third example makes the same point from another angle: a 70% win rate can still carry negative expectancy, so a short stretch of wins tells you very little on its own.",
    },
  ],

  drawdown: [
    {
      kind: "check",
      type: "mc",
      id: "m6-l8-q1",
      label: "Calculation",
      prompt:
        "An account suffers a 40% drawdown. Using this lesson's recovery formula (1 ÷ (1 − Loss %)) − 1, what percentage gain is required to get back to the original balance?",
      options: [
        { key: "a", text: "40.0%" },
        { key: "b", text: "50.0%" },
        { key: "c", text: "66.7%" },
        { key: "d", text: "100.0%" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct: 1 ÷ (1 − 0.40) − 1 = 1 ÷ 0.60 − 1 = 1.667 − 1 = 66.7%. Notice this is already well above the 40% that was lost — exactly the gap the lesson's recovery table illustrates.",
      incorrectFeedback:
        "Apply the formula: 1 ÷ (1 − 0.40) − 1 = 1 ÷ 0.60 − 1 = 1.6667 − 1 = 66.7% — always larger than the original loss percentage.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m6-l8-q2",
      prompt:
        "True or false: the percentage gain required to recover from a drawdown is always equal to the original loss percentage.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — required recovery is always larger than the loss, and the gap widens as the loss grows: a 50% loss needs a full 100% gain just to break even.",
      incorrectFeedback:
        "Actually false. The required recovery is always larger than the original loss percentage, and that gap grows faster as the loss gets bigger — a 30% loss needs a 42.9% gain, and a 50% loss needs a 100% gain.",
    },
  ],

  "losing-streaks": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l9-q1",
      prompt:
        "Under a fixed 1% risk rule, why does the dollar amount risked get slightly smaller with each consecutive loss during a losing streak?",
      options: [
        {
          key: "a",
          text: "Because 1% is recalculated from the current, already-reduced balance each time",
        },
        {
          key: "b",
          text: "Because brokers automatically shrink position sizes during losing streaks",
        },
        { key: "c", text: "Because stop-loss distances automatically tighten after a loss" },
        { key: "d", text: "Because pip value decreases as an account loses money" },
      ],
      correctKey: "a",
      correctFeedback:
        "Right — because the 1% is calculated from the current balance, not the original one, each loss is a little smaller in dollar terms than the one before, which is why the lesson's 5-loss table shows shrinking dollar amounts ($20.00, $19.80, $19.60...).",
      incorrectFeedback:
        "The lesson's actual explanation: 1% is recalculated from the current balance each time, not the original balance, so each individual loss under percentage-based risk is a little smaller in dollar terms than the one before it.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m6-l9-q2",
      prompt:
        "True or false: a losing streak, even for a strategy with genuinely positive expectancy, automatically means the strategy is broken and should be changed immediately.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that a losing streak is a statistically normal outcome even for a strategy with positive expectancy, and the streak alone isn't evidence one way or the other.",
      incorrectFeedback:
        "Actually false. A losing streak is described as a normal, expected event even for a strategy with genuinely positive expectancy — expectancy is a long-run average, not a guarantee about the order individual trades happen in.",
    },
  ],

  "leverage-margin": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l10-q1",
      label: "Calculation",
      scenario:
        "A trader opens 0.8 standard lots (80,000 units) of a pair trading at an exchange rate of 1.25000, using 1:200 leverage.",
      prompt: "What margin is required to open this position?",
      options: [
        { key: "a", text: "$250" },
        { key: "b", text: "$500" },
        { key: "c", text: "$1,000" },
        { key: "d", text: "$2,000" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct: notional value = 80,000 × 1.25000 = $100,000. Margin = $100,000 ÷ 200 = $500 — same two-step process as the lesson's own EUR/USD example.",
      incorrectFeedback:
        "Work it in two steps. Notional value = units × exchange rate = 80,000 × 1.25000 = $100,000. Margin required = notional value ÷ leverage = $100,000 ÷ 200 = $500.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m6-l10-q2",
      prompt:
        "A trader's planned risk (from their stop-loss distance and position size) is $300, whether they use 1:50 leverage or 1:500 leverage on the same position. What does this demonstrate?",
      options: [
        {
          key: "a",
          text: "Leverage and margin determine how much capital is needed to open a position, but not the trade's planned risk",
        },
        { key: "b", text: "Higher leverage always increases a trade's dollar risk" },
        { key: "c", text: "Margin and risk are simply the same thing, calculated two different ways" },
        { key: "d", text: "Leverage should always be set as high as possible to minimize risk" },
      ],
      correctKey: "a",
      correctFeedback:
        "Exactly right — the lesson's own point: the $300 planned-risk figure doesn't appear in the margin table at all and doesn't change as leverage changes, because risk is set by stop-loss distance and pip value, not by the leverage ratio.",
      incorrectFeedback:
        "Not quite. The lesson's point is that the margin required to open a position changes with leverage, but the position's planned risk if the stop is hit stays the same — risk is set by stop-loss distance and position size, not by leverage.",
    },
  ],

  "capital-preservation": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l11-q1",
      scenario:
        "After three straight losing trades, a trader considers raising their risk per trade from 1% to 3% so they can recover the losses faster.",
      prompt:
        "Per this lesson's capital-preservation rules, is that consistent with protecting capital?",
      options: [
        { key: "a", text: "Yes — the account can clearly absorb the higher risk" },
        {
          key: "b",
          text: "No — increasing risk after a loss is specifically warned against, and tends to turn a manageable drawdown into a much larger one",
        },
        { key: "c", text: "Yes, as long as the stop loss is still respected" },
        { key: "d", text: "It depends only on how confident the trader feels" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson lists \"avoid increasing risk after a loss\" as one of its specific capital-preservation rules, precisely because that response tends to turn a manageable drawdown into a much larger one.",
      incorrectFeedback:
        "The lesson is explicit here: avoiding increasing risk after a loss is one of its named capital-preservation rules — raising risk to \"win it back faster\" tends to turn a manageable drawdown into a much larger one.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m6-l11-q2",
      prompt:
        "Which of the following is explicitly listed in this lesson as a capital-preservation behavior?",
      options: [
        { key: "a", text: "Increasing position size when a setup 'feels' especially obvious" },
        { key: "b", text: "Moving a stop loss farther away rather than accepting a loss" },
        { key: "c", text: "Defining maximum risk before entering a trade, every single time" },
        {
          key: "d",
          text: "Reacting to results after a handful of trades rather than waiting for a meaningful sample",
        },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — \"define your maximum risk before entering, every time\" is listed first among this lesson's specific, checkable capital-preservation rules.",
      incorrectFeedback:
        "The other three options are listed in this lesson as mistakes to avoid, not capital-preservation behaviors. The rule actually listed is: define your maximum risk before entering a trade, every time.",
    },
  ],

  "building-your-own-risk-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m6-l12-q1",
      prompt:
        "Why does this module deliberately leave the values in the personal risk-rules template blank instead of filling them in for you?",
      options: [
        {
          key: "a",
          text: "Because the right values depend on your own capital, strategy, experience, and risk tolerance",
        },
        { key: "b", text: "Because written risk rules don't meaningfully affect trading outcomes" },
        { key: "c", text: "Because specific values are covered later, in Module 7" },
        { key: "d", text: "Because every trader should ultimately use the same values" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the lesson is explicit that a trader with a small account and little experience, one with a larger account and a long track record, and one running multiple strategies all have legitimately different answers to every field in the template.",
      incorrectFeedback:
        "The lesson's actual reason: the right values for each field depend on the individual trader's own capital, strategy, experience, and risk tolerance — the same principle Lesson 2 established for risk percentage specifically.",
    },
  ],
};
