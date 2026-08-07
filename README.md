# ABC Quiz — "Why Can't You Just Do The Thing In Your Business?"

Static site, no build step. Plain HTML/CSS/JS (no React/Node) because this
machine has no Node.js/npm installed — see "Why plain JS" below if you later
want to migrate to the originally-planned Vite/React/TypeScript stack.

## Running it locally

No install needed. Either:

- Double-click [index.html](index.html) to open it directly in a browser, **or**
- Serve it properly (recommended, avoids any `file://` quirks):
  ```
  cd quiz-app
  python3 -m http.server 4173
  ```
  then open http://localhost:4173

## What's built

- Landing page (hero, hook, credibility, how-it-works, testimonials, final CTA)
- 8-question quiz (6 trap-tagged + 1 intensity + 1 free text), answers shuffled per question
- Rollercoaster progress cart — SVG path, cart travels along it on each click with eased acceleration, then parks itself on the results page
- Data capture step (first name, email, consent checkbox)
- Scoring engine (`js/scoring.js`) — trap tally, tie-break, dominance + intensity score out of 100
- 3 personalized results pages (Idea Hoarder / Boom and Bust / Last-Minute Wrecker), one shared template in `index.html` populated per trap
- Grip strength gauge (animates on results load, color/fill tied to score band)
- Responsive layout (mobile + desktop)

## Files

```
index.html            all views (landing / quiz / capture / results), one SPA
css/styles.css         component styles, built on the tokens below
css/tokens/*.css       real ABC Quiz Design System tokens (colors, type, spacing, base)
js/data.js             questions, results copy, trap/offer config — edit copy here
js/scoring.js          pure scoring functions (tally, tie-break, score, band)
js/animations.js       rollercoaster cart, grip gauge
js/webhook.js          lead capture POST (placeholder — see below)
js/app.js              view routing, state, wiring everything together
```

## Design system

This now uses the **real "ABC Quiz Design System"** exported from Claude
Design (Ellie dropped the handoff ZIP into the project folder). The token
files in `css/tokens/` (`colors.css`, `typography.css`, `spacing.css`,
`fonts.css`, `base.css`) are copied verbatim from that export — purple
`#845aa6` primary, yellow `#fdb913` accent, green `#8d9f38` support, Quicksand
throughout, pill buttons, soft purple-tinted shadows, spring-easing motion.
The full unzipped export lives in `../design-system-handoff/` if you want to
see the original reference (JSX components, screenshots, guideline cards).

**One thing worth knowing:** that design system project was built from a
different version of the brief than the one Ellie confirmed for this build —
its own reference implementation uses **10 questions on a 1–4 scale** ("Never
/ Occasionally / Often / Constantly"), a GHL webhook, and a different
tie-break rule. This build keeps Ellie's confirmed content and scoring (8
situational questions, ActiveCampaign, Q6-wins tie-break) — only the *visual
language* (colors, type, spacing, component patterns, motion) was ported
over, not that reference's question set or scoring logic.

Colour is **band-driven and section-driven**, not trap-driven, matching the
reference `Results.jsx` convention: the grip gauge and score-band pill use
green/yellow/purple for light/firm/deep regardless of which trap someone got,
and each results-page section has a fixed accent (reframe = purple, cost =
yellow, fix = green) across all three trap pages. No trap has "its own colour."

## Placeholders you need to fill in

Search the code for `PLACEHOLDER` to find these:

1. **`js/data.js` → `ACTIVE_CAMPAIGN_WEBHOOK_URL`** — empty string. Until you
   create the ActiveCampaign webhook automation and drop the URL in, lead
   submissions just log to the browser console (see `js/webhook.js`) instead
   of failing silently.
2. **`js/data.js` → `OFFER`** — the £1-trial mechanic is built (plan selector,
   card-not-charged-today copy, auto-charge-after-30-days terms), but
   `plans.annual.priceLine` still has `£[X]`/`£[Y]` placeholders for the
   annual price and saving amount, and `joinUrl` (`#join-abc-placeholder`)
   needs the real checkout link. Swap once confirmed. The selected plan
   (`monthly`/`annual`) is passed to `joinUrl` as a `?plan=` query param for
   whatever checkout flow replaces the placeholder.
3. **Landing page testimonials** (`index.html`, "What ADHD Business Owners
   Say" section) — bracketed placeholder quotes, swap for real ones.
4. **Hero image** — spec called for `[HERO IMAGE]`; built a simple custom SVG
   illustration instead since no image asset was supplied.

## Scoring, as implemented

Per `abc-quiz-draft-v1-with-visuals.md`:

- Q1–6: each answer tags a trap (IH / BB / LMW). Most-picked trap wins.
- **Dominance points (0–40):** `((winning_count - 2) / 4) * 40` — the spec
  gave two anchor points (2 of 6 ≈ 0, 6 of 6 = 40) but not the values in
  between, so this is a linear interpolation build decision. Easy to change
  in `js/scoring.js` (`dominancePoints`) if Kim/Claire want a different curve.
- Q7 (intensity): 20 / 40 / 60 points, added to dominance points.
- **Tie-break:** confirmed with Ellie — Q6 ("the sting question") wins ties.
  This is provably safe: with 6 forced-choice answers, the only tie patterns
  are 2-2-2 or 3-3-0, and Q6's own answer is mathematically guaranteed to
  belong to one of the tied traps in both cases (verified in testing).
- Bands: <45 light, 45–70 firm, >70 deep — per spec.

## Known gaps / things to check yourself

I could not visually test this in a live browser — both the sandboxed
preview tool and the Chrome browser extension failed to connect in this
environment (unrelated to this codebase; confirmed by testing trivial,
unrelated commands that failed the same way). What I *did* verify:

- All JS files parse with no syntax errors (checked with JavaScriptCore)
- HTML tags are balanced/well-formed (checked with Python's HTML parser)
- The scoring engine was run against ~13 hand-built scenarios (all-one-trap,
  ties, boundary scores) with a real JS engine — every result matched the
  spec exactly
- The static file server serves every asset with 200 OK

What's **not** verified and needs a real look in a browser:
- Visual layout/spacing on actual mobile and desktop viewports
- The rollercoaster cart's motion/rotation along the SVG track
- The grip gauge actually looks right (not just "runs without throwing")
- Click-through of the full quiz flow end to end

Please open http://localhost:4173 yourself and run through it — happy to
fix anything that looks off once you've eyeballed it.

## Other build decisions worth knowing about

- **No back button** in the quiz — answers commit immediately and the cart
  only moves forward, matching the "no wrong answers, just forward motion"
  concept. Say if you'd rather allow going back.
- Consent checkbox on the capture form is **not required** to submit —
  the spec flagged this as unresolved ("worth checking how the rest of
  Kim's GHL forms handle it"), so it defaults to optional for now.
- First name has a `"friend"` fallback if somehow submitted blank, so no
  results page ever shows "Hi ,".

## Deploying

It's a fully static site — drag the `quiz-app` folder onto Netlify/Vercel,
or host it anywhere that serves static files (S3, GitHub Pages, or as a
custom page/iframe inside GHL).
