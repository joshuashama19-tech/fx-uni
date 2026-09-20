---
module: 6
title: Risk Management
subtitle: Protecting Your Capital So You Can Stay in the Game
status: complete
last_updated: 2026-09-19
---

# Module 6 — Risk Management

*"Protecting Your Capital So You Can Stay in the Game"*

## Module Introduction

Every module so far has taught you how to form a trading idea: reading
charts (Module 2), using indicators (Module 3), reading structure
(Module 4), and reading economic context (Module 5). None of that matters
if you don't control how much of your capital is on the line when you act
on an idea. This module is, deliberately, one of the most practically
useful in the entire course — it's less about theory and much more about
calculation.

Risk management will not make a losing idea profitable, and it will not
guarantee you make money. What it does is something different and, in
the long run, more important: it controls how much a wrong idea costs
you, so that being wrong sometimes — which happens to every trader, no
exceptions — doesn't threaten your ability to keep trading at all. This
is the actual meaning of the phrase "protecting your capital": not
avoiding every loss, but making sure no single loss, or short run of
losses, can end your ability to trade before your edge (if you have one)
has room to play out.

This module builds directly on Module 1 (leverage and margin basics,
lot sizes, pip value), Module 4 (stop loss and take profit as concepts),
and Module 5 (using fundamental context as part of your reasoning). It
does not teach trading psychology in depth (Module 7), the full
construction of a written trading plan (Module 8), or backtesting and
journaling (Module 9) — those build on the calculations you learn here.

## Learning Objectives

By the end of this module, you will be able to:

- Calculate the maximum dollar amount you're risking on a trade from an
  account size and a chosen risk percentage.
- Calculate position size from your risk amount, your stop-loss distance,
  and pip value.
- Explain why pip value depends on the currency pair, position size,
  account currency, and exchange rate — not a single universal number.
- Calculate a risk-to-reward ratio and explain why it's a planning
  metric, not a prediction.
- Calculate expectancy from a win rate and average win/loss, and explain
  what it does and doesn't tell you.
- Calculate the percentage gain required to recover from a given
  percentage loss, and explain why recovery gets disproportionately
  harder as losses grow.
- Calculate how a losing streak affects an account under fixed
  percentage risk, and explain why a losing streak doesn't automatically
  mean a strategy is broken.
- Distinguish leverage, margin, and risk as three separate (though
  related) concepts.
- Distinguish planned risk from actual realized loss, including the roles
  of slippage, spread, and commissions.
- Build a personal, written set of risk rules suited to your own capital
  and circumstances.

---

### Lesson 1 — Introduction to Risk Management

**Risk management** is the set of decisions and calculations that
control how much of your capital is exposed to loss on any single trade,
and across your account as a whole.

**Why does it matter more than almost anything else in this course?**
Every tool taught in Modules 2–5 — chart reading, indicators, price
action, fundamentals — helps you form a *view*. None of them tell you how
big a position to take based on that view. Two traders can have the exact
same, correct view on a chart and get completely different results,
because one of them risked 1% of their account on the idea and the other
risked 25%. Risk management is the layer that turns an idea into a
properly sized trade.

**The core relationship this entire module builds around:**

```
ACCOUNT SIZE
     ↓
RISK %  (a decision you make)
     ↓
MONEY AT RISK  (account size × risk %)
     ↓
STOP-LOSS DISTANCE  (from your trade idea, Module 4)
     ↓
POSITION SIZE  (money at risk ÷ risk per unit of the stop-loss distance)
```

**What a beginner would actually see:** most trading platforms let you
enter a lot size or unit size directly, but very few calculate it *for*
you from a risk percentage and a stop-loss distance — that calculation is
something you're expected to do yourself, before placing the trade, not
something the platform does automatically. This module exists because
skipping this step is one of the most common reasons beginners lose more
than they intended to.

> **Beginner mistake:** choosing a position size first (because it
> "feels" like the right number of lots) and only then discovering how
> much money that position actually risks — the correct order is
> reversed: decide the risk first, and let that determine the position
> size.

### Lesson 2 — Risk Per Trade

**Risk per trade** is the percentage of your account you're willing to
lose if a single trade hits its stop loss.

**Why a percentage, rather than a fixed dollar amount?** A percentage
automatically scales with your account: as your balance changes, the
dollar amount at risk changes with it, without you having to remember to
update a fixed number. Lesson 9 covers exactly what this scaling looks
like during a losing streak.

**Worked example — the chain from Lesson 1, applied:**

Account balance = $1,000
Risk per trade = 1%
Maximum planned loss = $1,000 × 0.01 = **$10**

That $10 is the maximum amount this trader has decided to lose if this
specific trade reaches its stop loss — decided *before* the trade is
placed, not discovered afterward.

**Common risk percentages, compared across account sizes:**

| Account size | 0.5% risk | 1% risk | 2% risk |
|---|---|---|---|
| $500 | $2.50 | $5.00 | $10.00 |
| $1,000 | $5.00 | $10.00 | $20.00 |
| $2,000 | $10.00 | $20.00 | $40.00 |
| $5,000 | $25.00 | $50.00 | $100.00 |
| $10,000 | $50.00 | $100.00 | $200.00 |

**This is a decision, not a rule handed down from this course.** 0.5%,
1%, and 2% are all commonly used starting points, and none of them is
"the" correct answer. A smaller percentage means smaller swings in your
account and more room to be wrong many times in a row before it matters;
a larger percentage means faster growth *if* things go well, and faster
damage if they don't. This course does not prescribe a single universal
percentage as the only acceptable approach — the right number depends on
your capital, your strategy's own statistics (Module 9 covers tracking
those), and your own tolerance for account swings.

> **Beginner mistake:** picking a risk percentage once and never
> reconsidering it — or worse, increasing it after a loss to "win it
> back faster," a mistake covered in depth in Lesson 9 and again in
> Module 7.

### Lesson 3 — Stop Loss & Invalidation

Module 4 (Lessons 9–10) introduced the stop loss as the price at which
your trade idea is proven wrong — this lesson builds directly on that,
from a risk-management angle.

**Why the stop loss should be linked to trade logic, not chosen
arbitrarily:** a stop placed at a structurally meaningful point (Module 4,
Lesson 10) means the position gets closed exactly when the reasoning
behind the trade breaks down. A stop placed at an arbitrary distance —
"I always use 30 pips" — is disconnected from that reasoning, and can
either get hit by ordinary market noise that didn't actually invalidate
the idea, or leave the trade open well past the point the idea was
already wrong.

**Why moving a stop farther away to avoid taking a loss changes the
original risk:** suppose a trader planned a 20-pip stop, risking $10 at
1% on a $1,000 account (Lesson 2's example). If price approaches that
stop and the trader moves it another 20 pips further away specifically to
avoid being closed out, the position's risk has doubled to $20 (2% of the
account) — without a new decision to accept that higher risk, and often
without the original trade logic actually supporting a wider stop. This
is not "giving the trade more room"; it's silently doubling the risk
after the fact.

**Why removing a stop entirely can expose an account to uncontrolled
loss:** without a stop loss, a losing position has no predefined point at
which it closes. Nothing in Forex prevents an adverse move from
continuing well beyond where a stop would have closed the trade — a
position without a stop is a position with an unknown, potentially very
large, maximum loss.

**Gaps and slippage — why a stop loss does not always execute at exactly
the requested price:** in genuinely fast-moving markets — around major
news (Module 5, Lesson 10) or over a weekend gap — price can move past a
stop-loss level before the order actually fills, especially for a
standard stop order. The order still closes the position, but at the
next available price, not necessarily the exact price requested. This gap
between the requested price and the executed price is called
**slippage**. It's usually small under normal conditions, and can be
larger during major volatility — which is one reason Lesson 2's chosen
risk percentage is better thought of as the *planned*, not guaranteed,
maximum loss.

> **Note — planned risk vs. actual realized loss:** this module
> consistently distinguishes the **planned risk** (what your calculation,
> like Lesson 2's $10 example, says you're risking) from the **actual
> realized loss** on any specific trade, which can differ slightly
> because of slippage (above), the spread (Module 1, Lesson 5, paid at
> entry), and any commission or fees your broker charges. None of this
> means the calculation is pointless — it means the calculated number is
> your intended, controlled risk, and the real world can move it a small
> amount in either direction around that intention.

> **Beginner mistake:** treating a placed stop loss as an absolute
> guarantee of the maximum possible loss, with no awareness that slippage
> during fast markets can occasionally result in a somewhat larger
> realized loss than planned.

### Lesson 4 — Position Sizing

**Position sizing** is the process of calculating exactly how large a
position to open, based on how much you've decided to risk and how far
away your stop loss is.

**The general formula:**

```
Position Size = Amount You Are Willing To Risk ÷ Risk Per Unit
```

**Applied to Forex, using pips as the unit:**

```
Position Size = Risk Amount ÷ (Stop-Loss Distance in Pips × Pip Value)
```

**Why pip value is not one universal number:** Module 1, Lesson 7
introduced approximate pip values (≈$10 per pip on a standard lot, ≈$1 on
a mini lot, ≈$0.10 on a micro lot) for a USD-quoted pair. Those figures
depend on several things at once:

- **The currency pair** — pip value is calculated differently depending
  on which currency is the quote currency.
- **Position size** — pip value scales directly with the number of units
  traded (Module 1, Lesson 7).
- **Account currency** — if your account is funded in a currency other
  than the pair's quote currency, an extra conversion step applies.
- **The current exchange rate** — for pairs where the pip value
  calculation involves the exchange rate directly, it shifts as the rate
  moves.

This course does not pretend one pip value applies universally across
every pair, account currency, and moment in time. The examples in this
module use a clearly stated, simplified pip-value **assumption** — the
same practice Module 1 and Module 3 used for their own simplified
examples — so the underlying math stays visible. In live trading, your
platform will calculate the exact, current pip value for your specific
account and position; treat the assumption in this module's examples as a
teaching device, not a number to trade with directly.

**What a beginner would actually see:** most trading platforms display a
pip value per lot size for the pair you have selected, updated for the
current exchange rate — the number this module's examples assume is a
simplified stand-in for a real number you'd check on your own platform.

> **Beginner mistake:** using the same pip-value figure for every pair
> and every account, without checking that it actually applies to the
> specific pair, position size, and account currency being traded.

### Lesson 5 — Practical Position-Sizing Calculations

This lesson works through the position-sizing formula from Lesson 4 in
full, step by step, with several complete examples. Every number below
has been independently verified.

**Worked example (the core pattern this module repeats):**

Account = $2,000
Risk = 1% → Risk amount = $2,000 × 0.01 = $20
Stop loss = 40 pips
Pip value assumption = $1 per pip (a mini lot, per Module 1, Lesson 7)

```
Position size = $20 ÷ (40 pips × $1/pip)
             = $20 ÷ $40
             = 0.50 mini lots (under the stated pip-value assumption)
```

**Example 1 — smaller account, tighter stop:**

Account = $1,000
Risk = 1% → Risk amount = $1,000 × 0.01 = **$10**
Stop loss = 20 pips
Pip value assumption = $1 per pip (mini lot)

```
Position size = $10 ÷ (20 pips × $1/pip) = $10 ÷ $20 = 0.50 mini lots
```

**Example 2 — different account, smaller risk percentage, wider stop:**

Account = $2,500
Risk = 0.5% → Risk amount = $2,500 × 0.005 = **$12.50**
Stop loss = 50 pips
Pip value assumption = $1 per pip (mini lot)

```
Position size = $12.50 ÷ (50 pips × $1/pip) = $12.50 ÷ $50 = 0.25 mini lots
```

**Example 3 — same risk percentage and stop distance, larger account:**

Account = $5,000
Risk = 1% → Risk amount = $5,000 × 0.01 = **$50**
Stop loss = 20 pips (same as Example 1)
Pip value assumption = $1 per pip (mini lot)

```
Position size = $50 ÷ (20 pips × $1/pip) = $50 ÷ $20 = 2.50 mini lots
```

**Comparing Example 1 and Example 3 directly:** both used a 1% risk and a
20-pip stop. The only thing that changed was account size — $1,000 versus
$5,000, a 5× difference — and the resulting position size scaled by
exactly the same factor: 0.50 mini lots versus 2.50 mini lots. This is
the entire point of risk-based position sizing: the position size is a
*result* of your risk decision and your stop distance, not a number you
pick independently and hope for the best with.

**What changes the position size, and what doesn't:** account size, risk
percentage, stop-loss distance, and pip value all directly change the
resulting position size. Your confidence in the trade idea, how
"obvious" the setup looks, or how much you want to make on the trade do
**not** belong in this calculation at all — those are exactly the kind of
emotional inputs Module 7 covers, and they have no place in a position-
sizing formula.

> **Beginner mistake:** doing this calculation once for one trade and
> then reusing the same position size on every future trade, regardless
> of a different stop-loss distance or a different account balance —
> every trade with a different stop distance requires its own
> calculation.

### Lesson 6 — Take Profit & Risk/Reward

Module 4 (Lesson 10) introduced take profit as the price at which a
trader plans to exit a winning trade, and introduced risk-to-reward as a
planning concept. This lesson goes further with the actual numbers.

**Definitions, precisely:**

- **Risk** = the planned dollar loss if the stop loss is reached (Lesson
  2's calculation).
- **Reward** = the planned dollar gain if the take-profit target is
  reached.

**Worked example:**

Risk = $20
Potential reward = $40
Risk-to-reward ratio = $40 ÷ $20 = **1:2**

**More examples, side by side:**

| Risk | Reward | Ratio |
|---|---|---|
| $20 | $20 | 1:1 |
| $20 | $40 | 1:2 |
| $20 | $60 | 1:3 |

**Why risk/reward is a planning metric, not a prediction of outcome:**
per Module 4, Lesson 10, a 1:2 or 1:3 ratio describes the plan *if* the
target is actually reached — it says nothing, by itself, about how often
that happens. A trader could plan a 1:3 ratio on every single trade and
still lose money overall if the stop is hit meaningfully more often than
the target. The next section makes this relationship precise.

**The mathematical relationship between win rate and risk/reward — the
breakeven win rate:** for any given risk-to-reward ratio, there's a
minimum win rate required just to break even, before accounting for
spread or commission. The formula:

```
Breakeven win rate = 1 ÷ (1 + Risk-to-Reward Ratio)
```

| Risk/reward | Breakeven win rate |
|---|---|
| 1:1 | 1 ÷ (1 + 1) = 50.00% |
| 1:2 | 1 ÷ (1 + 2) = 33.33% |
| 1:3 | 1 ÷ (1 + 3) = 25.00% |

**What this means in plain language:** with a 1:2 risk-to-reward ratio, a
trader only needs to win more than roughly a third of their trades to be
profitable over time, before costs. This is exactly why a strategy with a
lower win rate can still be genuinely profitable — a trader winning only
40% of trades at a 1:2 ratio is winning well above their 33.33% breakeven
point. It cuts the other way too: a trader winning 70% of trades with a
very small reward relative to risk can still lose money overall, if their
win rate sits below the breakeven point for that ratio. Lesson
6's companion idea, **expectancy**, makes this fully precise.

> **Beginner mistake:** chasing the highest possible risk-to-reward ratio
> on every trade without checking whether that ratio is realistic for the
> setup — a 1:5 target that's rarely actually reached can produce a worse
> outcome than a realistic 1:1.5 target reached consistently.

### Lesson 7 — Expectancy

**Expectancy** is the average amount a trader can expect to win or lose,
per trade, over a large enough number of trades — it combines win rate
and average win/loss size (Lesson 6) into a single number.

**The formula:**

```
Expectancy = (Win Rate × Average Win) − (Loss Rate × Average Loss)
```

**Worked example:**

Win rate = 40%
Average win = $50
Loss rate = 60% (1 − win rate)
Average loss = $25

```
Expectancy = (0.40 × $50) − (0.60 × $25)
           = $20 − $15
           = +$5 per trade
```

**What this actually means:** over a large enough sample of trades that
each followed this same win rate and average win/loss size, this trader
would expect to average about $5 of profit per trade. It does **not**
mean any individual trade makes $5 — a single trade is either a $50 win,
a $25 loss, or (per Lesson 3) something close to but not exactly one of
those, because of slippage. Expectancy only becomes meaningful as a
long-run average, the same way a casino's edge only shows up over many
hands, not any single one. Module 9 (Backtesting & Trading Journal) is
where you'll learn to actually track your own real win rate and average
win/loss to calculate this for yourself.

**A second example — lower win rate, higher reward-to-risk, still
positive:**

Win rate = 35%, Average win = $60, Loss rate = 65%, Average loss = $20

```
Expectancy = (0.35 × $60) − (0.65 × $20) = $21 − $13 = +$8 per trade
```

This connects directly to Lesson 6: this trader wins fewer than half
their trades, but because their average winner (a roughly 1:3
risk-to-reward relationship here) is so much larger than their average
loser, the expectancy is still clearly positive — actually higher than
the first example, despite the lower win rate.

**A third example — a cautionary case: a high win rate that's still
unprofitable:**

Win rate = 70%, Average win = $15, Loss rate = 30%, Average loss = $40

```
Expectancy = (0.70 × $15) − (0.30 × $40) = $10.50 − $12.00 = −$1.50 per trade
```

Despite winning 70% of trades — a win rate that sounds excellent in
isolation — this trader has a small average winner and a much larger
average loser, and the expectancy is negative. A high win rate, on its
own, says nothing about profitability without also knowing the average
size of the wins and losses.

**Why this is a mathematical expectation, not a promise:** expectancy is
calculated from a win rate and average win/loss that are themselves
estimates — usually based on a trader's historical results (Module 9) or,
before any real track record exists, an honest, conservative assumption.
A positive expectancy calculated from past results does not guarantee
future results will match it; market conditions change, and small samples
can be misleading (a handful of trades tells you very little). This
number is a planning and evaluation tool, not a certainty about any
future trade or any future stretch of trades.

> **Beginner mistake:** looking only at win rate when judging whether a
> strategy is "good," without also weighing the average size of wins
> versus losses — as the third example shows, a high win rate can still
> add up to a losing strategy.

### Lesson 8 — Drawdown

**Drawdown** is the decline in an account's value from a previous peak,
usually expressed as a percentage.

**Why does it matter?** Drawdown is the practical measure of how much
pain a trading approach can put an account through before it recovers —
and, critically, larger drawdowns require **disproportionately** larger
gains just to get back to even. This next calculation is one of the most
important in this entire module.

**The recovery formula:**

```
Required recovery % = (1 ÷ (1 − Loss %)) − 1
```

**Verified recovery table:**

| Loss | Remaining balance | Required recovery |
|---|---|---|
| 10% | 90% | 1 ÷ 0.90 − 1 = **11.1%** |
| 20% | 80% | 1 ÷ 0.80 − 1 = **25.0%** |
| 30% | 70% | 1 ÷ 0.70 − 1 = **42.9%** |
| 50% | 50% | 1 ÷ 0.50 − 1 = **100.0%** |

**Worked example:** a $1,000 account that drops to $700 has suffered a
30% drawdown. To get back to $1,000, that $700 needs to grow by $300 —
and $300 as a percentage of the *current* $700 balance is 42.9%, not 30%.
The bigger the loss, the more this gap between "how much was lost" and
"how much is needed to recover" widens — at a 50% loss, the account needs
to *double* (a 100% gain) just to break even.

**The lesson this table teaches:** large losses require disproportionately
larger gains to recover. This is precisely why Lessons 2 and 5's
disciplined, calculated position sizing matters so much — it's not about
avoiding every loss (impossible), it's about keeping any single loss, or
run of losses, small enough that recovery stays realistic rather than
requiring an outsized, harder-to-achieve gain.

> **Beginner mistake:** treating a 20% drawdown and the 25% gain needed to
> recover from it as roughly the same number, rather than recognizing
> that the required recovery is always larger than the original loss
> percentage — and grows much faster as losses get bigger.

### Lesson 9 — Losing Streaks

A **losing streak** is a run of consecutive losing trades — an
inevitable, normal part of trading, even for a strategy with a genuinely
positive expectancy (Lesson 7), because expectancy is a long-run average,
not a guarantee about the order individual trades happen in.

**Worked example — 5 consecutive losses at a fixed 1% risk, $2,000
account:**

| Loss # | Risk (1% of prior balance) | New balance |
|---|---|---|
| 1 | $20.00 | $1,980.00 |
| 2 | $19.80 | $1,960.20 |
| 3 | $19.60 | $1,940.60 |
| 4 | $19.41 | $1,921.19 |
| 5 | $19.21 | $1,901.98 |

Total drawdown after 5 losses: **4.90%**. Recovery needed to return to
$2,000: **5.15%** (per Lesson 8's formula).

**Why the dollar amount shrinks with each loss under percentage-based
risk:** because 1% is calculated from the *current* balance each time,
not the original balance, each individual loss is slightly smaller in
dollar terms than the one before it — a losing streak under
percentage-based risk erodes an account more gently than the same streak
would under a fixed dollar risk that never adjusts downward.

**Extending the same account through longer streaks:**

| Consecutive losses | Total drawdown | Recovery needed |
|---|---|---|
| 3 | 2.97% | 3.06% |
| 5 | 4.90% | 5.15% |
| 8 | 7.73% | 8.37% |

Even 8 losses in a row — a genuinely uncomfortable stretch to sit
through — costs this account well under 10% at a 1% fixed risk, and
stays comfortably inside the manageable end of Lesson 8's recovery table.
This is what disciplined risk sizing is actually for.

**What a losing streak does NOT automatically mean:**

- **It does not automatically mean the strategy is broken.** A losing
  streak is a statistically normal outcome for many strategies with
  genuinely positive expectancy — the streak alone isn't evidence one way
  or the other. Module 9 covers evaluating a strategy properly, over a
  meaningful sample, rather than reacting to any single streak.
- **It does not mean you should increase risk to "win it back faster."**
  Raising the risk percentage after losses increases the damage from the
  *next* loss too, at exactly the moment discipline matters most.
- **It does not mean you should revenge trade.** Entering a trade
  specifically to recover a recent loss, rather than because the setup
  itself justifies it, is a psychological response — covered in full in
  Module 7 — not a risk-management decision.
- **It does not mean you should abandon all your rules.** Discarding
  position sizing, stop-loss discipline, or your own risk rules (Lesson
  11) in reaction to a losing streak tends to turn a manageable, expected
  drawdown into a much larger, avoidable one.

> **Beginner mistake:** treating a short losing streak as proof that
> something is wrong and needs to change immediately — a handful of
> trades is a very small sample, and Module 9 covers exactly how large a
> sample needs to be before drawing a real conclusion.

### Lesson 10 — Leverage & Margin

Module 1 introduced leverage and margin briefly. This lesson makes the
distinction between leverage, margin, and risk fully explicit — because
confusing these three is one of the most damaging mistakes a beginner can
make.

**Definitions, kept separate on purpose:**

- **Leverage** is a ratio (like 1:100) describing how much larger a
  position you can control relative to the capital you put up.
- **Margin** is the actual amount of your account's capital required to
  open and hold a specific position, given the leverage in use.
- **Risk** is the amount you could actually lose on a trade, determined
  by your position size and your stop-loss distance (Lessons 4–5) — not
  by leverage or margin at all.

**The critical distinction this lesson exists to make:** leverage and
margin affect how much capital is *required to open* a position. They do
not, by themselves, determine your *planned* risk on that trade — your
position size and your stop-loss distance do. It's entirely possible to
use high leverage (meaning a small margin requirement) while still
risking a small, carefully calculated percentage of your account, exactly
as it's possible to use low leverage and still take on far more risk than
intended, if the position size and stop distance aren't controlled.

**Worked example — margin required:**

Position: 1 standard lot (100,000 units) of EUR/USD at an exchange rate
of 1.10000
Notional value = 100,000 × 1.10000 = **$110,000**

At 1:100 leverage:
```
Margin required = $110,000 ÷ 100 = $1,100
```

**The same position at different leverage ratios:**

| Leverage | Margin required |
|---|---|
| 1:50 | $110,000 ÷ 50 = $2,200.00 |
| 1:100 | $110,000 ÷ 100 = $1,100.00 |
| 1:200 | $110,000 ÷ 200 = $550.00 |
| 1:500 | $110,000 ÷ 500 = $220.00 |

**Now compare this to the position's planned risk**, using a 30-pip stop
loss and a simplified $10-per-pip standard-lot pip value (Module 1, Lesson
7):

```
Planned risk = 30 pips × $10/pip = $300
```

Notice that this $300 planned-risk figure does not appear anywhere in
the margin table above, and doesn't change as leverage changes. The
margin required to *open* this exact position ranges from $220 to $2,200
depending on leverage — but the risk if the stop loss is hit stays $300
regardless, because risk is set by the stop-loss distance and pip value,
not by the leverage ratio.

**Why excessive leverage is still dangerous, even though it doesn't
directly set your risk:** high leverage lowers the margin required to
open a given position — which makes it easier to open a position size
far larger than your account can safely support, without necessarily
noticing, because the margin requirement alone can look small and
affordable. The danger isn't leverage itself; it's that high leverage
removes the natural brake that a large margin requirement would otherwise
provide against oversizing a position. Position sizing (Lessons 4–5) is
what actually controls risk — leverage just changes how much capital is
tied up achieving that position size.

> **Beginner mistake:** treating a low margin requirement as a sign that
> a position is "safe," instead of separately checking what that position
> actually risks in dollar terms if the stop loss is hit.

### Lesson 11 — Capital Preservation

**Capital preservation** means treating "don't run out of money to
trade with" as the actual first goal of a trading approach — ahead of,
and as the precondition for, any goal about growing the account.

This lesson turns that idea into specific, actionable rules rather than
general encouragement:

- **Define your maximum risk before entering, every time.** Lessons 2
  and 5's calculation happens before the trade is opened, not
  after — deciding risk in advance is what makes it a plan rather than a
  reaction.
- **Avoid position sizes larger than your calculation supports.** A
  position sized from "how confident I feel" rather than from Lesson 5's
  formula is not controlled risk, regardless of the outcome on any single
  trade.
- **Respect your stop loss once it's set** — per Lesson 3, moving it
  further away or removing it entirely changes your risk without a fresh,
  deliberate decision to accept that new risk.
- **Avoid increasing risk after a loss.** Per Lesson 9, a losing streak
  is not a signal to risk more per trade — that response tends to turn a
  manageable drawdown into a much larger one.
- **Avoid revenge trading.** Entering a trade to "make back" a recent
  loss, rather than because the setup itself justifies the entry, is
  covered fully in Module 7, but the risk-management version of this rule
  is simple: a trade's size and entry should never be influenced by a
  previous trade's outcome.
- **Understand your own drawdown, in real numbers.** Per Lesson 8, know
  what percentage loss your account has actually experienced at any
  point, and what recovery that specific number requires — not a vague
  sense of "it's been a rough week."
- **Keep records.** Without a record of your actual trades, you can't
  calculate your real win rate, average win/loss, or expectancy (Lesson
  7) — you're only guessing. Module 9 covers building this properly.
- **Evaluate performance over a meaningful sample, not a handful of
  trades.** Per Lesson 9, a short losing (or winning) streak tells you
  very little on its own — Module 9 covers what a meaningful sample
  actually looks like.

None of this is generic encouragement to "be careful." Each rule above
is a specific, checkable behavior, directly derived from a calculation or
concept earlier in this module.

> **Beginner mistake:** treating capital preservation as something to
> think about only after a big loss has already happened, rather than as
> the standing precondition every single trade is sized against.

### Lesson 12 — Building Your Own Risk Rules

This lesson turns the whole module into something you actually fill in
for yourself — a personal, written risk framework. This course
deliberately does not fill in the values below for you; the right values
depend on your own capital, strategy, experience, and risk tolerance,
exactly as Lesson 2 established for risk percentage specifically.

**A template to fill in for yourself:**

```
Account: ___________________________
Maximum risk per trade: ____________
Maximum daily loss: ________________
Maximum weekly loss: _______________
Maximum simultaneous exposure: _____
Maximum consecutive losses before review: ____
Stop-loss rule: ____________________
Position-sizing rule: ______________
Conditions under which trading stops: ______
Review schedule: ___________________
```

**Why each field matters, without dictating a value:**

- **Maximum risk per trade** — Lesson 2's percentage, chosen deliberately
  rather than guessed.
- **Maximum daily/weekly loss** — a circuit breaker beyond any single
  trade's risk: a predefined total loss that, if reached, means you stop
  trading for the day or week rather than continuing to trade through a
  bad stretch.
- **Maximum simultaneous exposure** — how much total risk you're
  comfortable having open across multiple positions at once, not just on
  any one trade in isolation.
- **Maximum consecutive losses before review** — a specific number
  (Lesson 9 showed 3, 5, and 8 as examples, not recommendations) after
  which you pause to review your process, rather than mechanically
  continuing or mechanically stopping forever.
- **Stop-loss rule** — how you decide stop placement (Lesson 3 and
  Module 4, Lesson 10), stated specifically enough that you could follow
  it without having to decide in the moment.
- **Position-sizing rule** — a commitment to actually run Lesson 5's
  calculation every time, rather than eyeballing a lot size.
- **Conditions under which trading stops** — specific, predefined
  triggers (hitting a daily loss limit, reaching a consecutive-loss count,
  a major news event from Module 5 you've decided to sit out) rather than
  an in-the-moment judgment call made under pressure.
- **Review schedule** — how often you step back and evaluate your actual
  results (Module 9) rather than only reacting trade by trade.

**Why this course won't dictate universal values here:** a trader with a
small account and little experience, a trader with a larger account and a
long track record, and a trader running multiple strategies at once all
have legitimately different answers to every field above. What matters is
that each field has a specific, written answer *before* it's needed — not
that the answer matches anyone else's.

> **Beginner mistake:** treating this template as an exercise to think
> about once and never revisit — a risk framework is meant to be written
> down, followed consistently, and reviewed periodically (Module 9), not
> reconsidered from scratch under pressure in the middle of a trade.

---

## Common Beginner Mistakes (Module Recap)

Gathered here in one place for quick reference — each is explained fully
in its related lesson above:

1. Choosing a position size first and discovering the dollar risk
   afterward, instead of calculating risk first (Lesson 1).
2. Picking a risk percentage once and never reconsidering it — or raising
   it after a loss (Lesson 2).
3. Treating a placed stop loss as an absolute guarantee against slippage
   (Lesson 3).
4. Using the same pip-value figure for every pair, position size, and
   account currency (Lesson 4).
5. Reusing one position size across trades with different stop distances
   or account balances (Lesson 5).
6. Chasing the highest possible risk-to-reward ratio regardless of
   realism (Lesson 6).
7. Judging a strategy by win rate alone, ignoring average win/loss size
   (Lesson 7).
8. Treating a drawdown percentage and its required recovery percentage as
   roughly the same number (Lesson 8).
9. Treating a short losing streak as proof a strategy is broken (Lesson
   9).
10. Treating a low margin requirement as a sign a position is "safe"
    (Lesson 10).
11. Thinking about capital preservation only after a big loss has already
    happened (Lesson 11).
12. Writing a personal risk-rules template once and never revisiting it
    (Lesson 12).

## Practical Examples

**Example A — Full position-sizing walkthrough.** A trader has a $3,000
account and decides on 1% risk per trade: $3,000 × 0.01 = $30. Their
trade idea (built using Module 4's framework) has a stop loss 25 pips
away. Using a $1-per-pip mini-lot pip-value assumption: position size =
$30 ÷ (25 × $1) = 1.20 mini lots. Their target, based on a nearby
structural level, is 50 pips away — giving a reward of 50 × $1 × 1.20 =
$60, against the $30 risk: a 1:2 risk-to-reward ratio, exactly matching
Lesson 6's framework.

**Example B — A losing streak handled correctly.** The same trader above
loses four trades in a row at the same 1% risk. Following Lesson 9's
table pattern, their account drawdown after four losses stays under 4%,
well inside a manageable range. Per Lesson 9 and Lesson 11, they do not
raise their risk percentage to recover faster, do not abandon their
stop-loss rule, and instead check their written risk rules (Lesson 12):
their maximum-consecutive-losses-before-review field says 5, so they
continue trading their plan for now, while making a note to review their
process if a fifth loss follows.

**Example C — Margin availability is not the same question as risk.** A
trader's platform shows they have more than enough free margin to open a
3-standard-lot EUR/USD position at 1:200 leverage. Before opening it,
they run Lesson 5's calculation using their actual account size and 1%
risk rule, and find that a 3-lot position with their planned stop-loss
distance would risk roughly 8% of their account — far beyond their own
rule. Per Lesson 10, the fact that the position was affordable in margin
terms said nothing about whether it was appropriately sized in risk
terms; they reduce the position size to match their actual 1% risk
calculation instead.

## Key Takeaways

- Risk management doesn't make a trade idea correct — it controls how
  much a wrong idea costs, so a string of losses doesn't threaten your
  ability to keep trading.
- The core chain — account size → risk % → money at risk → stop-loss
  distance → position size — is the calculation this entire module builds
  around.
- Position size is a *result* of your risk decision and stop distance,
  not a number chosen independently; pip value depends on the pair,
  position size, account currency, and exchange rate, never one universal
  figure.
- Risk-to-reward describes a plan, not a guaranteed outcome; the
  breakeven win rate formula (1 ÷ (1 + R:R)) shows exactly how good a win
  rate needs to be for a given ratio to be profitable.
- Expectancy combines win rate and average win/loss into one number — a
  long-run mathematical average, never a promise about the next trade.
- Larger drawdowns require disproportionately larger percentage gains to
  recover — a 50% loss requires a 100% gain just to break even.
- A losing streak is a normal, expected event, even for a strategy with
  positive expectancy — it doesn't automatically mean the strategy is
  broken, or justify increasing risk, revenge trading, or abandoning your
  rules.
- Leverage and margin determine how much capital is required to open a
  position; your position size and stop-loss distance — not leverage —
  determine your actual planned risk.
- Planned risk, actual realized loss, slippage, spread, and commission
  are related but distinct — the real world can move your result slightly
  around your calculated plan.
- A personal, written set of risk rules turns every concept in this
  module into a specific, checkable standard you can actually follow —
  not a generic intention to "be careful."

## Before You Move On

This module ends with three things to actually complete before starting
Module 7 — not just read:

1. Work through **`02-exercises.md`** in this module's folder.
2. Complete the **`03-quiz.md`** knowledge checkpoint, then check your
   answers in **`04-answer-key.md`**.
3. Go through the full **`05-checklist.md`** and confirm every item
   honestly before continuing.

Nothing in this module claims that any risk percentage, position-sizing
formula, or risk-to-reward ratio guarantees profitability — every
calculation here controls how much a trade can cost you, never whether
it wins. If any quiz question or checklist item doesn't feel solid,
re-read that lesson before moving forward — Module 7 covers the
psychology behind actually following these rules under pressure, and
assumes you can already run every calculation in this module
comfortably.
