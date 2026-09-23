import type { Interaction } from "./types";

// Module 9 — Backtesting & Trading Journal. Batch 3 of the interactive-
// course expansion (Modules 8–10, the final batch), authored against the
// same standard as Module 1 (pilot) and Modules 2–8 (Batches 1 and 2) —
// see those files' own header comments for the full methodology.
//
// Grounding: every prompt, scenario, correct answer, and feedback line
// below is traced to a specific sentence, formula, or worked example in
// this module's own content/course/modules/module-09-backtesting-trading-
// journal/01-content.md. Per the user's Module 9 guidance, interactions
// favor identifying valid/invalid backtesting practices (L2, L4, L10),
// selecting what should be recorded (L5, L11), interpreting backtest
// observations (L6–L8), deciding whether a sample is useful (L9),
// journal-entry/pattern analysis (L11–L12), separating evidence from
// assumptions (L1, L9, L13), and scenario-based review of hypothetical
// trades/data (L4's look-ahead example, L9's 6-trade example, L12's
// 5-trade week, L13's Setup A/B comparison) reused directly from the
// lesson's own worked examples.
//
// Calculation-heavy lessons (Recording Backtest Results, Win Rate/Average
// Win/Average Loss, Expectancy and Profit Factor, Drawdown) get real,
// independently verified calculations, several using fresh-but-consistent
// numbers to test genuine application rather than recall of the lesson's
// own figures:
//   L5: $50 planned risk, $150 profit -> $150 / $50 = +3R
//   L6: 10 trades, 4 winners -> win rate 4/10 = 40%; those 4 winners total
//       $200 gross profit -> average win = $200/4 = $50
//   L7: win rate 60%, avg win $30, loss rate 40%, avg loss $25 ->
//       (0.60*30) - (0.40*25) = 18 - 10 = +$8 expectancy;
//       gross profit $400, gross loss $250 -> profit factor 400/250 = 1.6
//   L8: equity curve peak +3.0R, trough -1.0R -> drawdown = 3.0 - (-1.0)
//       = 4.0R
//   L12: reuses the lesson's own 5-trade week (+2R,-1R,-1R,+1R,-1R) ->
//        2 winners / 5 trades = 40% win rate
// No calculation here treats a backtest or journal result as a guarantee
// of future performance — every interaction's feedback stays consistent
// with the module's own repeated point that backtesting produces evidence,
// not proof.
//
// Interaction count: 2 per lesson for most of the 15 lessons; the three
// calculation- or concept-dense lessons (Win Rate/Avg Win/Avg Loss,
// Expectancy and Profit Factor, and the 9-item Biases and Errors lesson)
// get 3 each, since each genuinely covers several distinct, separately
// testable formulas or concepts — the same reasoning Module 3's
// indicator-calculation lessons used in Batch 1. Total: 33 interactions.
export const module09Interactions: Record<string, Interaction[]> = {
  "what-is-backtesting": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l1-q1",
      prompt: "What does a positive backtest actually tell you, per this lesson?",
      options: [
        { key: "a", text: "That the strategy is proven to be profitable going forward" },
        { key: "b", text: "That it's evidence worth testing further, not proof of future results" },
        { key: "c", text: "That live trading will produce the same results" },
        { key: "d", text: "Nothing useful — backtests can't be trusted at all" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is direct: a backtest replaces \"I think this setup works\" with evidence about what it actually did historically, but that's not the same as a guarantee about the future.",
      incorrectFeedback:
        "The lesson's own framing: a positive backtest is evidence worth testing further — it is not proof a strategy \"works,\" and it's not a guarantee of future performance.",
    },
    {
      kind: "reveal",
      id: "m9-l1-r1",
      label: "Think about it",
      prompt:
        "If backtesting can't prove a strategy is profitable, what is it actually good for, per this lesson?",
      revealLabel: "What the lesson says",
      explanation:
        "Backtesting is genuinely good for finding out early, at no financial cost, whether a set of rules is even reasonably defined, roughly how often it would have produced a valid setup, and roughly what its win rate, average win/loss, and expectancy would have looked like historically. That's enough to decide whether an idea is worth forward testing, worth reworking, or worth dropping — before any real capital is at risk.",
    },
  ],

  "preparing-a-strategy-for-testing": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l2-q1",
      prompt: "Which of these rules is specific enough to actually backtest consistently?",
      options: [
        { key: "a", text: "\"Enter when the trend looks strong and there's a good pullback.\"" },
        {
          key: "b",
          text: "\"Enter when price is above the 50-period moving average on the 4-hour chart, pulls back to touch the 20-period moving average, and forms a bullish engulfing candle on the 1-hour chart.\"",
        },
        { key: "c", text: "\"Enter when it feels like the right moment.\"" },
        { key: "d", text: "\"Enter when confidence in the setup is high.\"" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own \"testable\" version: it can be checked, candle by candle, by anyone looking at the same chart, unlike the vague alternatives.",
      incorrectFeedback:
        "The lesson's testable example is the moving-average/engulfing-candle version — specific enough that two different people applying it to the same chart would reach the same conclusion. The others depend entirely on the reader's own judgment.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l2-q2",
      prompt:
        "True or false: a vague rule mainly makes a trading plan harder to follow live, but doesn't actually affect a backtest's reliability.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that a vague rule makes the backtest itself unreliable too, because the person running it is unconsciously free to interpret each setup however makes the results look best.",
      incorrectFeedback:
        "Actually false. The lesson states that a vague rule doesn't just make a plan harder to follow live — it makes the backtest itself unreliable, since it leaves room for unconscious, results-favoring interpretation.",
    },
  ],

  "choosing-historical-data": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l3-q1",
      scenario:
        "A trader backtests a trend-following strategy using only six weeks of data, all from one strong, clean uptrend.",
      prompt: "Per this lesson, what's the problem with this test?",
      options: [
        { key: "a", text: "Nothing — six weeks of data is always sufficient" },
        {
          key: "b",
          text: "The strategy has only been tested in one kind of market condition, not in market conditions generally",
        },
        { key: "c", text: "Six weeks is too much data to be useful" },
        { key: "d", text: "The data source used doesn't matter for this kind of test" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own point: a strategy tested only against one especially favorable period has only been tested in one kind of market, not market conditions generally.",
      incorrectFeedback:
        "The lesson's actual concern: testing only against one favorable stretch (like a single clean uptrend) only reveals how the strategy performs in that one kind of market, not more broadly.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l3-q2",
      prompt:
        "True or false: for a beginner, manual backtesting on 1-hour, 4-hour, or daily charts is usually easier to run cleanly than on very short intraday timeframes.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — the lesson notes that lower timeframes usually need more historical data to cover a meaningful number of setups, and small data-quality issues are more likely to matter there.",
      incorrectFeedback:
        "Actually true. The lesson states that a beginner's first backtest is usually easier to run cleanly on 1-hour, 4-hour, or daily charts than on very short intraday timeframes.",
    },
  ],

  "manual-backtesting-step-by-step": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l4-q1",
      scenario:
        "A trader scrolls a chart forward, sees that price rallied sharply after a certain candle, and then goes back to mark a \"buy setup\" at that candle — because they already know, from having seen the outcome, that it worked.",
      prompt: "What is this an example of, per this lesson?",
      options: [
        { key: "a", text: "Selection bias" },
        { key: "b", text: "Look-ahead bias" },
        { key: "c", text: "Survivorship bias" },
        { key: "d", text: "Overfitting" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own worked example of look-ahead bias: using information (the outcome) that wouldn't actually have been available at the moment the decision was being made.",
      incorrectFeedback:
        "This is look-ahead bias — the lesson's own example. In real time, at that candle, the outcome wasn't yet known; marking the setup because the outcome is already visible produces a result unrelated to how the strategy performs live.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l4-q2",
      prompt: "What is the core defense against look-ahead bias during manual backtesting, per this lesson?",
      options: [
        { key: "a", text: "Testing with a larger simulated account size" },
        {
          key: "b",
          text: "Moving forward one candle at a time and refusing to scroll ahead before a setup decision is made",
        },
        { key: "c", text: "Only recording the trades that ended up winning" },
        { key: "d", text: "Using the highest timeframe available" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson names this discipline directly, along with bar-replay tools that enforce it by revealing price one bar at a time.",
      incorrectFeedback:
        "The lesson's stated core defense is moving forward one candle at a time and refusing to scroll ahead before deciding whether a setup is present — some traders use bar-replay tools specifically to enforce this.",
    },
  ],

  "recording-backtest-results": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l5-q1",
      label: "Calculation",
      scenario: "A trade's planned risk is $50. The trade closes for a $150 profit.",
      prompt: "What is this trade's result, expressed in R?",
      options: [
        { key: "a", text: "+1R" },
        { key: "b", text: "+2R" },
        { key: "c", text: "+3R" },
        { key: "d", text: "+5R" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — R is a multiple of planned risk: $150 ÷ $50 = 3, so this trade is +3R, the same kind of calculation as the lesson's own $20-risk worked examples.",
      incorrectFeedback:
        "R is the result expressed as a multiple of planned risk: $150 profit ÷ $50 planned risk = 3, so this trade is +3R.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l5-q2",
      prompt:
        "Beyond a simple \"win\" or \"loss,\" what does this lesson's Backtesting Log require recording for each trade?",
      options: [
        {
          key: "a",
          text: "The result as an R-multiple, plus the actual entry, stop, and exit price levels",
        },
        { key: "b", text: "Only whether the trader felt confident about the trade" },
        { key: "c", text: "The trader's total account balance history" },
        { key: "d", text: "Nothing else — win/loss alone is sufficient" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the log's required fields include the R-multiple result plus entry, stop, and exit levels, which is exactly what makes Lessons 6 and 7's calculations possible.",
      incorrectFeedback:
        "The lesson is explicit: recording only \"win\" or \"loss\" throws away the information — the R-multiple and actual price levels — needed to calculate average win/loss, expectancy, and profit factor accurately later.",
    },
  ],

  "win-rate-average-win-and-average-loss": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l6-q1",
      label: "Calculation",
      scenario: "A 10-trade backtest produces 4 winning trades and 6 losing trades.",
      prompt: "What is the win rate?",
      options: [
        { key: "a", text: "40%" },
        { key: "b", text: "60%" },
        { key: "c", text: "46%" },
        { key: "d", text: "4%" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct: Win Rate = (Number of Winning Trades ÷ Total Trades) × 100 = (4 ÷ 10) × 100 = 40%, the same formula as the lesson's own 20-trade, 45% example.",
      incorrectFeedback:
        "Apply the formula: Win Rate = (Winning Trades ÷ Total Trades) × 100 = (4 ÷ 10) × 100 = 40%.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l6-q2",
      label: "Calculation",
      scenario: "In that same 10-trade backtest, the 4 winning trades total $200 in gross profit.",
      prompt: "What is the average win?",
      options: [
        { key: "a", text: "$50" },
        { key: "b", text: "$200" },
        { key: "c", text: "$40" },
        { key: "d", text: "$800" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct: Average Win = Total Profit from Winning Trades ÷ Number of Winning Trades = $200 ÷ 4 = $50.",
      incorrectFeedback:
        "Apply the formula: Average Win = Total Profit from Winning Trades ÷ Number of Winning Trades = $200 ÷ 4 = $50.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l6-q3",
      prompt: "True or false: a strategy with a win rate under 50% can still be profitable overall.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — the lesson's own 20-trade example has a 45.0% win rate and still produces a positive result, because average win and average loss matter just as much as win rate.",
      incorrectFeedback:
        "Actually true. The lesson's own example shows a 45.0% win rate strategy producing a positive result overall — win rate alone says nothing about profitability without also knowing average win and average loss.",
    },
  ],

  "expectancy-and-profit-factor": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l7-q1",
      label: "Calculation",
      scenario:
        "A strategy's backtested stats: win rate 60%, average win $30, loss rate 40%, average loss $25.",
      prompt: "What is this strategy's expectancy per trade?",
      options: [
        { key: "a", text: "+$8.00 per trade" },
        { key: "b", text: "+$5.00 per trade" },
        { key: "c", text: "−$8.00 per trade" },
        { key: "d", text: "+$18.00 per trade" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct: (0.60 × $30) − (0.40 × $25) = $18 − $10 = +$8.00 per trade, the same formula as the lesson's own worked example.",
      incorrectFeedback:
        "Apply the formula: Expectancy = (Win Rate × Average Win) − (Loss Rate × Average Loss) = (0.60 × $30) − (0.40 × $25) = $18 − $10 = +$8.00 per trade.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l7-q2",
      label: "Calculation",
      scenario: "A backtest's gross profit is $400 and its gross loss is $250.",
      prompt: "What is the profit factor?",
      options: [
        { key: "a", text: "1.6" },
        { key: "b", text: "0.625" },
        { key: "c", text: "1.5" },
        { key: "d", text: "4.0" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct: Profit Factor = Gross Profit ÷ Gross Loss = $400 ÷ $250 = 1.6 — above 1.0, meaning gross profit exceeded gross loss.",
      incorrectFeedback:
        "Apply the formula: Profit Factor = Gross Profit ÷ Gross Loss = $400 ÷ $250 = 1.6.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l7-q3",
      prompt: "True or false: a high win rate always means positive expectancy.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson's cautionary example: a 70% win rate with a $15 average win and a $40 average loss produces an expectancy of −$1.50 per trade, and a profit factor of 0.88 — a losing result despite the high win rate.",
      incorrectFeedback:
        "Actually false. The lesson's own cautionary example shows a 70% win rate with negative expectancy (−$1.50 per trade), because the average loser was far larger than the average winner.",
    },
  ],

  "drawdown-and-losing-streaks-in-a-backtest": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l8-q1",
      label: "Calculation",
      scenario:
        "A backtest's equity curve reaches a peak of +3.0R, then declines to a low of −1.0R before recovering.",
      prompt: "What is the size of this drawdown, in R?",
      options: [
        { key: "a", text: "1.0R" },
        { key: "b", text: "2.0R" },
        { key: "c", text: "4.0R" },
        { key: "d", text: "3.0R" },
      ],
      correctKey: "c",
      correctFeedback:
        "Correct — drawdown is measured from the peak to the trough: +3.0R down to −1.0R is a decline of 4.0R, the same way the lesson measures its own +1.0R-to−3.5R example as a 4.5R drawdown.",
      incorrectFeedback:
        "Drawdown is the decline from peak to trough: +3.0R down to −1.0R is a decline of 3.0 − (−1.0) = 4.0R.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l8-q2",
      prompt:
        "True or false: two strategies with the same final backtest total but different equity-curve paths are equally easy to actually trade.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that a strategy with the same overall result but a long, deep losing streak partway through is a very different thing to actually trade than one with a smoother path.",
      incorrectFeedback:
        "Actually false. The lesson's point: reviewing the equity curve, not just the final number, reveals that a strategy with a long, deep drawdown along the way is much harder to actually sit through than one with a smoother path to the same total.",
    },
  ],

  "sample-size-and-statistical-caution": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l9-q1",
      scenario: "A strategy tested across only 6 trades produces 5 wins and 1 loss — an 83% win rate.",
      prompt: "Per this lesson, what should a trader conclude from this result?",
      options: [
        { key: "a", text: "The strategy is proven reliable and ready for live trading" },
        {
          key: "b",
          text: "This is a starting signal worth investigating further, not a statistically meaningful conclusion — a single different outcome would have swung the win rate dramatically",
        },
        { key: "c", text: "The strategy should go straight to live trading with real money" },
        { key: "d", text: "The result should be discarded and ignored entirely" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own illustration: with only 6 trades, one different outcome would swing the win rate by 17 percentage points, so the result is a starting signal, not a proven conclusion.",
      incorrectFeedback:
        "The lesson's own analysis of this exact example: with only 6 trades, a single different outcome would have changed the win rate dramatically — this is a starting signal worth investigating, not a statistically meaningful result.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l9-q2",
      prompt:
        "True or false: this course specifies an exact number of trades (such as 30 or 100) that makes any backtest provably reliable.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson explicitly declines to name a specific number, calling any such claim \"a false precision this module isn't willing to make.\"",
      incorrectFeedback:
        "Actually false. The lesson explicitly does not claim a specific trade count makes any strategy provably reliable — how many trades are needed depends on the strategy's own setup frequency, win rate, and result variability.",
    },
  ],

  "avoiding-backtesting-biases-and-errors": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l10-q1",
      scenario:
        "A trader backtests only the setups that \"look clean\" in hindsight, unconsciously skipping the messier ones the written rules also actually produced.",
      prompt: "Which error is this, per this lesson?",
      options: [
        { key: "a", text: "Look-ahead bias" },
        { key: "b", text: "Selection bias" },
        { key: "c", text: "Survivorship bias" },
        { key: "d", text: "Overfitting" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — selection bias means choosing which setups to include based on how they turned out, testing a hand-picked subset rather than the strategy as actually defined.",
      incorrectFeedback:
        "This is selection bias: choosing which setups to include in the backtest based on how they turned out, rather than logging every instance the written rules actually produced.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l10-q2",
      scenario:
        "A trader tweaks an indicator setting repeatedly, each time checking whether it improves the same backtest, until the rules fit that one stretch of historical data extremely well.",
      prompt: "Which error is this, per this lesson?",
      options: [
        { key: "a", text: "Cherry-picking" },
        { key: "b", text: "Overfitting (curve-fitting)" },
        { key: "c", text: "Instrument-switching" },
        { key: "d", text: "Rule-changing mid-test" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — overfitting means adjusting rules repeatedly until they fit one specific stretch of data extremely well, which tends to fit that data's noise rather than a genuine, repeatable edge.",
      incorrectFeedback:
        "This is overfitting (curve-fitting): tuning a strategy's exact rules over and over to maximize one backtest's result, which tends to perform worse on new data it wasn't tuned against.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l10-q3",
      scenario:
        "After a run of losses on one currency pair, a trader tries the exact same rules on a different pair hoping for a better outcome — repeating this until one pair happens to show good results.",
      prompt: "Which error is this, per this lesson?",
      options: [
        { key: "a", text: "Survivorship bias" },
        { key: "b", text: "Instrument-switching" },
        { key: "c", text: "Selection bias" },
        { key: "d", text: "Look-ahead bias" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson names this instrument-switching specifically: a form of cherry-picking applied to instruments instead of time periods, where a \"good\" result is found by searching rather than genuine performance.",
      incorrectFeedback:
        "This is instrument-switching — moving to a different pair as soon as one underperforms, without a specific reason connected to the strategy's own logic, until one pair happens to look good.",
    },
  ],

  "building-a-trading-journal": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l11-q1",
      prompt:
        "Per this lesson, why does recording only outcomes (\"+$40,\" \"−$20\") fall short of a useful trading journal?",
      options: [
        { key: "a", text: "Outcomes take too long to write down" },
        {
          key: "b",
          text: "It can't distinguish a well-executed trade that happened to lose from a poorly-executed trade that happened to win",
        },
        { key: "c", text: "Outcomes should never be recorded at all" },
        { key: "d", text: "It requires specialized journaling software" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit that recording facts and decisions, not just outcomes, is what makes the review process in Lessons 12–13 possible at all.",
      incorrectFeedback:
        "The lesson's point: a journal recording only outcomes shows what happened but not why — it can't tell a well-executed loss apart from a poorly-executed win. Recording the before/during/after details is what enables real review.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l11-q2",
      prompt:
        "True or false: a complete trading journal only needs to record trades that felt significant or worth writing about.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson's own beginner mistake warns against this exact pattern: journaling only winning trades, or only trades that feel worth writing about, produces a distorted, overly flattering picture.",
      incorrectFeedback:
        "Actually false. The lesson warns that journaling only some trades — winning ones, or ones that feel notable — produces a distorted, overly flattering picture of actual performance.",
    },
  ],

  "reviewing-your-journal": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l12-q1",
      label: "Calculation",
      scenario:
        "A trader's five-trade week produces results of +2R, −1R, −1R, +1R, −1R, at $20 risk per trade.",
      prompt: "What is this week's win rate?",
      options: [
        { key: "a", text: "40%" },
        { key: "b", text: "60%" },
        { key: "c", text: "20%" },
        { key: "d", text: "50%" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — 2 winning trades out of 5 total: (2 ÷ 5) × 100 = 40%, matching the lesson's own worked example, which also nets to a $0 breakeven week.",
      incorrectFeedback:
        "Win rate = winning trades ÷ total trades × 100. Here, 2 winners out of 5 trades: (2 ÷ 5) × 100 = 40%.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m9-l12-q2",
      prompt:
        "Per this lesson's Trade Review Framework, which of the following is the more useful conclusion to write down after reviewing several trades?",
      options: [
        { key: "a", text: "\"Be more careful next time.\"" },
        {
          key: "b",
          text: "\"Stop trading Setup B during the first 30 minutes after the session open, based on the last four trades.\"",
        },
        { key: "c", text: "\"This was a bad week overall.\"" },
        { key: "d", text: "\"I'll try harder going forward.\"" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson contrasts exactly this: a vague conclusion like \"be more careful\" isn't useful, while a specific one tied to evidence can actually be tested and applied.",
      incorrectFeedback:
        "The lesson's framework calls for a specific, written action — like the Setup B example — rather than a vague conclusion like \"be more careful,\" which can't actually be tested or applied.",
    },
  ],

  "finding-weaknesses-and-improving-the-process": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l13-q1",
      scenario:
        "A trader's monthly review shows that \"Setup B\" has a −$3 expectancy across the last 15 trades, while \"Setup A\" has a +$6 expectancy over the same period.",
      prompt: "Per this lesson's own example, what specific, evidence-based change does the trader make?",
      options: [
        { key: "a", text: "Abandon the entire trading plan and start over" },
        {
          key: "b",
          text: "Remove Setup B from the plan entirely, and continue journaling Setup A alone to see whether the plan's overall numbers improve",
        },
        { key: "c", text: "Increase the risk percentage used on Setup B to compensate" },
        { key: "d", text: "Stop journaling, since the evidence is already clear" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own worked example: one specific, evidence-based change (removing the underperforming setup), not abandoning the whole plan.",
      incorrectFeedback:
        "The lesson's own example: rather than abandoning the whole plan, the trader makes one specific change — removing Setup B — directly connected to what the evidence actually showed, and keeps testing.",
    },
    {
      kind: "reveal",
      id: "m9-l13-r1",
      label: "Think about it",
      prompt:
        "This lesson insists on testing only one change at a time, even though it takes longer. Why?",
      revealLabel: "What the lesson says",
      explanation:
        "Changing several rules at once and then retesting makes it impossible to know which specific change was responsible for any difference in results. A strategy's stop-loss method, entry trigger, and instrument list should each be tested as separate changes — the only way to know what actually caused an improvement, or a decline.",
    },
  ],

  "from-backtest-to-forward-test": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l14-q1",
      prompt: "What does forward testing check for that a backtest cannot, per this lesson?",
      options: [
        { key: "a", text: "Nothing new — it's simply the same test repeated" },
        {
          key: "b",
          text: "Whether the trader can actually identify and execute the setup correctly in real time, without the benefit of hindsight",
        },
        { key: "c", text: "A strategy's historical win rate over the tested period" },
        { key: "d", text: "The exact dollar amount of drawdown that will occur once trading live" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson lists this specifically: forward testing checks whether the setup can actually be identified and executed correctly live, and whether execution issues (like hesitation or fill difficulty) show up that a backtest wouldn't reveal.",
      incorrectFeedback:
        "The lesson's point: forward testing checks something a backtest cannot — whether the trader can actually identify and execute the setup correctly in real time, without already knowing what happens next.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l14-q2",
      prompt:
        "True or false: a strategy performing reasonably on a demo account is guaranteed to perform identically once real money is at risk.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson notes that Module 7 covers how differently a trader's psychology can respond once real money, rather than a demo balance, is on the line. Forward testing reduces risk; it doesn't eliminate it.",
      incorrectFeedback:
        "Actually false. The lesson is explicit that forward testing is not a guarantee that demo performance will carry over identically to real money — psychology responds differently once real capital is at risk.",
    },
  ],

  "building-your-complete-testing-journaling-system": [
    {
      kind: "check",
      type: "mc",
      id: "m9-l15-q1",
      prompt:
        "Per this lesson's ten-step Testing Workflow, what comes after logging every backtested trade with R-multiples but before moving to forward testing?",
      options: [
        {
          key: "a",
          text: "Calculate win rate, average win/loss, then expectancy and profit factor, review the equity curve, and check the Bias/Error Checklist",
        },
        { key: "b", text: "Go straight to live trading with real capital" },
        { key: "c", text: "Start journaling real trades before calculating any backtest statistics" },
        { key: "d", text: "Skip directly to the Monthly Review Template" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — steps 5 through 8 of the workflow: calculate the core statistics, review the equity curve for drawdown and streaks, and check the process against the Bias/Error Checklist, before the sample is judged ready for forward testing.",
      incorrectFeedback:
        "Per the ten-step workflow, after logging trades with R-multiples comes calculating win rate/average win/average loss, then expectancy and profit factor, reviewing the equity curve, and checking the Bias/Error Checklist — all before forward testing begins.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m9-l15-q2",
      prompt:
        "True or false: per this lesson, completing a first backtest and journal setup marks the finish line — no further testing or journaling is needed once live trading begins.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson's own beginner mistake warns against exactly this: treating a completed first backtest and journal template as the finish line, rather than the start of an ongoing process.",
      incorrectFeedback:
        "Actually false. The lesson is explicit that this entire process — test, record, measure, analyze, identify weaknesses, improve — repeats for as long as a strategy is traded; it doesn't end once live trading begins.",
    },
  ],
};
