import type { Interaction } from "./types";

// Module 4 interactivity — hand-authored for each of this module's 12
// lessons, grounded strictly in that lesson's own existing text (see
// content/course/modules/module-04-price-action/01-content.md).
// Follows the same standard as Modules 1–3. This module's own text is
// unusually careful about observation-vs-interpretation and about never
// treating structure/zones/BOS/CHOCH as proof of a specific outcome or of
// another participant's intent — several items test that distinction
// directly rather than just recalling a definition. Several scenario items
// continue the module's own running example (the swing sequence
// 1.08200 → 1.08450 → 1.08320 → 1.08600, the BOS at 1.08450, the CHOCH at
// 1.08460, and the resulting 1:2 risk-to-reward trade) across Lessons
// 4/7/8/9/10, the same way the lesson text itself carries that example
// forward — nothing here invents a new market claim beyond what each
// lesson already teaches.

export const module04Interactions: Record<string, Interaction[]> = {
  "introduction-to-price-action": [
    {
      kind: "check",
      id: "m4-l1-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, why does price action treat raw price as the primary source of analysis, ahead of indicators?",
      options: [
        { key: "A", text: "Indicators are considered unreliable and shouldn't be used at all" },
        { key: "B", text: "Every indicator is ultimately derived from price, so nothing it shows can contain more information than the price it was calculated from" },
        { key: "C", text: "Price action is a newer, more advanced technique than indicator-based analysis" },
        { key: "D", text: "Regulators require price-based analysis for retail traders" },
      ],
      correctKey: "B",
      correctFeedback: "Right — and per the lesson, that doesn't make indicators wrong or unnecessary; plenty of traders combine both.",
      incorrectFeedback: "Re-read the \"Why does it matter?\" section: the reasoning is that an indicator can't contain more information than the price it was calculated from.",
    },
    {
      kind: "reveal",
      id: "m4-l1-r1",
      label: "Think About It",
      prompt:
        "A price-action chart often looks comparatively bare — candles, a handful of marked levels — next to an indicator-heavy chart. Does that mean less analytical work is happening? Decide, then reveal.",
      revealLabel: "Reveal explanation",
      explanation:
        "No — per the lesson, that simplicity is deliberate, not a sign of less work. Price action carries exactly the same fundamental uncertainty as every tool in Module 3; it's a different lens, not a more certain one.",
    },
  ],

  "reading-raw-price-movement": [
    {
      kind: "check",
      id: "m4-l2-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "This lesson distinguishes observation from interpretation. Which of the following is an observation, not an interpretation?",
      options: [
        { key: "A", text: "\"Buyers are running out of strength\"" },
        { key: "B", text: "\"The candles got smaller and the upper wicks got longer\"" },
        { key: "C", text: "\"The market is about to reverse\"" },
        { key: "D", text: "\"Sellers are now fully in control\"" },
      ],
      correctKey: "B",
      correctFeedback: "Right — that's something you can point to directly on the chart. The others are reasonable-sounding explanations, but not something you can verify just by looking.",
      incorrectFeedback:
        "Re-read the lesson's own example directly: \"the candles got smaller and the upper wicks got longer\" is the observation; \"buyers are running out of strength\" is the interpretation of it.",
    },
    {
      kind: "check",
      id: "m4-l2-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, it's fine to name a pattern or structure label before actually describing, in plain language, what price is doing.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the Beginner Mistake note, the label is only useful if the underlying observation actually supports it.",
      incorrectFeedback: "Re-read the Beginner Mistake note: skipping straight to a label without first describing what price is doing is called out directly as the mistake to avoid.",
    },
  ],

  "market-structure": [
    {
      kind: "check",
      id: "m4-l3-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson's precise definition, what is a swing high?",
      options: [
        { key: "A", text: "Any candle that closes higher than it opened" },
        { key: "B", text: "A local peak — higher than the price immediately before and after it — before price turns back down" },
        { key: "C", text: "The highest closing price on the entire chart" },
        { key: "D", text: "A price level that's been touched exactly twice" },
      ],
      correctKey: "B",
      correctFeedback: "Right — that's this lesson's precise \"local peak\" framing of a swing high.",
      incorrectFeedback: "Re-read the definition directly: a swing high is a local peak, higher than the price immediately on either side of it, not just any bullish candle.",
    },
    {
      kind: "reveal",
      id: "m4-l3-r1",
      label: "Think About It",
      prompt: "Should every small wiggle in price on a noisy lower timeframe be labeled a meaningful swing high or low? Decide, then reveal.",
      revealLabel: "Reveal explanation",
      explanation:
        "No — per the Beginner Mistake note, not every minor turn is structurally significant. This is a judgment skill that improves with practice, not a rule with a precise universal cutoff.",
    },
  ],

  "swings-trends-and-structure": [
    {
      kind: "check",
      id: "m4-l4-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "This module's running example: a swing low at 1.08200, a swing high at 1.08450, a higher swing low at 1.08320, and then a new swing high at 1.08600.",
      prompt: "Using this lesson's method, how does this sequence of swing points classify?",
      options: [
        { key: "A", text: "Bullish structure (higher highs and higher lows)" },
        { key: "B", text: "Bearish structure (lower highs and lower lows)" },
        { key: "C", text: "Ranging" },
        { key: "D", text: "Cannot be determined from four swing points" },
      ],
      correctKey: "A",
      correctFeedback: "Right — the highs (1.08450 → 1.08600) and lows (1.08200 → 1.08320) are both rising: this is the lesson's own example of bullish structure.",
      incorrectFeedback:
        "Check both sequences the way this lesson's example does: the highs are rising and so are the lows — that combination is bullish structure.",
    },
    {
      kind: "check",
      id: "m4-l4-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, structure can be called bullish based on a single higher high, even if the lows aren't also rising.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the Beginner Mistake note, both the highs and the lows need to actually follow the pattern, not just one swing.",
      incorrectFeedback: "Re-read the Beginner Mistake note: calling structure bullish from a single swing, without checking both highs and lows, is the exact mistake flagged here.",
    },
  ],

  "supply-and-demand": [
    {
      kind: "check",
      id: "m4-l5-q1",
      type: "mc",
      label: "Scenario",
      scenario: "EUR/USD trades between 1.07800 and 1.07850, then rallies sharply away, climbing over 100 pips without much hesitation.",
      prompt: "Per this lesson, what does this make the 1.07800–1.07850 zone?",
      options: [
        { key: "A", text: "A supply zone" },
        { key: "B", text: "A demand zone" },
        { key: "C", text: "A liquidity pool" },
        { key: "D", text: "A confirmed level guaranteed to hold if price returns" },
      ],
      correctKey: "B",
      correctFeedback: "Right — this is the lesson's own example of a demand zone: the area price departed sharply away from, to the upside.",
      incorrectFeedback: "Re-read the lesson's own worked example: a sharp rally away from an area marks that origin area as a demand zone, not supply.",
    },
    {
      kind: "reveal",
      id: "m4-l5-r1",
      label: "Think About It",
      prompt:
        "This lesson deliberately avoids claiming that demand/supply zones are precisely-placed \"institutional order blocks.\" Why does it draw that line?",
      revealLabel: "Reveal explanation",
      explanation:
        "Because that framing overstates what can actually be observed. What's observable is only that price moved sharply away from an area before — a reasonable basis for attention, not a mechanism that causes price to reverse.",
    },
  ],

  "liquidity-concepts": [
    {
      kind: "check",
      id: "m4-l6-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "EUR/USD prints a swing high at 1.08900, then a second swing high at 1.08910 (equal highs). Days later, price briefly pushes to 1.08950, above both, then reverses and closes back down at 1.08850.",
      prompt: "Per this lesson, what is the observation here — the part you can actually point to on the chart, as distinct from interpretation?",
      options: [
        { key: "A", text: "That a specific trader deliberately targeted the resting orders at that level" },
        { key: "B", text: "That price pushed briefly above 1.08910 and then reversed back below 1.08900" },
        { key: "C", text: "That \"smart money\" engineered the entire move" },
        { key: "D", text: "That this sweep proves the market will now fall further" },
      ],
      correctKey: "B",
      correctFeedback: "Right — that price pushed above the highs and reversed back below is directly observable. Why it happened, and who caused it, is interpretation this course can't verify.",
      incorrectFeedback:
        "Re-read \"Observation versus interpretation, applied directly\": the price move itself is the observation; any claim about a specific participant's intent is interpretation, not verified fact.",
    },
    {
      kind: "check",
      id: "m4-l6-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, every brief spike beyond a recent high or low is proof of a deliberate liquidity grab.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the lesson's Note, some moves are a genuine sweep-and-reverse, but others are normal volatility, a real breakout that continues, or news-driven movement.",
      incorrectFeedback: "Re-read the Note and the Beginner Mistake below it: treating every spike as proof of a deliberate grab is the exact mistake this lesson warns against.",
    },
  ],

  "break-of-structure-bos": [
    {
      kind: "check",
      id: "m4-l7-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "Continuing the module's running example: structure was already bullish (low 1.08200, high 1.08450, higher low 1.08320). Price then closes above 1.08450 and goes on to form a new high at 1.08600.",
      prompt: "Per this lesson, what does that close above 1.08450 represent?",
      options: [
        { key: "A", text: "A bearish CHOCH" },
        { key: "B", text: "A bullish BOS — confirming the uptrend is continuing" },
        { key: "C", text: "A new demand zone forming" },
        { key: "D", text: "A liquidity sweep" },
      ],
      correctKey: "B",
      correctFeedback: "Right — this is the lesson's own example of a bullish BOS: a close beyond the most recent swing high, confirming the existing bullish structure is continuing.",
      incorrectFeedback: "Re-read the lesson's own worked example: closing above the prior swing high in an already-bullish structure is the definition of a bullish BOS, not a CHOCH.",
    },
    {
      kind: "check",
      id: "m4-l7-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a brief wick through a prior swing high — without price closing beyond it — should be treated the same as a genuine close beyond that level.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the lesson, a useful habit is requiring a close beyond the level, since a wick alone could just as easily be a liquidity sweep (Lesson 6) that reverses.",
      incorrectFeedback: "Re-read \"Distinguishing a meaningful break from random noise\": a close beyond the level is treated as more significant than a brief wick through it.",
    },
  ],

  "change-of-character-choch": [
    {
      kind: "check",
      id: "m4-l8-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "Continuing the running example: after the bullish BOS, price pulls back to a higher low at 1.08480, then only reaches 1.08560 on its next push (below the prior 1.08600 high), then falls and closes at 1.08460, below the 1.08480 swing low.",
      prompt: "Per this lesson, what does that close at 1.08460 represent?",
      options: [
        { key: "A", text: "A bullish BOS" },
        { key: "B", text: "A bearish CHOCH" },
        { key: "C", text: "Confirmed proof the uptrend has reversed for good" },
        { key: "D", text: "A new supply zone forming" },
      ],
      correctKey: "B",
      correctFeedback: "Right — the market failed to hold a low that should have held if the uptrend were still intact, right after failing to make a new high: this lesson's own definition of a bearish CHOCH.",
      incorrectFeedback: "Re-read the lesson's own worked example: breaking below the prior swing low, against the existing bullish structure, is a CHOCH, not a BOS.",
    },
    {
      kind: "check",
      id: "m4-l8-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a single CHOCH is proof that a full trend reversal is now underway.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — the lesson states directly: \"It is not proof that a full reversal is now underway.\" Structure can shift into a range, or the trend can resume anyway.",
      incorrectFeedback: "Re-read \"What a CHOCH indicates, and what it does NOT prove\" — a CHOCH is worth watching closely, but it's explicitly not proof of a reversal.",
    },
  ],

  "building-a-price-action-entry": [
    {
      kind: "check",
      id: "m4-l9-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, what's the actual difference between an anticipation entry and a confirmation entry?",
      options: [
        { key: "A", text: "There is no real difference between them" },
        { key: "B", text: "Anticipation acts before a level is actually broken; confirmation waits until the condition has actually occurred" },
        { key: "C", text: "Anticipation entries are always the safer choice" },
        { key: "D", text: "Confirmation entries don't require a defined trigger" },
      ],
      correctKey: "B",
      correctFeedback: "Right — and per the lesson, neither approach is universally \"correct\"; each trades off a better price against more confirming evidence.",
      incorrectFeedback: "Re-read \"Confirmation versus anticipation\": the difference is whether you act before or after the level is actually broken.",
    },
    {
      kind: "reveal",
      id: "m4-l9-r1",
      label: "Think About It",
      prompt:
        "This lesson says an entry decided \"in the moment, based on how a trade feels\" is far more likely to be driven by fear of missing out than by real analysis. What's the lesson's fix for this?",
      revealLabel: "Reveal explanation",
      explanation:
        "Defining a specific, observable trigger in advance, before price gets anywhere near it — that's what separates a planned entry from an emotional one, per the lesson.",
    },
  ],

  "stop-loss-and-take-profit-concepts": [
    {
      kind: "check",
      id: "m4-l10-q1",
      type: "mc",
      label: "Calculation",
      scenario: "Continuing the running example: entry at 1.08460, stop loss at 1.08590, target at 1.08200.",
      prompt: "Using this lesson's method, what is the risk-to-reward ratio for this trade?",
      options: [
        { key: "A", text: "1 : 1" },
        { key: "B", text: "1 : 2" },
        { key: "C", text: "2 : 1" },
        { key: "D", text: "1 : 3" },
      ],
      correctKey: "B",
      correctFeedback: "Risk = 1.08590 − 1.08460 = 13 pips. Reward = 1.08460 − 1.08200 = 26 pips. 26 ÷ 13 = 2, a 1:2 risk-to-reward ratio.",
      incorrectFeedback:
        "Follow the lesson's method: risk is the distance to the stop (13 pips here), reward is the distance to the target (26 pips) — reward ÷ risk gives the ratio.",
    },
    {
      kind: "check",
      id: "m4-l10-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, planning a 1:2 (or higher) risk-to-reward ratio on every trade guarantees profitability over time.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — per the lesson, the ratio says nothing about how often the target is actually reached versus the stop; a trader can plan a high ratio on every trade and still lose money overall.",
      incorrectFeedback: "Re-read \"Why a high reward-to-risk ratio does not guarantee profitability\" — the ratio describes the plan, not the odds of it succeeding.",
    },
  ],

  "multi-timeframe-price-action-analysis": [
    {
      kind: "check",
      id: "m4-l11-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson's context/structure/execution framework, what role does the lower timeframe play?",
      options: [
        { key: "A", text: "Context — the broadest read of the trend" },
        { key: "B", text: "Structure — the specific swing points and any recent BOS/CHOCH" },
        { key: "C", text: "Execution — where a specific entry trigger actually occurs" },
        { key: "D", text: "Risk management — where the stop loss is calculated" },
      ],
      correctKey: "C",
      correctFeedback: "Right — in this lesson's framework, the lower timeframe is for execution: the specific, small-timeframe trigger.",
      incorrectFeedback: "Re-check the three-part framework: higher timeframe is context, middle is structure, and the lower timeframe is execution.",
    },
    {
      kind: "check",
      id: "m4-l11-q2",
      type: "mc",
      label: "Scenario",
      scenario: "The 4-hour chart shows clear bullish structure, but the 1-hour chart prints a bearish CHOCH against that context.",
      prompt: "Per this lesson, how does a price-action trader typically treat that lower-timeframe signal?",
      options: [
        { key: "A", text: "As an automatic green light to trade against the bigger picture" },
        { key: "B", text: "As lower-confidence — a reason for caution, not an automatic countertrend entry" },
        { key: "C", text: "As proof the higher timeframe reading must be wrong" },
        { key: "D", text: "It should be ignored completely since it conflicts with the higher timeframe" },
      ],
      correctKey: "B",
      correctFeedback: "Right — the lesson lists reasonable responses like waiting for higher-timeframe confirmation or treating it only as caution on an existing position, not a fresh countertrend entry.",
      incorrectFeedback:
        "Re-read \"When timeframes conflict\": a conflicting lower-timeframe signal is treated as lower-confidence, not a green light and not something to simply ignore.",
    },
  ],

  "building-a-repeatable-price-action-framework": [
    {
      kind: "check",
      id: "m4-l12-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson's ten-step framework, what comes right after identifying market context and current structure (steps 1–2)?",
      options: [
        { key: "A", text: "Defining the stop loss" },
        { key: "B", text: "Marking relevant supply/demand areas worth watching" },
        { key: "C", text: "Recording the trade idea in a journal" },
        { key: "D", text: "Reviewing the result afterward" },
      ],
      correctKey: "B",
      correctFeedback: "Right — Step 3 is marking relevant supply/demand areas, before liquidity (step 4) and the structural condition itself (step 5).",
      incorrectFeedback: "Re-check the ten numbered steps in order: after context and structure comes marking relevant areas, well before stop loss, journaling, or review.",
    },
    {
      kind: "check",
      id: "m4-l12-q2",
      type: "mc",
      label: "Knowledge Check",
      prompt:
        "This lesson notes that two careful traders can reasonably read the same chart slightly differently at several steps of the framework. Given that, what does following the framework consistently actually guarantee, per the lesson?",
      options: [
        { key: "A", text: "That every individual trade will be profitable" },
        { key: "B", text: "That your process is consistent, so you can actually learn something from each outcome" },
        { key: "C", text: "That structure can never be misread" },
        { key: "D", text: "That risk management becomes unnecessary" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, following the framework doesn't make any individual trade idea correct; it makes your process consistent enough to learn from.",
      incorrectFeedback: "Re-read \"Why this is a decision-making process, not a guarantee of successful trades\" — consistency of process is what's promised, never a guaranteed outcome.",
    },
  ],
};
