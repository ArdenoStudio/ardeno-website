const keys = ["utm_source", "utm_medium", "utm_campaign"] as const;
type UtmKey = (typeof keys)[number];

export const trackUtmParams = () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");

    if (source) sessionStorage.setItem("utm_source", source.slice(0, 120));
    if (medium) sessionStorage.setItem("utm_medium", medium.slice(0, 120));
    if (campaign) sessionStorage.setItem("utm_campaign", campaign.slice(0, 160));
};

export const getStoredUtm = () => {
    const empty = {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
    };

    if (typeof window === "undefined") return empty;

    return keys.reduce<Record<UtmKey, string | null>>((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
    }, empty);
};
