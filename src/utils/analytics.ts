type ConsentValue = "granted" | "denied";

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
  setAnalyticsConsent("granted");
  trackInitialPageView();
};

export const disableAnalyticsTracking = () => {
  setAnalyticsConsent("denied");
};
