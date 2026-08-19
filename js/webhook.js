/* ============================================================
   ABC QUIZ — LEAD CAPTURE WEBHOOKS

   Sends quiz results to:
   1. Codebreak webhook (ACTIVE_CAMPAIGN_WEBHOOK_URL)
   2. GHL webhook (GHL_WEBHOOK_URL) — GoHighLevel inbound webhook

   Fields sent: first name, email, consent, trap result, score,
   score band, free text answer.

   Both webhooks fire independently — if one fails, the other still
   completes. Never blocks the results page.
   ============================================================ */

async function submitLeadToActiveCampaign(payload) {
  const results = {};

  // Send to Codebreak webhook
  if (ACTIVE_CAMPAIGN_WEBHOOK_URL) {
    try {
      const res = await fetch(ACTIVE_CAMPAIGN_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.codebreak = { ok: res.ok };
    } catch (err) {
      console.error("Codebreak webhook failed:", err);
      results.codebreak = { ok: false, error: err.message };
    }
  }

  // Send to GHL webhook
  if (GHL_WEBHOOK_URL) {
    try {
      const res = await fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.ghl = { ok: res.ok };
    } catch (err) {
      console.error("GHL webhook failed:", err);
      results.ghl = { ok: false, error: err.message };
    }
  }

  // Log results but never block the page
  console.info("[webhooks] results:", results);
  return results;
}
