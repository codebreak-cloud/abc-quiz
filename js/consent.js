/* ============================================================
   COOKIE CONSENT & TRACKING MANAGEMENT
   GDPR-compliant consent system supporting multiple tracking
   categories: Analytics, Marketing, etc. Easy to add new trackers.
   ============================================================ */

const CONSENT_KEY = "abc-quiz-consent";

// Define consent categories and their trackers
const CONSENT_CATEGORIES = {
  analytics: {
    label: "Analytics",
    description: "Understand how you use this quiz",
    required: false,
    trackers: ["google-analytics", "plausible"],
  },
  marketing: {
    label: "Marketing",
    description: "Track quiz completion and signup intent for ads",
    required: false,
    trackers: ["facebook-pixel", "google-ads", "linkedin"],
  },
};

// Tracker definitions (add/remove as needed)
const TRACKERS = {
  "facebook-pixel": {
    category: "marketing",
    pixelId: "PLACEHOLDER_FACEBOOK_PIXEL_ID",
    load: (pixelId) => {
      if (pixelId === "PLACEHOLDER_FACEBOOK_PIXEL_ID") {
        console.warn("[Tracking] Facebook Pixel ID not configured");
        return;
      }
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', pixelId);
      fbq('track', 'PageView');
    },
  },
  "google-analytics": {
    category: "analytics",
    measurementId: "PLACEHOLDER_GA_ID",
    load: (measurementId) => {
      if (measurementId === "PLACEHOLDER_GA_ID") {
        console.warn("[Tracking] Google Analytics ID not configured");
        return;
      }
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', measurementId);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    },
  },
};

function getConsentStatus() {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function setConsentStatus(categoryConsent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    categories: categoryConsent,
    timestamp: new Date().toISOString(),
  }));
}

function hasConsent(trackerId) {
  const consent = getConsentStatus();
  if (!consent) return false;
  const tracker = TRACKERS[trackerId];
  if (!tracker) return false;
  return consent.categories[tracker.category] === true;
}

function hideCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (banner) {
    banner.classList.remove("is-visible");
  }
}

function loadAllTrackers(categoryConsent) {
  Object.entries(TRACKERS).forEach(([trackerId, tracker]) => {
    if (categoryConsent[tracker.category]) {
      const config = tracker.pixelId || tracker.measurementId;
      tracker.load(config);
    }
  });
}

function setupCookieBanner() {
  const consent = getConsentStatus();

  // If consent already given, hide banner and load trackers
  if (consent) {
    hideCookieBanner();
    loadAllTrackers(consent.categories);
    return;
  }

  // Banner visible by default; wire up buttons
  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    const categoryConsent = {};
    Object.keys(CONSENT_CATEGORIES).forEach(cat => {
      categoryConsent[cat] = document.getElementById(`consent-${cat}`)?.checked || false;
    });
    setConsentStatus(categoryConsent);
    hideCookieBanner();
    loadAllTrackers(categoryConsent);
  });

  document.getElementById("cookie-reject")?.addEventListener("click", () => {
    setConsentStatus({});
    hideCookieBanner();
  });
}

// Event tracking functions (work with any enabled tracker)
function trackFormSubmission(firstName, trapType, score) {
  if (hasConsent("facebook-pixel") && window.fbq) {
    fbq('track', 'Lead', {
      value: 1.0,
      currency: 'GBP',
      content_name: 'Quiz Completion - ' + trapType,
      content_type: 'lead',
      custom_data: { trap: trapType, score: score }
    });
  }
  if (hasConsent("google-analytics") && window.gtag) {
    gtag('event', 'generate_lead', {
      content_name: 'Quiz - ' + trapType,
      value: 1.0,
      currency: 'GBP'
    });
  }
}

function trackCTAClick(trapType) {
  if (hasConsent("facebook-pixel") && window.fbq) {
    fbq('track', 'ViewContent', {
      content_name: 'ABC Offer - ' + trapType,
      content_type: 'offer',
    });
  }
  if (hasConsent("google-analytics") && window.gtag) {
    gtag('event', 'view_item', {
      content_name: 'ABC Offer - ' + trapType,
      content_type: 'product'
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCookieBanner);
} else {
  setupCookieBanner();
}
