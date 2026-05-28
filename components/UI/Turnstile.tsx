import React, { useEffect, useId, useRef } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "expired-callback": () => void;
                    "error-callback": () => void;
                    theme: "dark" | "light" | "auto";
                }
            ) => string;
            remove?: (widgetId: string) => void;
        };
    }
}

const SCRIPT_ID = "cloudflare-turnstile";

type TurnstileProps = {
    onVerify: (token: string) => void;
    onExpire: () => void;
};

export const Turnstile: React.FC<TurnstileProps> = ({ onVerify, onExpire }) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    const id = useId().replace(/:/g, "-");
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        let widgetId: string | undefined;
        let cancelled = false;
        let script: HTMLScriptElement | null = null;

        const renderWidget = () => {
            if (cancelled || widgetId || !containerRef.current || !window.turnstile) return;

            widgetId = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
                "expired-callback": onExpire,
                "error-callback": onExpire,
                theme: "dark",
            });
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
            if (!script) {
                script = document.createElement("script");
                script.id = SCRIPT_ID;
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
            script.addEventListener("load", renderWidget);
        }

        return () => {
            cancelled = true;
            script?.removeEventListener("load", renderWidget);
            if (widgetId && window.turnstile?.remove) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [onExpire, onVerify, siteKey]);

    if (!siteKey) return null;

    return (
        <div
            ref={containerRef}
            id={`turnstile-${id}`}
            className="min-h-[65px]"
        />
    );
};
