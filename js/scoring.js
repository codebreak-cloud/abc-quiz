/* ============================================================
   ABC QUIZ — SCORING
   Rules per abc-quiz-draft-v1-with-visuals.md:

   - Q1-6: each answer tags a trap (IH/BB/LMW). Most picked trap wins.
   - Dominance points (0-40): how many of the 6 answers went to the
     winning trap. Spec anchors: 2 of 6 -> near 0, 6 of 6 -> 40.
     Linear between: points = ((count - 2) / 4) * 40
   - Q7 (intensity, doesn't affect trap): 20 / 40 / 60 points.
   - Total score = dominance points + Q7 points (range 20-100).
   - Tie-break (build decision, confirmed with Ellie): with 6 forced
     choice answers a two-way (3-3-0) or three-way (2-2-2) tie is
     possible. Q6 (the "sting" question) always belongs to one of the
     tied traps in both cases, so its trap wins the tie.
   ============================================================ */

function tallyTraps(traps) {
  const counts = { IH: 0, BB: 0, LMW: 0 };
  traps.forEach((t) => counts[t]++);
  return counts;
}

function resolveWinner(counts, q6Trap) {
  const max = Math.max(counts.IH, counts.BB, counts.LMW);
  const topTraps = Object.keys(counts).filter((t) => counts[t] === max);
  if (topTraps.length === 1) return topTraps[0];
  // Tie: Q6's own trap always sits among the tied traps (a trap with
  // zero picks can't be tied for the max), so this always resolves.
  if (topTraps.includes(q6Trap)) return q6Trap;
  return topTraps[0];
}

function dominancePoints(winningCount) {
  const clamped = Math.max(2, Math.min(6, winningCount));
  return Math.round(((clamped - 2) / 4) * 40);
}

function scoreBandFor(score, SCORE_BANDS) {
  return SCORE_BANDS.find((b) => score <= b.max);
}

/**
 * @param {Object} answers - { q1..q6: trapKey string, q7: points number, q8: string }
 * @returns {{ trap: string, score: number, band: object, freeText: string }}
 */
function calculateResult(answers, SCORE_BANDS) {
  const traps = [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5, answers.q6];
  const counts = tallyTraps(traps);
  const winner = resolveWinner(counts, answers.q6);
  const score = dominancePoints(counts[winner]) + answers.q7;
  const band = scoreBandFor(score, SCORE_BANDS);
  return { trap: winner, score, band, freeText: answers.q8 || "" };
}

if (typeof module !== "undefined") {
  module.exports = { tallyTraps, resolveWinner, dominancePoints, scoreBandFor, calculateResult };
}
