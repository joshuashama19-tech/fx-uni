---
module: 3
title: Technical Analysis
subtitle: Tools for Interpreting Price, Not Predicting It
status: complete
last_updated: 2026-09-19
---

# Module 3 — Technical Analysis

*"Tools for Interpreting Price, Not Predicting It"*

## Module Introduction

Module 2 taught you to read a chart with your own eyes — candles,
trends, support and resistance, structure. Everything in this module is
built directly on top of that skill. Technical analysis is simply a
collection of tools that take the same price data you already know how
to read and process it in a specific way — averaging it, measuring how
fast it's moving, marking mathematically-derived levels — to give you
another lens on the same picture.

That's an important framing to hold onto through this whole module:
these are *lenses*, not oracles. A moving average doesn't know where
price is going next. RSI doesn't know either. Neither does MACD, nor
Fibonacci, nor any chart pattern you're about to learn to recognize.
Every one of them is built from *past* price — they summarize what
already happened, in a way that can usefully inform how you interpret
the present. None of them can see the future, and this module will say
so explicitly, over and over, because it's the single most important
thing to understand correctly before you touch any of these tools.

This module teaches you how each tool works and how to read it — not a
system, not a strategy, not a set of rules that tells you when to enter
or exit a trade. Module 4 goes deep on price action as a trading
approach. Module 6 teaches risk management. Module 7 covers the
psychology of actually using any of this under pressure. Module 8 is
where you'll eventually build a written trading plan. This module's job
is narrower and comes first: understand what these tools are, what they
calculate, what they can tell you, and — just as important — what they
can't.

## Learning Objectives

By the end of this module, you will be able to:

- Explain what technical analysis is and what it can and can't tell you.
- Draw and interpret a basic trendline.
- Explain what a moving average calculates, what its period means, and
  why different periods behave differently.
- Explain momentum in plain language, and how it differs from direction.
- Interpret an RSI reading, including what overbought and oversold
  actually mean (and don't mean).
- Explain what MACD represents and how to read its basic signals.
- Calculate a Fibonacci retracement level and explain what it represents.
- Recognize several common chart patterns and candlestick patterns and
  explain what context they need.
- Explain confluence and evaluate a realistic multi-factor example.
- Describe the shared limitations every technical indicator has.
- Explain why loading a chart with too many indicators causes problems,
  not confidence.
- Walk through a basic, honest technical-analysis workflow from start to
  finish.

---

### Lesson 1 — What Technical Analysis Is

**Technical analysis** is the practice of studying price data — mainly
through charts, and through tools derived mathematically from price —
to inform trading decisions, as opposed to studying news and economic
data directly (that's fundamental analysis, covered in Module 5).

You've already been doing a basic form of technical analysis since
Module 2: reading candles, identifying trends, spotting support and
resistance. This module adds a further layer of tools on top of that
same skill — trendlines, moving averages, momentum-based indicators like
RSI and MACD, Fibonacci retracements, and recognizable chart and
candlestick patterns.

**Why does it matter?** Every tool in this module answers the same
underlying question in a different way: *given everything that's
happened on this chart so far, what does that suggest about the current
balance between buyers and sellers?* None of them answer a different,
much bigger question that no tool can honestly answer: *what will
definitely happen next?* Keeping that distinction clear is what separates
using technical analysis as an interpretation framework from misusing it
as a prediction machine.

**What a beginner would actually see:** open any charting platform and
you'll find a menu of dozens, sometimes hundreds, of available
indicators. That can look overwhelming, or worse, it can look like
"more indicators = more insight." Neither reaction is warranted — this
module deliberately covers a focused, well-established set, and Lesson
12 explains directly why piling on more than that tends to hurt rather
than help.

> **Beginner mistake:** treating technical analysis as a search for the
> one tool or setting that "works," rather than as a set of lenses for
> interpreting price that each come with real, permanent limitations —
> covered honestly throughout this module, not glossed over.

### Lesson 2 — Trendlines

A **trendline** is a straight line drawn on a chart connecting a series
of swing lows (in an uptrend) or swing highs (in a downtrend), used to
visualize the trend you already learned to identify in Module 2.

**How it works:** in an uptrend — remember, a sequence of higher highs
and higher lows — you draw a line connecting at least two swing lows,
extending it forward. If a third swing low touches or nearly touches that
same line, the trendline gains a bit more credibility as a level the
market is respecting. The mirror version in a downtrend connects swing
highs instead.

**Example:** Suppose EUR/USD's swing lows over three weeks are 1.08200,
then 1.08400, then 1.08550, each one higher than the last (a
higher-lows sequence, per Module 2 Lesson 8). Connecting the first two
points with a straight line and extending it forward, the third low
(1.08550) lands almost exactly on that extended line. That's a trendline
being **respected** — each pullback finding support roughly along the
same rising line, rather than at a random, unrelated price.

**What a beginner would actually see:** a rising or falling diagonal
line that price keeps bouncing off of, similar in spirit to the
horizontal support/resistance zones from Module 2, just tilted to follow
a trend instead of sitting flat.

> **Note:** a trendline is drawn by a person, using judgment about which
> swing points to connect — two different traders can reasonably draw
> two slightly different trendlines on the same chart. It's a visual
> guide, not a precise mathematical level.

> **Beginner mistake:** forcing a trendline to fit by choosing whichever
> points make the line look clean, rather than connecting the swing
> points that are actually there — and then treating a broken trendline
> as automatically meaning the trend has reversed, when a single break
> is only a hint worth watching, not a confirmed reversal.

### Lesson 3 — Moving Averages

A **moving average** takes the average closing price over a fixed number
of recent periods, and plots that average as a smooth line on the chart,
recalculated fresh with each new candle.

The **period** is how many candles are averaged together. A "20-period"
moving average on a daily chart averages the last 20 daily closes. A
"20-period" moving average on a 1-hour chart averages the last 20 hourly
closes instead — same period, different amount of real time, because it
depends on the timeframe you're viewing (Module 2, Lesson 7).

**Example (Simple Moving Average, or SMA):** Take six consecutive daily
EUR/USD closes: 1.08300, 1.08450, 1.08600, 1.08550, 1.08700, 1.08750.
The **5-period SMA**, using the most recent 5 of those closes (excluding
the oldest), is:

(1.08450 + 1.08600 + 1.08550 + 1.08700 + 1.08750) ÷ 5 = **1.08610**

As a new day's close comes in, the oldest close drops out of the
calculation and the newest one enters — the average "moves" forward one
period at a time, which is where the name comes from.

**How it smooths price:** because it's an average of several periods,
a moving average reacts more slowly than the raw price line, filtering
out a lot of the candle-to-candle noise Module 2 discussed and leaving
a cleaner sense of the broader direction.

**Common uses:** traders often watch whether price is trading above or
below a moving average as a rough trend filter, and sometimes treat the
moving average line itself as a dynamic, moving area of potential
support or resistance, the same way a horizontal level was in Module 2 —
though, like those levels, it's a zone of possible reaction, not a
guarantee.

**Why different periods matter:** a short period (like 10) hugs price
closely and reacts quickly to recent moves, but can whipsaw — change
direction — often in a choppy market. A long period (like 200) is much
smoother and slower to turn, useful for a broad sense of direction, but
it lags well behind recent price changes. Neither length is "correct" —
they show you different things, and traders often watch more than one
length at once for exactly that reason.

**Limitations:** a moving average is built entirely from *past* closes —
it always lags the current price to some degree, more so the longer its
period. It can also produce misleading signals in a ranging market
(Module 2, Lesson 9), where price repeatedly crosses back and forth over
it without any real trend developing.

> **Note:** this course focuses on the Simple Moving Average (SMA) for
> worked examples because it's the most transparent to calculate by
> hand. Many platforms default to an **Exponential Moving Average
> (EMA)** instead, which weights recent closes more heavily than older
> ones, making it react a bit faster to new price changes. The
> interpretation principles in this lesson apply to both — only the
> weighting differs.

> **Beginner mistake:** assuming a longer-period moving average is
> always "better" because it looks smoother, without recognizing that
> smoother also means slower to reflect what price is actually doing
> right now.

### Lesson 4 — Understanding Momentum

Before RSI and MACD make sense, **momentum** needs to make sense first,
in plain language.

Momentum, in everyday terms, is about *how strongly and how quickly*
something is moving — not just whether it's moving up or down. Picture
two cars both traveling in the same direction: one cruising steadily,
the other accelerating hard. Both are moving the same direction, but
they have very different momentum. Price behaves the same way: EUR/USD
can be rising slowly and steadily, or rising sharply and quickly — same
direction, different momentum.

**Why does it matter?** Direction alone (which Module 2 already taught
you to read) doesn't tell you whether a move is gaining strength,
losing strength, or running out of steam. Momentum tools exist to put a
number on that — not to replace reading direction, but to add a second
dimension to it.

**What a beginner would actually see:** on a chart, strengthening
momentum often looks like larger, more decisive candles with small wicks
moving further per candle (Module 2, Lesson 5). Weakening momentum often
looks like candles getting smaller, with longer wicks and less net
progress per candle — even while price is technically still moving in
the same direction, the way Lesson 6 of Module 2 described a strong move
"losing momentum" and pausing.

**How it works, mechanically:** the two momentum tools in this module,
RSI and MACD, both work by comparing recent price changes to each other
in different ways — RSI compares the size of recent gains to the size of
recent losses; MACD compares the relationship between a faster and a
slower moving average. Both are ways of measuring the same underlying
idea introduced above: not just where price is, but how forcefully it
got there.

> **Beginner mistake:** treating "momentum" and "direction" as the same
> thing. A market can be moving up (direction) while momentum is
> actually fading — which is exactly the kind of situation RSI and MACD
> are built to help you notice.

### Lesson 5 — RSI (Relative Strength Index)

**RSI** measures momentum by comparing the size of recent upward price
changes to the size of recent downward price changes, and expresses the
result as a single number on a **0 to 100 scale**.

**How it's calculated, simplified:** over a set number of recent
periods, add up all the *gains* (positive changes) and separately add up
all the *losses* (negative changes, as positive numbers). Divide each
sum by the number of periods to get an average gain and an average loss.
Divide the average gain by the average loss to get a ratio, then convert
that ratio to the 0–100 scale using the formula `RSI = 100 − (100 ÷ (1 +
ratio))`. Real platforms typically use a **14-period** RSI by default;
the worked example below uses a shorter period purely to keep the
arithmetic visible.

**Example (simplified, 5-period):** using the same six closes from
Lesson 3 — 1.08300, 1.08450, 1.08600, 1.08550, 1.08700, 1.08750 — the
five period-to-period changes are: +15 pips, +15 pips, −5 pips, +15
pips, +5 pips.

| Period | Change | Gain | Loss |
|---|---|---|---|
| 1 | +15 pips | 15 | 0 |
| 2 | +15 pips | 15 | 0 |
| 3 | −5 pips | 0 | 5 |
| 4 | +15 pips | 15 | 0 |
| 5 | +5 pips | 5 | 0 |

Average gain = (15+15+0+15+5) ÷ 5 = 50 ÷ 5 = **10 pips**. Average loss =
(0+0+5+0+0) ÷ 5 = 5 ÷ 5 = **1 pip**. Ratio = 10 ÷ 1 = **10**. RSI = 100 −
(100 ÷ (1 + 10)) = 100 − (100 ÷ 11) = 100 − 9.09 = **90.9**.

**What that number means:** an RSI near 90.9 reflects a period where
gains have heavily outweighed losses — in this simplified example, four
up periods and only one, small, down period. RSI is commonly read using
rough reference zones: above **70** is often called **overbought**,
below **30** is often called **oversold**, with the area in between
considered neutral.

**Why overbought does NOT automatically mean "sell," and oversold does
NOT automatically mean "buy":** "overbought" only means recent buying
has been strong relative to recent selling — it does not mean price is
guaranteed to fall, or even likely to fall immediately. A strong,
healthy uptrend can push RSI above 70 and *stay* there for an extended
stretch while price keeps climbing. Treating "overbought" as an
automatic sell signal is one of the most common and costly
misreadings of this indicator. The same logic applies in reverse for
"oversold" in a strong downtrend.

**Divergence, briefly:** sometimes price makes a new high while RSI
makes a *lower* high than its previous one — price and momentum
disagreeing with each other. This is called **divergence**, and some
traders treat it as a hint that the move may be losing underlying
strength even though price is still climbing. It is exactly that — a
hint worth noting, not a signal that reliably predicts a reversal by
itself; divergence can persist for a long time before anything changes,
or resolve without any reversal at all.

> **Beginner mistake:** selling purely because RSI crossed above 70, or
> buying purely because it crossed below 30, without considering the
> broader trend and structure already covered in Module 2.

### Lesson 6 — MACD (Moving Average Convergence Divergence)

**MACD** is a momentum tool built directly from moving averages — it
measures the relationship between a faster (shorter-period) moving
average and a slower (longer-period) one. The name describes exactly
that: when the two moving averages move toward each other, they're
**converging**; when they move apart, they're **diverging** — and that
converging/diverging relationship is what the MACD line, described
below, actually plots.

**Its components, at a beginner level:**

- **MACD line** — the difference between a fast moving average and a
  slow moving average. When the fast average is above the slow average,
  the MACD line is positive; when it's below, the MACD line is negative.
- **Signal line** — a further, smoothed average of the MACD line itself,
  used as a reference to compare the MACD line against.
- **Histogram** — the difference between the MACD line and the signal
  line, usually drawn as bars. Growing bars suggest the gap between the
  two is widening (momentum strengthening); shrinking bars suggest it's
  narrowing (momentum fading).

**Example (simplified illustration):** using simple moving averages
instead of the exponential moving averages real platforms typically use
— to show the mechanism without the more complex math — take the same
six EUR/USD closes again. A 3-period SMA (the "fast" average, using the
most recent 3 closes) is (1.08550 + 1.08700 + 1.08750) ÷ 3 = **1.08667**.
A 5-period SMA (the "slow" average, using the most recent 5 closes) is,
from Lesson 3, **1.08610**. A simplified MACD line value is the
difference: 1.08667 − 1.08610 = **+0.00057**, or about **+5.7 pips** —
positive, meaning the faster average is currently above the slower one,
consistent with the recent upward bias already visible in this same
data in Lesson 5's RSI example.

**Common interpretations:** a MACD line crossing *above* its signal line
is often read as a shift toward upward momentum; crossing *below* is
often read the opposite way. The MACD line crossing above or below the
zero line is sometimes read as the faster average crossing the slower
one entirely — similar in spirit to a moving-average crossover. A
histogram that's shrinking, even while price is still moving in the same
direction, can suggest fading momentum — much like the RSI divergence
idea from Lesson 5.

**Limitations:** MACD is built entirely from moving averages, so it
inherits their core limitation — it lags price, sometimes generating a
crossover signal well after the move it's describing has already
happened. Like RSI, it can also produce frequent, unreliable crossovers
in a ranging market.

> **Beginner mistake:** reacting to every single MACD crossover as if it
> were an independent trading signal, without asking whether the broader
> trend and structure from Module 2 actually support that read.

### Lesson 7 — Fibonacci Retracement

A **retracement** is a partial pullback against a prior price move,
measured as a percentage of that move. **Fibonacci retracement** is a
tool that marks specific percentage levels — derived from a mathematical
sequence — on a chart, as reference areas where a pullback might find
support or resistance.

**Where the levels come from, briefly:** the percentages are derived
from ratios found in the Fibonacci number sequence (where each number is
the sum of the two before it) — most notably **61.8%**, sometimes called
the "golden ratio," along with its derivatives **38.2%** and **23.6%**.
**50%** is included by convention (it isn't technically a Fibonacci
ratio) because retracements to the halfway point of a move are common
enough in practice that most platforms include it alongside the others.
This course doesn't go deeper into the mathematics of the sequence
itself — what matters practically is knowing the common levels and how
they're used, not deriving them from scratch.

**How a level is calculated:** pick a swing low and a swing high
(Module 2, Lesson 8). For a retracement measured down from a swing high
after an upward move, the formula is: `level = high − ((high − low) ×
ratio)`.

**Example:** suppose EUR/USD swings from a low of **1.08000** up to a
high of **1.09000** — a range of 0.01000, or 100 pips. The common
retracement levels are:

| Level | Calculation | Price |
|---|---|---|
| 23.6% | 1.09000 − (0.01000 × 0.236) | **1.08764** |
| 38.2% | 1.09000 − (0.01000 × 0.382) | **1.08618** |
| 50.0% | 1.09000 − (0.01000 × 0.500) | **1.08500** |
| 61.8% | 1.09000 − (0.01000 × 0.618) | **1.08382** |
| 78.6% | 1.09000 − (0.01000 × 0.786) | **1.08214** |

**How traders use them:** as reference areas to watch if price pulls
back after that upward move — similar in purpose to the support and
resistance zones from Module 2, just placed using this specific
mathematical method instead of purely by eye. A pullback stalling near
the 61.8% level, for instance, is something a trader watching this tool
might note with interest.

**Why the tool is subjective and doesn't guarantee a reversal:**
different traders can reasonably select different swing points to
measure from, which shifts every level that follows — there's no single
"official" high and low on most charts. And even from an identically
drawn measurement, price has no obligation to react at any of these
levels at all; they are areas of *possible* interest based on a
historical mathematical pattern, not a mechanism that causes price to
turn.

> **Beginner mistake:** treating a Fibonacci level as an exact price
> that price "must" respect, rather than an approximate reference zone —
> and forgetting that a differently-drawn swing measurement produces
> different levels entirely.

### Lesson 8 — Chart Patterns

**Chart patterns** are recognizable shapes formed by price over time,
built from the same swing highs, swing lows, and structure concepts from
Module 2 — this lesson names and organizes a few well-established shapes
rather than introducing new underlying mechanics.

**Double top.** What it looks like: price rises to a high, pulls back,
rises again to a *similar* high, and turns back down a second time —
two peaks at roughly the same level. What it represents: two failed
attempts to push past the same resistance area. Where it commonly
appears: at the end of an uptrend. How traders may interpret it: as a
possible sign that upward momentum is struggling to continue at that
level. Why context matters: a double top that forms after a long,
established uptrend is read very differently from two random peaks
inside a choppy range that was never trending in the first place.

**Double bottom.** The mirror image of a double top — two similar lows,
commonly appearing at the end of a downtrend, sometimes read as a sign
downward momentum is struggling to continue.

**Head and shoulders.** What it looks like: three peaks, where the
middle peak (the "head") is higher than the two outer peaks (the
"shoulders"), which sit at roughly similar levels to each other. What it
represents: a stronger version of the double-top idea — a market that
pushed to a new high, failed, and then failed again at a lower high.
Where it commonly appears: at the end of an established uptrend. The
inverse pattern (inverse head and shoulders — three troughs, with the
middle one lowest) is the mirror version, commonly appearing at the end
of a downtrend.

**Triangles.** What they look like: a series of swing highs and swing
lows that gradually converge toward a point, as the price range
narrows. A **symmetrical triangle** narrows from both directions; an
**ascending triangle** has a roughly flat top with rising swing lows;
a **descending triangle** has a roughly flat bottom with falling swing
highs. What they represent: a period where the range of price movement
is compressing, often read as a pause rather than a clear directional
signal on its own.

**Why context matters, generally:** every pattern above is defined by
the same swing-high/swing-low language from Module 2, and every one of
them can appear and then simply fail to do what traders commonly expect
— a double top can be followed by price pushing to new highs anyway; a
triangle can break in either direction, or not break cleanly at all.
None of these shapes are announcements of what happens next — they're
recognizable, commonly-discussed shapes worth knowing, read alongside
everything else on the chart, not in isolation.

> **Beginner mistake:** spotting a pattern that resembles one of these
> shapes and treating its "textbook" outcome as expected or likely,
> rather than as one possible interpretation among others.

### Lesson 9 — Candlestick Patterns

Beyond the single-candle reading from Module 2 (body, wicks, bullish or
bearish), certain **candlestick patterns** — specific, named shapes
formed by one or a few candles — are widely recognized and worth being
able to identify.

**Doji.** What it looks like: a candle with a very small or nonexistent
body — the open and close are at or very near the same price — often
with wicks on both sides. What it represents: indecision; buyers and
sellers were both active but neither gained meaningful control by the
close. Where it commonly appears: anywhere, but it draws more attention
after a strong directional move, where it can suggest that move is
pausing.

**Hammer / hanging man.** What it looks like: a small body near the top
of the candle's range, with a long lower wick and little or no upper
wick — the same shape either way. What it represents: price pushed
significantly lower during the period but was bought back up by the
close. Why context matters here specifically: the *same shape* is called
a **hammer** when it appears after a downtrend (where it's sometimes
read as a possible sign of buyers stepping in) and a **hanging man**
when it appears after an uptrend (where it's read differently, as a
possible sign sellers are starting to show up) — the shape alone doesn't
tell you which situation you're in; where it appears does.

**Engulfing candle.** What it looks like: a candle whose body completely
covers, or "engulfs," the body of the candle before it. A **bullish
engulfing** candle is a bullish candle whose body covers the prior
(bearish) candle's body; a **bearish engulfing** candle is the reverse.
What it represents: a potential shift in control from one side to the
other within a short space of time.

**Why context matters, generally:** exactly as with chart patterns, none
of these shapes work as standalone signals. A doji in the middle of a
strong, healthy trend is a much weaker signal than a doji sitting right
at a support or resistance level already identified through Module 2 —
this is precisely the kind of overlap that Lesson 10 (Confluence) builds
on directly.

> **Beginner mistake:** memorizing a pattern's name and its "textbook"
> meaning without checking where it actually appears on the chart — the
> same shape can mean meaningfully different things depending on
> context, as the hammer/hanging man example shows directly.

### Lesson 10 — Confluence

**Confluence** is what you have when multiple, genuinely independent
pieces of information point toward the same interpretation at the same
time — instead of relying on just one tool or observation in isolation.

**Example:** suppose you're looking at EUR/USD and you notice: (1) the
broader trend, per Module 2, is a clear uptrend — higher highs and
higher lows over several weeks; (2) price has pulled back to a
previously-identified support zone; (3) that support zone also happens
to sit almost exactly at the 61.8% Fibonacci retracement level of the
most recent upward swing; and (4) the most recent candle at that zone is
a bullish engulfing candle, following a small doji the candle before it.
Four separate observations — trend context, a support level, a
Fibonacci level, and candlestick behavior — are all pointing toward the
same broad interpretation: this area looks like a place buyers may be
regaining control, consistent with the larger uptrend.

**Why does it matter?** Confluence is a way of checking whether an
interpretation is well-supported by more than one, ideally unrelated,
source of information, rather than resting on a single indicator or
pattern that could easily be noise.

**More confluence does NOT mean certainty.** This has to be stated
directly: even four aligned observations, as in the example above, do
not make the outcome certain, for a few concrete reasons. Some tools are
naturally correlated rather than truly independent — a Fibonacci level
and a support zone drawn on the same price range are, to some extent,
reflecting the same underlying price action rather than two fully
separate pieces of evidence. And even a genuinely well-supported
interpretation is still just that: an interpretation. The market is
free to do something that contradicts every tool on the chart at once.
Confluence can make an interpretation more *coherent* and worth paying
attention to — it cannot make any outcome guaranteed.

> **Beginner mistake:** treating a high-confluence setup as a
> "guaranteed" trade because "everything lines up," rather than as a
> well-supported interpretation that is still, like every interpretation
> in this module, uncertain.

### Lesson 11 — Indicator Limitations

Every tool covered in this module — trendlines, moving averages, RSI,
MACD, Fibonacci, chart and candlestick patterns — shares some limitations
worth stating plainly, together, in one place.

**They're built from the past.** Every one of these tools is calculated
from price that has already happened. None of them have any access to
information about the future — they describe history and the present
moment, nothing more.

**They lag, to different degrees.** Moving averages and MACD are
explicitly built from averages of past prices, so they always trail
current price to some extent. Even RSI, which reacts faster, is still
only describing what has *already* occurred over its lookback period.

**They struggle in ranging markets.** Many of these tools — especially
moving averages and MACD — are built around the idea of a trend, and
tend to produce frequent, contradictory, or "whipsaw" signals when a
market is genuinely ranging (Module 2, Lesson 9) rather than trending.

**They can disagree with each other.** It's entirely normal for RSI to
suggest one thing while MACD suggests another, or for a chart pattern to
point one way while a moving average points another. Disagreement
between tools isn't a malfunction — it reflects real uncertainty in the
market itself.

**They can be tuned to fit the past perfectly, and still fail going
forward.** Adjusting an indicator's settings until it would have
"worked" on old chart data is easy to do and tells you very little about
how it will perform on data that hasn't happened yet — a trap worth
being aware of even at this stage, well before Module 9 covers
backtesting properly.

**Why does it matter?** None of this makes these tools useless — it
makes them tools, with the same kind of honest limitations any
analytical tool has. Understanding these limits is what allows you to
use technical analysis as a genuine aid to interpretation, instead of
mistaking it for a system that removes uncertainty.

> **Beginner mistake:** assuming a disagreement between two indicators
> means one of them is "wrong" and searching for a third to break the
> tie, rather than accepting that the disagreement itself is useful
> information about how uncertain the current picture actually is.

### Lesson 12 — Avoiding Indicator Overload

A very common beginner habit is adding indicator after indicator to a
chart — a moving average, then RSI, then MACD, then Fibonacci, then two
or three more — hoping that more tools mean more clarity.

**Why it backfires:** most of these tools are, to some degree,
correlated — many are built from the same underlying price data in
similar ways, so adding more of them often doesn't add genuinely new
information; it just adds more lines and colors that tend to agree with
each other most of the time and contradict each other at exactly the
moments the market is least clear. A chart with eight indicators active
at once usually doesn't produce eight independent opinions — it produces
visual noise that makes it *harder*, not easier, to see what price is
actually doing.

**What a beginner would actually see:** a chart so covered in lines,
histograms, and colored zones that the candles themselves — the actual
price data everything else is derived from — become hard to see at all.

**A sensible general principle:** a small, complementary set of tools —
for example, price structure and levels from Module 2, one trend tool,
and one momentum tool — is generally enough to work with, because each
one is answering a genuinely different question rather than restating
the same one. This course doesn't prescribe a specific fixed combination
as "the" setup to use, because doing so would start to cross into
strategy-building, which belongs in Module 8, once you've also covered
price action (Module 4), risk management (Module 6), and psychology
(Module 7).

> **Beginner mistake:** believing that a chart covered in every
> available indicator looks more "professional" or thorough, when in
> practice it usually signals the opposite — a lack of clarity about
> which questions actually need answering.

### Lesson 13 — A Practical Technical-Analysis Workflow

Bringing this module together: a simple, honest order for looking at a
chart, combining Module 2's reading skills with this module's tools.

1. **Establish context first.** What's the trend, per Module 2 — up,
   down, or ranging? What key support/resistance levels are already in
   play?
2. **Check momentum.** What is RSI or MACD suggesting about the strength
   of the current move — accelerating, fading, or roughly neutral?
3. **Look for confluence.** Do a Fibonacci level, a chart or candlestick
   pattern, or a moving average line coincide with the levels or trend
   already identified in step 1?
4. **Form an interpretation, not a prediction.** State, in plain
   language, what the evidence suggests — and just as importantly, what
   would make that interpretation wrong.

**Worked example:** GBP/USD is in a clear uptrend on the daily chart
(step 1). RSI is reading 68 — elevated, approaching but not yet past the
70 reference line, suggesting continued but not extreme upward momentum
(step 2). Price has just pulled back to a support zone that also lines
up closely with the 50% Fibonacci retracement of the most recent swing,
and the most recent candle is a small-bodied doji at that zone (step 3).
Put together: an uptrend, pulling back to a level with two independent
sources of confluence, showing early signs of hesitation rather than
continued selling. A reasonable interpretation is that buyers may be
regaining interest here — not a signal to act on blindly, and not a
guarantee that price won't instead break down through this zone and
continue lower (step 4).

**Why does it matter?** This workflow is the honest version of what
"doing technical analysis" actually looks like: gathering several
independent, genuinely informative observations, reasoning through them
together, and arriving at an interpretation you hold with appropriate
uncertainty — never a certainty, and never, on its own, a complete
trading decision. Actually acting on an interpretation like this safely
requires risk management (Module 6) and a written trading plan (Module
8) — tools this module deliberately doesn't provide, because bolting
them on here would turn a reading-and-interpretation module into
exactly the kind of "guaranteed setup" this course does not teach.

> **Beginner mistake:** skipping straight to an indicator reading
> without first establishing trend and structure context from Module 2
> — the same RSI or MACD reading can mean very different things
> depending on that missing context.

---

## Common Beginner Mistakes (Module Recap)

Gathered here in one place for quick reference — each is explained fully
in its related lesson above:

1. Searching for the one indicator or setting that "works," instead of
   treating every tool as a limited lens (Lesson 1).
2. Forcing a trendline to fit, and treating a single break as a
   confirmed reversal (Lesson 2).
3. Assuming a longer moving average is always "better" without
   recognizing the added lag (Lesson 3).
4. Treating momentum and direction as the same thing (Lesson 4).
5. Selling on RSI above 70 or buying below 30 without considering trend
   and structure (Lesson 5).
6. Reacting to every MACD crossover as an independent signal (Lesson 6).
7. Treating a Fibonacci level as an exact, guaranteed price (Lesson 7).
8. Assuming a chart pattern's "textbook" outcome is expected (Lesson 8).
9. Reading a candlestick pattern by its shape alone, ignoring where it
   appears (Lesson 9).
10. Treating high confluence as a guarantee rather than a well-supported
    interpretation (Lesson 10).
11. Assuming disagreement between indicators means one is "wrong"
    (Lesson 11).
12. Believing more indicators automatically means more clarity (Lesson
    12).
13. Jumping to an indicator reading without first establishing trend and
    structure context (Lesson 13).

## Practical Examples

**Example A — Moving average and momentum together.** Using the six
EUR/USD closes from Lessons 3, 5, and 6 (1.08300, 1.08450, 1.08600,
1.08550, 1.08700, 1.08750): the 5-period SMA is 1.08610, and the most
recent close (1.08750) is trading above it — a basic bullish trend
filter reading. The simplified RSI over the same data is 90.9 —
elevated, reflecting the fact that four of the five recent periods were
gains. Read together, this is a market that has been moving up with
real strength — not a signal to chase the move blindly, since Lesson 5
was explicit that an elevated RSI doesn't mean a top is guaranteed, but
a consistent, non-contradictory picture across two independent tools.

**Example B — Pattern plus level.** GBP/USD approaches a resistance zone
that has held twice before (Module 2, Lesson 10). On this third
approach, the two candles that reach the zone form a **double top** —
two similar highs, both failing at the same level. This is a case where
a chart pattern (Lesson 8) and a horizontal resistance level (from
Module 2) are describing the same event from two angles — worth noting
as mutually reinforcing, while still remembering, per Lesson 8, that a
double top can fail to play out as expected.

**Example C — When tools disagree.** USD/JPY's 50-period SMA is sloping
upward and price is trading above it (a bullish trend-filter reading),
but RSI has fallen to 35 and MACD's histogram has been shrinking for
several periods (both suggesting fading upward momentum). This is a
genuine, normal disagreement — per Lesson 11, not a sign that one tool
is malfunctioning, but a picture of a market where the broader trend
is still technically up while short-term momentum is cooling. The honest
read is exactly that mixed picture, not a forced decision to make the
tools agree.

## Key Takeaways

- Technical analysis studies price itself, using tools built from past
  price data — it interprets, it does not predict.
- A trendline visualizes a trend already defined by swing highs and
  lows; it's a visual guide, not a precise level.
- A moving average smooths price using an average over a chosen period;
  shorter periods react faster but noisier, longer periods are smoother
  but lag more.
- Momentum describes how strongly and quickly price is moving, not just
  its direction.
- RSI compares recent gains to recent losses on a 0–100 scale;
  overbought and oversold describe recent strength, not automatic
  reversal signals.
- MACD compares a fast and slow moving average through its line, signal
  line, and histogram; it inherits the lag built into moving averages.
- Fibonacci retracement levels are calculated from a swing high and low
  using ratios from the Fibonacci sequence, used as reference zones —
  not guaranteed turning points.
- Chart patterns and candlestick patterns are recognizable shapes built
  from swing points and candles; none of them guarantee their "textbook"
  outcome, and context changes their meaning.
- Confluence is multiple independent observations pointing the same
  direction — it strengthens an interpretation, it never guarantees an
  outcome.
- Every tool in this module is built from the past, lags to some degree,
  struggles in ranging markets, and can disagree with other tools — all
  normal, not a flaw to "fix."
- Loading a chart with too many indicators adds noise more often than
  clarity; a small, complementary set is usually enough.
- A sound technical-analysis workflow establishes trend and structure
  context first, then checks momentum and confluence, and ends in an
  interpretation held with appropriate uncertainty — not a prediction.

## Before You Move On

This module ends with three things to actually complete before starting
Module 4 — not just read:

1. Work through **`02-exercises.md`** in this module's folder.
2. Complete the **`03-quiz.md`** knowledge checkpoint, then check your
   answers in **`04-answer-key.md`**.
3. Go through the full **`05-checklist.md`** and confirm every item
   honestly before continuing.

Nothing in this module implies that any indicator, pattern, or
combination of them guarantees future price movement, a winning trade,
or a specific outcome — every tool here describes probability and
interpretation, never certainty. If any quiz question or checklist item
doesn't feel solid, re-read that lesson before moving forward — Module 4
goes deep on price action and market structure, and assumes you can
already read a chart (Module 2) and interpret these tools (Module 3)
comfortably, rather than re-teaching either.
