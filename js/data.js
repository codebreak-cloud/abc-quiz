/* ============================================================
   ABC QUIZ — DATA
   Source: abc-quiz-draft-v1-with-visuals.md
   8 questions: 6 situational (trap-tagged) + 1 intensity + 1 free text
   ============================================================ */

// Colour is band-driven (light/firm/deep -> green/yellow/purple) and
// section-driven (reframe/cost/fix -> purple/yellow/green) throughout the
// results page, per the ABC Quiz Design System — traps don't carry their
// own hue, matching the reference Results.jsx convention.
const TRAPS = {
  IH: {
    key: "IH",
    name: "Idea Hoarder",
    shortName: "The Idea Hoarder",
    costAnimation: "stacking",
  },
  BB: {
    key: "BB",
    name: "Boom and Bust",
    shortName: "The Boom and Bust",
    costAnimation: "pulse",
  },
  LMW: {
    key: "LMW",
    name: "Last-Minute Wrecker",
    shortName: "The Last-Minute Wrecker",
    costAnimation: "squeeze",
  },
};

// 6 situational questions, one answer per trap. Order of answers is
// shuffled at render time (see shuffleAnswers in app.js) so the trap
// groupings aren't guessable across the quiz.
const QUESTIONS = [
  {
    id: 1,
    type: "trap",
    prompt:
      "It's Monday morning and you've blocked out a whole day to work ON the business. What actually happens?",
    answers: [
      { trap: "IH", text: "You start something completely new that came to you in the shower" },
      { trap: "BB", text: "Depends entirely on which week you catch me. Could be superhuman, could be staring at a wall" },
      { trap: "LMW", text: "Every small task in existence gets done except the one that matters, because it's not due yet" },
    ],
  },
  {
    id: 2,
    type: "trap",
    prompt: "Open your notes app. What's in there?",
    answers: [
      { trap: "IH", text: "Roughly 400 business ideas, three half written offers and a name for a podcast that doesn't exist" },
      { trap: "BB", text: "Bursts of beautifully detailed plans, dated months apart, with nothing in between" },
      { trap: "LMW", text: "The same to-do-list copied forward week after week, with the same scary item at the top" },
    ],
  },
  {
    id: 3,
    type: "trap",
    prompt: "It's Sunday night. How do you feel about the week ahead?",
    answers: [
      { trap: "IH", text: "Buzzing. You've had a new idea and this one is definitely the one" },
      { trap: "BB", text: "No idea. Depends which version of you wakes up on Monday" },
      { trap: "LMW", text: "A low hum of dread about the thing you've been avoiding. Again" },
    ],
  },
  {
    id: 4,
    type: "trap",
    prompt: "Be honest. Why isn't the important thing done yet?",
    answers: [
      { trap: "IH", text: "Because six more interesting things happened since you decided to do it" },
      { trap: "BB", text: "You're waiting for your next good patch, whenever that decides to arrive" },
      { trap: "LMW", text: "It's not on fire yet, and your brain only responds to fire" },
    ],
  },
  {
    id: 5,
    type: "trap",
    prompt: "What happens when things actually start going well?",
    answers: [
      { trap: "IH", text: "You take it as a green light to start three new things" },
      { trap: "BB", text: "You ease off, the momentum quietly dies, and the cycle starts again" },
      { trap: "LMW", text: "You crash. The push it took to get there wiped you out" },
    ],
  },
  {
    id: 6,
    type: "trap",
    prompt: "Which sentence stings the most?",
    answers: [
      { trap: "IH", text: '"So much potential, so many unfinished projects"' },
      { trap: "BB", text: '"Where did you disappear to?"' },
      { trap: "LMW", text: '"You always leave it until the last minute"' },
    ],
  },
  {
    id: 7,
    type: "intensity",
    prompt:
      "Last one before your result. How often does your week actually go the way you planned it?",
    answers: [
      { points: 20, text: "Most weeks, give or take" },
      { points: 40, text: "About half the time" },
      { points: 60, text: "There was a plan?" },
    ],
  },
  {
    id: 8,
    type: "freetext",
    prompt: "What's the one thing in your business you keep meaning to do, but haven't got round to?",
    placeholder: "e.g. launch my email list, put my prices up, post consistently",
  },
];

// Score bands. Boundaries per spec: <45 light, 45-70 firm, >70 deep.
const SCORE_BANDS = [
  { key: "light", max: 44, label: "This trap has a light grip on you", shortLabel: "Light grip" },
  { key: "firm", max: 70, label: "This trap has a firm hold", shortLabel: "Firm hold" },
  { key: "deep", max: Infinity, label: "You are in the deep end of this one", shortLabel: "Deep end" },
];

// Results page copy. {{firstName}} / {{score}} / {{freeText}} / {{bandLine}}
// are substituted at render time. PLACEHOLDER = flagged for Kim/Claire to confirm.
const RESULTS_CONTENT = {
  IH: {
    trapName: "Idea Hoarder",
    headline: "{{firstName}}, you're caught in the Idea Hoarder trap.",
    reflection:
      "You told us the thing you keep meaning to do is <strong>{{freeText}}</strong>. Here's the uncomfortable truth: it's probably still not done because seventeen newer, shinier ideas have jumped the queue since then.",
    reframeHeading: "This isn't a discipline problem, {{firstName}}.",
    reframeBody: [
      "Your ADHD brain is an idea machine. Novelty gives it the dopamine it runs on, which is why a brand new idea always feels more alive than the half built one on your desk. Starting is the reward. Finishing offers your brain almost nothing.",
      "So you collect. Notebooks, voice notes, half started projects. Each one genuinely good. None of them finished. And from the outside it looks like progress, because you're always busy. But busy on six things is slower than focused on one.",
    ],
    costHeading: "What it's costing you",
    costBody:
      "Every unfinished idea is money you've spent (time, energy, sometimes actual money) with no return. Worse, the pile itself becomes the problem. You open your laptop, see everything you've started, feel the weight of it, and reach for a new idea because new is the only thing that doesn't feel heavy.",
    fixHeading: "What actually fixes it",
    fixBody:
      "Not another productivity app, {{firstName}}. Not trying harder. What works for brains like yours is external structure: somewhere to take the ideas so a decision gets made, and something that holds you to the one you chose.",
    bridgeHeading: "That's precisely what the ADHD Business Collective is built for.",
    bridgeBody:
      "Inside the ABC, the monthly Focus Strategy Call gets your ideas out of your head and into a one page plan with one main focus for the month ahead. The monthly Hotseat is where you bring the \"which idea do I actually run with\" question and get it answered by Kim and a room of business owners whose brains work like yours. Then the weekly body doubling sprints are where the chosen idea actually gets built, week after week, until it's done.",
    bridgeStrap: "Pick. Plan. Finish. With people who get it.",
    closing: "Imagine opening your laptop in a month's time, {{firstName}}, and <strong>{{freeText}}</strong> is done.",
  },
  BB: {
    trapName: "Boom and Bust",
    headline: "{{firstName}}, you're caught in the Boom and Bust trap.",
    reflection:
      "You told us the thing you keep meaning to do is <strong>{{freeText}}</strong>. Sound familiar? It gets done in the boom weeks and abandoned in the bust weeks, and the stop start is why it never sticks.",
    reframeHeading: "This isn't laziness, {{firstName}}. It's how an ADHD brain works.",
    reframeBody: [
      "Your brain doesn't do steady. It does all or nothing. Hyperfocus weeks where you achieve more than most people manage in a month, then flat weeks where opening your inbox feels like lifting a car. The problem is your marketing, your delivery and your income all end up on the same rollercoaster.",
    ],
    costHeading: "What it's costing you",
    costBody:
      "The revenue rollercoaster. Feast months and famine months. Clients and followers who forget you exist between bursts. And the exhausting cycle of rebuilding momentum from a standing start, over and over, because momentum was never held for you when you dipped.",
    fixHeading: "What actually fixes it",
    fixBody:
      "You will never willpower your way to consistency, {{firstName}}. The fix is borrowing structure: regular, scheduled, external rhythm that keeps things moving even in your flat weeks, so a dip never becomes a derailment.",
    bridgeHeading: "That's exactly what the ADHD Business Collective gives you.",
    bridgeBody:
      "The week has a shape inside the ABC. Body doubling sprints every Monday and Wednesday where you get the needle moving tasks done alongside other business owners doing the same. Friday sessions that pull you back to the plan. And when the flat weeks come, and they will, the community carries the rhythm until you're back. Kim's expert trainings even include End The Revenue Rollercoaster, because this trap is that common among ADHD business owners.",
    bridgeStrap: "",
    closing: "Steady, without pretending your brain is something it isn't. Picture <strong>{{freeText}}</strong> actually happening every week, {{firstName}}, even the flat ones.",
  },
  LMW: {
    trapName: "Last-Minute Wrecker",
    headline: "{{firstName}}, you're caught in the Last-Minute Wrecker trap.",
    reflection:
      "You told us the thing you keep meaning to do is <strong>{{freeText}}</strong>. Our guess? It'll get done eventually, in one frantic, caffeine soaked push at the worst possible moment, and it'll cost you a week of recovery afterwards.",
    reframeHeading: "This isn't self sabotage, {{firstName}}. It's how your brain sources fuel.",
    reframeBody: [
      "ADHD brains struggle to act without urgency. Pressure is the fuel, so you've learned, probably without realising, to manufacture it by waiting. And it works, sort of. You always pull it off. But you pull it off at 2am, running on adrenaline, and then you crash right at the moment your business needs you most.",
    ],
    costHeading: "What it's costing you",
    costBody:
      "The crash after every push. Launches you limped through instead of built on. Opportunities you didn't chase because you were recovering from the last sprint. And the quiet fear, {{firstName}}, that one day the last minute miracle won't come.",
    fixHeading: "What actually fixes it",
    fixBody:
      "You can't remove your brain's need for urgency, but you can change where the urgency comes from. Scheduled sessions, real people expecting you, small deadlines all the way through the month instead of one terrifying one at the end. Pressure in small, regular doses instead of one big blowout.",
    bridgeHeading: "That's what the ADHD Business Collective is designed around.",
    bridgeBody:
      "Body doubling sprints on Mondays and Wednesdays give you a start time, an end time and a room full of business owners getting their heads down with you. That's urgency, twice a week, in a dose that doesn't flatten you. The Friday planning and strategy sessions break the big scary things into pieces you can actually start early. And Kim's trainings include Bouncing Back From Burnout and Regulating Your ADHD Nervous System, because she has lived this trap too.",
    bridgeStrap: "",
    closing: "Get things done before the panic, and still have something left afterwards. That includes <strong>{{freeText}}</strong>, {{firstName}}, done calmly and early for once.",
  },
};

// £1-for-30-days trial offer. Card is captured at signup but not charged;
// monthly vs. annual is chosen on the GHL checkout page this button leads
// to, not here, so pricing for each plan lives in that checkout, not in
// this codebase. Same CTA/price/guarantee across all three traps now, so
// it lives here rather than per-trap in RESULTS_CONTENT.
const OFFER = {
  ctaText: "Yes, Start My £1 Month",
  // Alternates for Kim/Claire to swap in instead, if preferred:
  //   "Get Off The Rollercoaster For £1"
  //   "Try It For £1"
  price: "Just £1 for your first month",
  guarantee:
    "We'll ask for your card details to activate your £1 trial, but you won't be charged the full plan price today. You'll choose monthly or annual on the next step. Cancel any time in the next 30 days and you'll never be charged a penny more. If you don't, your card is automatically charged for the plan you picked, and you carry straight on.",
  joinUrl: "#join-abc-placeholder",
};

// PLACEHOLDER — real webhook endpoint to be created later (ActiveCampaign).
const ACTIVE_CAMPAIGN_WEBHOOK_URL = "";

if (typeof module !== "undefined") {
  module.exports = { TRAPS, QUESTIONS, SCORE_BANDS, RESULTS_CONTENT, OFFER, ACTIVE_CAMPAIGN_WEBHOOK_URL };
}
