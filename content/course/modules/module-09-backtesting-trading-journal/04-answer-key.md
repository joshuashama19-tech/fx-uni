---
module: 9
file: answer-key
status: complete
last_updated: 2026-09-19
---

# Module 9 — Answer Key

Kept in a separate file from `03-quiz.md` on purpose, so the quiz can be
worked through honestly before checking. Question numbers match exactly.

**1. Answer: B) Applying a specific, written set of trading rules to
historical price data to see what results those rules would have
produced.** Backtesting doesn't guarantee future profitability (ruling
out A), doesn't eliminate uncertainty (ruling out C), and doesn't replace
forward testing on demo (ruling out D) (Lesson 1).

**2. Answer: False.** Per Lesson 1, a positive backtest is evidence worth
testing further, not proof of future performance — market conditions
change, and past results don't guarantee future results (Lesson 1).

**3. Answer guide.** Look-ahead bias is using information in a backtest
that would not actually have been available at the moment a trade
decision was being made — most commonly, letting knowledge of what price
does after a candle influence whether that candle is marked as a valid
setup (Lesson 4).

**4. Answer: This is look-ahead bias.** Marking a setup only because its
outcome is already visible has nothing to do with how the strategy would
perform in real time, where that outcome is never known in advance — it
silently inflates the results in a way that makes them meaningless as
evidence about how the strategy actually performs (Lesson 4).

**5. Answer: −$60.** $40 × (−1.5) = −$60 (Lesson 5).

**6. Answer: 45.8%.** (11 ÷ 24) × 100 = 45.8333...%, rounded to 45.8%
(Lesson 6).

**7. Answer: $6.00 per trade.** Expectancy = (0.50 × $30) − (0.50 × $18)
= $15.00 − $9.00 = $6.00 (Lesson 7).

**8. Answer: 1.50.** Profit Factor = $450 ÷ $300 = 1.50 (Lesson 7).

**9. Answer: B) Finding the largest decline from a peak in the running
equity curve down to the lowest point reached before a new peak is set.**
Drawdown is read from the path the equity curve takes, not from the
starting balance alone (A), an average of losses (C), or a simple loss
count (D) (Lesson 8).

**10. Answer: 4.** The sequence contains a losing run of loss, loss,
loss, loss (positions 9–12), which is longer than the two earlier losing
runs of three and two (Lesson 8).

**11. Answer: False.** Per Lesson 9, this course does not claim any
specific trade count makes a backtest statistically proven — how much
evidence is needed depends on the strategy, and confidence should build
gradually with a larger, more varied sample, not from any single "magic
number" (Lesson 9).

**12. Answer guide.** Any three of: look-ahead bias, selection bias,
survivorship bias, overfitting (curve-fitting), rule-changing mid-test,
ignoring spread/commission/slippage, cherry-picking, testing only in a
favorable period, instrument-switching (Lesson 10).

**13. Answer: Instrument-switching (a form of cherry-picking applied to
instruments).** Searching across multiple pairs and keeping only the
best-looking result doesn't test the strategy's genuine performance — it
finds whichever pair happened to look best, which says very little about
what to expect going forward (Lesson 10).

**14. Answer: B) Whether the plan was followed exactly as written, and
any adjustments made along with their stated reason.** The final dollar
result (A) belongs in the "after" section, not "during"; spread (C) and
account balance (D) aren't part of this template at all (Lesson 11).

**15. Answer guide.** A journal's value comes from noticing patterns and
making deliberate decisions based on them — recording entries without
ever stepping back to review them weekly or monthly means the information
just accumulates without ever being turned into an actual conclusion or
change (Lesson 12).

**16. Answer: False.** Per Lesson 13, changing several rules at once
makes it impossible to know which specific change caused any difference
in results — the correct approach is one change at a time, followed by
retesting and comparison (Lesson 13).

**17. Answer: This trader should move to forward testing on a demo
account next, journaling every trade the same way as in live conditions,
before considering live trading.** A backtest across a large, varied
sample with positive expectancy and manageable drawdown is a reasonable
candidate for the next stage of evidence — real-time execution — but it
has not yet been tested in real time at all, which is exactly what
forward testing checks for (Lesson 14).

**18. Answer: False.** Per Lesson 15, this module builds the process of
testing and tracking honestly — it does not certify any specific strategy
as proven, and completing a first backtest and journal setup is the start
of an ongoing process, not a finish line (Lesson 15).

---

**Scoring guide:** this checkpoint isn't pass/fail — it's a signal. If
you missed one or two questions, re-read the specific lesson referenced
next to that answer before continuing. If you missed several, it's worth
re-reading `01-content.md` in full before starting Module 10 — Module 9's
process is what makes the rest of your trading development honest and
evidence-based, rather than guesswork.
