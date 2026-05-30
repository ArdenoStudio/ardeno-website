import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCookie, setCookie } from "./cookies";
import { disableAnalyticsTracking, enableAnalyticsTracking } from "../../src/utils/analytics";

const CookieBanner: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const hasShownRef = useRef(false);

    useEffect(() => {
        const consent = getCookie("ardeno_cookie_consent");

        if (consent === "accepted") {
            enableAnalyticsTracking();
            setVisible(false);
            return;
        }

        if (consent === "rejected") {
            disableAnalyticsTracking();
            setVisible(false);
            return;
        }

        const revealDelay = window.matchMedia("(max-width: 767px)").matches ? 5200 : 2600;

        const timer = window.setTimeout(() => {
            if (hasShownRef.current) return;
            hasShownRef.current = true;
            setVisible(true);
        }, revealDelay);

        const handleScroll = () => {
            if (hasShownRef.current) return;

            if (window.scrollY > 180) {
                hasShownRef.current = true;
                setVisible(true);
                window.removeEventListener("scroll", handleScroll);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const accept = () => {
        setCookie("ardeno_cookie_consent", "accepted", 180);
        enableAnalyticsTracking();
        setVisible(false);
    };

    const reject = () => {
        setCookie("ardeno_cookie_consent", "rejected", 180);
        disableAnalyticsTracking();
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="ardeno-cookie-banner fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-3 sm:bottom-6 sm:px-4"
                >
                    <div
                        className="relative w-full max-w-[760px] rounded-[22px] border px-5 py-5 sm:rounded-[26px] md:px-7 md:py-6"
                        style={{
                            background: "rgba(20,20,22,0.88)",
                            borderColor: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(18px)",
                            WebkitBackdropFilter: "blur(18px)",
                            boxShadow:
                                "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,9,20,0.05)",
                        }}
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(229,9,20,0.9) 40%, rgba(229,9,20,0.3) 70%, transparent)",
                            }}
                        />

                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.025]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                backgroundSize: "128px",
                            }}
                        />

                        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-md">
                                <div className="mb-2 flex items-center gap-2">
                                    <div
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                            background: "#E50914",
                                            boxShadow: "0 0 10px rgba(229,9,20,0.9)",
                                        }}
                                    />
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                        Cookie Preferences
                                    </span>
                                </div>

                                <h3
                                    className="text-[1.9rem] leading-none tracking-[-0.03em] text-white"
                                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                >
                                    A smoother <span style={{ color: "#8c8c96" }}>experience</span>
                                </h3>

                                <p
                                    className="mt-2 text-[13px] leading-6 text-zinc-400"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    We use essential cookies to keep the site working properly. Optional
                                    analytics only loads if you accept, helping us understand traffic and
                                    improve the enquiry flow.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-3">
                                <button
                                    onClick={accept}
                                    className="min-w-[112px] rounded-full px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 sm:px-6 sm:tracking-[0.2em]"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        background: "#E50914",
                                        border: "1px solid rgba(229,9,20,0.6)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#ff1420";
                                        e.currentTarget.style.boxShadow =
                                            "0 0 24px rgba(229,9,20,0.35)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#E50914";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    Accept
                                </button>

                                <button
                                    onClick={reject}
                                    className="min-w-[112px] rounded-full px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 sm:px-6 sm:tracking-[0.2em]"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(229,9,20,0.45)";
                                        e.currentTarget.style.background = "rgba(229,9,20,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
