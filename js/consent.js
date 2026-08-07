/* ============================================================
   COOKIE CONSENT & FACEBOOK PIXEL MANAGEMENT
   Handles GDPR-compliant consent collection and conditional
   Facebook Pixel loading for form submissions & conversions.
   ============================================================ */

const CONSENT_KEY = "abc-quiz-fb-consent";
const FACEBOOK_PIXEL_ID = "PLACEHOLDER_PIXEL_ID"; // Replace with real pixel ID

function getConsentStatus() {
  const stored = localStorage.getItem(CONSENT_KEY);
  return stored ? JSON.parse(stored) : null;
}

function setConsentStatus(accepted) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    accepted,
    timestamp: new Date().toISOString(),
  }));
  return accepted;
}

function hideCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (banner) {
    banner.classList.remove("is-visible");
  }
}

function setupCookieBanner() {
  const consent = getConsentStatus();

  // If consent already given, hide banner and load pixel
  if (consent?.accepted === true) {
    hideCookieBanner();
    loadFacebookPixel();
    return;
  }

  // If consent was explicitly rejected, hide banner
  if (consent?.accepted === false) {
    hideCookieBanner();
    return;
  }

  // Banner visible by default; wire up buttons
  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    setConsentStatus(true);
    hideCookieBanner();
    loadFacebookPixel();
  });

  document.getElementById("cookie-reject")?.addEventListener("click", () => {
    setConsentStatus(false);
    hideCookieBanner();
  });
}

function loadFacebookPixel() {
  if (FACEBOOK_PIXEL_ID === "PLACEHOLDER_PIXEL_ID") {
    console.warn("[FB Pixel] Placeholder ID not replaced yet");
    return;
  }

  // Load Facebook Pixel SDK
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document, 'script',
    'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', FACEBOOK_PIXEL_ID);
  fbq('track', 'PageView');
}

function trackFBEvent(eventName, data) {
  if (!window.fbq) return;
  fbq('track', eventName, data);
}

// Wire up form submission tracking
function trackFormSubmission(firstName, trapType, score) {
  trackFBEvent('Lead', {
    value: 1.0,
    currency: 'GBP',
    content_name: 'Quiz Completion - ' + trapType,
    content_type: 'lead',
    custom_data: {
      trap: trapType,
      score: score,
    }
  });
}

// Wire up CTA button click tracking
function trackCTAClick(trapType) {
  trackFBEvent('ViewContent', {
    content_name: 'ABC Offer - ' + trapType,
    content_type: 'offer',
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCookieBanner);
} else {
  setupCookieBanner();
}
