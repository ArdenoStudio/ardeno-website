import { setCookie, getCookie } from "./cookies";

export const trackUtmParams = () => {
    const params = new URLSearchParams(window.location.search);

    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");

    if (source) setCookie("utm_source", source, 30);
    if (medium) setCookie("utm_medium", medium, 30);
    if (campaign) setCookie("utm_campaign", campaign, 30);
};

export const getStoredUtm = () => {
    return {
        utm_source: getCookie("utm_source"),
        utm_medium: getCookie("utm_medium"),
        utm_campaign: getCookie("utm_campaign")
    };
};