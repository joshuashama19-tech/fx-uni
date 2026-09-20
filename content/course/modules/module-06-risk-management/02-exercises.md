---
module: 6
file: exercises
status: complete
last_updated: 2026-09-19
---

# Module 6 — Exercises

These exercises apply what you covered in `01-content.md`. They use new
numbers, not the exact examples from the lessons, so you're applying the
formulas, not recalling a result. Work through them in order — a
calculator is genuinely useful here. Answers aren't provided here on
purpose (as with Modules 1–5): this is practice, not another quiz.

## Exercise 1 — Maximum dollar risk

Account balance = $1,500. Risk per trade = 1.5%.

1. Calculate the maximum dollar amount this trader is risking on the
   trade.
2. Per Lesson 2, is 1.5% "the" correct risk percentage, or one of many
   reasonable choices? Explain.

## Exercise 2 — Position sizing, calculation A

Account = $3,000. Risk = 1%. Stop loss = 30 pips. Pip value assumption =
$1 per pip (mini lot).

1. Calculate the dollar risk amount.
2. Calculate the position size, in mini lots, using Lesson 5's formula.

## Exercise 3 — Position sizing, calculation B

Account = $800. Risk = 2%. Stop loss = 20 pips. Pip value assumption = $1
per pip (mini lot).

1. Calculate the dollar risk amount.
2. Calculate the position size, in mini lots.

## Exercise 4 — Why pip value isn't universal

A trader assumes every pair uses the same pip value as EUR/USD, at every
position size, regardless of their account's funding currency.

1. Per Lesson 4, name at least three factors that actually determine pip
   value.
2. Why can this assumption lead to a miscalculated position size, even
   if the rest of the trader's math (risk amount, stop distance) is
   correct?

## Exercise 5 — Moving a stop loss

A trader has a $1,200 account, risks 1% per trade, and opens a position
with a 25-pip stop loss.

1. Calculate the original dollar risk.
2. The trader then moves the stop loss to 50 pips away — twice the
   original distance — without changing the position size, specifically
   to avoid being stopped out. Calculate the new dollar risk, and express
   it as a percentage of the account.
3. Per Lesson 3, has this trader's risk actually changed, even though
   they never explicitly decided to accept a new risk percentage?

## Exercise 6 — Risk-to-reward calculation

A trader risks $30 on a trade and sets a target that would produce a $90
gain if reached.

1. Calculate the risk-to-reward ratio.
2. Per Lesson 6, does this ratio guarantee the trade will be profitable?
   Explain.

## Exercise 7 — Breakeven win rate

A trader consistently uses a 1:4 risk-to-reward ratio.

1. Using Lesson 6's formula, calculate the breakeven win rate for this
   ratio.
2. If this trader's actual win rate is 30%, are they above or below
   their breakeven point? What does that suggest, on its own, about
   whether their approach is profitable — and what would you still need
   to know to be sure (per Lesson 7)?

## Exercise 8 — Expectancy calculation A

Win rate = 45%. Average win = $40. Loss rate = 55%. Average loss = $30.

1. Calculate the expectancy per trade using Lesson 7's formula.
2. Is this a positive or negative expectancy? What does that number
   represent over a large sample of trades?

## Exercise 9 — Expectancy calculation B (a cautionary case)

Win rate = 80%. Average win = $10. Loss rate = 20%. Average loss = $50.

1. Calculate the expectancy per trade.
2. Per Lesson 7, does a high win rate by itself guarantee a positive
   expectancy? Use this specific result to explain your answer.

## Exercise 10 — Drawdown and recovery

An account experiences a 25% drawdown.

1. What percentage of the account balance remains?
2. Using Lesson 8's recovery formula, calculate the percentage gain
   required to fully recover back to the original balance.

## Exercise 11 — A losing streak under fixed percentage risk

A $1,500 account risks a fixed 2% per trade and suffers four consecutive
losing trades.

1. Calculate the account balance after each of the four losses (risk is
   recalculated from the current balance each time, per Lesson 9).
2. Calculate the total drawdown after all four losses, as a percentage of
   the original $1,500.
3. Calculate the percentage gain required to fully recover.

## Exercise 12 — Margin calculation

A trader opens a position of 50,000 units (0.5 standard lots) on a pair
trading at an exchange rate of 1.35000, using 1:200 leverage.

1. Calculate the notional value of the position.
2. Calculate the margin required to open it.

## Exercise 13 — Leverage vs. risk

A trader opens a position with a 20-pip stop loss, using a pip value of
$5 per pip.

1. Calculate the planned dollar risk on this trade.
2. If this trader switched from 1:100 leverage to 1:500 leverage without
   changing the position size or the stop-loss distance, would the
   planned dollar risk you just calculated change? Explain, using Lesson
   10.

## Exercise 14 — Spot the mistake

Each short scenario below contains one of the beginner mistakes covered
in this module. Identify the mistake and briefly explain what the trader
should have done differently.

1. "I picked 2 mini lots because that felt like a reasonable size, then
   checked afterward how much it actually risked."
2. "I lost three trades in a row, so I doubled my risk per trade on the
   next one to catch up faster."
3. "My platform showed I had plenty of free margin for this position, so
   I didn't bother calculating what it actually risked in dollars."
4. "I won 8 of my last 10 trades, so my strategy must have strong
   positive expectancy" (without knowing the average win or loss size).
5. "I moved my stop loss further away because I was confident the trade
   would still work out."

## Exercise 15 — Building your own risk rules

Using Lesson 12's template, write out a complete, specific set of
personal risk rules for a hypothetical trader with a $2,000 account, who
is new to live trading and wants to start conservatively. Fill in every
field from the template (maximum risk per trade, maximum daily loss,
maximum weekly loss, maximum simultaneous exposure, maximum consecutive
losses before review, stop-loss rule, position-sizing rule, conditions
under which trading stops, review schedule) with specific values and
explain, in one or two sentences per field, why you chose that value for
this particular trader's situation.

---

Once you've worked through all fifteen exercises, move on to
**`03-quiz.md`** for the module's knowledge checkpoint.
