/* ============================================================
   ABC QUIZ — LEAD CAPTURE WEBHOOKS

   Sends quiz results to:
   1. Codebreak webhook (ACTIVE_CAMPAIGN_WEBHOOK_URL)
   2. Zapier webhook (ZAPIER_WEBHOOK_URL) → GHL integration

   Fields sent: first name, email, consent, trap result, score,
   score band, free text answer.

   Both webhooks fire independently — if one fails, the other still
   completes. Never blocks the results page.
   ============================================================ */

async function submitLeadToWebhooks(payload) {
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

  // Send to Zapier webhook (GHL integration)
  if (ZAPIER_WEBHOOK_URL) {
    try {
      const res = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.zapier = { ok: res.ok };
    } catch (err) {
      console.error("Zapier webhook failed:", err);
      results.zapier = { ok: false, error: err.message };
    }
  }

  // Log results but never block the page
  console.info("[webhooks] results:", results);
  return results;
}

// Keep old function name for backwards compatibility
async function submitLeadToActiveCampaign(payload) {
  return submitLeadToWebhooks(payload);
}
