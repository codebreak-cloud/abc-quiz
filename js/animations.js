/* ============================================================
   ABC QUIZ — VISUAL INTERACTIONS
   Rollercoaster progress cart, grip strength gauge.
   Plain DOM/SVG + requestAnimationFrame, no deps.
   ============================================================ */

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

/* ---------------------------------------------------------
   Rollercoaster cart — travels along the SVG track path as
   the user answers each question, then hands off to a parked
   cart element on the results page.
   --------------------------------------------------------- */
function createCoasterController(pathEl, cartEl, railEl) {
  const totalLength = pathEl.getTotalLength();
  let currentFrac = 0;
  let raf = null;

  function pointAt(frac) {
    const clamped = Math.max(0, Math.min(1, frac));
    const pt = pathEl.getPointAtLength(clamped * totalLength);
    const ptAhead = pathEl.getPointAtLength(Math.min(totalLength, clamped * totalLength + 1));
    const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);
    return { x: pt.x, y: pt.y, angle };
  }

  const vb = pathEl.ownerSVGElement.viewBox.baseVal;

  function render(frac) {
    const { x, y, angle } = pointAt(frac);
    const leftPct = (x / vb.width) * 100;
    const topPct = (y / vb.height) * 100;
    cartEl.style.left = leftPct + "%";
    cartEl.style.top = topPct + "%";
    cartEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  function setProgress(frac, animate = true) {
    if (raf) cancelAnimationFrame(raf);
    const from = currentFrac;
    const to = Math.max(0, Math.min(1, frac));
    if (!animate) {
      currentFrac = to;
      render(to);
      return Promise.resolve();
    }
    const duration = 700;
    const start = performance.now();
    cartEl.classList.add("is-boosting");
    return new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutExpo(t);
        const frac = from + (to - from) * eased;
        render(frac);
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          currentFrac = to;
          cartEl.classList.remove("is-boosting");
          resolve();
        }
      }
      raf = requestAnimationFrame(step);
    });
  }

  render(0);
  return { setProgress, getPointAt: pointAt, totalLength };
}

/* Hands the quiz cart off to the fixed "parked" cart on the results page. */
function settleParkedCart(parkedEl) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      parkedEl.classList.add("is-settled");
    });
  });
}

/* ---------------------------------------------------------
   Grip strength gauge — full circular dial (ports ScoreMeter.jsx).
   Ring color is band-driven (light/firm/deep -> green/yellow/purple,
   per tokens/colors.css --band-*), fill sweeps and the number counts
   up together on results load.
   --------------------------------------------------------- */
function animateGripGauge(fillCircleEl, scoreEl, score, bandKey) {
  const r = fillCircleEl.r.baseVal.value;
  const circ = 2 * Math.PI * r;
  fillCircleEl.style.strokeDasharray = String(circ);

  const bandVar = { light: "--band-light", firm: "--band-firm", deep: "--band-deep" }[bandKey] || "--band-firm";
  fillCircleEl.style.stroke = `var(${bandVar})`;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    fillCircleEl.style.strokeDashoffset = String(circ - (score / 100) * circ);
    scoreEl.textContent = String(score);
    return;
  }

  fillCircleEl.style.strokeDashoffset = String(circ);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    const offset = circ - (eased * score / 100) * circ;
    fillCircleEl.style.strokeDashoffset = String(offset);
    scoreEl.textContent = String(Math.round(eased * score));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------------------------------------------------------
   Hero cart — ambient back-and-forth motion along the hero
   track, riding the exact same curve that's drawn on screen.
   Skipped under prefers-reduced-motion (cart stays parked at
   its static markup position).
   --------------------------------------------------------- */
function initHeroCart() {
  const cart = document.getElementById("hero-cart");
  const track = document.getElementById("hero-track-path");
  if (!cart || !track) return;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  cart.removeAttribute("transform");

  const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
  motion.setAttribute("dur", "6s");
  motion.setAttribute("repeatCount", "indefinite");
  motion.setAttribute("rotate", "auto");
  motion.setAttribute("calcMode", "linear");
  motion.setAttribute("keyPoints", "0;1;0");
  motion.setAttribute("keyTimes", "0;0.5;1");
  motion.setAttribute("path", track.getAttribute("d"));
  cart.appendChild(motion);
}

