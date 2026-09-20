---
module: 2
title: Reading & Understanding Charts
subtitle: Learning to See What the Market Is Actually Showing You
status: complete
last_updated: 2026-09-19
---

# Module 2 — Reading & Understanding Charts

*"Learning to See What the Market Is Actually Showing You"*

## Module Introduction

In Module 1 you learned what you're looking at when you see a price like
EUR/USD 1.08500 — what the number means, what moves it, and how a trade
around it actually works. This module teaches you something different:
how to look at the *history* of that price, laid out on a chart, and
actually understand what it's showing you.

A chart isn't decoration and it isn't a crystal ball. It's a record — a
visual log of every price a market has traded at, over whatever period of
time you're looking at. Right now, if you opened a chart, you'd probably
see a wall of small shapes and lines that means nothing to you. By the
end of this module, that same wall of shapes will read like a story:
where price has been, whether it's been climbing, falling, or going
nowhere, which levels it's respected or broken, and how zooming in or out
changes what you notice.

This module is deliberately about *reading*, not *strategy*. You won't
walk out of it with a trading system — that's not the goal here, and
nobody should be trading off Module 2 alone. Module 3 builds actual
analysis tools on top of what you learn here (moving averages, RSI,
MACD, and more). Module 4 goes deep on price action and market structure
as a trading approach. Module 5 covers the news and data that also move
price. All of that depends on you being able to look at a chart and
correctly describe what's actually on it first — which is exactly what
this module builds.

## Learning Objectives

By the end of this module, you will be able to:

- Explain what a price chart is and why traders use candlestick charts
  specifically.
- Read a single candlestick and identify its open, high, low, and close.
- Identify whether a candle is bullish or bearish, and explain what that
  means.
- Describe a candle's body, wicks, and range, and calculate each from
  OHLC values.
- Read a short sequence of candles and describe the story they tell.
- Explain what a timeframe is and how the same market looks different
  across timeframes.
- Identify an uptrend and a downtrend using higher highs/higher lows and
  lower highs/lower lows.
- Identify a range and distinguish it from a trend.
- Identify a potential support or resistance level on a chart.
- Describe what a breakout is, and explain why some breakouts fail.
- Describe, at a basic level, what "market structure" means.
- Explain what multi-timeframe analysis is and why traders use it.
- Recognize the most common mistakes beginners make when reading charts.

---

### Lesson 1 — What Charts Are, and Why Traders Use Them

A price chart is simply a picture of price over time. Every trade that
happens in the market gets logged, and a chart plots those prices in
sequence so you can see the shape they form, instead of trying to hold a
list of numbers in your head.

Why not just watch the raw price ticking up and down, the way you might
have looked at bid/ask quotes in Module 1? Because a single live price
tells you almost nothing about *context*. Is 1.08500 high or low compared
to where EUR/USD has been trading this week? Has it been climbing
steadily or swinging wildly? A single number can't answer that. A chart
can — at a glance.

**Why does it matter?** Every skill in this course, starting with the
next lesson and continuing all the way through Module 4, depends on
being able to look at a chart and read it accurately. Analysis, price
action, even risk management decisions like where to place a stop loss,
all start with correctly seeing what's actually on the chart in front of
you — not what you expect or hope to see.

**What it looks like in practice:** open any Forex charting platform and
you'll typically be able to choose between a few chart types — a simple
line chart (just connecting closing prices), a bar chart, or a
**candlestick chart**. Nearly every trader, from complete beginners to
professionals, uses candlestick charts, because they pack more
information into each point on the chart than a simple line does. That's
exactly what the rest of this module unpacks, starting now.

> **Beginner mistake:** stopping at a line chart because it looks
> simpler, and never learning to read candlesticks — which quietly
> throws away most of the useful information a chart can give you.

### Lesson 2 — Understanding Candlestick Charts

A **candlestick** is a single shape on a chart that summarizes all the
trading that happened during one fixed period of time — one minute, one
hour, one day, whatever period you've selected. Line up hundreds of
these shapes side by side, and you get a candlestick chart.

Picture one candle in isolation: it has a thicker rectangular section in
the middle, called the **body**, and thin lines sticking out of the top
and/or bottom, called **wicks** (or **shadows**). Different platforms
color candles differently, but the most common convention is: a candle
is colored one way (often green or white) if price closed *higher* than
it opened during that period, and colored the other way (often red or
black) if price closed *lower* than it opened. This course will describe
candles as **bullish** (closed higher) or **bearish** (closed lower)
rather than relying on color, since color schemes vary by platform.

**Why does it matter?** A single candlestick tells you four specific
prices at once — where the period started, where it ended, and the
highest and lowest points it reached in between — which is exactly what
the next lesson unpacks in full.

**What it looks like in practice:** a chart set to a "1-hour" timeframe
shows you one candle for every hour that passed, each one a compressed
summary of that entire hour of trading. A chart set to "daily" shows one
candle per day. Same market, same underlying prices — different level of
detail, which is the whole subject of Lesson 7.

> **Beginner mistake:** assuming a candle's color alone tells you
> everything you need to know. Color only tells you the direction price
> closed relative to where it opened — not how strong the move was, not
> what happened during the period, and not what's likely to happen next.
> The next few lessons build on top of color, not instead of it.

### Lesson 3 — OHLC: Open, High, Low, Close

Every single candlestick is built from exactly four prices, commonly
abbreviated **OHLC**:

- **Open** — the price when that period began.
- **High** — the highest price reached at any point during that period.
- **Low** — the lowest price reached at any point during that period.
- **Close** — the price when that period ended.

**Example:** Suppose you're looking at a 1-hour EUR/USD candle with:
Open **1.08500**, High **1.08560**, Low **1.08470**, Close **1.08530**.
Reading this in plain language: during that hour, EUR/USD started
trading at 1.08500, at some point climbed as high as 1.08560, at some
point fell as low as 1.08470, and by the end of the hour had settled at
1.08530. You don't know the *order* those things happened in just from
OHLC alone (did it go up first, then down, then back up? Or down, then
up?) — only that all four of those prices occurred somewhere in the hour.

**Why does it matter?** OHLC is the raw data behind every candle you'll
ever look at, and behind most of the tools you'll learn in Module 3. It's
also exactly what determines whether a candle is bullish or bearish
(Lesson 4) and what its body, wicks, and range look like (Lesson 5).

**What it looks like in practice:** most charting platforms let you hover
or click on any candle to see its exact OHLC values pop up — a useful
habit to build early, instead of only estimating visually.

> **Beginner mistake:** confusing the close of a candle with the
> *current* price while that candle is still forming. A candle's close
> isn't final until the period ends — an hourly candle's "close" is still
> changing, in real time, until the hour is actually over.

### Lesson 4 — Bullish and Bearish Candles

Now that you know OHLC, the bullish/bearish distinction from Lesson 2
becomes precise: a candle is **bullish** if its close is higher than its
open (buyers pushed price up over that period, net), and **bearish** if
its close is lower than its open (sellers pushed price down over that
period, net).

**Example:** Using the candle from Lesson 3 — Open 1.08500, Close
1.08530 — the close (1.08530) is higher than the open (1.08500), so this
is a **bullish candle**. If instead that same candle had closed at
1.08460, below its 1.08500 open, it would be a **bearish candle**.

**Why does it matter?** A run of several bullish candles in a row is a
very different picture than a run of several bearish candles, or a mix
of both — and that's the very first, most basic read of "what's been
happening" on any chart, before you look at anything more advanced.

**What it looks like in practice:** scan a chart left to right and you'll
naturally start noticing runs and clusters — several bullish candles in a
row, then a bearish one, then more bullish ones. That rhythm is the
beginning of reading a chart's story, which Lesson 6 builds on directly.

> **Note:** a bullish candle is not a promise that price will keep
> rising, and a bearish candle isn't a promise it will keep falling. Each
> candle only tells you what already happened during that specific
> period — nothing about what comes next is guaranteed by a candle's
> color alone.

> **Beginner mistake:** treating a single bullish or bearish candle as a
> strong signal on its own. One candle is one data point — context (the
> subject of the rest of this module) is what makes it meaningful.

### Lesson 5 — Reading a Single Candle: Body, Wicks, and Range

Beyond just bullish or bearish, a candle's *shape* tells you more.

The **body** is the rectangular part between the open and the close —
its size is `|close − open|`. A **large body** means price moved a
meaningful distance between open and close. A **small body** means price
ended up close to where it started, even if it moved around in between.

The **wicks** (or shadows) are the thin lines above and below the body,
showing the high and low that weren't held into the close. The **upper
wick** length is `high − the higher of open/close`. The **lower wick**
length is `the lower of open/close − low`. A long upper wick means price
pushed up but got rejected back down before the period ended. A long
lower wick means price pushed down but got bought back up.

The **range** is the full distance the candle covered: `high − low` —
the total territory price explored during that period, body and wicks
combined.

**Example:** Take that same candle — Open 1.08500, High 1.08560, Low
1.08470, Close 1.08530.

- Body size: |1.08530 − 1.08500| = **0.00030** (3 pips)
- Upper wick: 1.08560 − 1.08530 (the higher of open/close is the close,
  1.08530) = **0.00030** (3 pips)
- Lower wick: 1.08500 − 1.08470 (the lower of open/close is the open,
  1.08500) = **0.00030** (3 pips)
- Range: 1.08560 − 1.08470 = **0.00090** (9 pips)

**How to read a single candle, put together:** this candle is bullish
(close above open), with a moderate body and roughly equal wicks on both
sides — meaning price pushed both up and down during the hour before
settling with a net gain. A candle with the *same* open and close but no
wicks at all would tell a cleaner story: buyers were in control from the
first tick to the last, without significant pushback in either direction.

**Why does it matter?** Body and wick size are the raw material behind
almost every candlestick pattern you'll hear traders mention. This
course does not teach individual named candlestick patterns as trading
signals — that kind of pattern-based technical analysis belongs in
Module 3 — but understanding body, wick, and range is what makes any of
that meaningful later, instead of memorized shapes.

> **Beginner mistake:** looking only at whether a candle is bullish or
> bearish and ignoring its body and wick size — two bullish candles with
> very different shapes can be telling very different stories.

### Lesson 6 — How Multiple Candles Tell a Story

A single candle is one data point. A sequence of candles is where actual
reading begins.

**Example — describing a sequence, not just naming it:** Imagine four
consecutive 1-hour EUR/USD candles. The first is a large bullish candle
with almost no wicks — a strong, decisive move up. The second is a small
candle with a tiny body and short wicks on both sides, sitting near the
top of the first candle's range — price barely moved, essentially
pausing. The third is another small, indecisive candle in roughly the
same area. The fourth is a large bearish candle that closes back below
where the first candle started.

Read as a story rather than four isolated shapes: buyers pushed price up
decisively (candle 1), then lost momentum and the market paused,
unable to push higher (candles 2 and 3), then sellers took control and
erased the entire earlier gain (candle 4). That's meaningfully different
information than just noting "3 bullish candles, 1 bearish candle" — the
*order*, the *sizes*, and *where* each candle sits relative to the others
all matter.

**Why does it matter?** This is the actual skill of chart reading: not
memorizing that "candle shape X means Y," but building the habit of
reading a sequence for what it shows about the ongoing contest between
buyers and sellers. Everything from Lesson 8 onward (trends, structure,
support and resistance) is really this same skill applied to a wider
view.

> **Beginner mistake:** reading candles one at a time and forgetting what
> came before — chart reading is cumulative, not a series of unrelated
> snapshots.

### Lesson 7 — Timeframes and Choosing the Right One

A **timeframe** is the length of time each candle on your chart
represents — 1 minute, 5 minutes, 15 minutes, 1 hour, 4 hours, daily,
weekly, and so on. Switching timeframes doesn't change the underlying
market — it changes how much detail versus how much history you can see
at once.

**Example:** A single daily candle is built from roughly 24 separate
1-hour candles compressed into one. If EUR/USD spent the day drifting
up, spiking down sharply in the afternoon, then recovering by the close,
the daily candle would only show you a bullish candle with a long lower
wick — a fair summary, but it hides the hour-by-hour detail of exactly
when and how that dip happened. Zoom into the 1-hour chart for that same
day, and the dip and recovery become individually visible candles.

**Why does it matter?** Lower timeframes (1-minute, 5-minute) show far
more detail but far less history in the same screen space, and tend to
look "noisier" — more small, choppy moves. Higher timeframes (4-hour,
daily, weekly) smooth that noise out and show the bigger picture, but
hide the detail of what happened within each candle. Neither is
"correct" — they answer different questions. This course generally uses
higher timeframes (1-hour and above) in its examples, because price
behavior tends to be clearer and less erratic there, which makes it a
sensible starting point for a beginner still building the core reading
skill this module teaches. Which timeframe (or combination of
timeframes) actually fits a given trading style and schedule is a
decision covered properly in Module 8, once you have more of the course
behind you.

**What it looks like in practice:** switch a chart from 1-hour to daily
and the exact same recent price action will look far more compressed and
smoother — sharp intraday spikes that looked dramatic on the 1-hour chart
often shrink into a single wick on the daily chart.

> **Beginner mistake:** watching a very low timeframe (like 1-minute) as
> a beginner and mistaking normal short-term noise for a meaningful,
> tradeable move.

### Lesson 8 — Trend Identification: Higher Highs/Higher Lows and Lower Highs/Lower Lows

Zoom out from individual candles, and price forms a series of peaks and
troughs — these are called **swing highs** (a point where price turned
down after rising) and **swing lows** (a point where price turned up
after falling).

**What it looks like on a chart:** picture price climbing to a peak,
pulling back partway, climbing again to a new peak *higher* than the
first, pulling back to a point *higher* than the previous pullback,
then climbing again. That sequence — each peak higher than the last, and
each pullback holding above the previous one — is called **higher highs
and higher lows (HH/HL)**, and it's the defining pattern of an
**uptrend**.

The mirror image — each peak *lower* than the last, and each pullback
falling *below* the previous one — is called **lower highs and lower
lows (LH/LL)**, the defining pattern of a **downtrend**. Picture price
falling to a trough, bouncing partway, falling again to a new trough
*lower* than the first, bouncing to a point *lower* than the previous
bounce, then falling again.

**Example:** Say EUR/USD's swing highs and lows over several days, in
order, are: 1.08200 (low) → 1.08600 (high) → 1.08400 (low) → 1.08750
(high) → 1.08550 (low) → 1.08900 (high). Checking the highs in order —
1.08600 → 1.08750 → 1.08900 — each is higher than the last. Checking the
lows in order — 1.08200 → 1.08400 → 1.08550 — each is also higher than
the last. Both conditions hold, so this is a clear **higher highs and
higher lows** sequence — an uptrend.

**Why does it matter?** This is the actual, checkable definition of a
trend — not a feeling that "price looks like it's going up," but a
specific, repeatable pattern in the sequence of swing highs and lows that
you can point to on a chart.

> **Beginner mistake:** calling something a trend after seeing only one
> or two candles move in a direction, instead of checking for an actual
> sequence of higher (or lower) highs and lows over multiple swings.

### Lesson 9 — Uptrends, Downtrends, and Ranges

Putting Lesson 8 together: an **uptrend** is a sustained sequence of
higher highs and higher lows. A **downtrend** is a sustained sequence of
lower highs and lower lows. But price doesn't always do either — a lot
of the time, it does neither, and that's its own distinct condition.

A **range** (or "sideways market") is what you see when price bounces
between a rough ceiling and a rough floor without making meaningfully
higher highs or meaningfully lower lows — the swing highs stay roughly
level, and the swing lows stay roughly level, instead of climbing or
falling in sequence.

**Example:** If EUR/USD's swing highs over several days were 1.08700 →
1.08680 → 1.08720 → 1.08690 (all clustered close together, no clear
climb) and its swing lows were 1.08400 → 1.08420 → 1.08390 → 1.08410
(also clustered, no clear fall), neither the highs nor the lows are
forming a directional sequence. Price is oscillating between roughly
1.08400 and 1.08700 — a range.

**Why does it matter?** Correctly telling the difference between "trend"
and "range" changes what you should even be looking for on a chart. A
market grinding sideways in a range is a fundamentally different
situation than one making a sustained directional move, and later
modules (especially Module 4) treat them very differently.

> **Beginner mistake:** forcing every chart into "uptrend" or
> "downtrend" because those feel like the "real" states, when a large
> share of the time, a market is genuinely just ranging.

### Lesson 10 — Support and Resistance

**Support** is a price level where a market has repeatedly stopped
falling and turned back up. **Resistance** is a price level where a
market has repeatedly stopped rising and turned back down. In a range
(Lesson 9), the ceiling is resistance and the floor is support — but
support and resistance show up inside trends too, not only in ranges.

**Why do these levels exist at all?** At a basic level, a price level
becomes support or resistance because enough traders have made decisions
around it before — buying near a level that held as support previously,
or selling near a level that capped price before — and that collective
memory tends to produce reactions at the same levels again. This course
doesn't go deeper into the mechanics behind *why* than that here — the
detailed methodology for identifying and trading these zones is exactly
what Module 4 (Price Action) is built around.

**What it looks like on a chart:** you're looking for a horizontal price
area (not usually an exact single price) where you can see price
approach it multiple separate times and turn away each time — two, three,
or more touches at roughly the same level is a stronger signal than a
level price only touched once.

**Example:** Suppose EUR/USD approaches 1.09000 on three separate
occasions over two weeks, and each time, price turns back down within a
few pips of that level without closing meaningfully above it. That
repeated reaction is what makes 1.09000 a **resistance level** worth
paying attention to — not because the number 1.09000 is special in
itself, but because the market has *shown you*, repeatedly, that it
reacts there.

> **Note:** support and resistance are zones of likely reaction, not
> guarantees. A level that has held three times can still fail on the
> fourth attempt — which is exactly the subject of the next lesson.

> **Beginner mistake:** drawing support/resistance lines at a single
> exact price to the pip, then being confused when price reacts a few
> pips away from the exact line. Treat these as approximate zones, not
> laser-precise levels.

### Lesson 11 — Breakouts and False Breakouts

A **breakout** happens when price moves beyond an established support or
resistance level instead of reacting to it the way it has before.

**Example:** Using the 1.09000 resistance from Lesson 10 — if, on a
fourth approach, EUR/USD doesn't turn back down but instead closes a
candle clearly above 1.09000 and keeps going, that's a breakout: the
level that previously held has now been broken.

But a breakout isn't automatically a reliable signal on its own. A
**false breakout** is when price pushes beyond a level, appears to break
it, and then reverses back to the other side — trapping traders who
assumed the breakout was genuine.

**What a false breakout can look like:** price wicks above 1.09000
intra-candle, even trading a few pips higher, but the candle's *close*
ends up back below 1.09000 rather than holding above it — the break
turned out to be temporary. This is one reason some traders pay closer
attention to where a candle *closes* relative to a level, rather than
reacting to any brief move beyond it — though even a closing break above
a level is still not a guarantee that price will continue in that
direction. **No characteristic of a breakout — how far it moves, whether
it closes beyond the level, or how convincing it looks — guarantees it
won't reverse.** Genuine breakouts and false breakouts frequently look
identical while they're happening; the only way to know for certain
which one occurred is afterward.

**Why does it matter?** Recognizing that both outcomes are always
possible is more important, at this stage, than trying to predict which
one will happen — that's a skill built with the price-action and risk
management tools in Modules 4 and 6, not something Module 2 equips you
to do reliably on its own.

> **Beginner mistake:** assuming any move beyond a support/resistance
> level is automatically a valid breakout worth reacting to, without
> considering that false breakouts are common and often look identical
> to real ones until after the fact.

### Lesson 12 — Market Structure, at a Glance

**Market structure** is simply the overall shape formed by a market's
swing highs and lows over time — which is really everything from
Lessons 8 through 11 viewed together as one picture, rather than as
separate topics.

**Why does it matter?** Reading structure means being able to look at a
chart and describe, in order: is this an uptrend, a downtrend, or a
range (Lesson 9)? Where are the levels price has reacted to (Lesson 10)?
Has price recently broken any of those levels, and did that break hold
(Lesson 11)? A market's structure can also *shift* — for example, an
uptrend that was making higher highs and higher lows can start printing
a lower high for the first time, an early hint (never a certainty) that
the character of the market may be changing.

**What it looks like in practice:** this module only asks you to
describe structure at this basic level — trend, key levels, and whether
they've held or broken. Module 4 (Price Action) goes considerably
further, with formal concepts like break of structure and change of
character, and builds an actual trading approach on top of structure
reading. What you're building here is the visual foundation that makes
that later material possible to learn properly, not a substitute for it.

> **Beginner mistake:** trying to learn detailed structural trading
> concepts (like those covered later in Module 4) before being able to
> reliably do the basics in this lesson — correctly identifying trend
> direction and key levels on a chart, without those, more advanced
> structure concepts won't make sense.

### Lesson 13 — Multi-Timeframe Analysis

**Multi-timeframe analysis** means looking at more than one timeframe of
the same market before drawing a conclusion, instead of relying on a
single chart in isolation.

**Why does it matter?** A chart always shows you accurate information —
but only about the timeframe you're looking at. A market can be in a
clear uptrend on the 4-hour chart while pulling back on the 15-minute
chart at the very same moment — both are true simultaneously, they're
just describing different scales of the same price action. Looking at
only one of them gives you an incomplete picture.

**Example:** Suppose the 4-hour EUR/USD chart shows a clear uptrend —
higher highs and higher lows over the past several days (Lesson 8). Zoom
into the 15-minute chart for the most recent few hours, and you see price
pulling back — a short sequence of lower highs and lower lows. Read in
isolation, the 15-minute chart alone might look like a new downtrend has
started. Read together with the 4-hour chart, a more complete picture
emerges: this looks like a short-term pullback *within* a larger uptrend,
not necessarily a reversal of it — though, consistent with Lesson 11,
that's a reasonable read of the current picture, not a guarantee of what
happens next.

**What it looks like in practice:** a common habit is starting on a
higher timeframe to establish the broader context (trend, key levels),
then moving to a lower timeframe for more detail within that context —
rather than starting on a low timeframe with no sense of the bigger
picture at all.

> **Beginner mistake:** analyzing only one timeframe, forming a
> conclusion, and never checking whether a higher timeframe tells a
> different — or contradicting — story.

---

## Common Beginner Mistakes (Module Recap)

Gathered here in one place for quick reference — each is explained fully
in its related lesson above:

1. Relying on a simple line chart and never learning to read
   candlesticks (Lesson 1).
2. Assuming candle color alone tells the whole story (Lesson 2).
3. Confusing an in-progress candle's current price with its final close
   (Lesson 3).
4. Treating a single bullish or bearish candle as a strong signal on its
   own (Lesson 4).
5. Ignoring body and wick size and looking only at color (Lesson 5).
6. Reading candles as isolated snapshots instead of a continuous story
   (Lesson 6).
7. Mistaking low-timeframe noise for a meaningful move (Lesson 7).
8. Calling something a trend after only one or two candles, without
   checking for an actual HH/HL or LH/LL sequence (Lesson 8).
9. Forcing every chart into "uptrend" or "downtrend" when it may simply
   be ranging (Lesson 9).
10. Drawing support/resistance as an exact single price instead of an
    approximate zone (Lesson 10).
11. Assuming any move beyond a level is automatically a valid breakout
    (Lesson 11).
12. Trying to learn advanced structure concepts before mastering the
    basics this module teaches (Lesson 12).
13. Analyzing only one timeframe and never checking for a contradicting
    picture on another (Lesson 13).

## Practical Examples

**Example A — Full candle read.** A 4-hour USD/JPY candle shows: Open
149.400, High 149.680, Low 149.280, Close 149.310. First, bullish or
bearish? Close (149.310) is below open (149.400), so this is a **bearish
candle**. Body size: |149.310 − 149.400| = 0.090 (9 pips using the JPY
pip convention from Module 1). Upper wick: 149.680 − 149.400 (open is
the higher of open/close) = 0.280 (28 pips) — a long upper wick. Lower
wick: 149.310 − 149.280 (close is the lower of open/close) = 0.030 (3
pips) — a short lower wick. Range: 149.680 − 149.280 = 0.400 (40 pips).
Reading it together: a bearish candle with a notably long upper wick
relative to its small body and short lower wick — buyers pushed price up
substantially during the period (to 149.680) but lost control, and
sellers pushed it back down through the open by the close. That long
upper wick is a meaningfully different story than a bearish candle with
no wicks at all, even though both would be labeled "bearish."

**Example B — Trend or range?** Over three weeks, GBP/USD's swing highs
are recorded, in order, as: 1.26300 → 1.26550 → 1.26480 → 1.26700. The
swing lows, in order: 1.25900 → 1.26100 → 1.26050 → 1.26300. Checking the
highs: 1.26300 → 1.26550 is higher, 1.26480 is *lower* than 1.26550 (a
break in the pattern), then 1.26700 is higher again. Checking the lows:
1.25900 → 1.26100 → 1.26050 (also breaks the pattern) → 1.26300. Neither
sequence is a perfectly clean run of higher highs and higher lows — but
the *overall* direction of both highs and lows is still upward over the
full three weeks, with one minor pullback in the middle that didn't
undo the broader pattern. This is a realistic, honest example of why
chart reading in practice is rarely as clean as a textbook diagram: real
markets have minor pullbacks inside a larger uptrend, and reading
structure means judging the overall picture, not requiring every single
swing to be perfectly higher than the last.

**Example C — Multi-timeframe context changes the read.** The daily
EUR/USD chart shows price approaching 1.09500, a level it has reacted to
downward twice before — a resistance level (Lesson 10). On the 1-hour
chart, the most recent candles show price pushing through 1.09500 and
closing three consecutive candles above it. Read on the 1-hour chart
alone, this looks like a breakout (Lesson 11). Zooming back out to the
daily chart, that entire 1-hour move is still a very small fraction of a
single daily candle's typical range — not enough, on its own, to confirm
the break is significant on the timeframe where the resistance level was
originally identified. This doesn't mean the breakout is false — it
means a single timeframe's confirmation isn't automatically enough
context, which is exactly why Lesson 13 exists.

## Key Takeaways

- A chart is a picture of price over time; candlestick charts pack more
  information into each point than a simple line.
- Every candle is built from four prices — Open, High, Low, Close
  (OHLC).
- A candle is bullish if it closes above its open, bearish if it closes
  below — but color alone doesn't tell you how strong or meaningful the
  move was.
- Body, wicks, and range describe a candle's shape and add real detail
  beyond just bullish/bearish.
- Reading candles as a sequence, not in isolation, is the core skill of
  chart reading.
- A timeframe is the period each candle represents; the same market
  looks different — more detailed or more compressed — at different
  timeframes.
- An uptrend is a sequence of higher highs and higher lows; a downtrend
  is a sequence of lower highs and lower lows; a range is neither.
- Support and resistance are price zones where a market has repeatedly
  reacted, not guaranteed exact lines.
- A breakout is price moving beyond a level; a false breakout is a
  breakout that reverses — and the two frequently look identical while
  they're happening.
- Market structure is the overall shape formed by trend, key levels, and
  whether those levels have held or broken.
- Multi-timeframe analysis checks more than one timeframe before drawing
  a conclusion, because different timeframes can show genuinely
  different (and both accurate) pictures at once.

## Before You Move On

This module ends with three things to actually complete before starting
Module 3 — not just read:

1. Work through **`02-exercises.md`** in this module's folder.
2. Complete the **`03-quiz.md`** knowledge checkpoint, then check your
   answers in **`04-answer-key.md`**.
3. Go through the full **`05-checklist.md`** and confirm every item
   honestly before continuing.

Nothing in this module implies that any chart pattern, trend, level, or
breakout guarantees future price movement — chart reading describes what
has happened and what may be more or less likely, never what is
certain. If any quiz question or checklist item doesn't feel solid,
re-read that lesson before moving forward — Module 3 assumes you can
already read a chart accurately, and builds analysis tools on top of
that skill rather than re-teaching it.
