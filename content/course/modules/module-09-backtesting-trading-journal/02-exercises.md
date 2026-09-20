---
module: 9
file: exercises
status: complete
last_updated: 2026-09-19
---

# Module 9 — Exercises

These exercises apply what you covered in `01-content.md`. Most of them
use fresh numbers, not the exact examples from the lessons, so you're
applying the process yourself, not recalling a result. A calculator is
genuinely useful for several of these. Work through them in order.
Answers aren't provided here on purpose (as with prior modules) — this is
practice, not another quiz; the knowledge checkpoint in `03-quiz.md` is
where your understanding gets checked, with its own answer key.

## Exercise 1 — Rewriting a vague rule as testable

A trader's written setup rule says: *"Enter when momentum picks up and
the pair is due for a move."*

1. Per Lesson 2, explain specifically why this rule cannot be backtested
   consistently.
2. Rewrite it as a specific, observable rule that two different people
   could apply to the same chart and reach the same decision.

## Exercise 2 — Designing a backtest

You want to backtest a swing-trading setup on one currency pair.

1. Per Lesson 3, describe what kind of historical data period you would
   choose, and explain specifically why you would include more than one
   type of market condition rather than testing only a strong trending
   stretch.
2. List the six items from Lesson 2 that your rules need to specify
   before testing begins.

## Exercise 3 — Fill the Backtesting Log

A trader backtests Setup A with a fixed planned risk of $30 per trade
(so 1R = $30). Four trades occur:

- **Trade 1:** the full stop-loss is hit.
- **Trade 2:** the trade reaches a target at 2.5 times the planned risk
  distance.
- **Trade 3:** the trade is exited early, at half of the planned loss
  distance.
- **Trade 4:** the trade reaches a target at 3 times the planned risk
  distance.

1. Record each trade's result as an R-multiple.
2. Convert each result to dollars.
3. Calculate the total R and total dollar result across all four trades.

## Exercise 4 — Win rate, average win, average loss

A 15-trade backtest, with $25 planned risk per trade (1R = $25), produces
these results, in R:

+1.0, −1.0, +2.0, −1.0, −1.0, +1.0, −1.0, +3.0, −1.0, +1.5, −1.0, +2.0,
−1.0, −1.0, −1.0

1. Count the winning and losing trades, and calculate the win rate.
2. Calculate the gross profit and gross loss, in dollars.
3. Calculate the average win and average loss, in dollars.

## Exercise 5 — Expectancy and profit factor

Using your answers from Exercise 4:

1. Calculate this strategy's expectancy per trade, in dollars, using
   Lesson 7's formula.
2. Calculate the profit factor.
3. Confirm your expectancy figure by dividing the total dollar result
   from Exercise 4 by the number of trades — the two numbers should
   match. If they don't, recheck your work.

## Exercise 6 — Reading an equity curve

A 10-trade backtest, with $25 planned risk per trade, produces these
results in order, in R:

+1, +1, −1, −1, −1, −1, +2, −1, +1, +1

1. Build the running equity curve (the cumulative R total after each
   trade).
2. Identify the peak and the trough that together produce this
   backtest's largest drawdown, and calculate that drawdown in R and in
   dollars.
3. Identify the longest losing streak in this sequence.

## Exercise 7 — Small sample, high win rate

A trader backtests a new idea across only 8 trades, with $15 planned risk
per trade, and gets these results, in R:

+1.0, +0.7, +1.0, +0.5, +1.3, +0.8, −1.0, −1.0

1. Calculate the win rate, average win, average loss, expectancy, and
   profit factor.
2. Per Lesson 9, explain why this result — however good it looks — is
   not yet strong evidence that the strategy has a genuine long-run edge.
   Be specific about what a small sample like this can and can't tell
   you.

## Exercise 8 — Identify the bias or error

For each short scenario, name which of Lesson 10's nine biases or errors
it describes, and explain in one sentence why:

1. A trader backtests a strategy only on the three currency pairs that
   are currently the most talked-about online, without checking how the
   same rules would have performed on pairs that fell out of popularity.
2. A trader adjusts a moving-average setting fourteen times until the
   backtest's results look as strong as possible on one specific chart.
3. A trader calculates backtested results using only the exact chart
   price at entry and exit, with no allowance for the spread the broker
   actually charges.
4. A trader runs the same rules on five different pairs, one after
   another, and keeps only the pair that happened to produce the best
   result.
5. A trader lowers the position size mid-backtest, right after a losing
   trade, then keeps testing as if this had been the plan from the
   start.

## Exercise 9 — Build a journal entry

Using Lesson 11's Trading Journal Template, write a complete before/
during/after journal entry for a hypothetical trade of your own choosing
(you can invent realistic details). Include at least one specific,
concrete note in the "after" section — not a general comment like "went
fine."

## Exercise 10 — Weekly review

A trader's week produces six trades, with $20 planned risk per trade,
in R: +1, −1, +2, −1, −1, +1.

1. Calculate this week's win rate, gross profit, gross loss, average
   win, average loss, and net dollar result.
2. Using Lesson 12's Weekly Review Template, write one sentence noting
   any pattern you'd want to watch for if this same result repeated
   over the following two weeks.

## Exercise 11 — Monthly comparison

Two months of results, $20 planned risk per trade, 10 trades each month:

**Month 1** (in R): +1, −1, +1, −1, −1, +2, −1, +1, −1, −1
**Month 2** (in R): +1, +1, −1, +1, −1, +1, +1, −1, +1, −1

1. Calculate the win rate, expectancy, and profit factor for each month
   separately.
2. Per Lesson 12's Monthly Review Template, which month would you flag
   for closer review, and what specifically would you want to check
   first?

## Exercise 12 — Strategy versus execution

A trader's backtest for Setup C shows a clearly positive expectancy over
40 trades. Three months into forward testing it live on demo, their
actual journal shows the plan's entry rule was followed exactly on only
11 of 30 real trades — the rest were entered early, "because it looked
like it was about to move."

1. Per Lesson 12's Trade Review Framework, which of the four questions
   applies most directly here?
2. Explain why this trader's real, disappointing results so far don't
   necessarily mean Setup C itself has a poor edge.

## Exercise 13 — One change at a time

A trader's monthly review shows disappointing results. In response, they
change their stop-loss method, add a second setup, and switch to a new
currency pair, all in the same week, then start a new backtest.

1. Per Lesson 13, what specifically is wrong with this approach?
2. Rewrite this as a correct application of the Change → Retest →
   Compare → Decide cycle, choosing just one of the three changes to test
   first.

## Exercise 14 — Ready to forward test?

A trader has backtested a strategy across 85 trades, spanning both a
trending period and a choppier, range-bound period. The backtest shows a
45% win rate, a profit factor of 1.4, and a largest drawdown of 6R. They
have not yet traded the strategy in real time at all.

1. Per Lesson 14, is this trader ready to move to forward testing on
   demo? Explain what specifically supports your answer.
2. Is this trader ready to move straight to live trading with real
   money, skipping forward testing? Explain why or why not.

## Exercise 15 — Your personal testing workflow

Using Lesson 15's ten-step workflow, write out how you would apply it to
your own trading plan from Module 8 — naming your specific setup(s),
your planned data source and period, and how often you intend to run
your weekly and monthly reviews once you begin forward testing.
