/* ============================================================
   ABC QUIZ — LEAD CAPTURE WEBHOOK

   PLACEHOLDER: ACTIVE_CAMPAIGN_WEBHOOK_URL (js/data.js) is empty.
   Ask Ellie/Kim to create an ActiveCampaign webhook-triggered
   automation and drop the URL in there. Until then this just
   logs the payload to the console so the flow can be tested.

   Fields sent match the "Custom fields needed" list in the spec:
   first name, email, trap result, score, score band, free text answer.
   ============================================================ */

async function submitLeadToActiveCampaign(payload) {
  if (!ACTIVE_CAMPAIGN_WEBHOOK_URL) {
    console.info("[webhook placeholder] would POST lead:", payload);
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch(ACTIVE_CAMPAIGN_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok };
  } catch (err) {
    // Never block the results page on a failed webhook — the user
    // has already earned their result.
    console.error("Lead webhook failed:", err);
    return { ok: false, error: err };
  }
}
