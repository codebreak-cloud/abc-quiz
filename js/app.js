/* ============================================================
   ABC QUIZ — APP CONTROLLER
   Landing -> Quiz (8 Qs) -> Data capture -> Results (per trap)
   ============================================================ */

(function () {
  "use strict";

  const state = {
    currentIndex: 0, // 0-7, maps to QUESTIONS array
    answers: {}, // q1..q6: trap key, q7: points, q8: free text
    firstName: "",
    email: "",
    consent: false,
  };

  let coaster = null;
  let isTransitioning = false;

  /* ---------------- view switching ---------------- */
  const EXITABLE_VIEWS = ["view-quiz", "view-capture"];

  function showView(id) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    document.getElementById(id).classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    const showExit = EXITABLE_VIEWS.includes(id);
    document.getElementById("header-cta-btn").classList.toggle("is-hidden", showExit);
    document.getElementById("header-exit-btn").classList.toggle("is-hidden", !showExit);
  }

  function exitQuiz() {
    state.currentIndex = 0;
    state.answers = {};
    showView("view-landing");
  }

  /* ---------------- helpers ---------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function substitute(template, vars) {
    return template
      .replace(/\{\{firstName\}\}/g, escapeHtml(vars.firstName))
      .replace(/\{\{score\}\}/g, String(vars.score))
      .replace(/\{\{freeText\}\}/g, escapeHtml(vars.freeText));
  }

  /* ---------------- quiz rendering ---------------- */
  function questionCount() {
    return QUESTIONS.length;
  }

  function updateTopbar() {
    const idx = state.currentIndex;
    document.getElementById("quiz-step-label").innerHTML =
      "Question <strong>" + (idx + 1) + "</strong> of " + questionCount();
    const percent = Math.round((idx / questionCount()) * 100);
    document.getElementById("quiz-percent-label").textContent = percent + "%";
  }

  function renderQuestion() {
    const q = QUESTIONS[state.currentIndex];
    const mount = document.getElementById("question-mount");
    mount.innerHTML = "";

    const card = document.createElement("div");
    card.className = "question-card";
    const heading = document.createElement("h2");
    heading.textContent = q.prompt;
    card.appendChild(heading);

    const nextBtn = document.getElementById("quiz-next-btn");

    if (q.type === "trap" || q.type === "intensity") {
      nextBtn.classList.add("is-hidden");
      nextBtn.style.display = "none";

      const list = document.createElement("div");
      list.className = "answer-list";
      const answers = shuffle(q.answers);
      answers.forEach((answer) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer-btn";
        btn.textContent = answer.text;
        btn.addEventListener("click", () => onAnswerSelected(q, answer, list, btn));
        list.appendChild(btn);
      });
      card.appendChild(list);
    } else if (q.type === "freetext") {
      nextBtn.style.display = "";
      nextBtn.classList.remove("is-hidden");
      nextBtn.textContent = "See My Result";
      nextBtn.disabled = true;

      const textarea = document.createElement("textarea");
      textarea.className = "freetext-input";
      textarea.placeholder = q.placeholder;
      textarea.rows = 3;
      textarea.addEventListener("input", () => {
        nextBtn.disabled = textarea.value.trim().length === 0;
      });
      card.appendChild(textarea);

      nextBtn.onclick = () => {
        state.answers.q8 = textarea.value.trim();
        advancePastFreeText();
      };
    }

    mount.appendChild(card);
    requestAnimationFrame(() => card.classList.add("is-visible"));
    updateTopbar();
  }

  function onAnswerSelected(question, answer, list, btn) {
    if (isTransitioning) return;
    isTransitioning = true;

    Array.from(list.children).forEach((el) => (el.disabled = true));
    btn.classList.add("is-selected");

    if (question.type === "trap") {
      state.answers["q" + question.id] = answer.trap;
    } else if (question.type === "intensity") {
      state.answers["q" + question.id] = answer.points;
    }

    const nextIndex = state.currentIndex + 1;
    const frac = nextIndex / questionCount();
    coaster.setProgress(frac).then(() => {
      state.currentIndex = nextIndex;
      const card = document.querySelector(".question-card");
      if (card) card.classList.remove("is-visible");
      setTimeout(() => {
        renderQuestion();
        isTransitioning = false;
      }, 200);
    });
  }

  function advancePastFreeText() {
    if (isTransitioning) return;
    isTransitioning = true;
    coaster.setProgress(1).then(() => {
      setTimeout(() => {
        showView("view-capture");
        isTransitioning = false;
      }, 250);
    });
  }

  /* ---------------- data capture ---------------- */
  function setupCaptureForm() {
    const form = document.getElementById("capture-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("capture-name");
      const emailInput = document.getElementById("capture-email");
      const consentInput = document.getElementById("capture-consent");
      const nameError = document.getElementById("capture-name-error");
      const emailError = document.getElementById("capture-email-error");
      nameError.textContent = "";
      emailError.textContent = "";

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      let valid = true;
      if (!name) {
        nameError.textContent = "Pop your first name in so we know what to call you.";
        valid = false;
      }
      if (!emailOk) {
        emailError.textContent = "That doesn't look like a valid email.";
        valid = false;
      }
      if (!consentInput.checked) {
        alert("Please read and agree to our Privacy Policy to continue.");
        valid = false;
      }
      if (!valid) return;

      // Fallback per build notes: never show "Hi ," if the name is somehow blank.
      state.firstName = name || "friend";
      state.email = email;
      state.consent = document.getElementById("capture-consent").checked;

      showResult();
    });
  }

  /* ---------------- scoring + results ---------------- */
  function showResult() {
    const result = calculateResult(state.answers, SCORE_BANDS);
    const content = RESULTS_CONTENT[result.trap];
    const vars = { firstName: state.firstName, score: result.score, freeText: result.freeText };

    document.getElementById("result-headline").textContent = substitutePlain(content.headline, vars);
    document.getElementById("result-score-line").innerHTML =
      "You scored <strong>" + result.score + " out of 100</strong>.";
    document.getElementById("result-band-sentence").textContent = result.band.label;
    document.getElementById("result-band-label").textContent = result.band.shortLabel;
    const bandPill = document.getElementById("result-band-pill");
    bandPill.className = "score-band-pill band-" + result.band.key;

    document.getElementById("result-reflection").innerHTML = substitute(content.reflection, vars);

    document.getElementById("result-reframe-heading").textContent = substitutePlain(content.reframeHeading, vars);
    const reframeBody = document.getElementById("result-reframe-body");
    reframeBody.innerHTML = "";
    content.reframeBody.forEach((p) => {
      const el = document.createElement("p");
      el.textContent = substitutePlain(p, vars);
      reframeBody.appendChild(el);
    });

    document.getElementById("result-cost-heading").textContent = content.costHeading;
    document.getElementById("result-cost-body").textContent = substitutePlain(content.costBody, vars);

    document.getElementById("result-fix-heading").textContent = content.fixHeading;
    document.getElementById("result-fix-body").textContent = substitutePlain(content.fixBody, vars);

    document.getElementById("result-bridge-heading").textContent = content.bridgeHeading;
    document.getElementById("result-bridge-body").textContent = content.bridgeBody;
    document.getElementById("result-bridge-strap").textContent = content.bridgeStrap || "";

    document.getElementById("result-closing").innerHTML = substitute(content.closing, vars);

    document.getElementById("result-bridge-cta").textContent = OFFER.bridgeCta;
    document.getElementById("result-cta-btn").textContent = OFFER.ctaText;
    document.getElementById("result-cta-btn").href = OFFER.joinUrl;
    document.getElementById("result-guarantee").textContent = OFFER.guarantee;

    showView("view-results");

    const gaugeFill = document.getElementById("grip-gauge-fill");
    const gaugeScore = document.getElementById("grip-gauge-score");
    const gaugeRing = document.getElementById("grip-gauge-ring");
    animateGripGauge(gaugeFill, gaugeScore, gaugeRing, result.score, result.band.key);

    settleParkedCart(document.getElementById("coaster-parked"));

    submitLeadToActiveCampaign({
      firstName: state.firstName,
      email: state.email,
      consent: state.consent,
      trap: content.trapName,
      score: result.score,
      scoreBand: result.band.key,
      freeTextAnswer: result.freeText,
    });
  }

  function substitutePlain(template, vars) {
    return template
      .replace(/\{\{firstName\}\}/g, vars.firstName)
      .replace(/\{\{score\}\}/g, String(vars.score))
      .replace(/\{\{freeText\}\}/g, vars.freeText);
  }

  /* ---------------- boot ---------------- */
  function startQuiz() {
    state.currentIndex = 0;
    state.answers = {};
    showView("view-quiz");
    const path = document.getElementById("coaster-track-path");
    const cart = document.getElementById("coaster-cart");
    const rail = document.querySelector(".coaster-rail");
    coaster = createCoasterController(path, cart, rail);
    renderQuestion();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('[data-action="start-quiz"]').forEach((btn) => {
      btn.addEventListener("click", startQuiz);
    });
    document.getElementById("header-exit-btn").addEventListener("click", exitQuiz);
    setupCaptureForm();
    initHeroCart();
  });
})();
