import type { Interaction } from "./types";

// Module 1 interactivity pilot — hand-authored for each of this module's 13
// lessons, grounded strictly in that lesson's own existing text (see
// content/course/modules/module-01-forex-fundamentals/01-content.md).
// Nothing here introduces a claim, number, or market scenario the lesson
// doesn't already support, and none of it implies a guaranteed outcome.
// Not every lesson gets the same interaction type — each was chosen for
// what that lesson's specific content supports (a definitional lesson gets
// a knowledge check; a mechanics lesson with a worked example gets a
// calculation-style check or a scenario; Lesson 13, the module's capstone
// walkthrough, gets a short multi-question end-of-lesson quick check).
//
// This is intentionally the ONLY module with lesson-embedded interactions
// so far — see the commit message / delivery report for why (a pilot for
// review before the same standard is applied to Modules 2–10).

export const module01Interactions: Record<string, Interaction[]> = {
  "what-is-forex": [
    {
      kind: "check",
      id: "m1-l1-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Based on this lesson, the Forex market is best described as:",
      options: [
        { key: "A", text: "A single centralized exchange, similar to a stock exchange" },
        { key: "B", text: "A decentralized network of banks, institutions, brokers, and traders" },
        { key: "C", text: "A simulation used only for practice before real trading" },
        { key: "D", text: "A market that only operates a few hours a day" },
      ],
      correctKey: "B",
      correctFeedback: "Forex has no single exchange — it's a decentralized, electronically connected network.",
      incorrectFeedback:
        "Re-read the lesson's second paragraph: unlike a stock exchange, Forex is decentralized — a network, not one building or authority.",
    },
    {
      kind: "reveal",
      id: "m1-l1-r1",
      label: "Think About It",
      prompt:
        "Before revealing the answer: why does it matter that the price on your screen reflects real buyers and sellers, not a random number generator?",
      revealLabel: "Reveal explanation",
      explanation:
        "It's the first mental shift toward trading responsibly, per this lesson: the price reflects genuine economic activity — trade, interest rates, investment flows, commerce — so it isn't a game, and accessibility from a phone app doesn't make the underlying risk any smaller.",
    },
  ],

  "how-the-forex-market-works": [
    {
      kind: "check",
      id: "m1-l2-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "You open a live EUR/USD chart and watch it for sixty seconds. The price ticks up and down continuously, sometimes by a fraction of a cent.",
      prompt: "Based only on what this lesson covered, which interpretation is best supported?",
      options: [
        { key: "A", text: "The constant movement means a breakout is about to happen in that direction" },
        {
          key: "B",
          text: "The movement reflects the market processing continuous order flow — it doesn't, on its own, indicate what happens next",
        },
        { key: "C", text: "The price feed must be malfunctioning" },
        { key: "D", text: "The direction it just moved guarantees it will keep moving that way" },
      ],
      correctKey: "B",
      correctFeedback:
        "The lesson is explicit that nothing about that movement is guaranteed to continue in any particular direction just because it moved that way a moment ago.",
      incorrectFeedback:
        "This lesson's beginner-mistake note warns against reading short-term movement as a signal on its own — re-read the \"What it looks like in practice\" section.",
    },
  ],

  "understanding-currency-pairs": [
    {
      kind: "check",
      id: "m1-l3-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "In the pair GBP/JPY, which currency is the base currency?",
      options: [
        { key: "A", text: "GBP" },
        { key: "B", text: "JPY" },
        { key: "C", text: "Neither — pairs don't have a base currency" },
        { key: "D", text: "Both, equally" },
      ],
      correctKey: "A",
      correctFeedback: "The base currency is always the one listed first — GBP here.",
      incorrectFeedback:
        "This lesson's habit for remembering it: the base currency is always written first, and it's the one you're figuratively \"holding\" when you buy the pair.",
    },
    {
      kind: "reveal",
      id: "m1-l3-r1",
      label: "Practical Task",
      prompt:
        "If EUR/USD rises from 1.08500 to 1.09000, which currency strengthened relative to the other? Decide before revealing.",
      revealLabel: "Reveal answer",
      explanation:
        "The Euro strengthened relative to the Dollar — it now takes more Dollars to buy the same Euro, exactly as the lesson's worked example describes.",
    },
  ],

  "major-minor-and-exotic-pairs": [
    {
      kind: "check",
      id: "m1-l4-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Using this lesson's classification, EUR/GBP is:",
      options: [
        { key: "A", text: "A major pair" },
        { key: "B", text: "A minor pair (a cross)" },
        { key: "C", text: "An exotic pair" },
        { key: "D", text: "Not a valid trading pair" },
      ],
      correctKey: "B",
      correctFeedback: "EUR/GBP pairs two major currencies without the US Dollar — the definition of a minor/cross pair.",
      incorrectFeedback:
        "A major pair always includes the US Dollar. EUR/GBP doesn't include USD, which is what makes it a minor pair (cross) rather than a major.",
    },
    {
      kind: "check",
      id: "m1-l4-q2",
      type: "tf",
      label: "True or False",
      prompt: "Exotic pairs typically have tighter spreads and more predictable liquidity than major pairs.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "It's the reverse — exotics typically have wider spreads and can move less predictably.",
      incorrectFeedback:
        "Re-check the lesson's Exotic pairs paragraph and the comparison table — exotics are described as having wider spreads, not tighter ones.",
    },
  ],

  "bid-ask-and-spread": [
    {
      kind: "check",
      id: "m1-l5-q1",
      type: "mc",
      label: "Calculation",
      scenario: "A quote shows a bid of 1.10015 and an ask of 1.10032.",
      prompt: "Using this lesson's method, what is the spread in pips?",
      options: [
        { key: "A", text: "0.17 pips" },
        { key: "B", text: "1.7 pips" },
        { key: "C", text: "17 pips" },
        { key: "D", text: "3.2 pips" },
      ],
      correctKey: "B",
      correctFeedback: "1.10032 − 1.10015 = 0.00017, which is 1.7 pips — the same method as the lesson's own example.",
      incorrectFeedback:
        "Follow the lesson's worked example: subtract bid from ask (1.10032 − 1.10015 = 0.00017), then read that as pips (1.7).",
    },
  ],

  "pips-and-pipettes": [
    {
      kind: "check",
      id: "m1-l6-q1",
      type: "mc",
      label: "Calculation",
      scenario: "USD/JPY moves from 150.200 to 150.450.",
      prompt: "How many pips did it move?",
      options: [
        { key: "A", text: "2.5 pips" },
        { key: "B", text: "0.25 pips" },
        { key: "C", text: "25 pips" },
        { key: "D", text: "250 pips" },
      ],
      correctKey: "C",
      correctFeedback: "For JPY pairs, a pip is the second decimal place: 150.450 − 150.200 = 0.250 = 25 pips.",
      incorrectFeedback:
        "This is the exact beginner mistake the lesson warns about: JPY pairs use the second decimal place for a pip, not the fourth.",
    },
  ],

  "lot-sizes": [
    {
      kind: "reveal",
      id: "m1-l7-r1",
      label: "Think About It",
      prompt:
        "A standard lot is worth roughly $10/pip on a USD-quoted pair. What's the approximate pip value of 2 standard lots? Work it out before revealing.",
      revealLabel: "Reveal answer",
      explanation:
        "Roughly $20/pip. Per the lesson, pip value scales linearly with position size — double the units, double the pip value.",
    },
    {
      kind: "check",
      id: "m1-l7-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "On a USD-quoted pair, approximately how much is one pip worth on a micro lot?",
      options: [
        { key: "A", text: "$10.00" },
        { key: "B", text: "$1.00" },
        { key: "C", text: "$0.10" },
        { key: "D", text: "$100.00" },
      ],
      correctKey: "C",
      correctFeedback: "A micro lot (1,000 units) is worth roughly $0.10 per pip, per the lesson's table.",
      incorrectFeedback: "Check the lesson's lot-size table — a micro lot is one-hundredth of a standard lot's pip value.",
    },
  ],

  "market-limit-and-stop-orders": [
    {
      kind: "check",
      id: "m1-l8-q1",
      type: "mc",
      label: "Scenario",
      scenario: "EUR/USD is at 1.08500. A trader wants to buy, but only if price first drops to 1.08300.",
      prompt: "Which order type fits this scenario?",
      options: [
        { key: "A", text: "Market order" },
        { key: "B", text: "Buy limit" },
        { key: "C", text: "Buy stop" },
        { key: "D", text: "Sell limit" },
      ],
      correctKey: "B",
      correctFeedback:
        "A buy limit is placed below the current price — exactly this lesson's example of waiting to buy at a more favorable, lower price.",
      incorrectFeedback:
        "A market order would enter immediately at the current price, not wait for a drop. This scenario matches the lesson's buy-limit example.",
    },
    {
      kind: "check",
      id: "m1-l8-q2",
      type: "tf",
      label: "True or False",
      prompt: "A buy stop order is placed below the current market price.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "A buy stop is placed above the current price — used to enter a breakout upward.",
      incorrectFeedback: "Check the lesson's order-type table: a buy stop sits above the current price, not below it.",
    },
  ],

  "leverage-and-margin": [
    {
      kind: "check",
      id: "m1-l9-q1",
      type: "mc",
      label: "Calculation",
      scenario: "A broker offers 20:1 leverage on a position with a full notional value of $50,000.",
      prompt: "Approximately how much margin is required?",
      options: [
        { key: "A", text: "$1,000" },
        { key: "B", text: "$2,500" },
        { key: "C", text: "$5,000" },
        { key: "D", text: "$25,000" },
      ],
      correctKey: "B",
      correctFeedback: "$50,000 ÷ 20 = $2,500 — the same division the lesson's own worked example uses.",
      incorrectFeedback: "Follow the lesson's method: margin ≈ notional value ÷ leverage ratio ($50,000 ÷ 20).",
    },
    {
      kind: "reveal",
      id: "m1-l9-r1",
      label: "Think About It",
      prompt: "Does leverage reduce the risk of a trade? Decide before revealing the lesson's answer.",
      revealLabel: "Reveal explanation",
      explanation:
        "No — per the lesson's risk note, leverage magnifies gains and losses equally. It doesn't make a trade safer or cheaper; it makes the same price movement matter more to the account balance.",
    },
  ],

  "forex-trading-sessions": [
    {
      kind: "check",
      id: "m1-l10-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Which overlap does this lesson describe as generally the most active window for major pairs?",
      options: [
        { key: "A", text: "Sydney/Tokyo" },
        { key: "B", text: "Tokyo/London" },
        { key: "C", text: "London/New York" },
        { key: "D", text: "There is no meaningful overlap" },
      ],
      correctKey: "C",
      correctFeedback: "The London/New York overlap is generally the most active window, since both high-volume regions are trading at once.",
      incorrectFeedback: "Re-check the \"Why does it matter\" section — it names the London/New York overlap specifically.",
    },
  ],

  "who-participates-in-the-forex-market": [
    {
      kind: "check",
      id: "m1-l11-q1",
      type: "mc",
      label: "Scenario",
      scenario:
        "A trader bases a EUR/USD decision mainly on what a popular trading forum currently expects will happen.",
      prompt: "Based only on this lesson, which observation is best supported?",
      options: [
        { key: "A", text: "This is a strong basis, since forums reflect real-time institutional flow" },
        {
          key: "B",
          text: "Retail sentiment is a relatively small share of total volume compared to institutional participants, making this a comparatively weak basis",
        },
        { key: "C", text: "Forums are themselves regulated financial institutions" },
        { key: "D", text: "Retail sentiment is the primary driver of every currency pair" },
      ],
      correctKey: "B",
      correctFeedback:
        "The lesson notes retail participation is real but a relatively small share of volume next to banks, corporations, and institutions.",
      incorrectFeedback:
        "This is the lesson's own beginner-mistake warning: assuming retail sentiment meaningfully drives major pairs the way it sometimes can in smaller markets.",
    },
  ],

  "understanding-brokers": [
    {
      kind: "check",
      id: "m1-l12-q1",
      type: "mc",
      label: "Knowledge Check",
      prompt: "Per this lesson, why does a broker's regulatory status matter in practice?",
      options: [
        { key: "A", text: "It guarantees the trader will be profitable" },
        {
          key: "B",
          text: "It determines real requirements like segregated client funds and accountability to a financial authority",
        },
        { key: "C", text: "It's irrelevant as long as the broker's website looks professional" },
        { key: "D", text: "It only matters for accounts above a certain size" },
      ],
      correctKey: "B",
      correctFeedback:
        "Regulation determines concrete requirements — segregated funds, minimum capital, accountability — not just appearances.",
      incorrectFeedback:
        "Re-read the \"Why does it matter\" paragraph — regulation is described by concrete requirements, not by how professional a site looks.",
    },
  ],

  "basic-trade-execution": [
    {
      kind: "check",
      id: "m1-l13-quick-1",
      type: "mc",
      label: "Quick Check · Question 1 of 3",
      prompt: "In this lesson's walkthrough, why does the buy market order fill at the ask price?",
      options: [
        { key: "A", text: "Because buying always executes at the ask" },
        { key: "B", text: "Because the ask is always the lower of the two prices" },
        { key: "C", text: "Because the broker chose that price randomly" },
        { key: "D", text: "Because the spread was zero on this trade" },
      ],
      correctKey: "A",
      correctFeedback: "A market buy order fills at the ask — the price at which the base currency can be bought right now.",
      incorrectFeedback: "Step 1 of the walkthrough states it directly: buying always executes at the ask.",
    },
    {
      kind: "check",
      id: "m1-l13-quick-2",
      type: "tf",
      label: "Quick Check · Question 2 of 3",
      prompt: "In the walkthrough, the stop loss was placed above the trade's entry price.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback: "The stop loss (a sell stop) was placed 10 pips below entry — the predetermined maximum acceptable loss.",
      incorrectFeedback: "Re-check step 2 of the walkthrough: the stop loss sat below the entry price, not above it.",
    },
    {
      kind: "check",
      id: "m1-l13-quick-3",
      type: "mc",
      label: "Quick Check · Question 3 of 3",
      prompt: "This lesson describes the same basic sequence behind essentially every trade. What is that sequence?",
      options: [
        { key: "A", text: "Enter, then decide on risk once the trade is already moving" },
        { key: "B", text: "Analyze, enter with a fitting order type, define risk with a stop loss, define an exit plan" },
        { key: "C", text: "Choose a lot size, then decide whether to analyze the pair" },
        { key: "D", text: "Wait for a signal from a trading forum, then enter immediately" },
      ],
      correctKey: "B",
      correctFeedback: "That's the lesson's closing summary — analyze, enter, define risk, define an exit, in that order.",
      incorrectFeedback:
        "The lesson's beginner-mistake note warns specifically against deciding the exit only after the trade is already moving — re-read the closing paragraph.",
    },
  ],
};
