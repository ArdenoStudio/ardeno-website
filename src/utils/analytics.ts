type ConsentValue = "granted" | "denied";

const MEASUREMENT_ID = "G-LXT357JC8Y";
let gtagLoaded = false;

const sendGtag = (...args: any[]) => {
  if (typeof window === "undefined") return;

  const win = window as any;
  if (typeof win.gtag === "function") {
    win.gtag(...args);
    return;
  }

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(args);
};

const ensureGtag = () => {
  if (typeof window === "undefined" || gtagLoaded) return;

  const win = window as any;
  win.dataLayer = win.dataLayer || [];
  win.gtag =
    win.gtag ||
    function gtagShim() {
      win.dataLayer.push(arguments);
    };

  sendGtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  sendGtag("js", new Date());
  sendGtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  gtagLoaded = true;
};

export const setAnalyticsConsent = (value: ConsentValue) => {
  sendGtag("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
};

export const trackInitialPageView = () => {
  if (typeof window === "undefined") return;

  sendGtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
  });
};

export const enableAnalyticsTracking = () => {
  ensureGtag();
  setAnalyticsConsent("granted");
  trackInitialPageView();
};

export const disableAnalyticsTracking = () => {
  setAnalyticsConsent("denied");
};
