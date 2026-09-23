import type { Interaction } from "./types";

// Module 3 interactivity — hand-authored for each of this module's 13
// lessons, grounded strictly in that lesson's own existing text (see
// content/course/modules/module-03-technical-analysis/01-content.md).
// Follows the same standard as Modules 1–2: nothing here introduces a
// claim, number, or market scenario the lesson doesn't already support.
// This module's own text is unusually explicit that every tool interprets
// past price and never predicts the future, so several items test that
// distinction directly (overbought/oversold isn't an automatic signal,
// confluence isn't a guarantee, a broken trendline isn't a confirmed
// reversal, etc.) rather than just recall of a definition.
//
// Calculation-style items (moving average, RSI, MACD, Fibonacci) reuse each
// lesson's own worked formula with fresh numbers, the same approach Modules
// 1–2 use — never a new formula or claim the lesson didn't already teach.

export const module03Interactions: Record<string, Interaction[]> = {
  "what-technical-analysis-is": [
    {
      kind: "check",
      id: "m3-l1-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt:
        "This lesson says every tool in this module answers one question well, and cannot honestly answer a different one. Which pairing is correct?",
      options: [
        { key: "A", text: "They answer \"what will definitely happen next\" but not \"what's happened so far\"" },
        {
          key: "B",
          text: "They answer \"what does this suggest about the current balance of buyers and sellers\" but not \"what will definitely happen next\"",
        },
        { key: "C", text: "They answer both questions equally well" },
        { key: "D", text: "They answer neither question reliably" },
      ],
      correctKey: "B",
      correctFeedback:
        "Right — that distinction is exactly what separates using technical analysis as an interpretation framework from misusing it as a prediction machine.",
      incorrectFeedback:
        "Re-read the \"Why does it matter?\" section: these tools describe the current balance of buyers and sellers based on what's already happened — none of them can honestly say what happens next.",
    },
    {
      kind: "reveal",
      id: "m3-l1-r1",
      label: "Think About It",
      prompt:
        "A charting platform lists dozens, sometimes hundreds, of available indicators. Does having access to more of them automatically mean more insight? Decide, then reveal.",
      revealLabel: "Reveal explanation",
      explanation:
        "No — per the lesson, neither reaction (feeling overwhelmed, or assuming more indicators means more insight) is warranted. Lesson 12 explains directly why piling on more than a focused set tends to hurt rather than help.",
    },
  ],

  trendlines: [
    {
      kind: "check",
      id: "m3-l2-q1",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a trendline is a precise mathematical level, so any two traders analyzing the same chart will draw the exact same one.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — a trendline is drawn using judgment about which swing points to connect; two traders can reasonably draw two slightly different lines on the same chart.",
      incorrectFeedback: "Re-read the lesson's Note: a trendline is a visual guide drawn by a person, not a precise mathematical level everyone draws identically.",
    },
    {
      kind: "check",
      id: "m3-l2-q2",
      type: "mc",
      label: "Scenario",
      scenario:
        "EUR/USD's swing lows over three weeks are 1.08200, then 1.08400, then 1.08550 — each higher than the last. A line is drawn connecting the first two lows and extended forward; the third low lands almost exactly on that extended line.",
      prompt: "Per this lesson, what does this describe?",
      options: [
        { key: "A", text: "The trendline being respected" },
        { key: "B", text: "A confirmed trend reversal" },
        { key: "C", text: "A false breakout" },
        { key: "D", text: "A double bottom pattern" },
      ],
      correctKey: "A",
      correctFeedback: "Right — this is the lesson's own example of a trendline being respected: pullbacks finding support roughly along the same rising line.",
      incorrectFeedback: "Re-read the lesson's own worked example — a later swing landing on an already-drawn trendline is what \"respecting\" the trendline means here.",
    },
  ],

  "moving-averages": [
    {
      kind: "check",
      id: "m3-l3-q1",
      type: "mc",
      label: "Calculation",
      scenario: "Six consecutive daily EUR/USD closes: 1.09100, 1.09200, 1.09350, 1.09300, 1.09400, 1.09450.",
      prompt: "Using this lesson's method, what is the 5-period SMA (using the most recent 5 of these closes)?",
      options: [
        { key: "A", text: "1.09300" },
        { key: "B", text: "1.09340" },
        { key: "C", text: "1.09383" },
        { key: "D", text: "1.09450" },
      ],
      correctKey: "B",
      correctFeedback: "(1.09200 + 1.09350 + 1.09300 + 1.09400 + 1.09450) ÷ 5 = 1.09340 — the same method as the lesson's own worked example, just excluding the oldest close.",
      incorrectFeedback:
        "Follow the lesson's method exactly: average the most recent 5 closes (drop the oldest one, 1.09100), not all six and not just the last one.",
    },
    {
      kind: "check",
      id: "m3-l3-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a moving average reacts instantly to the very latest price change, the same way raw price does.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the Limitations section, a moving average is built entirely from past closes and always lags the current price to some degree.",
      incorrectFeedback: "Re-read the Limitations section: it always lags current price, more so the longer its period — it does not react instantly.",
    },
  ],

  "understanding-momentum": [
    {
      kind: "check",
      id: "m3-l4-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, which statement correctly distinguishes momentum from direction?",
      options: [
        { key: "A", text: "They're the same thing — momentum just means whether price is going up or down" },
        { key: "B", text: "Direction tells you which way price is moving; momentum tells you how strongly and quickly" },
        { key: "C", text: "Momentum only applies during a downtrend" },
        { key: "D", text: "Direction is calculated from momentum, not the other way around" },
      ],
      correctKey: "B",
      correctFeedback: "Right — direction and momentum are two different dimensions: which way price is moving, and how strongly/quickly it's doing so.",
      incorrectFeedback: "Re-read the car analogy: two cars moving the same direction can still have very different momentum. Direction and momentum answer different questions.",
    },
    {
      kind: "reveal",
      id: "m3-l4-r1",
      label: "Think About It",
      prompt: "A market can be moving up (direction) while momentum is actually fading. Why does this matter, per this lesson?",
      revealLabel: "Reveal explanation",
      explanation:
        "Because direction alone doesn't tell you whether a move is gaining strength, losing strength, or running out of steam — momentum tools like RSI and MACD exist to add that second dimension.",
    },
  ],

  "rsi-relative-strength-index": [
    {
      kind: "check",
      id: "m3-l5-q1",
      type: "mc",
      label: "Calculation",
      scenario: "Six consecutive EUR/USD closes: 1.09000, 1.09150, 1.09100, 1.09250, 1.09300, 1.09200.",
      prompt: "Using this lesson's simplified 5-period method, what is the RSI for this data?",
      options: [
        { key: "A", text: "30.0" },
        { key: "B", text: "62.5" },
        { key: "C", text: "70.0" },
        { key: "D", text: "90.9" },
      ],
      correctKey: "C",
      correctFeedback:
        "The five changes are +15, −5, +15, +5, −10 pips. Average gain = (15+0+15+5+0)÷5 = 7. Average loss = (0+5+0+0+10)÷5 = 3. Ratio = 7÷3 = 2.33. RSI = 100 − (100 ÷ 3.33) = 70.0.",
      incorrectFeedback:
        "Follow the lesson's formula step by step: sum the gains and losses separately, average each, divide gain by loss for the ratio, then apply RSI = 100 − (100 ÷ (1 + ratio)).",
    },
    {
      kind: "check",
      id: "m3-l5-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, an RSI reading above 70 automatically means price is likely to fall soon.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — overbought only means recent buying has been strong relative to recent selling. A strong, healthy uptrend can push RSI above 70 and stay there for an extended stretch.",
      incorrectFeedback:
        "Re-read the lesson's bolded section: treating \"overbought\" as an automatic sell signal is called out as one of the most common, costly misreadings of RSI.",
    },
  ],

  "macd-moving-average-convergence-divergence": [
    {
      kind: "check",
      id: "m3-l6-q1",
      type: "mc",
      label: "Calculation",
      scenario:
        "For a run of recent EUR/USD closes, this lesson's method gives a 3-period (fast) SMA of 1.10250 and a 5-period (slow) SMA of 1.10180.",
      prompt: "What does the resulting simplified MACD line value tell you?",
      options: [
        { key: "A", text: "It's positive (1.10250 − 1.10180), meaning the faster average is currently above the slower one" },
        { key: "B", text: "It's negative, meaning the faster average is below the slower one" },
        { key: "C", text: "MACD can't be determined from two moving averages alone" },
        { key: "D", text: "The two averages must be exactly equal for MACD to mean anything" },
      ],
      correctKey: "A",
      correctFeedback: "Right — MACD line = fast − slow = 1.10250 − 1.10180 = +0.00070, positive, meaning the faster average is above the slower one.",
      incorrectFeedback:
        "Follow the lesson's definition: the MACD line is simply fast average minus slow average. Here that's 1.10250 − 1.10180, which is positive.",
    },
    {
      kind: "reveal",
      id: "m3-l6-r1",
      label: "Think About It",
      prompt:
        "A MACD histogram is shrinking even while price is still moving in the same direction. What might that suggest, per this lesson?",
      revealLabel: "Reveal explanation",
      explanation:
        "Fading momentum — a shrinking histogram means the gap between the MACD line and signal line is narrowing, which the lesson compares directly to the RSI divergence idea from Lesson 5.",
    },
  ],

  "fibonacci-retracement": [
    {
      kind: "check",
      id: "m3-l7-q1",
      type: "mc",
      label: "Calculation",
      scenario: "EUR/USD swings from a low of 1.09200 up to a high of 1.10200 (a range of 100 pips).",
      prompt: "Using this lesson's formula, what is the 61.8% retracement level?",
      options: [
        { key: "A", text: "1.09582" },
        { key: "B", text: "1.09818" },
        { key: "C", text: "1.09700" },
        { key: "D", text: "1.10618" },
      ],
      correctKey: "A",
      correctFeedback: "level = high − ((high − low) × ratio) = 1.10200 − (0.01000 × 0.618) = 1.09582.",
      incorrectFeedback:
        "Follow the lesson's formula exactly: 1.10200 − (0.01000 × 0.618). (1.09818 is the 38.2% level, and 1.09700 is the 50% level — check which ratio you used.)",
    },
    {
      kind: "check",
      id: "m3-l7-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, price is obligated to react at a Fibonacci retracement level once it's drawn.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — per the lesson, even from an identically drawn measurement, price has no obligation to react at any of these levels; they're areas of possible interest, not a mechanism that causes price to turn.",
      incorrectFeedback: "Re-read the \"Why the tool is subjective\" section: these are reference zones based on a historical pattern, not levels price must respect.",
    },
  ],

  "chart-patterns": [
    {
      kind: "check",
      id: "m3-l8-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "A double top forms after a long, established uptrend. A separate double top forms from two random peaks inside a choppy range that was never trending.",
      prompt: "Per this lesson, how should these two double tops be read?",
      options: [
        { key: "A", text: "Identically — it's the same shape either way" },
        { key: "B", text: "Differently — context changes how much weight the pattern deserves" },
        { key: "C", text: "The pattern is only valid if it forms in a downtrend" },
        { key: "D", text: "Both guarantee a reversal, since it's a recognized pattern" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, \"why context matters\" is explicit: the same shape means something different depending on what came before it.",
      incorrectFeedback: "Re-read the \"Why context matters\" note under Double top — the same pattern is read differently depending on whether it follows an established trend.",
    },
    {
      kind: "reveal",
      id: "m3-l8-r1",
      label: "Think About It",
      prompt:
        "A triangle pattern can break in either direction, or not break cleanly at all, per this lesson. What should a trader NOT assume about a forming triangle?",
      revealLabel: "Reveal explanation",
      explanation:
        "That it announces which way price will go next. Per the lesson, a triangle represents a period of compression — often a pause — not a directional guarantee.",
    },
  ],

  "candlestick-patterns": [
    {
      kind: "check",
      id: "m3-l9-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt:
        "The exact same candle shape — small body near the top of its range, long lower wick — is called a hammer after a downtrend and a hanging man after an uptrend, per this lesson. What determines which name and interpretation applies?",
      options: [
        { key: "A", text: "The candle's color" },
        { key: "B", text: "Where the candle appears relative to the recent trend" },
        { key: "C", text: "How many wicks it has" },
        { key: "D", text: "Which timeframe it's drawn on" },
      ],
      correctKey: "B",
      correctFeedback: "Right — the shape alone doesn't tell you which situation you're in; where it appears (after a downtrend vs. after an uptrend) does.",
      incorrectFeedback: "Re-read the hammer/hanging man section: it's explicit that \"the shape alone doesn't tell you which situation you're in — where it appears does.\"",
    },
    {
      kind: "check",
      id: "m3-l9-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a bullish engulfing candle is a bullish candle whose body completely covers the prior candle's body.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback: "True — that's exactly this lesson's definition of a bullish engulfing candle.",
      incorrectFeedback: "Re-read the Engulfing candle section: a bullish engulfing candle's body covers the prior (bearish) candle's body entirely.",
    },
  ],

  confluence: [
    {
      kind: "check",
      id: "m3-l10-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "This lesson's own example lines up four observations on EUR/USD: an established uptrend, a pullback to a known support zone, that zone sitting near the 61.8% Fibonacci level, and a bullish engulfing candle at that zone.",
      prompt: "What does this confluence actually establish, per the lesson?",
      options: [
        { key: "A", text: "The trade is now guaranteed to work" },
        { key: "B", text: "The interpretation is more coherent and worth paying attention to, but still not certain" },
        { key: "C", text: "No further risk management is needed since the setup is confirmed" },
        { key: "D", text: "The four observations are really just one piece of information repeated four times" },
      ],
      correctKey: "B",
      correctFeedback: "Right — the lesson is explicit that even four aligned observations don't make the outcome certain; confluence makes an interpretation more coherent, never guaranteed.",
      incorrectFeedback: "Re-read the bolded section: \"More confluence does NOT mean certainty.\" It strengthens an interpretation without making any outcome guaranteed.",
    },
    {
      kind: "reveal",
      id: "m3-l10-r1",
      label: "Think About It",
      prompt:
        "This lesson notes that a Fibonacci level and a support zone drawn on the same price range are \"naturally correlated rather than truly independent.\" Why does that matter when counting up confluence factors?",
      revealLabel: "Reveal explanation",
      explanation:
        "Because correlated tools aren't really separate, independent evidence — they're reflecting the same underlying price action. Piling up related tools can look like stronger confluence than it actually is.",
    },
  ],

  "indicator-limitations": [
    {
      kind: "check",
      id: "m3-l11-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, when RSI suggests one thing and MACD suggests another at the same time, what does this most likely reflect?",
      options: [
        { key: "A", text: "A malfunction in one of the two indicators" },
        { key: "B", text: "Real uncertainty in the market itself" },
        { key: "C", text: "That MACD is always the more reliable of the two" },
        { key: "D", text: "That the chart's timeframe must be wrong" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, disagreement between tools isn't a malfunction; it reflects real uncertainty in the market itself.",
      incorrectFeedback: "Re-read \"They can disagree with each other\": disagreement between indicators is described as normal, reflecting genuine market uncertainty, not a broken tool.",
    },
  ],

  "avoiding-indicator-overload": [
    {
      kind: "check",
      id: "m3-l12-q1",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, adding more indicators to a chart generally adds more independent information and more clarity.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — most of these tools are correlated and built from similar underlying price data, so adding more often adds noise, not genuinely new information.",
      incorrectFeedback: "Re-read \"Why it backfires\": a chart with many indicators usually produces visual noise, not independent opinions.",
    },
    {
      kind: "reveal",
      id: "m3-l12-r1",
      label: "Think About It",
      prompt: "This lesson says a chart with eight indicators active at once usually doesn't produce eight independent opinions. What does it produce instead?",
      revealLabel: "Reveal explanation",
      explanation:
        "Visual noise that makes it harder, not easier, to see what price is actually doing — to the point the candles themselves can become hard to see at all.",
    },
  ],

  "a-practical-technical-analysis-workflow": [
    {
      kind: "check",
      id: "m3-l13-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson's workflow, what should you establish first — before checking momentum or looking for confluence?",
      options: [
        { key: "A", text: "The RSI reading" },
        { key: "B", text: "The trend and key support/resistance levels, per Module 2" },
        { key: "C", text: "A Fibonacci retracement level" },
        { key: "D", text: "Whether the setup shows confluence" },
      ],
      correctKey: "B",
      correctFeedback: "Right — Step 1 is establishing context: the trend and key levels already in play, before layering on momentum or confluence.",
      incorrectFeedback: "Re-check the workflow's numbered steps: context (trend and levels) comes first, momentum second, confluence third.",
    },
    {
      kind: "check",
      id: "m3-l13-q2",
      type: "mc",
      label: "Scenario",
      scenario:
        "Following this lesson's worked example: GBP/USD is in a clear uptrend, RSI reads 68, and price has pulled back to a support zone that also lines up with the 50% Fibonacci level, with a doji at that zone.",
      prompt: "Per this lesson, what's the appropriate final step after gathering this evidence?",
      options: [
        { key: "A", text: "Enter a trade immediately, since every step lined up" },
        { key: "B", text: "Form an interpretation held with appropriate uncertainty, not a guaranteed prediction" },
        { key: "C", text: "Ignore RSI entirely since it didn't cross above 70" },
        { key: "D", text: "Conclude the uptrend is now confirmed to continue with certainty" },
      ],
      correctKey: "B",
      correctFeedback:
        "Right — per the lesson, this is \"not a signal to act on blindly, and not a guarantee\"; the workflow ends in an interpretation, never a certainty.",
      incorrectFeedback: "Re-read Step 4 and the \"Why does it matter?\" section: the workflow deliberately ends in an interpretation held with uncertainty, not a trading decision.",
    },
  ],
};
