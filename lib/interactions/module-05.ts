import type { Interaction } from "./types";

// Module 5 interactivity — hand-authored for each of this module's 14
// lessons, grounded strictly in that lesson's own existing text (see
// content/course/modules/module-05-fundamental-analysis/01-content.md).
// Follows the same standard as Modules 1–4. This module's own text is
// unusually careful that economic data does not move currencies
// mechanically, so most items test the surprise-vs-forecast reading skill
// and the "this doesn't guarantee an outcome" distinction directly, rather
// than plain recall of a definition. Several scenario items reuse this
// module's own running example (the CPI/NFP/GDP/unemployment/central-bank
// figures the lesson text itself carries across Lessons 2, 4, 6–9, 12, and
// 14) — nothing here invents a market claim beyond what each lesson
// already teaches, and no current real-world officeholder, rate, or event
// is referenced, matching the module's own deliberate scope.

export const module05Interactions: Record<string, Interaction[]> = {
  "introduction-to-fundamental-analysis": [
    {
      kind: "check",
      id: "m5-l1-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, what does fundamental analysis study, as distinct from technical analysis and price action?",
      options: [
        { key: "A", text: "Price movement itself" },
        { key: "B", text: "The economic, monetary, and political conditions that influence a currency's value" },
        { key: "C", text: "Chart patterns and candlestick shapes" },
        { key: "D", text: "Broker execution quality" },
      ],
      correctKey: "B",
      correctFeedback: "Right — fundamental analysis is the study of the conditions behind a currency, complementing the price-reading tools from Modules 2–4.",
      incorrectFeedback: "Re-read the opening definition: fundamental analysis studies economic, monetary, and political conditions — Modules 2–4 already covered price movement itself.",
    },
    {
      kind: "reveal",
      id: "m5-l1-r1",
      label: "Think About It",
      prompt:
        "This lesson calls fundamental analysis a different layer of the same picture, not a separate, competing method from technical analysis. Why does that framing matter?",
      revealLabel: "Reveal explanation",
      explanation:
        "Because Lesson 12 shows the three approaches — fundamental, technical, price action — are meant to be combined and weighed together, not treated as rival systems where only one can be \"right.\"",
    },
  ],

  "previous-forecast-and-actual-how-markets-read-economic-data": [
    {
      kind: "check",
      id: "m5-l2-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt:
        "A CPI report comes in exactly at its forecast, even though the headline number sounds high in the news. Per this lesson, what does it say tends to happen to price?",
      options: [
        { key: "A", text: "Price usually moves sharply, since the headline number sounds high" },
        { key: "B", text: "Price often reacts very little, since the forecast was already priced in" },
        { key: "C", text: "Price always falls in this exact situation" },
        { key: "D", text: "The reaction depends only on whether the number is above or below last year's reading" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, a number that comes in exactly as forecast often produces very little reaction, since the forecast is already assumed to be priced in.",
      incorrectFeedback: "Re-read the \"Why does it matter?\" section: markets react to the surprise relative to forecast, not to how the raw number sounds on its own.",
    },
    {
      kind: "check",
      id: "m5-l2-q2",
      type: "mc",
      label: "Calculation",
      scenario: "A retail sales report shows: Previous 0.3%, Forecast 0.2%, Actual −0.1%.",
      prompt: "Using this lesson's framework, how does this reading compare on both comparisons it teaches you to check?",
      options: [
        { key: "A", text: "A downside surprise versus forecast, and a slowdown versus the previous reading" },
        { key: "B", text: "An upside surprise versus both forecast and the previous reading" },
        { key: "C", text: "No surprise at all, since the numbers are all close to zero" },
        { key: "D", text: "This can't be assessed without more data" },
      ],
      correctKey: "A",
      correctFeedback: "Right — −0.1% is below the 0.2% forecast (a downside surprise) and below the 0.3% previous reading (a slowdown) — both comparisons this lesson teaches you to make.",
      incorrectFeedback: "Follow the lesson's two comparisons separately: actual vs. forecast (−0.1% vs. 0.2%) and actual vs. previous (−0.1% vs. 0.3%) — both point the same direction here.",
    },
  ],

  "interest-rates-monetary-policy": [
    {
      kind: "check",
      id: "m5-l3-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, why is \"higher interest rates always mean a stronger currency\" an oversimplification?",
      options: [
        { key: "A", text: "Interest rates never actually affect currency demand" },
        { key: "B", text: "The relationship depends heavily on what was already expected — a hike the market fully priced in may barely move price at all" },
        { key: "C", text: "Higher rates always weaken a currency instead" },
        { key: "D", text: "Central banks no longer use interest rates as a policy tool" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, \"all else being equal\" rarely holds; expectations, forward guidance, and what's already priced in shape the actual reaction.",
      incorrectFeedback: "Re-read \"Why this relationship is NOT automatic\": rates can genuinely influence currency demand, but expectations already priced in often matter more than the move itself.",
    },
    {
      kind: "reveal",
      id: "m5-l3-r1",
      label: "Think About It",
      prompt:
        "Currency A's rate is 5.00% and Currency B's is 1.00% — a gap that could make Currency A attractive. But the market expects Currency B to hike several times while Currency A is expected to cut. Which matters more to current price, per this lesson — the current gap, or the expected future path?",
      revealLabel: "Reveal answer",
      explanation:
        "The expected future path, per the lesson — markets often move on rate expectations, not just the current rate itself, which is why a currency can weaken even while its central bank is actively raising rates.",
    },
  ],

  inflation: [
    {
      kind: "check",
      id: "m5-l4-q1",
      type: "mc",
      label: "Scenario",
      scenario: "A CPI report shows headline inflation at 3.4% and core inflation (ex food and energy) at 3.2% — a 0.2 percentage-point gap.",
      prompt: "Per this lesson, what does this small gap between headline and core suggest?",
      options: [
        { key: "A", text: "The headline surprise wasn't driven by one isolated category, making it look more broad-based" },
        { key: "B", text: "The report must be inaccurate" },
        { key: "C", text: "Core CPI is now irrelevant to the central bank" },
        { key: "D", text: "The central bank will definitely cut rates at its next meeting" },
      ],
      correctKey: "A",
      correctFeedback: "Right — a small headline/core gap suggests the surprise wasn't driven by one volatile category like energy, which can make it look more broad-based.",
      incorrectFeedback: "Re-read the worked example directly: a small gap between headline and core suggests the surprise is broad-based, not isolated to one category.",
    },
    {
      kind: "check",
      id: "m5-l4-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, any high CPI reading should be read as automatically currency-bullish.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the Beginner Mistake note, the reaction depends on the surprise relative to forecast, the core/headline breakdown, and the likely central-bank response.",
      incorrectFeedback: "Re-read the Beginner Mistake note: treating any high CPI reading as automatically currency-bullish is the exact mistake this lesson warns against.",
    },
  ],

  "employment-data": [
    {
      kind: "check",
      id: "m5-l5-q1",
      type: "mc",
      label: "Calculation",
      scenario: "An unemployment rate report shows: Previous 4.0%, Forecast 4.0% (no change expected), Actual 3.9%.",
      prompt: "Using this lesson's framework, how should this reading be read?",
      options: [
        { key: "A", text: "A negative surprise, since the unemployment rate fell" },
        { key: "B", text: "A positive surprise relative to forecast, even though the change is small in absolute terms" },
        { key: "C", text: "No meaningful information, since forecast and previous were identical" },
        { key: "D", text: "A sign the central bank will definitely cut rates immediately" },
      ],
      correctKey: "B",
      correctFeedback: "Right — 3.9% came in 0.1 percentage points below the 4.0% forecast, read as a positive surprise for the labor market, per this lesson's own worked example.",
      incorrectFeedback: "Re-read the worked example directly: coming in below forecast is read as a positive surprise for the labor market, even when the move is small.",
    },
  ],

  "nfp-non-farm-payrolls": [
    {
      kind: "check",
      id: "m5-l6-q1",
      type: "mc",
      label: "Calculation",
      scenario: "An NFP report shows: Previous 175,000, Forecast 180,000, Actual 225,000.",
      prompt: "By how much did the actual reading beat the forecast?",
      options: [
        { key: "A", text: "5,000 jobs" },
        { key: "B", text: "45,000 jobs" },
        { key: "C", text: "50,000 jobs" },
        { key: "D", text: "225,000 jobs" },
      ],
      correctKey: "B",
      correctFeedback: "225,000 − 180,000 (forecast) = 45,000. (50,000 is the beat versus the previous reading, a different comparison — check which baseline the question asks about.)",
      incorrectFeedback: "Compare actual against forecast specifically: 225,000 − 180,000 = 45,000. Don't confuse this with the comparison against the previous reading (175,000).",
    },
    {
      kind: "check",
      id: "m5-l6-q2",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a strong NFP report that beats its forecast guarantees the currency will rise.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — per the lesson, the actual reaction depends on wage growth, the unemployment rate released alongside it, other data due that week, and positioning — not the headline number alone.",
      incorrectFeedback: "Re-read \"Why NFP does not guarantee a specific currency direction\" — the headline beat is only one part of a larger picture.",
    },
  ],

  gdp: [
    {
      kind: "check",
      id: "m5-l7-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, why is GDP generally interpreted alongside inflation and employment data rather than in isolation?",
      options: [
        { key: "A", text: "GDP numbers are never accurate" },
        { key: "B", text: "GDP is backward-looking, reported less frequently, gets revised, and says nothing on its own about how growth is distributed" },
        { key: "C", text: "GDP is only relevant to bond markets, not currencies" },
        { key: "D", text: "GDP is calculated using the exact same method as CPI" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the \"Limitations of GDP\" section, it's a look in the rearview mirror that's best read alongside inflation and employment data.",
      incorrectFeedback: "Re-read \"Limitations of GDP\": it's backward-looking, revised, and reported quarterly — that's why it's read alongside other data, not in isolation.",
    },
  ],

  "central-banks": [
    {
      kind: "check",
      id: "m5-l8-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "A central bank holds rates exactly as the market expected — but its statement describes inflation risks as \"elevated\" and signals it isn't ready to cut as soon as the market had priced in.",
      prompt: "Per this lesson, what is most likely to actually move the currency here?",
      options: [
        { key: "A", text: "Nothing — the currency can't move if the rate decision matched expectations exactly" },
        { key: "B", text: "The tone of the guidance, which was more cautious about inflation than expected" },
        { key: "C", text: "The currency cannot move unless the rate itself changes" },
        { key: "D", text: "Only the length of the press conference matters" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson's own worked example, the decision itself wasn't a surprise, but the more cautious tone was plausibly enough, on its own, to move the currency.",
      incorrectFeedback: "Re-read the worked example: even with an as-expected hold, guidance that sounds more cautious or more aggressive than expected can move the currency by itself.",
    },
    {
      kind: "reveal",
      id: "m5-l8-r1",
      label: "Think About It",
      prompt: "Why does this lesson deliberately avoid naming any current central bank officeholder or policy rate?",
      revealLabel: "Reveal explanation",
      explanation:
        "Because both change over time, and the course is meant to stay accurate regardless of when you're taking it — per the lesson's own Note, current specifics are worth looking up directly, not learning from a course.",
    },
  ],

  "reading-an-economic-calendar": [
    {
      kind: "check",
      id: "m5-l9-q1",
      type: "mc",
      label: "Scenario",
      scenario: "This lesson's sample calendar shows NFP and the Unemployment Rate both scheduled for Friday at 12:30 UTC.",
      prompt: "Per this lesson, why is this worth noting in advance?",
      options: [
        { key: "A", text: "It means one of the two releases must be canceled" },
        { key: "B", text: "Multiple high-impact releases at the same time can move price quickly and simultaneously — better known in advance than discovered mid-trade" },
        { key: "C", text: "It means the calendar contains an error" },
        { key: "D", text: "It guarantees a bigger move than either release would cause on its own" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, knowing about simultaneous high-impact releases in advance is the practical value of checking the calendar first.",
      incorrectFeedback: "Re-read \"Why release timing matters\": simultaneous high-impact releases are worth knowing about in advance, not a calendar error or a guaranteed larger move.",
    },
  ],

  "major-economic-news": [
    {
      kind: "check",
      id: "m5-l10-q1",
      type: "tf",
      label: "True or False",
      prompt: "Per this lesson, a central-bank decision, an inflation report, and an unscheduled surprise development should all be expected to create the same kind of volatility.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "False — per the Beginner Mistake note, different categories of news create different kinds and durations of volatility.",
      incorrectFeedback: "Re-read the Beginner Mistake note: treating every major release the same way, without recognizing they create different kinds of volatility, is the mistake flagged here.",
    },
    {
      kind: "reveal",
      id: "m5-l10-r1",
      label: "Think About It",
      prompt: "This lesson says spreads can widen and \"execution risk\" increases around high-impact releases. What does execution risk mean here, per the lesson?",
      revealLabel: "Reveal explanation",
      explanation:
        "The chance that the price you actually get differs from the price you intended, because price moved between when you placed an order and when it filled.",
    },
  ],

  "geopolitical-events": [
    {
      kind: "check",
      id: "m5-l11-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, geopolitical events can affect currencies through which channels?",
      options: [
        { key: "A", text: "Only scheduled economic reports" },
        { key: "B", text: "Uncertainty, trade effects, capital flows, and shifts in economic expectations" },
        { key: "C", text: "Only central-bank rate decisions" },
        { key: "D", text: "They have no measurable effect on currencies" },
      ],
      correctKey: "B",
      correctFeedback: "Right — this lesson lists uncertainty, trade, capital flows, and economic expectations as the general channels, without claiming any is automatic.",
      incorrectFeedback: "Re-read \"How geopolitical events can affect currencies\": it lists four channels — uncertainty, trade, capital flows, and economic expectations.",
    },
    {
      kind: "check",
      id: "m5-l11-q2",
      type: "tf",
      label: "True or False",
      prompt:
        "This lesson's illustrative scenario (a trade dispute weakening the currency facing new restrictions) proves that every trade dispute produces this exact reaction.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — per the lesson, it's one illustrative way these channels can play out, not a rule; real geopolitical events are historically inconsistent in their market impact.",
      incorrectFeedback: "Re-read \"Why causality here deserves particular care\": the same broad type of event has produced different, sometimes opposite, reactions historically.",
    },
  ],

  "combining-fundamental-and-technical-analysis": [
    {
      kind: "check",
      id: "m5-l12-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "Per this lesson's worked example, the fundamental backdrop (hot CPI, cautious central-bank guidance, strong NFP) is broadly consistent with bullish chart structure and a recent bullish Break of Structure.",
      prompt: "What does this framework suggest a trader do with this combination?",
      options: [
        { key: "A", text: "Trade on the fundamental story alone and ignore the chart entirely" },
        { key: "B", text: "Treat the fundamental backdrop as supportive context, and use technical/price-action tools to look for a specific, structured way to act" },
        { key: "C", text: "Ignore the fundamentals, since only the chart ever matters" },
        { key: "D", text: "Wait until fundamentals and technicals always agree before ever trading" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, the fundamental backdrop provides supportive context, while the technical/price-action tools supply a specific, structured way to act on it.",
      incorrectFeedback: "Re-read the worked example: it treats the fundamental view as context, then uses Modules 3–4's tools to find a structured way to act — not one in isolation from the other.",
    },
    {
      kind: "reveal",
      id: "m5-l12-r1",
      label: "Think About It",
      prompt: "This lesson says fundamentals and technicals can just as easily disagree as agree. What should a trader do when they disagree, per this lesson?",
      revealLabel: "Reveal explanation",
      explanation:
        "Weigh them together honestly, rather than picking whichever one happens to support a trade already wanted — the same discipline Module 4's multi-timeframe conflict lesson taught.",
    },
  ],

  "uncertainty-market-expectations-limitations": [
    {
      kind: "check",
      id: "m5-l13-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, what does it mean that \"being right about the economy does not automatically mean being right about a trade\"?",
      options: [
        { key: "A", text: "Economic analysis and profitable trading are exactly the same skill" },
        { key: "B", text: "A trader can correctly anticipate an economic outcome and still lose money on a trade built around it, due to timing, sizing, or how much was already priced in" },
        { key: "C", text: "Being right about the economy guarantees a profitable trade" },
        { key: "D", text: "Fundamental analysis is therefore not worth learning" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson, this is described as perhaps the most important professional mindset here: the two are related but not the same skill.",
      incorrectFeedback: "Re-read the closing section directly: correctly anticipating an economic outcome doesn't guarantee a winning trade — timing and sizing still matter.",
    },
    {
      kind: "check",
      id: "m5-l13-q2",
      type: "tf",
      label: "True or False",
      prompt:
        "Per this lesson, a relationship that has held reliably in the past (like a currency strengthening on strong employment data) is a fixed law that will always hold in the future.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "False — per \"Correlations can change,\" a relationship that held for a period can weaken or break down as conditions shift; treating it as a fixed law is a recurring mistake.",
      incorrectFeedback: "Re-read \"Correlations can change\": historical patterns are tendencies that can shift, not fixed laws.",
    },
  ],

  "a-practical-fundamental-analysis-workflow": [
    {
      kind: "check",
      id: "m5-l14-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson's workflow, what should you note before a scheduled release even happens — not just the event itself?",
      options: [
        { key: "A", text: "The final actual value" },
        { key: "B", text: "The forecast — what the market already expects" },
        { key: "C", text: "Next month's release date" },
        { key: "D", text: "The central bank's next officeholder" },
      ],
      correctKey: "B",
      correctFeedback: "Right — Step 2 is noting the forecast: a release without a forecast in mind is much harder to interpret once it's published.",
      incorrectFeedback: "Re-check the seven numbered steps: Step 2 is noting the forecast before the release happens.",
    },
    {
      kind: "check",
      id: "m5-l14-q2",
      type: "mc",
      label: "Scenario",
      scenario:
        "Following this lesson's worked example: CPI surprises to the upside, recent NFP also beat forecast, and the chart shows bullish structure with a recent Break of Structure.",
      prompt: "Per Step 7 of this lesson's workflow, what should the trader stay clear about?",
      options: [
        { key: "A", text: "That this combination guarantees the trade will work" },
        { key: "B", text: "That none of this produces certainty — it produces a reasoned, informed view, still requiring risk management before it becomes an actual trade" },
        { key: "C", text: "That risk management is now unnecessary since everything lines up" },
        { key: "D", text: "That the fundamental view should override the technical picture going forward" },
      ],
      correctKey: "B",
      correctFeedback: "Right — per the lesson's own worked example, this consistent picture still doesn't guarantee the trade works out, and still needs Module 6's risk management.",
      incorrectFeedback: "Re-read Step 7 (\"Stay honest about uncertainty\") and the worked example's final line: nothing here produces certainty, however consistent the picture looks.",
    },
  ],
};
