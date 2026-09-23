import type { Interaction } from "./types";

// Module 7 — Trading Psychology. Batch 2 of the interactive-course
// expansion (Modules 5–7), authored against the same standard as Module 1
// (pilot) and Modules 2–6 (Batches 1 and 2) — see those files' own header
// comments for the full methodology.
//
// Grounding: every prompt, scenario, correct answer, and feedback line
// below is traced to a specific sentence, scenario, or table row in this
// module's own content/course/modules/module-07-trading-psychology/
// 01-content.md. Per the user's explicit Module 7 instruction, interactions
// here are scenario-based wherever the lesson supports it — "what would you
// do," identify-the-psychological-mistake, and disciplined-vs-impulsive
// framing reused directly from the lesson's own scenarios (Lesson 2's
// missed-setup-after-losses scenario, Lesson 3's moved-target scenario,
// Lesson 4's chased-rally scenario, Lesson 5's revenge-trading spiral,
// Lesson 6's weak-setup-after-waiting scenario, Lesson 9's disciplined-vs-
// impulsive table, Lesson 13's winning-streak overconfidence effect) rather
// than invented situations. Bias labels (confirmation bias, recency bias,
// loss aversion, overconfidence, outcome bias, availability bias, FOMO,
// revenge trading) are applied only where Lesson 7 or the relevant lesson
// explicitly names that exact concept — no mental-health claims are made,
// and the module's own repeated point that psychology "doesn't eliminate
// losses" or "guarantee profit" is never contradicted by any interaction's
// feedback text.
//
// Interaction count follows the same rhythm as Modules 5–6: most lessons
// get 2 interactions; Lesson 11 (Building Professional Trading Habits) and
// Lesson 14 (Building Your Personal Psychology Rules) get only 1 each,
// because both are checklist/template lessons built around a single
// conceptual point rather than several distinct testable ideas — the same
// reason Module 6's own risk-rules-template lesson (Lesson 12) also got
// only 1.
export const module07Interactions: Record<string, Interaction[]> = {
  "introduction-to-trading-psychology": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l1-q1",
      scenario:
        "A trader takes a trade with a valid setup, a position sized per Module 6's calculation, and a stop placed at a logical, structural level. The trade hits its stop and loses.",
      prompt: "Per this lesson, is this a \"bad decision\"?",
      options: [
        { key: "a", text: "Yes — any loss counts as a bad decision" },
        {
          key: "b",
          text: "No — a losing trade that followed the trader's own process completely is not a mistake",
        },
        { key: "c", text: "It depends on how large the dollar loss was" },
        { key: "d", text: "Only Module 9's journal can determine this" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson draws this distinction directly: a losing trade is a normal, expected outcome some percentage of the time, while a bad decision means abandoning your own criteria or acting on impulse. A properly followed trade that loses is not a mistake.",
      incorrectFeedback:
        "Not quite. The lesson's key distinction: a losing trade that followed a trader's own process completely — valid setup, sensible stop, properly calculated size — is not a bad decision, even though it lost. A bad decision means abandoning that process, regardless of the outcome.",
    },
    {
      kind: "reveal",
      id: "m7-l1-r1",
      label: "Think about it",
      prompt:
        "What's actually different between \"having a losing trade\" and \"making a bad decision\"?",
      revealLabel: "What the lesson says",
      explanation:
        "A losing trade can be planned correctly — a valid setup, a sensible stop, a properly calculated position size — and still lose, because losing is a normal, expected outcome some percentage of the time. A bad decision is different: abandoning your own criteria, sizing a position outside your rules, or acting on impulse rather than process — regardless of whether that particular decision happens to win or lose. A bad decision that wins is still a bad decision; a losing trade that followed your process completely is not a mistake.",
    },
  ],

  "fear-and-hesitation": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l2-q1",
      scenario:
        "A trader closes three consecutive losing trades that all followed their process correctly. A new setup forms that meets every one of their stated entry criteria, but they hesitate, second-guess it for no specific new reason, and let the entry window pass.",
      prompt: "Per this lesson, what was actually controllable in this situation?",
      options: [
        { key: "a", text: "Whether the missed trade would have won or lost" },
        {
          key: "b",
          text: "The decision to act on a setup that met their own criteria, regardless of how the recent losses felt",
        },
        { key: "c", text: "The outcome of the three prior losses" },
        { key: "d", text: "Nothing — the outcome was entirely up to the market" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit that the market outcome was never controllable, but the decision itself was: the setup met the trader's own criteria, and the hesitation wasn't based on anything specific to this setup.",
      incorrectFeedback:
        "The lesson's own analysis: the eventual market outcome was never something the trader could control. What was controllable was the decision — the setup met their own stated criteria, and the hesitation came from how the prior losses felt, not from anything about this specific setup.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l2-q2",
      prompt:
        "True or false: this lesson's practical takeaway is that a disciplined trader should train themselves to stop feeling fear entirely.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson explicitly says the takeaway isn't \"never feel fear.\" It's noticing the fear in the moment and checking it against a process, rather than letting it silently override a decision that otherwise met every stated criterion.",
      incorrectFeedback:
        "Actually false. The lesson explicitly states the takeaway isn't to eliminate fear — it's to notice fear in the moment and check it against your process, rather than letting it silently override a decision that met your own criteria.",
    },
  ],

  "greed-and-the-desire-for-more": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l3-q1",
      scenario:
        "A trade approaches its planned target, based on a structural level from Module 4. Instead of taking profit, the trader decides the trend \"still looks strong\" and moves the target farther away, wanting a bigger win. Price then reverses before reaching the new target.",
      prompt: "What does this lesson call this pattern?",
      options: [
        { key: "a", text: "A disciplined adjustment based on new structural information" },
        {
          key: "b",
          text: "Greed — a decision built from wanting more after the position was already winning, not from new structural evidence",
        },
        { key: "c", text: "A sensible use of Module 4's structure-reading tools" },
        { key: "d", text: "Revenge trading" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own analysis: the revised target wasn't built from new structural information, it was built from wanting more once the position was already profitable. That's the exact distinction this lesson is built around.",
      incorrectFeedback:
        "The lesson names this as greed specifically: the original plan came from actual Module 4 structure; the revised target came only from wanting more after the trade was already winning — not from any new structural evidence.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l3-q2",
      prompt:
        "True or false: wanting to grow your account and improve as a trader is, by itself, the problem this lesson is about.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson calls that ordinary, reasonable ambition. The problem is that desire getting inserted into an individual trade's decisions, overriding a plan set before the trade opened.",
      incorrectFeedback:
        "Actually false. The lesson distinguishes ambition (fine, and belongs in how a trader develops over time) from the problem it addresses: that desire for more overriding a single open trade's predefined plan.",
    },
  ],

  fomo: [
    {
      kind: "check",
      type: "mc",
      id: "m7-l4-q1",
      scenario:
        "A trader watches a pair rally sharply with no valid entry trigger having formed beforehand. Worried about missing further gains, they enter at the current price with no specific trigger, simply because the move is happening.",
      prompt: "Why does this lesson classify this entry as FOMO-driven?",
      options: [
        { key: "a", text: "Because it followed a defined trigger from Module 4, Lesson 9" },
        {
          key: "b",
          text: "Because it was built entirely from the discomfort of watching the move happen without being positioned, with no structural condition or defined trigger behind it",
        },
        { key: "c", text: "Because it exactly matched the trader's own written criteria" },
        { key: "d", text: "Because the position was sized per Module 6's calculation" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's own analysis: no structural condition, no defined trigger, no invalidation point decided in advance. The entry came entirely from discomfort, not from process.",
      incorrectFeedback:
        "The lesson is explicit: this entry wasn't built from any of Modules 2–4's process — no structural condition, no defined trigger. It came entirely from the discomfort of watching a move happen without being in it.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m7-l4-q2",
      label: "What would you do?",
      scenario:
        "The urge to chase a rally shows up, and you notice it.",
      prompt:
        "Per this lesson's Emotional Pause sequence (Notice → Stop → Identify → Check Rules → Decide), what's the very next step after noticing the urge?",
      options: [
        { key: "a", text: "Place the order immediately before the move continues further" },
        {
          key: "b",
          text: "Stop — do not place the order yet, which removes the time pressure the urge relies on",
        },
        { key: "c", text: "Increase the position size to make up for entering a bit late" },
        { key: "d", text: "Check what other traders are saying about the move" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson describes this step as removing the time pressure that FOMO relies on, before moving on to identifying the real driver and checking it against your actual entry criteria.",
      incorrectFeedback:
        "The sequence is Notice → Stop → Identify → Check Rules → Decide. Right after noticing the urge, the next step is Stop — not placing the order yet, which removes the time pressure the urge depends on.",
    },
  ],

  "revenge-trading": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l5-q1",
      scenario:
        "A properly sized, well-planned trade hits its stop loss. Instead of moving on, the trader immediately takes a lower-quality setup at increased size to \"win it back,\" which also loses — then abandons stop-loss discipline entirely on a third attempt.",
      prompt: "What does this lesson call this pattern?",
      options: [
        { key: "a", text: "Disciplined recovery" },
        { key: "b", text: "Revenge trading" },
        { key: "c", text: "Patient re-entry" },
        { key: "d", text: "Confirmation bias" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — this is the lesson's own worked scenario: one ordinary, properly managed loss escalating into a much larger sequence, driven almost entirely by the emotional reaction to the first loss.",
      incorrectFeedback:
        "This is the lesson's own revenge-trading scenario: entering the next trade specifically to emotionally recover a loss, taking a weaker setup, and increasing size to recover faster — escalating one ordinary loss into a much larger sequence.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l5-q2",
      prompt:
        "True or false: each trade should be evaluated independently against a trader's actual criteria — the next trade isn't responsible for recovering the previous one.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "true",
      correctFeedback:
        "Correct — a previous loss is already final, and treating the next trade as a \"make-up\" opportunity attaches an emotional job to it that has nothing to do with whether the setup is actually valid.",
      incorrectFeedback:
        "Actually true. The lesson is explicit: each trade is evaluated on its own merits, and a previous loss's outcome doesn't change based on what happens next.",
    },
  ],

  "overtrading-and-impatience": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l6-q1",
      label: "What would you do?",
      scenario:
        "You've waited several hours with no setup meeting your entry criteria. A setup finally appears that only partially matches your criteria — weaker confluence and a less clean structural read than usual.",
      prompt:
        "Applying this lesson's filter — \"would this setup meet my criteria if I had taken zero trades today?\" — what should you do?",
      options: [
        { key: "a", text: "Take it anyway, since you've waited long enough to deserve a trade" },
        {
          key: "b",
          text: "Skip it — the honest answer to the filter is no, so it fails regardless of how long the wait has felt",
        },
        { key: "c", text: "Take it, but at a smaller position size than usual" },
        { key: "d", text: "Ask another trader for a second opinion before deciding" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's filter is direct: if a setup only \"counts\" because of how long it's been since the last trade, it fails, regardless of how uncomfortable the wait has been.",
      incorrectFeedback:
        "The lesson's filter question is specific: would this setup meet your criteria if you'd taken zero trades today? Here, the honest answer is no — it only partially matches — so per the filter, it should be skipped.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l6-q2",
      prompt:
        "True or false: the amount of time spent waiting for a setup makes the next setup that appears more valid.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that the time spent waiting has no bearing on whether the next setup is genuinely valid; a setup either meets a trader's actual standard or it doesn't.",
      incorrectFeedback:
        "Actually false. The lesson states directly: the amount of time spent waiting for a setup has no bearing on whether the next one that appears is genuinely valid.",
    },
  ],

  "confirmation-bias-and-other-decision-biases": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l7-q1",
      scenario:
        "A trader remembers a trade taken outside their own rules that happened to win as a \"good decision,\" while a properly planned trade that lost gets remembered as a \"mistake.\"",
      prompt: "Which bias does this lesson use to describe this pattern?",
      options: [
        { key: "a", text: "Confirmation bias" },
        { key: "b", text: "Outcome bias" },
        { key: "c", text: "Loss aversion" },
        { key: "d", text: "Availability bias" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — outcome bias is judging a decision by its result rather than by the quality of the decision-making process at the time it was made, which this lesson identifies as reinforcing exactly the undisciplined behavior the module is built to reduce.",
      incorrectFeedback:
        "This is outcome bias: judging a decision by its result rather than by whether it followed the trader's actual process — a rule-breaking win gets misremembered as good, a properly planned loss as a mistake.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m7-l7-q2",
      scenario:
        "A trader keeps their risk percentage and position-sizing rules fixed even after a recent string of wins, specifically so that confidence has no mechanical way to translate into larger risk.",
      prompt: "Which bias is this practice meant to counter, per this lesson?",
      options: [
        { key: "a", text: "Recency bias" },
        { key: "b", text: "Overconfidence" },
        { key: "c", text: "Loss aversion" },
        { key: "d", text: "Confirmation bias" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson lists exactly this as the countermeasure for overconfidence: keeping risk and position-sizing rules fixed regardless of recent results, so confidence can't mechanically translate into larger risk.",
      incorrectFeedback:
        "This is the countermeasure the lesson names for overconfidence specifically: a string of recent wins can create a sense of unusually reliable judgment, so keeping sizing rules fixed removes any mechanical path from that feeling into larger risk.",
    },
  ],

  "accepting-losses": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l8-q1",
      scenario:
        "A setup met the trader's criteria, the position was sized per Module 6's calculation, and the stop loss was placed at a logical, structure-based point. The trade simply didn't work out.",
      prompt: "Is this a planned loss or a careless loss, per this lesson?",
      options: [
        { key: "a", text: "A planned loss" },
        { key: "b", text: "A careless loss" },
        { key: "c", text: "Neither — losses can't be categorized this way" },
        { key: "d", text: "It depends entirely on the dollar amount lost" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — a planned loss is exactly this: criteria met, position sized correctly, stop placed logically, and the trade simply not working out. That's a known, acceptable, pre-decided outcome, not a surprise.",
      incorrectFeedback:
        "This is a planned loss, per the lesson's own definition: the setup met criteria, the position was sized per Module 6, and the stop was placed at a logical point — the trade just didn't work out.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l8-q2",
      prompt:
        "True or false: a planned loss and a careless loss are the same event whenever the dollar amount lost happens to be identical.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that these two are not the same event, even when the dollar amount lost happens to be identical, because what matters is whether the process was actually followed.",
      incorrectFeedback:
        "Actually false. The lesson states these are not the same event even when the dollar amount lost is identical — a planned loss followed the process; a careless loss involved a skipped or violated step.",
    },
  ],

  "discipline-and-rule-following": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l9-q1",
      scenario: "A setup only partially matches a trader's entry criteria.",
      prompt:
        "Per this lesson's disciplined-vs-impulsive comparison, what's the disciplined decision here?",
      options: [
        { key: "a", text: "Take it anyway — it's \"close enough\"" },
        { key: "b", text: "Pass on the trade" },
        { key: "c", text: "Take it, but increase the position size to compensate" },
        { key: "d", text: "Wait for a second confirmation signal before deciding" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson's table lists exactly this pairing: setup partially matches criteria → disciplined decision is to pass; impulsive decision is taking it anyway as \"close enough.\"",
      incorrectFeedback:
        "Per the lesson's disciplined-vs-impulsive table, when a setup only partially matches criteria, the disciplined decision is to pass on the trade — taking it anyway as \"close enough\" is the impulsive one.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m7-l9-q2",
      scenario: "Price is approaching the stop loss on an open trade.",
      prompt:
        "Per this lesson's disciplined-vs-impulsive comparison, what's the disciplined decision here?",
      options: [
        { key: "a", text: "Leave the stop loss in place" },
        { key: "b", text: "Move the stop farther away to avoid the loss" },
        { key: "c", text: "Remove the stop loss entirely" },
        { key: "d", text: "Close the trade early, before the stop is reached" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the lesson's table pairs this exactly: stop loss approaching → disciplined decision is leaving it in place; moving it farther away to avoid the loss is the impulsive one (and, per Module 6, Lesson 3, silently changes the trade's risk).",
      incorrectFeedback:
        "Per the lesson's table, when a stop loss is approaching, the disciplined decision is to leave it in place — moving it farther away to avoid the loss is listed as the impulsive decision.",
    },
  ],

  "patience-and-consistency": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l10-q1",
      scenario:
        "A trader follows an identical, disciplined process on ten different trades and still gets a mix of wins and losses.",
      prompt: "Per this lesson, is that consistent?",
      options: [
        { key: "a", text: "Yes — consistent process, even though results varied" },
        { key: "b", text: "No — true consistency requires winning every trade" },
        { key: "c", text: "No — the mixed results prove the process is unreliable" },
        { key: "d", text: "It depends on whether more trades won than lost" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the lesson draws this distinction directly: consistency of process and consistency of results are different things, and Module 6's expectancy concept predicts exactly this kind of mixed outcome from an identical, disciplined process.",
      incorrectFeedback:
        "The lesson's point is that consistency of process and consistency of results are genuinely different — ten identical, disciplined decisions can still produce a mix of wins and losses, and that's still consistent process.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l10-q2",
      prompt:
        "True or false: this course includes a rule stating that a valid trading day requires at least one trade.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson says directly: there is no rule, anywhere in this course, that says a valid trading day requires a trade in it.",
      incorrectFeedback:
        "Actually false. The lesson states plainly that there is no rule anywhere in this course requiring a trade every day — treating each day as needing one is called out as a common source of overtrading.",
    },
  ],

  "building-professional-trading-habits": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l11-q1",
      prompt:
        "Which of the following is explicitly listed in this lesson as a professional trading habit?",
      options: [
        { key: "a", text: "Taking a break after an emotionally difficult session" },
        { key: "b", text: "Increasing position size to make up for a quiet session" },
        { key: "c", text: "Trading every session regardless of whether a setup appears" },
        { key: "d", text: "Skipping the economic calendar to avoid being influenced by it" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the lesson lists stepping away after a session involving a significant loss, a losing streak, or rule-breaking, rather than immediately opening a new position while still affected by what happened.",
      incorrectFeedback:
        "The habit actually listed is taking a break after an emotionally difficult session — the other three options describe exactly the kind of overtrading and impatience this module warns against elsewhere.",
    },
  ],

  "the-psychology-of-a-trading-routine": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l12-q1",
      prompt:
        "Per this lesson's three-phase routine, which phase does \"check the economic calendar\" belong to?",
      options: [
        { key: "a", text: "Before Trading" },
        { key: "b", text: "During Trading" },
        { key: "c", text: "After Trading" },
        { key: "d", text: "It's checked continuously throughout the session" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — the Before Trading phase's sequence is Prepare → Review rules → Check market conditions → Check scheduled news → Set risk boundaries.",
      incorrectFeedback:
        "Checking scheduled news belongs to the Before Trading phase, alongside preparing your watchlist, reviewing rules, checking market conditions, and setting risk boundaries for the session.",
    },
    {
      kind: "check",
      type: "mc",
      id: "m7-l12-q2",
      prompt:
        "Which of the following is one of the seven questions in this lesson's Post-Trade Review?",
      options: [
        { key: "a", text: "\"Did I follow my rules?\"" },
        { key: "b", text: "\"Did I make more money than yesterday?\"" },
        { key: "c", text: "\"Would other traders have taken this trade?\"" },
        { key: "d", text: "\"How many total trades have I taken this year?\"" },
      ],
      correctKey: "a",
      correctFeedback:
        "Correct — \"Did I follow my rules?\" is one of the Post-Trade Review's seven questions, alongside what was planned, what was actually done, what emotion was present, and what to repeat or change.",
      incorrectFeedback:
        "The Post-Trade Review's actual questions include \"Did I follow my rules?\", \"What did I plan?\", \"What did I actually do?\", and \"What emotion was present, if any?\" — not the other options listed here.",
    },
  ],

  "handling-losing-streaks-and-winning-streaks": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l13-q1",
      scenario:
        "A trader is five trades into a winning streak and considers increasing their position size beyond their normal risk, because they feel unusually sharp right now.",
      prompt: "What does this lesson identify this effect as?",
      options: [
        { key: "a", text: "A justified adjustment, since the results prove their edge" },
        {
          key: "b",
          text: "Overconfidence — a normal streak effect that precedes exactly this kind of rule violation",
        },
        { key: "c", text: "Recency bias about a past loss" },
        { key: "d", text: "Revenge trading" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson names overconfidence directly as the effect of a winning streak, and notes it's exactly when a rule violation is most likely to slip through unnoticed.",
      incorrectFeedback:
        "The lesson identifies this as overconfidence — a run of wins producing a sense of unusually sharp judgment, which tends to precede exactly this kind of oversized position or abandoned criteria.",
    },
    {
      kind: "check",
      type: "tf",
      id: "m7-l13-q2",
      prompt:
        "True or false: per this lesson, Module 6's position-sizing rules should be relaxed after a long winning streak, since the trader has proven their edge.",
      options: [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ],
      correctKey: "false",
      correctFeedback:
        "Correct — the lesson is explicit that the same position-sizing rules apply after ten straight wins exactly as they did before the streak started.",
      incorrectFeedback:
        "Actually false. The lesson states directly that a winning streak should not trigger increased risk — the same Module 6 position-sizing rules apply after ten straight wins exactly as before the streak.",
    },
  ],

  "building-your-personal-psychology-rules": [
    {
      kind: "check",
      type: "mc",
      id: "m7-l14-q1",
      prompt: "What is the Psychology Scorecard, per this lesson?",
      options: [
        { key: "a", text: "A clinical, diagnostic psychological assessment" },
        {
          key: "b",
          text: "A practical, personal check-in across patience, discipline, and related behaviors — not a diagnostic tool",
        },
        { key: "c", text: "A replacement for Module 9's trading journal" },
        { key: "d", text: "A required weekly exam before continuing to Module 8" },
      ],
      correctKey: "b",
      correctFeedback:
        "Correct — the lesson is explicit that this is a practical, personal check-in, not a clinical or diagnostic psychological assessment of any kind.",
      incorrectFeedback:
        "The lesson states directly: the Psychology Scorecard is a practical, personal check-in — not a clinical or diagnostic assessment, and not a substitute for Module 9's journal.",
    },
  ],
};
