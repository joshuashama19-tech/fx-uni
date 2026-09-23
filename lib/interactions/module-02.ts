import type { Interaction } from "./types";

// Module 2 interactivity — hand-authored for each of this module's 13
// lessons, grounded strictly in that lesson's own existing text (see
// content/course/modules/module-02-reading-understanding-charts/01-content.md).
// Follows the same standard as Module 1 (lib/interactions/module-01.ts):
// nothing here introduces a claim, number, or market scenario the lesson
// doesn't already support, and none of it implies that any candle, trend,
// level, or breakout guarantees a future outcome — several items test that
// exact distinction directly, since this module's own text repeatedly makes
// the point that chart reading describes what happened, not what's certain.
// Calculation-style items reuse the lesson's own worked method (OHLC ->
// body/wick/range; swing highs/lows -> trend classification) with new
// numbers, the same approach Module 1 uses for its own calculation checks.

export const module02Interactions: Record<string, Interaction[]> = {
  "what-charts-are-and-why-traders-use-them": [
    {
      kind: "check",
      id: "m2-l1-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "According to this lesson, why do most traders — beginners through professionals — use candlestick charts instead of a simple line chart?",
      options: [
        { key: "A", text: "They're more visually appealing" },
        { key: "B", text: "They pack more information into each point on the chart than a line does" },
        { key: "C", text: "Line charts are only available on some platforms" },
        { key: "D", text: "Candlestick charts are required for Forex specifically" },
      ],
      correctKey: "B",
      correctFeedback: "Right — a candlestick summarizes more than a line's single closing point, which is exactly what the next lesson unpacks.",
      incorrectFeedback:
        "Re-read the \"What it looks like in practice\" section: candlestick charts are used because they pack more information into each point than a simple line chart does.",
    },
    {
      kind: "reveal",
      id: "m2-l1-r1",
      label: "Think About It",
      prompt:
        "A single live price like 1.08500 can't tell you whether that's high or low for the week, or whether the market's been climbing or swinging wildly. Why does a chart solve a problem that one number on its own can't?",
      revealLabel: "Reveal explanation",
      explanation:
        "Per this lesson, a single price tells you almost nothing about context — a chart plots price over time so you can see the shape it forms, instead of trying to hold a list of numbers in your head.",
    },
  ],

  "understanding-candlestick-charts": [
    {
      kind: "check",
      id: "m2-l2-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, what actually determines whether a candle is described as bullish or bearish?",
      options: [
        { key: "A", text: "Its color on the specific platform being used" },
        { key: "B", text: "Whether price closed higher or lower than it opened during that period" },
        { key: "C", text: "How long its wicks are" },
        { key: "D", text: "Whether it appears on a daily or hourly chart" },
      ],
      correctKey: "B",
      correctFeedback:
        "Right — this course describes candles as bullish (closed higher) or bearish (closed lower) rather than relying on color, since color schemes vary by platform.",
      incorrectFeedback:
        "Re-read the lesson: color is just a common convention that varies by platform. What actually makes a candle bullish or bearish is whether it closed above or below where it opened.",
    },
  ],

  "ohlc-open-high-low-close": [
    {
      kind: "check",
      id: "m2-l3-q1",
      type: "mc",
      label: "Interpretation",
      scenario: "A 1-hour EUR/USD candle shows: Open 1.08500, High 1.08560, Low 1.08470, Close 1.08530.",
      prompt: "Based only on these four OHLC values, which of the following can you actually determine?",
      options: [
        { key: "A", text: "The exact order in which the high and low occurred during the hour" },
        { key: "B", text: "That price never traded below 1.08470 or above 1.08560 during the hour" },
        { key: "C", text: "That price closed at its lowest point of the hour" },
        { key: "D", text: "That the candle is bearish" },
      ],
      correctKey: "B",
      correctFeedback:
        "Right — OHLC tells you the boundaries of the hour's trading (High and Low), but not the order events happened in, and this candle closed above its open (1.08530 > 1.08500), so it's bullish, not bearish.",
      incorrectFeedback:
        "Re-read the lesson's example closely: OHLC alone doesn't tell you the order things happened in. What it does guarantee is that price stayed within the High/Low range for the whole period.",
    },
  ],

  "bullish-and-bearish-candles": [
    {
      kind: "check",
      id: "m2-l4-q1",
      type: "mc",
      label: "Calculation",
      scenario: "A candle opens at 1.09500 and closes at 1.09420.",
      prompt: "Per this lesson's definition, this candle is:",
      options: [
        { key: "A", text: "Bullish" },
        { key: "B", text: "Bearish" },
        { key: "C", text: "Neutral — OHLC alone can't say" },
        { key: "D", text: "Impossible to classify without the high and low" },
      ],
      correctKey: "B",
      correctFeedback: "Close (1.09420) is lower than open (1.09500), so sellers pushed price down over the period, net — a bearish candle.",
      incorrectFeedback:
        "Follow the lesson's rule: bearish means the close is lower than the open. Here, 1.09420 is below the 1.09500 open.",
    },
    {
      kind: "reveal",
      id: "m2-l4-r1",
      label: "Think About It",
      prompt:
        "EUR/USD prints three bullish candles in a row. Does that guarantee the next candle will also be bullish? Decide before revealing, based on what this lesson says.",
      revealLabel: "Reveal answer",
      explanation:
        "No. Per the lesson's own note, a bullish candle isn't a promise that price will keep rising — each candle only tells you what already happened during that specific period, nothing about what comes next is guaranteed by color alone.",
    },
  ],

  "reading-a-single-candle-body-wicks-and-range": [
    {
      kind: "check",
      id: "m2-l5-q1",
      type: "mc",
      label: "Calculation",
      scenario: "A candle shows: Open 1.10200, High 1.10265, Low 1.10175, Close 1.10240.",
      prompt: "Using this lesson's method, what is this candle's body size, in pips?",
      options: [
        { key: "A", text: "2.5 pips" },
        { key: "B", text: "4 pips" },
        { key: "C", text: "9 pips" },
        { key: "D", text: "13 pips" },
      ],
      correctKey: "B",
      correctFeedback: "Body size = |close − open| = |1.10240 − 1.10200| = 0.00040, which is 4 pips.",
      incorrectFeedback:
        "Follow the lesson's formula: body size is |close − open|. Here that's |1.10240 − 1.10200| = 4 pips (9 pips is the full range, and 2.5 pips is each wick).",
    },
    {
      kind: "reveal",
      id: "m2-l5-r1",
      label: "Compare Two Situations",
      prompt:
        "Two bullish candles both close 10 pips above their open. One has no wicks at all. The other has a long upper wick showing price pushed 40 pips higher before falling back to that same close. Do these two candles tell the same story? Decide before revealing.",
      revealLabel: "Reveal explanation",
      explanation:
        "No — per the lesson, the first shows buyers in control from the first tick to the last with no real pushback. The long-wicked one shows price pushed much further up before sellers rejected it back down. Same net move, very different story.",
    },
  ],

  "how-multiple-candles-tell-a-story": [
    {
      kind: "check",
      id: "m2-l6-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "Four consecutive 1-hour candles: a large bullish candle with almost no wicks, then two small indecisive candles near the top of that range, then a large bearish candle closing back below where the first candle started.",
      prompt: "Read as a story rather than four isolated shapes, what do these four candles suggest happened?",
      options: [
        { key: "A", text: "Buyers pushed price up decisively, momentum stalled, then sellers erased the entire earlier gain" },
        { key: "B", text: "The market was in one continuous, unbroken uptrend the whole time" },
        { key: "C", text: "The data must be wrong, since 3 of the 4 candles were not bearish" },
        { key: "D", text: "Nothing meaningful can be read from only four candles" },
      ],
      correctKey: "A",
      correctFeedback: "That's exactly this lesson's own reading: a decisive move up, a stall, then sellers taking control and erasing the gain.",
      incorrectFeedback:
        "Re-read the lesson's own worked example — the order and sizes of the four candles tell a specific story, not just a raw bullish/bearish count.",
    },
  ],

  "timeframes-and-choosing-the-right-one": [
    {
      kind: "check",
      id: "m2-l7-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "According to this lesson, switching a chart from a 1-hour to a daily timeframe changes:",
      options: [
        { key: "A", text: "The underlying market prices themselves" },
        { key: "B", text: "How much detail versus how much history you can see at once" },
        { key: "C", text: "Which currency pair is being displayed" },
        { key: "D", text: "Whether the chart is a candlestick chart or a line chart" },
      ],
      correctKey: "B",
      correctFeedback: "Right — switching timeframes doesn't change the underlying market, only how much detail versus history is visible at once.",
      incorrectFeedback: "Re-check the lesson's opening definition: a timeframe changes the detail-versus-history trade-off, not the market itself.",
    },
    {
      kind: "reveal",
      id: "m2-l7-r1",
      label: "Think About It",
      prompt:
        "A beginner watches a 1-minute chart and sees price jumping around constantly. Per this lesson, is that necessarily a meaningful, tradeable move?",
      revealLabel: "Reveal answer",
      explanation:
        "No — per the lesson's beginner-mistake note, very low timeframes look noisier, and it's easy to mistake normal short-term noise for a meaningful move.",
    },
  ],

  "trend-identification-higher-highs-higher-lows-and-lower-highs-lower-lows": [
    {
      kind: "check",
      id: "m2-l8-q1",
      type: "mc",
      label: "Calculation",
      scenario:
        "EUR/USD's swing highs, in order: 1.09500 → 1.09650 → 1.09800. Its swing lows, in order: 1.09100 → 1.09250 → 1.09400.",
      prompt: "Using this lesson's method, how does this sequence classify?",
      options: [
        { key: "A", text: "Higher highs and higher lows — an uptrend" },
        { key: "B", text: "Lower highs and lower lows — a downtrend" },
        { key: "C", text: "A range" },
        { key: "D", text: "Not enough swings to say anything" },
      ],
      correctKey: "A",
      correctFeedback: "Each high is higher than the last, and each low is also higher than the last — both conditions hold, so this is HH/HL, an uptrend.",
      incorrectFeedback:
        "Check both sequences the way the lesson's own example does: the highs are climbing (1.09500→1.09650→1.09800) and so are the lows (1.09100→1.09250→1.09400) — that's the definition of HH/HL.",
    },
    {
      kind: "check",
      id: "m2-l8-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, seeing one or two candles move in a direction is enough to call something a trend.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — this is the lesson's own beginner-mistake warning: a trend requires an actual sequence of higher (or lower) highs and lows across multiple swings.",
      incorrectFeedback: "Re-check the Beginner Mistake note: a trend is a checkable pattern across multiple swings, not a read on one or two candles.",
    },
  ],

  "uptrends-downtrends-and-ranges": [
    {
      kind: "check",
      id: "m2-l9-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "EUR/USD's swing highs, in order: 1.08700 → 1.08680 → 1.08720 → 1.08690 (clustered, no clear climb). Its swing lows: 1.08400 → 1.08420 → 1.08390 → 1.08410 (also clustered, no clear fall).",
      prompt: "Based on this lesson's definitions, how would you classify this price behavior?",
      options: [
        { key: "A", text: "Uptrend" },
        { key: "B", text: "Downtrend" },
        { key: "C", text: "Range" },
        { key: "D", text: "Breakout" },
      ],
      correctKey: "C",
      correctFeedback: "Neither the highs nor the lows are forming a directional sequence — price is bouncing between a rough ceiling and floor, which this lesson defines as a range.",
      incorrectFeedback:
        "Re-check both sequences: neither the highs nor the lows are climbing or falling in order, which is exactly this lesson's definition of a range, not a trend.",
    },
  ],

  "support-and-resistance": [
    {
      kind: "check",
      id: "m2-l10-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, what actually makes a price level become support or resistance?",
      options: [
        { key: "A", text: "It's assigned officially by an exchange or regulator" },
        { key: "B", text: "Traders have repeatedly made decisions (buying or selling) around that level before" },
        { key: "C", text: "It's always a round number" },
        { key: "D", text: "It only applies on the daily timeframe" },
      ],
      correctKey: "B",
      correctFeedback: "Right — a level becomes support or resistance because enough traders have reacted there before, and that collective memory tends to produce reactions again.",
      incorrectFeedback: "Re-read the \"Why do these levels exist at all?\" section — it's about repeated trader reactions at a level, not an official designation.",
    },
    {
      kind: "reveal",
      id: "m2-l10-r1",
      label: "Think About It",
      prompt:
        "EUR/USD approaches 1.09000 for a fourth time after holding as resistance three times before. Does a level holding three times in the past guarantee it holds a fourth time? Decide, then reveal.",
      revealLabel: "Reveal answer",
      explanation:
        "No — per the lesson's own note, support and resistance are zones of likely reaction, not guarantees. A level that has held three times can still fail on the fourth attempt.",
    },
  ],

  "breakouts-and-false-breakouts": [
    {
      kind: "check",
      id: "m2-l11-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "Price wicks above a 1.09000 resistance level intra-candle, even trading a few pips higher — but the candle's close ends up back below 1.09000.",
      prompt: "Per this lesson, what does this describe?",
      options: [
        { key: "A", text: "A confirmed, reliable breakout" },
        { key: "B", text: "A false breakout" },
        { key: "C", text: "A new support level being formed" },
        { key: "D", text: "A shift in market structure" },
      ],
      correctKey: "B",
      correctFeedback: "Right — this is the lesson's own example of a false breakout: price pushes beyond a level, appears to break it, then reverses back before the close.",
      incorrectFeedback:
        "Re-read the \"What a false breakout can look like\" section: closing back below the level after wicking above it is the lesson's own definition of a false breakout.",
    },
    {
      kind: "check",
      id: "m2-l11-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a breakout that closes clearly beyond a level is guaranteed not to reverse.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — the lesson states plainly that no characteristic of a breakout, including a closing break, guarantees it won't reverse.",
      incorrectFeedback:
        "Re-read the lesson's bolded sentence directly: \"No characteristic of a breakout... guarantees it won't reverse.\"",
    },
  ],

  "market-structure-at-a-glance": [
    {
      kind: "check",
      id: "m2-l12-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "At the level this module covers, what does this lesson say \"market structure\" means?",
      options: [
        { key: "A", text: "A formal indicator plotted automatically on the chart" },
        { key: "B", text: "The overall shape formed by a market's swing highs and lows — trend, key levels, and whether they've held or broken" },
        { key: "C", text: "A guaranteed prediction of the next candle's direction" },
        { key: "D", text: "A rule for calculating how large a position to take" },
      ],
      correctKey: "B",
      correctFeedback: "Right — structure is Lessons 8 through 11 (trend, levels, breakouts) viewed together as one picture, not a separate new tool.",
      incorrectFeedback:
        "Re-read the lesson's opening definition: market structure is the overall shape formed by swing highs and lows — trend, key levels, and whether they've held or broken.",
    },
  ],

  "multi-timeframe-analysis": [
    {
      kind: "check",
      id: "m2-l13-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "The 4-hour EUR/USD chart shows a clear uptrend (higher highs and higher lows). The 15-minute chart, for the most recent few hours, shows price pulling back with a short sequence of lower highs and lower lows.",
      prompt: "Read together, per this lesson, what's the more complete picture?",
      options: [
        { key: "A", text: "The uptrend is over and a new downtrend has started" },
        { key: "B", text: "This looks like a short-term pullback within the larger uptrend, not necessarily a reversal of it" },
        { key: "C", text: "The two timeframes are contradicting each other, and one of them must be wrong" },
        { key: "D", text: "Multi-timeframe analysis proves the pullback will end within the hour" },
      ],
      correctKey: "B",
      correctFeedback:
        "Right — that's the lesson's own read, though it's also careful to call this a reasonable read of the current picture, not a guarantee of what happens next.",
      incorrectFeedback:
        "Re-read the lesson's own worked example: both charts are simultaneously true, just at different scales — reading them together points to a pullback within the larger trend, not a contradiction.",
    },
    {
      kind: "reveal",
      id: "m2-l13-r1",
      label: "Think About It",
      prompt:
        "A market can be in an uptrend on the 4-hour chart and pulling back on the 15-minute chart at the exact same moment. Why isn't either chart \"wrong\"? Decide, then reveal.",
      revealLabel: "Reveal explanation",
      explanation:
        "Because a chart always shows accurate information about the timeframe you're looking at — the two charts are just describing different scales of the same price action, which is exactly why this lesson checks more than one before drawing a conclusion.",
    },
  ],
};
