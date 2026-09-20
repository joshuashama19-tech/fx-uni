---
module: 9
title: Backtesting & Trading Journal
subtitle: Testing your rules against evidence, and tracking your own progress honestly
status: complete
last_updated: 2026-09-19
---

# Module 9 — Backtesting & Trading Journal

## Module Introduction

Module 8 ended with a complete, written first-draft trading plan. A
written plan is a necessary step — but on its own, it's just a set of
ideas on paper. It hasn't been tested against anything yet, and nothing
in it has been proven to work. This module teaches you how to close that
gap: how to test a set of trading rules against historical evidence
(backtesting), and how to track your own real results going forward
(journaling), so that decisions about your plan are based on your own
data instead of guesses, hope, or how a handful of recent trades felt.

Every lesson in this module builds toward one repeatable process:

```
TEST → RECORD → MEASURE → ANALYZE → IDENTIFY WEAKNESSES → IMPROVE
```

You **test** a specific, written set of rules against historical data.
You **record** every trade the rules would have produced, honestly and
completely, in a structured log. You **measure** the results using a
small set of statistics — win rate, average win/loss, expectancy, profit
factor, drawdown. You **analyze** what those numbers actually show about
the rules being tested. You **identify weaknesses** — in the rules
themselves, or in how consistently they were followed. And you
**improve** the process based on what the evidence actually says, then
test again. This cycle never really ends; it's the same cycle a trader
runs, in a lighter form, on live results for as long as they trade.

This module is deliberately honest about what backtesting and journaling
can and cannot do. Backtesting cannot prove a strategy will be profitable
in the future — markets change, and past results are evidence, not a
guarantee. A positive backtest is a reason to test further, not a reason
to risk real money with confidence. A trading journal doesn't make
someone a disciplined trader by itself — it makes their own behavior
visible, which is the necessary first step toward improving it. Nothing
in this module claims otherwise, and nothing here promises that testing
a strategy carefully will make it profitable. What this module promises
is a structured, honest way to find out what's actually true about a set
of trading rules, and about how well they're actually being followed —
which is the only reliable foundation the rest of a trading career can be
built on.

## Learning Objectives

By the end of this module, you will be able to:

- Explain what backtesting is, what it can tell you, and what it cannot
  prove.
- Prepare a set of trading rules so they're specific enough to actually
  test.
- Choose an appropriate source and amount of historical data for a test.
- Manually backtest a strategy step by step, without accidentally using
  information you wouldn't have had in real time (look-ahead bias).
- Record backtest results in a structured Backtesting Log, using the
  R-multiple concept.
- Calculate win rate, average win, and average loss from a set of
  results.
- Calculate expectancy and profit factor, and explain what each one
  actually measures.
- Read a simple equity curve to recognize drawdown and losing streaks,
  conceptually.
- Explain why sample size matters, and why no single trade count makes a
  test "proven."
- Recognize and avoid the most common backtesting biases and errors,
  including look-ahead bias, cherry-picking, and ignoring trading costs.
- Build and maintain a trading journal that records both facts and
  decision-making, not just outcomes.
- Review a trading journal using a structured framework, on a weekly and
  monthly basis.
- Use evidence from testing and journaling to identify specific
  weaknesses and improve a strategy or process, deliberately.
- Explain the role of forward testing (demo trading) as the bridge
  between backtesting and live trading.
- Build your own complete testing and journaling system, ready to apply
  to the trading plan from Module 8.

### Lesson 1 — What Is Backtesting?

**Backtesting** is the process of applying a specific, written set of
trading rules to historical price data, to see what results those rules
would have produced if they had been followed in the past.

**Why it matters before risking real money:** a trading plan (Module 8)
is a set of rules written from reasoning, study, and intent — but reasoning
alone doesn't tell you how a set of rules actually would have performed.
Backtesting replaces "I think this setup works" with "here is what this
exact setup actually did, across a defined set of historical
opportunities." That's a meaningfully different, much more useful kind of
statement to make about a trading idea before putting real money behind
it.

**What a beginner would actually do:** open a chart, go back to a point
in the past, and move forward through the price history one candle (or
one day) at a time, checking at each point whether the written setup
conditions are met. When they are, record what would have happened —
entry, stop, target, and outcome — exactly as if trading it live, without
looking ahead at what the price does afterward until that trade is
resolved. Lesson 4 covers this process in full step-by-step detail.

**What backtesting is not:** it is not a guarantee of future performance,
it is not proof a strategy is profitable, and it is not a substitute for
actually trading the strategy (first on demo, later live) and seeing how
it performs going forward. Markets and conditions change over time, and a
strategy that performed well on one stretch of historical data is not
certain to perform the same way going forward. Backtesting is evidence —
often the best evidence available before risking money — but it is not
certainty, and this module never claims otherwise.

**What backtesting is genuinely good for:** finding out early, at no
financial cost, whether a set of rules is even reasonably defined,
roughly how often it would have produced a valid setup, and roughly what
its win rate, average win/loss, and expectancy would have looked like
historically. That's enough to decide whether an idea is worth the next
step (forward testing, Lesson 14) — or worth reworking, or dropping
entirely — before any real capital is at risk.

> **Beginner mistake:** treating a positive backtest as proof a strategy
> "works," rather than as one piece of evidence that it's worth testing
> further. A backtest answers "what would this have done historically,"
> not "what will this do going forward."

### Lesson 2 — Preparing a Strategy for Testing

A strategy can only be backtested if it's written specifically enough
that the same conditions, applied by two different people to the same
chart, would produce the same trade decisions.

**Why this matters:** Module 8, Lesson 13 introduced a simple test for a
trading plan's rules — could someone else follow this rule and get the
same answer you would? Backtesting depends on that same standard even
more directly, because a backtest is only meaningful if the rules being
tested are the rules that actually get applied, consistently, trade after
trade. A vague rule doesn't just make a trading plan harder to follow
live — it makes the backtest itself unreliable, because the person
running it is unconsciously free to interpret each setup however makes
the results look best.

**What needs to be specific before testing begins:**

- The exact setup conditions (required, not optional — Module 8, Lesson
  5).
- The exact entry trigger.
- The exact stop-loss placement method.
- The exact take-profit or exit method.
- The exact risk amount or position-sizing method per trade.
- Any conditions that rule a trade out entirely (Module 8's no-trade
  rules).

**Worked example — vague rule made testable:**

Vague: *"Enter when the trend looks strong and there's a good pullback."*

Testable: *"Enter when price is above the 50-period moving average on the
4-hour chart (uptrend context), pulls back to touch the 20-period moving
average, and forms a bullish engulfing candle on the 1-hour chart."*

The testable version can be checked, candle by candle, by anyone looking
at the same chart. The vague version cannot — "looks strong" and "good
pullback" depend entirely on the person judging them, which means two
different testers (or the same tester on two different days) could reach
different conclusions from identical data.

**What this lesson does not repeat:** the full process of building a
setup definition and entry rules — that belongs to Module 8, Lessons 5
and 6. This lesson exists to confirm, one more time, before any testing
begins, that those rules are specific enough to actually produce
consistent, testable results.

> **Beginner mistake:** starting to backtest a strategy that still has
> vague, judgment-based conditions in it, then being surprised when the
> results don't feel repeatable — the inconsistency was in the rule
> definition, not in the market.

### Lesson 3 — Choosing Historical Data

Backtesting requires historical price data to test against, and the
source and amount of that data affects how much the results can actually
be trusted.

**What a beginner would use:** most charting platforms (including the
free tools built into most brokers) provide historical candle data going
back months or years, on every standard timeframe. For manual backtesting
(Lesson 4), this built-in chart history is normally enough — no special
data feed or paid service is required to get started.

**How much historical data is enough:** there's no single universal
number that applies to every strategy (Lesson 9 covers this properly),
but as a starting reference point, testing across a period long enough to
include multiple different market conditions — some trending stretches,
some ranging or choppy stretches — gives a more honest picture than
testing only during one especially favorable period. A strategy that only
gets tested against six months of a strong, clean trend has only been
tested in one kind of market, not in market conditions generally.

**Data quality matters too:** occasional gaps, misprinted candles, or
feed errors happen on any platform, particularly further back in history
or on less common instruments. A backtest built on a small number of bad
data points usually isn't ruined by it, but it's worth a quick visual
sanity check — does the price history look continuous and reasonable, or
does something obviously look broken — before relying heavily on results
drawn from it.

**A specific caution for very short timeframes:** the lower the
timeframe, the more historical data is usually needed to cover a
meaningful number of setups, and the more likely small data-quality
issues are to matter. A beginner's first backtest is usually easier to
run cleanly on 1-hour, 4-hour, or daily charts than on very short
intraday timeframes.

> **Beginner mistake:** backtesting a strategy against only a short,
> unusually favorable stretch of price history (for example, a few weeks
> of one strong clean trend) and concluding the strategy is proven,
> without testing it against a more varied set of market conditions.

### Lesson 4 — Manual Backtesting Step by Step

With a specific set of rules (Lesson 2) and a chosen data source (Lesson
3), manual backtesting follows a consistent, repeatable process.

**The step-by-step process:**

1. Go back on the chart to a starting point in history.
2. Move forward one candle (or session) at a time — never further ahead
   than the candle currently being evaluated.
3. At each point, check whether the setup's required conditions (Lesson
   2) are met, using only the price information that would have been
   visible at that exact moment.
4. If a setup is present, record the planned entry, stop-loss, and
   take-profit or exit method, exactly as the written rules define them.
5. Continue moving forward, candle by candle, until the trade's stop or
   target is hit (or the exit rule is triggered another way), and record
   the actual result.
6. Move on to look for the next setup, and repeat.

**The single most important rule of manual backtesting: look-ahead
bias.** Look-ahead bias happens when a backtest uses information that
would not actually have been available at the moment a trade decision was
being made — most often, by glancing ahead on the chart and
(consciously or not) letting knowledge of what price does *next*
influence whether a setup is marked as valid, or where an entry is
placed.

**Worked example of look-ahead bias:** a trader scrolls a chart forward
to review history, sees that price rallied sharply after a certain
candle, and then goes back to mark a "buy setup" at that candle —
because they already know, from having seen the outcome, that it worked.
In real time, at that candle, the outcome was not yet known. Marking the
setup only because the outcome is already visible produces a result that
has nothing to do with how the strategy would actually perform live,
because live trading never has that advantage.

**How to avoid it practically:** the discipline of moving forward one
candle at a time (step 2 above) and refusing to scroll ahead before a
setup decision is made is the core defense. Some traders use charting
software's built-in "replay" or "bar replay" feature specifically because
it enforces this — it reveals price one bar at a time and makes scrolling
ahead impossible. Manual backtesting without that feature is still valid,
but requires real self-discipline not to peek.

> **Beginner mistake:** scrolling freely around a chart while backtesting
> instead of moving forward one candle at a time — even without meaning
> to "cheat," seeing what happens next before marking a setup quietly
> inflates the results and makes the backtest meaningless as evidence.

### Lesson 5 — Recording Backtest Results

Every trade a backtest produces needs to be recorded in a structured,
consistent format — otherwise the results can't be measured accurately
in Lessons 6 and 7.

**The R-multiple concept:** rather than recording every trade's result in
raw dollars (which changes depending on account size and position size),
backtest results are usually recorded as a multiple of the amount risked
on that trade — called **R**. If a trade's planned risk is $20, then that
$20 is "1R." A trade that made twice its planned risk is "+2R" ($40 in
this example); a trade that lost the full planned risk is "−1R" ($20 lost
in this example); a trade that lost only half its planned risk before
being stopped out some other way is "−0.5R" ($10 lost).

**Why R-multiples are useful:** they let results be compared and combined
consistently, regardless of the exact dollar amount risked on any one
trade, and they connect directly to expectancy (Lesson 7) and to Module
6's risk-per-trade concept — a strategy's edge, expressed in R, doesn't
change depending on what account size it's eventually traded with.

**The Backtesting Log — required fields:**

| Trade # | Date | Instrument | Direction | Setup | Entry | Stop | Exit | Result (R) | Notes |
|---|---|---|---|---|---|---|---|---|---|

Each row is one backtested trade. **Trade #** and **Date** identify and
order it. **Instrument** and **Direction** (long/short) record what was
traded. **Setup** names which specific, written setup (Lesson 2)
triggered the trade — useful later if more than one setup is being
tested. **Entry**, **Stop**, and **Exit** record the actual price levels.
**Result (R)** records the outcome as a multiple of planned risk, per the
concept above. **Notes** records anything relevant — a partial exit,
an unusual market condition, or a rule that was borderline.

**Worked example — three log rows (all with $20 planned risk, so 1R =
$20):**

| Trade # | Date | Instrument | Direction | Setup | Entry | Stop | Exit | Result (R) | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Day 1 | EUR/USD | Long | Setup A | 1.0850 | 1.0830 | 1.0810 | −1R | Full stop hit |
| 2 | Day 3 | EUR/USD | Long | Setup A | 1.0790 | 1.0770 | 1.0870 | +4.0R | Ran to extended target |
| 3 | Day 6 | GBP/USD | Short | Setup A | 1.2650 | 1.2670 | 1.2610 | +2.0R | Hit planned target |

Trade 1 lost its full planned risk: −1R = −$20. Trade 2 made four times
its planned risk: +4.0R = +$80. Trade 3 made twice its planned risk:
+2.0R = +$40. Every result in the log is recorded the same way, which is
what makes the calculations in Lessons 6 and 7 possible.

> **Beginner mistake:** recording backtest results only as "win" or
> "loss" without the R-multiple, or the actual price levels — this throws
> away the information needed to calculate average win/loss, expectancy,
> and profit factor accurately in the next lessons.

### Lesson 6 — Win Rate, Average Win, and Average Loss

With a completed Backtesting Log, the first three statistics to
calculate are win rate, average win, and average loss.

**Win Rate:**

```
Win Rate = (Number of Winning Trades ÷ Total Number of Trades) × 100
```

**Average Win:**

```
Average Win = Total Profit from All Winning Trades ÷ Number of Winning Trades
```

**Average Loss:**

```
Average Loss = Total Loss from All Losing Trades ÷ Number of Losing Trades
```

**Worked example — a 20-trade backtest, $20 planned risk per trade (1R =
$20):**

The full results, trade by trade, in R:

−1R, +2R, −1R, −1R, +1.5R, −1R, −1R, −1R, −1R, +3R, −1R, +1R, −1R, +2R,
−1R, +1R, −1R, +2.5R, +1R, +2R

That's 20 trades: **9 winners** and **11 losers**.

```
Win Rate = (9 ÷ 20) × 100 = 45.0%
```

The 9 winning trades total 2 + 1.5 + 3 + 1 + 2 + 1 + 2.5 + 1 + 2 = **16R**
= 16 × $20 = **$320** in gross profit.

```
Average Win = $320 ÷ 9 = $35.56  (≈1.78R)
```

The 11 losing trades each lost exactly 1R = $20, for a total of **11R** =
**$220** in gross loss.

```
Average Loss = $220 ÷ 11 = $20.00  (1.00R)
```

This same 20-trade dataset is used again in Lesson 7 to calculate
expectancy and profit factor, and in Lesson 8 to look at its equity
curve — this is the Backtest Summary Sheet's dataset, and it's worth
sitting with these three numbers (45.0% win rate, $35.56 average win,
$20.00 average loss) before moving on, since the next lesson builds
directly on them.

**What these three numbers do and don't tell you on their own:** win
rate alone says nothing about profitability — a strategy can be
profitable with a win rate under 50%, as this example already shows, or
unprofitable with a win rate well above 50%, if the average loss is large
enough relative to the average win. These three numbers only become
genuinely useful once combined, which is exactly what Lesson 7's
expectancy and profit factor do.

> **Beginner mistake:** treating win rate as the single most important
> number from a backtest, and judging a strategy as "good" or "bad" from
> win rate alone, without also looking at average win and average loss
> together.

### Lesson 7 — Expectancy and Profit Factor

Win rate, average win, and average loss (Lesson 6) combine into two
numbers that actually describe whether a set of results was profitable:
expectancy and profit factor.

**Expectancy:**

```
Expectancy = (Win Rate × Average Win) − (Loss Rate × Average Loss)
```

(This is the same formula introduced in Module 6, Lesson 7 — here it's
applied to a strategy's actual backtested results instead of an assumed
or estimated win rate and average win/loss.)

**Profit Factor:**

```
Profit Factor = Gross Profit ÷ Gross Loss
```

**Continuing the same 20-trade example from Lesson 6:**

Win rate = 45.0%, Loss rate = 55.0%, Average win = $35.56, Average loss =
$20.00, Gross profit = $320, Gross loss = $220.

```
Expectancy = (0.45 × $35.56) − (0.55 × $20.00)
           = $16.00 − $11.00
           = +$5.00 per trade  (+0.25R per trade)
```

```
Profit Factor = $320 ÷ $220 = 1.45
```

**What these numbers mean:** a positive expectancy of +$5.00 per trade
means that, across these 20 backtested trades, the strategy averaged
$5.00 of profit per trade — and indeed, the total result across all 20
trades was $320 − $220 = $100, and $100 ÷ 20 trades = $5.00, confirming
the expectancy figure matches the actual total. A profit factor of 1.45
means gross profit was 1.45 times gross loss — for every $1 this strategy
lost across these 20 trades, it made $1.45. A profit factor above 1.0
means gross profit exceeded gross loss over this sample; below 1.0 means
the opposite, regardless of win rate.

**A cautionary second example — why win rate alone is misleading (from
Lesson 6's warning):** a strategy with a 70% win rate, a $15 average win,
and a $40 average loss has:

```
Expectancy = (0.70 × $15) − (0.30 × $40) = $10.50 − $12.00 = −$1.50 per trade
```

Despite winning 70% of the time, this strategy has negative expectancy —
it loses money on average, because its average loser is far larger than
its average winner. Profit factor confirms the same conclusion from a
different angle: with a 70% win rate over, say, 10 trades (7 wins, 3
losses), gross profit = 7 × $15 = $105, gross loss = 3 × $40 = $120,
profit factor = 105 ÷ 120 = **0.88** — below 1.0, confirming a losing
result despite the high win rate.

**Why this is evidence, not a guarantee:** expectancy and profit factor,
calculated from a backtest, describe what a specific set of rules
produced against a specific stretch of historical data. They are not a
promise that the same numbers will hold going forward — market
conditions change, and (per Lesson 9) a limited sample of historical
trades is not a certainty about the future. A positive expectancy and a
profit factor above 1.0 are a genuinely meaningful signal that a strategy
is worth testing further — not proof it will remain profitable.

> **Beginner mistake:** calculating a strong-looking expectancy or profit
> factor from a backtest and treating the strategy as "proven,"
> skipping forward testing (Lesson 14) and going straight to live trading
> with real money.

### Lesson 8 — Drawdown and Losing Streaks in a Backtest

A backtest's results aren't just a final total — the order the trades
happened in matters too, and that's what an equity curve shows.

**What an equity curve is:** a running total of a strategy's results,
trade by trade, plotted over time (or, for a quick manual check, simply
tracked as a running sum). It shows not just the final outcome, but the
path the account balance took to get there — including any stretches
where it dropped from a high point before recovering.

**Continuing the same 20-trade dataset (running total, in R, after each
trade):**

−1.0, +1.0, 0.0, −1.0, +0.5, −0.5, −1.5, −2.5, −3.5, −0.5, −1.5, −0.5,
−1.5, +0.5, −0.5, +0.5, −0.5, +2.0, +3.0, +5.0

**Reading this curve:** the running total reaches its first high point of
+1.0R after trade 2, then declines — through a stretch of four
consecutive losing trades (trades 6 through 9) — down to a low point of
−3.5R after trade 9. That decline, from the +1.0R peak down to the
−3.5R trough, is this backtest's largest **drawdown**: 4.5R (4.5 × $20 =
**$90** at this example's risk level). The account then recovers,
eventually reaching a new high point of +5.0R by the end of the 20
trades. The **longest losing streak** in this dataset is those same four
consecutive losses (trades 6–9).

**Why this belongs in a backtest review, conceptually:** a strategy's
expectancy (Lesson 7) describes its long-run average — but a real
account has to survive the drawdowns along the way to reach that average.
A strategy that's profitable overall but produces a long, deep losing
streak partway through is a very different thing to actually trade than
one with the same overall result but a smoother path. Reviewing the
equity curve, not just the final number, is how a backtest reveals that
difference.

**What this lesson deliberately does not repeat:** the detailed math of
recovery percentages (what percentage gain is needed to recover from a
given percentage loss) belongs to Module 6, Lesson 8, and isn't repeated
here — if a backtest's drawdown looks large relative to the account it
would be traded with, that's exactly the calculation Module 6 provides.
This lesson's job is narrower: showing how to read a backtest's own
equity curve to find its drawdowns and losing streaks in the first place.

> **Beginner mistake:** looking only at a backtest's final total result
> and never reviewing the equity curve in between — missing that the
> strategy went through a long losing streak partway through that would
> have been very difficult to sit through in real trading, even though
> the final number looks fine.

### Lesson 9 — Sample Size and Statistical Caution

A backtest's results are only as trustworthy as the number of trades they
are based on — and there is no single, universal trade count that makes
a test "proven."

**Why small samples are misleading:** with a small number of trades,
random variation has an outsized effect on the results. A strategy with a
genuinely mediocre long-run edge can easily produce 5 or 6 winning trades
in a row purely by chance, just as a genuinely good strategy can produce
a short losing stretch by chance (Module 6, Lesson 9 covers this same
idea for live losing streaks). Neither short stretch, on its own, reliably
reveals the strategy's actual long-run performance.

**Why there's no single "correct" number of trades:** how many trades are
needed to draw a reasonably confident conclusion depends on the
strategy's setup frequency, its win rate, the variability of its results,
and how the results are being used. This course does not claim a specific
number (such as "30 trades" or "100 trades") makes any strategy provably
reliable — any such claim would be a false precision this module isn't
willing to make. What can be said honestly: a handful of trades (fewer
than perhaps 15–20) provides very limited evidence either way, and
confidence should build gradually as a genuinely larger, more varied
sample accumulates — never from a single short stretch, however
striking it looks.

**A worked illustration:** a strategy tested across only 6 trades
produces 5 wins and 1 loss — an 83% win rate. That looks outstanding. But
with only 6 trades, a single different outcome on any one of them would
have changed the win rate dramatically (5 wins out of 6 versus 4 wins out
of 6 is a 17-percentage-point swing from one trade). A result built on
this few trades is a starting signal worth investigating further — not a
statistically meaningful conclusion about the strategy's real long-run
win rate.

**What this means practically:** treat an early backtest result — good
or bad — as a reason to keep testing with more data and more varied
market conditions (Lesson 3), not as a final verdict. A strategy that
still looks reasonable after a larger, more varied sample of trades is a
much stronger candidate for forward testing (Lesson 14) than one judged
from a small, favorable stretch alone.

> **Beginner mistake:** running a short backtest, seeing an unusually
> high win rate from a small number of trades, and concluding the
> strategy is reliable — without recognizing how easily a small sample
> can be misleading in either direction.

### Lesson 10 — Avoiding Backtesting Biases and Errors

Beyond look-ahead bias (Lesson 4), several other common errors can make a
backtest's results misleading — some by accident, some through
unconscious self-favoring choices while testing.

**1. Look-ahead bias.** *What it is:* using information that wouldn't
have been available at the time a decision was made (covered fully in
Lesson 4). *How it happens:* scrolling ahead on a chart before marking a
setup. *Why it matters:* it silently inflates results in a way that has
nothing to do with how the strategy performs in real time. *Countermeasure:*
move forward one candle at a time; use a bar-replay tool where available.

**2. Selection bias.** *What it is:* choosing which setups to include in
a backtest based on how they turned out, rather than testing every
instance the written rules actually produced. *How it happens:*
unconsciously backtesting only the setups that "look clean" in hindsight
and skipping messier ones. *Why it matters:* it tests a hand-picked
subset, not the strategy as actually defined. *Countermeasure:* commit
to logging every setup the written rules identify, in order, without
skipping any.

**3. Survivorship bias.** *What it is:* testing a strategy only on
instruments, setups, or time periods that are still commonly discussed or
easy to find data for today, while ones that performed badly enough to be
abandoned are left out of the picture. *How it happens:* naturally, since
poorly performing ideas tend to disappear from view over time. *Why it
matters:* it makes strategies and markets look more consistently
favorable than the full historical picture actually was. *Countermeasure:*
test the specific instruments in your own plan (Module 8) across their
own full available history, rather than only the periods or instruments
that currently look good.

**4. Overfitting (curve-fitting).** *What it is:* adjusting a strategy's
exact rules repeatedly until they fit one specific stretch of historical
data extremely well. *How it happens:* tweaking an indicator setting, a
stop distance, or an entry condition over and over, each time checking
whether it improves the same backtest. *Why it matters:* a strategy
tuned this precisely to past data often fits the noise of that specific
data, not a genuine, repeatable edge — and tends to perform worse on new
data it wasn't tuned against. *Countermeasure:* keep rules simple and
based on sound reasoning, not adjusted purely to maximize one backtest's
result; test on data the rules weren't tuned against before trusting
them.

**5. Rule-changing mid-test.** *What it is:* altering the strategy's
rules partway through a backtest, based on how the results so far are
looking. *How it happens:* seeing a losing stretch mid-backtest and
adjusting the stop-loss method or entry condition specifically to reduce
it, then continuing the same test as if the rules had been consistent
throughout. *Why it matters:* the resulting log no longer reflects one
consistent, testable strategy (Lesson 2) — it reflects several different,
partially-tested strategies stitched together. *Countermeasure:* finish
testing one fixed, written version of the rules completely; make changes
only between full tests, never mid-test.

**6. Ignoring spread, commission, and slippage.** *What it is: c*alculating
backtest results using only the exact entry and exit prices, without
accounting for the real costs of actually trading. *How it happens:*
it's simple to forget, especially when backtesting manually. *Why it
matters:* real trading costs reduce every result slightly, and for
strategies with many trades or tight targets, that reduction can turn a
backtest's positive result into a real-world breakeven or losing one.
*Countermeasure:* build a reasonable estimate of typical spread and any
commission into the entry/exit prices used when calculating results,
particularly for tighter-target strategies.

**7. Cherry-picking.** *What it is:* selectively presenting or relying on
only the backtest results that support a desired conclusion. *How it
happens:* running several different rule variations or time periods and
reporting (even just to yourself) only the most favorable one. *Why it
matters:* it isn't really a test of the strategy at all — it's a search
for whichever version happened to look best, which tells you very little
about what to expect going forward. *Countermeasure:* decide the rules
and test period in advance, and record the result honestly, whatever it
turns out to be.

**8. Testing only in a favorable period.** *What it is: t*esting a
strategy against a single, specific stretch of history that happens to
suit it particularly well (echoing Lesson 3's caution). *How it happens:*
choosing (even unintentionally) a period with a strong trend for a
trend-following strategy, without also testing quieter or choppier
periods. *Why it matters:* it produces results that describe how the
strategy performs in one kind of market, not markets generally.
*Countermeasure:* deliberately include more than one type of market
condition in the historical data tested.

**9. Instrument-switching.** *What it is:* moving a strategy to a
different currency pair or instrument as soon as it underperforms on the
one currently being tested, without a specific, honest reason connected
to the strategy's actual logic. *How it happens:* a run of losses on one
pair prompts trying the same rules on a different pair, hoping for a
better outcome, then repeating this until one pair happens to show good
results. *Why it matters:* this is a form of cherry-picking applied to
instruments instead of time periods — the "good" result is found by
searching, not by genuine strategy performance. *Countermeasure:* pick
the instruments a plan will actually trade (Module 8, Lesson 3) before
testing, and evaluate results on those instruments as originally chosen.

> **Beginner mistake:** treating these as rare, deliberate mistakes other
> traders make. Every one of them is easy to fall into by accident,
> often while trying to be thorough — which is exactly why a written,
> fixed process (Lesson 2, and this module's Bias/Error Checklist) matters
> more than good intentions alone.

### Lesson 11 — Building a Trading Journal

Backtesting (Lessons 1–10) tests rules against historical data. A
**trading journal** tracks a trader's own actual results and decisions,
going forward, in real time.

**Why a journal is different from a backtest:** a backtest is done once
(or periodically, when a strategy changes) against historical data before
trading it. A journal is ongoing — a record kept for every real trade,
starting the moment forward testing begins (Lesson 14) and continuing for
as long as the strategy is traded. It captures information a backtest
can't: what the trader was actually thinking, whether the plan's rules
were actually followed, and how execution held up under real conditions.

**What this lesson does not repeat:** Module 7 covered the psychology
behind emotional trading decisions — fear, greed, FOMO, revenge trading,
and the cognitive biases that distort judgment — in full detail, along
with its own Post-Trade Review and Rule-Violation Log. This lesson
doesn't re-teach that material; it builds the structural habit of
recording every trade, which is where that psychological work actually
gets applied and made visible over time.

**The Trading Journal Template — three sections per trade:**

**Before the trade:**

- Setup identified (which written setup, per the trading plan)
- Entry, stop, and target levels planned
- Planned risk (in $ and R)
- Any relevant news/calendar check (Module 8, Lesson 9)

**During the trade:**

- Was the plan followed exactly as written? (yes/no, and if no, what
  changed)
- Any adjustments made, and the stated reason for each one

**After the trade:**

- Actual result (in $ and R)
- What went well
- What could be improved
- One specific lesson or note for next time

**Worked example — one completed journal entry:**

*Before:* Setup A, EUR/USD long. Entry 1.0850, stop 1.0830, target
1.0910. Planned risk $20 (1R). No high-impact news within 30 minutes, per
plan.

*During:* Plan followed exactly. No adjustments made.

*After:* Result: +2R (+$40), target hit. What went well: waited for the
full setup and entry trigger without entering early. What could improve:
nothing specific this trade. Note: this was the cleanest execution of
Setup A so far this month.

**Why recording facts and decisions both matters:** a journal that
records only outcomes ("+$40," "−$20") shows what happened but not why —
it can't distinguish a well-executed trade that happened to lose from a
poorly-executed trade that happened to win. Recording the before/during/
after details is what makes Lessons 12 and 13's review process possible.

> **Beginner mistake:** journaling only winning trades, or only trades
> that feel worth writing about, rather than every single trade — an
> incomplete journal produces a distorted, overly flattering picture of
> actual performance.

### Lesson 12 — Reviewing Your Journal

A journal that's filled in but never reviewed provides almost none of its
value — the review is where the recorded information actually becomes
useful.

**The Trade Review Framework — four questions, applied to a completed
trade or a stretch of trades:**

1. **Was the plan followed?** Compare the actual trade to the written
   setup, entry, stop, and exit rules from Module 8. A trade can be
   correctly executed and still lose — or poorly executed and still win
   (Lesson 13 covers this distinction in depth).
2. **Was the result explained by the plan, or by a deviation from it?**
   If the plan was followed exactly, the result is simply one outcome of
   the strategy's normal variation (Lessons 6–9). If it wasn't followed,
   the result says more about that specific deviation than about the
   strategy itself.
3. **What pattern, if any, connects this to other recent trades?** A
   single trade rarely reveals much on its own — the review is more
   useful when it looks across several trades at once for a repeating
   theme (a particular setup underperforming, a particular time of day
   producing worse results, a particular kind of rule violation
   recurring).
4. **What is one specific, written action to take from this?** A vague
   conclusion ("be more careful") isn't useful. A specific one ("stop
   trading Setup B during the first 30 minutes after the session open,
   based on the last four trades") can actually be tested and applied.

**The Weekly Review Template:**

- Number of trades taken this week
- Win rate, average win, average loss for the week
- Was every trade consistent with the written trading plan? (list any
  exceptions)
- Any repeated setup, mistake, or emotional pattern noticed this week
- One specific focus for next week

**The Monthly Review Template:**

- Total trades, win rate, average win/loss, expectancy, and profit
  factor for the month (same formulas as Lessons 6–7, applied to actual
  results instead of backtested ones)
- Comparison to the prior month's numbers
- Largest drawdown and longest losing streak experienced this month
  (Lesson 8's concepts, applied to real results)
- Which specific setups, or times, performed best and worst
- Any change being considered to the trading plan, and why

**Worked example — a five-trade week, $20 risk per trade:**

Results: +2R, −1R, −1R, +1R, −1R. Two winners, three losers. Win rate =
2 ÷ 5 × 100 = **40%**. Gross profit = 3R = $60. Gross loss = 3R = $60.
Net result for the week: **$0** — a breakeven week. On its own, this
single week says very little; per Lesson 9, it's one short stretch. Logged
consistently and reviewed alongside several other weeks, patterns worth
acting on start to become visible.

> **Beginner mistake:** journaling every trade in detail but never
> actually sitting down to review the week or month as a whole — the
> individual entries pile up without ever being turned into an actual
> conclusion or decision.

### Lesson 13 — Finding Weaknesses and Improving the Process

Both backtesting (Lessons 1–10) and journaling (Lessons 11–12) exist for
the same ultimate purpose: finding specific, real weaknesses and
improving deliberately, based on evidence rather than guesswork.

**The improvement cycle:**

```
CHANGE → RETEST → COMPARE → DECIDE
```

**Change:** based on a specific weakness the evidence actually points to
(not a hunch, and not a reaction to one recent trade), make one specific,
written change to the strategy or process. **Retest:** backtest the
changed version, or forward-test it (Lesson 14), using the same
discipline as the original test. **Compare:** compare the new version's
results — win rate, average win/loss, expectancy, profit factor,
drawdown — to the original version's, using the same statistics so the
comparison is meaningful. **Decide:** keep the change if the evidence
supports it, revert it if it doesn't, and either way record the decision
and the reasoning.

**Why only one change at a time:** changing several rules at once and
then retesting makes it impossible to know which specific change was
responsible for any difference in results. A strategy's stop-loss method
and its entry trigger and its instrument list should be tested as
separate changes, one at a time, even though this takes longer — it's the
only way to know what actually caused an improvement (or a decline).

**Worked example — using journal evidence to make one specific change:**
a trader's monthly review (Lesson 12) shows that a specific setup,
"Setup B," has a −$3 expectancy across the last 15 trades, while "Setup
A" has a +$6 expectancy over the same period. Rather than abandoning the
whole trading plan, the trader makes one specific change — removing
Setup B from the plan entirely — and continues journaling Setup A alone
for the next month to see whether the plan's overall numbers improve, a
change directly connected to what the evidence actually showed.

**A caution about reacting too quickly:** per Lesson 9, a handful of
trades isn't a large enough sample to justify most changes on its own.
The distinction that matters: is this change based on a pattern that's
shown up consistently across a meaningful number of trades and reviews,
or a reaction to one bad trade or one bad week? The improvement cycle is
built around evidence gathered over time, not around adjusting the
strategy every time a single trade doesn't go as planned.

> **Beginner mistake:** changing multiple rules at once after a rough
> stretch, then being unable to tell afterward which specific change (if
> any) actually made a difference.

### Lesson 14 — From Backtest to Forward Test

A promising backtest is not the same as a strategy ready for live
trading — **forward testing** is the step in between.

**What forward testing is:** applying the exact same written rules used
in the backtest to new, real-time market conditions — on a demo account,
with no real money at risk — recording every trade in the same journal
format as Lesson 11, exactly as if it were a real trade.

**Why this step matters, even after a positive backtest:** a backtest is
built on historical data the trader has already seen the outcome of,
applied with the benefit of hindsight discipline (Lesson 4's look-ahead
bias caution notwithstanding). Forward testing is the first time the
exact same rules are applied to genuinely unknown, real-time price
action — which tests something a backtest cannot: whether the trader can
actually identify and execute the setup correctly, live, without knowing
what happens next.

**What forward testing checks for, specifically:**

- Does the strategy's live performance stay broadly consistent with what
  the backtest suggested, once a reasonable number of forward trades has
  accumulated (Lesson 9's sample-size caution applies here too)?
- Can the setup actually be identified and executed correctly in real
  time, under normal conditions, without the benefit of hindsight?
- Do execution issues show up that a backtest wouldn't reveal — for
  example, difficulty getting filled at the planned entry, or
  hesitation at the actual moment of entry?

**What forward testing is not:** it is not a guarantee that a strategy
performing reasonably on demo will perform identically with real money at
risk — Module 7 covers how differently a trader's psychology can respond
once real money, rather than a demo balance, is on the line. Forward
testing reduces risk and adds a genuinely new layer of evidence; it does
not eliminate the need for continued journaling and review once live
trading begins.

**A reasonable sequence, stated honestly (not as a universal rule):**
backtest first, forward test on demo next, and only then consider live
trading — each step adding real evidence the previous step couldn't
provide, rather than skipping straight from a backtest to live trading
with real capital.

> **Beginner mistake:** skipping forward testing entirely after a
> positive backtest and moving straight to live trading, treating
> backtested results as if they already account for real-time execution
> and real psychology.

### Lesson 15 — Building Your Complete Testing & Journaling System

This final lesson brings backtesting, statistics, bias-avoidance,
journaling, and review together into one complete, repeatable system —
applied to the trading plan built in Module 8.

**The complete workflow, step by step:**

1. Take the written trading plan from Module 8 and confirm every rule is
   specific and testable (Lesson 2).
2. Choose a historical data source and time period, including more than
   one type of market condition (Lesson 3).
3. Manually backtest the plan's rules, moving forward one candle at a
   time and avoiding look-ahead bias (Lesson 4).
4. Record every trade the rules produce in a Backtesting Log, using
   R-multiples (Lesson 5).
5. Calculate win rate, average win, and average loss from the completed
   log (Lesson 6).
6. Calculate expectancy and profit factor (Lesson 7), and review the
   equity curve for drawdown and losing streaks (Lesson 8).
7. Check the process against the Bias/Error Checklist before drawing any
   conclusions (Lesson 10).
8. If the backtest results are reasonable and the sample is large enough
   to mean something (Lesson 9), move to forward testing on demo,
   journaling every trade the same way (Lessons 11, 14).
9. Review the journal weekly and monthly, using the Trade Review
   Framework (Lesson 12).
10. Apply the Change → Retest → Compare → Decide cycle to any specific
    weakness the evidence reveals, one change at a time (Lesson 13).

**The Testing Workflow (one-page reference):**

```
1. Confirm rules are specific and testable
2. Choose historical data (varied conditions)
3. Backtest manually, one candle at a time — no look-ahead
4. Log every trade with R-multiples
5. Calculate win rate, avg win, avg loss
6. Calculate expectancy and profit factor
7. Review equity curve for drawdown and streaks
8. Check against the Bias/Error Checklist
9. Forward test on demo, journal every trade
10. Review weekly and monthly; improve one change at a time
```

**Backtesting & Journal Completion Audit** — go through honestly before
considering this system ready to use:

- [ ] My strategy's rules are written specifically enough to test
      consistently.
- [ ] I have backtested against historical data covering more than one
      type of market condition.
- [ ] I recorded every trade the rules produced, in order, using
      R-multiples.
- [ ] I calculated win rate, average win, average loss, expectancy, and
      profit factor from my own results.
- [ ] I reviewed my backtest's equity curve for its largest drawdown and
      longest losing streak.
- [ ] I checked my process against the Bias/Error Checklist, honestly.
- [ ] I understand my sample size is a starting point, not final proof.
- [ ] I have a Trading Journal Template ready to use for every future
      trade.
- [ ] I understand forward testing on demo comes next, before any live
      trading.
- [ ] I understand this entire process repeats — testing and journaling
      don't stop once live trading begins.

**Why this module ends here, not with "you're ready to trade":** this
module's honest purpose is building the *process* of testing and
tracking — not certifying any specific strategy as proven, and not
claiming that completing this process guarantees profitable trading.
Module 10 picks up from here, covering the broader practical and
professional habits (demo practice, broker safety, avoiding scams and
signal dependency, and continuous improvement as an ongoing process) that
surround actually using this system in practice.

> **Beginner mistake:** treating the completion of a first backtest and a
> journal template as the finish line, rather than as the start of an
> ongoing process that continues for as long as the strategy is traded.

## Common Beginner Mistakes (Module Recap)

- Treating a positive backtest as proof a strategy works, rather than as
  one piece of evidence worth testing further (Lesson 1).
- Backtesting rules that are still vague or judgment-based, rather than
  specific and testable (Lesson 2).
- Testing against only a short, unusually favorable stretch of history
  (Lesson 3).
- Scrolling ahead on a chart while backtesting, introducing look-ahead
  bias (Lesson 4).
- Recording only win/loss instead of R-multiples and price levels,
  losing the detail needed for later calculations (Lesson 5).
- Judging a strategy by win rate alone, without average win and average
  loss (Lesson 6).
- Treating a strong expectancy or profit factor as proof, and skipping
  forward testing (Lesson 7).
- Looking only at a backtest's final total and never reviewing the
  equity curve for drawdown and losing streaks (Lesson 8).
- Trusting conclusions drawn from a small number of trades (Lesson 9).
- Falling into selection bias, overfitting, cherry-picking, or the other
  biases in Lesson 10, often without realizing it.
- Journaling only some trades instead of every trade (Lesson 11).
- Filling in a journal but never actually reviewing it weekly or monthly
  (Lesson 12).
- Changing multiple rules at once, losing the ability to tell what caused
  a change in results (Lesson 13).
- Skipping forward testing and moving straight from backtest to live
  trading (Lesson 14).
- Treating a completed first backtest and journal setup as a finish line
  rather than an ongoing process (Lesson 15).

## Practical Scenarios (Quick Reference)

1. **Look-ahead bias** — a trader scrolls ahead on a chart before
   marking a setup, letting knowledge of the outcome influence the
   decision. *Correct principle:* move forward one candle at a time; a
   result influenced by hindsight isn't evidence of anything (Lesson 4).
2. **Cherry-picking** — a trader tests several rule variations and
   reports only the best-performing one. *Correct principle:* decide the
   rules and test period in advance, and record the honest result,
   whatever it is (Lesson 10).
3. **Changing rules mid-test** — a trader adjusts the stop-loss method
   partway through a backtest after seeing a losing stretch. *Correct
   principle:* finish testing one fixed version of the rules completely
   before making any change (Lessons 10, 13).
4. **A small sample with a high win rate** — a strategy shows an 83% win
   rate across only 6 trades. *Correct principle:* a small sample can
   look outstanding by chance; treat it as a starting signal, not a
   proven result (Lesson 9).
5. **Positive expectancy but poor execution** — a strategy's backtested
   expectancy is strongly positive, but the trader's journal shows the
   plan wasn't actually followed on several real trades. *Correct
   principle:* a strategy's tested edge and a trader's actual execution
   of it are two different things — the Trade Review Framework's first
   question exists specifically to separate them (Lesson 12).
6. **Ignoring trading costs** — a backtest calculates results using exact
   entry/exit prices with no allowance for spread, commission, or
   slippage. *Correct principle:* build a reasonable cost estimate into
   backtested results, especially for tighter-target strategies, since
   real trading costs reduce every result (Lesson 10).

## Practical Materials & Templates (Quick Reference)

1. **Backtesting Log** — Trade #, Date, Instrument, Direction, Setup,
   Entry, Stop, Exit, Result (R), Notes (Lesson 5).
2. **Backtest Summary Sheet** — total trades, winning/losing trades, win
   rate, average win/loss, gross profit/loss, profit factor, expectancy,
   max drawdown, longest losing streak, notes (Lessons 6–8).
3. **Trading Journal Template** — Before / During / After sections for
   every real trade (Lesson 11).
4. **Weekly Review Template** — trade count, win rate, average win/loss,
   plan consistency, patterns noticed, next week's focus (Lesson 12).
5. **Monthly Review Template** — full monthly statistics, comparison to
   the prior month, drawdown/streak review, best/worst setups, any plan
   change under consideration (Lesson 12).
6. **Bias/Error Checklist** — the nine items from Lesson 10, checked
   honestly before trusting a backtest's conclusions.
7. **Testing Workflow (one-page)** — the ten-step sequence from Lesson
   15, from confirming rules through ongoing weekly/monthly review.

## Key Takeaways

- Backtesting tests a specific, written set of rules against historical
  data — it produces evidence, not proof, and never guarantees future
  results.
- A strategy has to be written specifically enough to test consistently
  before backtesting is meaningful at all.
- Look-ahead bias — using information that wouldn't have been available
  at the time — is the single most important error to avoid while
  backtesting manually.
- R-multiples record results as a multiple of planned risk, making
  results comparable regardless of exact dollar amounts.
- Win rate alone says nothing about profitability; expectancy and profit
  factor, calculated from win rate together with average win and average
  loss, actually describe whether a set of results was profitable.
- Reviewing a backtest's equity curve — not just its final total —
  reveals its drawdown and losing streaks.
- No single trade count makes a backtest "proven"; a small sample can
  look outstanding or terrible purely by chance.
- Look-ahead bias, selection bias, survivorship bias, overfitting,
  rule-changing mid-test, ignoring trading costs, cherry-picking,
  favorable-period-only testing, and instrument-switching can each
  quietly distort a backtest's results.
- A trading journal records real, ongoing results and decisions — facts
  and reasoning, not just outcomes — and only becomes useful once it's
  actually reviewed, weekly and monthly.
- Improvement should follow a disciplined Change → Retest → Compare →
  Decide cycle, one change at a time, based on evidence gathered over
  time rather than a reaction to any single trade.
- Forward testing on demo is the step between a promising backtest and
  live trading — it tests real-time execution that a backtest cannot.
- This entire process — test, record, measure, analyze, identify
  weaknesses, improve — repeats for as long as a strategy is traded; it
  does not end once a first backtest and journal are complete.

## Before You Move On

Complete `02-exercises.md`, take the knowledge checkpoint in
`03-quiz.md`, check your answers in `04-answer-key.md`, and work through
`05-checklist.md` before continuing to Module 10 — Practical Forex
Development. Module 9 has given you a complete process for testing a
strategy honestly and tracking your own results; Module 10 covers the
broader practical habits — demo practice, broker safety, avoiding scams
and signal dependency, and continuous improvement — that surround using
this process as an ongoing part of how you trade.
