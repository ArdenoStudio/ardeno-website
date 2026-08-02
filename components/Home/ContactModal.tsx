import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock3,
    Loader2,
    Mail,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    User,
    WalletCards,
    X,
} from "lucide-react";
import { getStoredUtm } from "../UI/trackUtm";
import { Turnstile } from "../UI/Turnstile";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fontDisplay = "var(--font-display)";
const fontBody = "var(--font-body)";
const fontUi = "var(--font-ui)";

const budgetOptions = [
    { label: "Starter scope", value: "Under LKR 50,000" },
    { label: "Growth build", value: "LKR 50,000 - 150,000" },
    { label: "Scale build", value: "LKR 150,000 - 500,000" },
    { label: "Flagship build", value: "LKR 500,000 - 1,000,000" },
    { label: "Premier build", value: "LKR 1,000,000+" },
    { label: "Let's scope it", value: "Let's discuss" },
];

const briefNotes = [
    { label: "Reply window", value: "24 hrs", icon: Clock3 },
    { label: "Launch focus", value: "Secure", icon: ShieldCheck },
    { label: "Build style", value: "Custom", icon: Sparkles },
];

const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement | null) =>
    container
        ? Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
              (element) => !element.hasAttribute("disabled") && element.offsetParent !== null
          )
        : [];

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [formState, setFormState] = useState<FormState>("idle");
    const [fields, setFields] = useState({ name: "", email: "", company: "", budget: "", message: "" });
    const [errors, setErrors] = useState<Partial<typeof fields>>({});
    const [turnstileToken, setTurnstileToken] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        let resetTimer: ReturnType<typeof setTimeout> | undefined;
        let focusTimer: ReturnType<typeof setTimeout> | undefined;
        if (isOpen) {
            previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            document.body.style.overflow = "hidden";
            document.body.classList.add("contact-modal-open");
            focusTimer = setTimeout(() => modalRef.current?.focus(), 0);
        } else {
            document.body.style.overflow = "";
            document.body.classList.remove("contact-modal-open");
            previousFocusRef.current?.focus?.();
            resetTimer = setTimeout(() => {
                setFormState("idle");
                setFields({ name: "", email: "", company: "", budget: "", message: "" });
                setErrors({});
                setTurnstileToken("");
            }, 400);
        }
        return () => {
            document.body.style.overflow = "";
            document.body.classList.remove("contact-modal-open");
            if (resetTimer) clearTimeout(resetTimer);
            if (focusTimer) clearTimeout(focusTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (isOpen && e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Tab") return;

        const focusable = getFocusableElements(modalRef.current);
        if (!focusable.length) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const validate = () => {
        const errs: Partial<typeof fields> = {};
        if (!fields.name.trim()) errs.name = "Please add your name";
        if (!fields.email.trim()) errs.email = "Please add your email";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Please enter a valid email";
        if (!fields.message.trim()) errs.message = "Please add a short message";
        return errs;
    };

    const clearTurnstileToken = useCallback(() => setTurnstileToken(""), []);

    const handleSubmit = async () => {
        if (formState === "submitting") return;

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setFormState("submitting");

        try {
            const utm = getStoredUtm();

            const payload = {
                name: fields.name,
                email: fields.email,
                company: fields.company || "-",
                budget: fields.budget || "Not specified",
                message: fields.message,

                utm_source: utm.utm_source || "direct",
                utm_medium: utm.utm_medium || "none",
                utm_campaign: utm.utm_campaign || "none",

                page_path: window.location.pathname,
                page_url: window.location.href,
                referrer: document.referrer || "direct",
                submitted_at: new Date().toISOString(),
                turnstileToken,
                website: "",
            };

            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                await res.json().catch(() => ({}));
                setTurnstileToken("");
                setFormState("error");
                return;
            }

            setFormState("success");
        } catch {
            setTurnstileToken("");
            setFormState("error");
        }
    };

    const fieldClass = (hasError?: string) => `ardeno-field ${hasError ? "has-error" : ""}`;

    return (
        <>
            <style>{`
        .ardeno-contact-modal {
          background:
            radial-gradient(circle at 8% 0%, rgba(229, 9, 20, 0.19), transparent 34%),
            radial-gradient(circle at 92% 100%, rgba(229, 9, 20, 0.12), transparent 34%),
            linear-gradient(145deg, rgba(22, 22, 24, 0.98), rgba(9, 9, 10, 0.99));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 34px 120px rgba(0, 0, 0, 0.86), 0 0 0 1px rgba(229, 9, 20, 0.08);
        }
        .ardeno-contact-modal::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 150px;
        }
        .ardeno-form-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ardeno-form-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ardeno-form-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
        }
        .ardeno-field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
          font-family: ${fontUi};
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.66);
        }
        .ardeno-field {
          position: relative;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.14);
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .ardeno-field:focus-within {
          border-color: rgba(229,9,20,0.72);
          background: rgba(255,255,255,0.075);
          box-shadow: 0 0 0 4px rgba(229,9,20,0.08), 0 18px 50px rgba(0,0,0,0.22);
        }
        .ardeno-field.has-error {
          border-color: rgba(255,77,87,0.9);
          box-shadow: 0 0 0 4px rgba(255,77,87,0.09);
        }
        .ardeno-field-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: rgba(255,255,255,0.42);
          pointer-events: none;
        }
        .ardeno-field-icon.textarea {
          top: 19px;
          transform: none;
        }
        .ardeno-field-control {
          width: 100%;
          min-height: 52px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #ffffff;
          font-family: ${fontBody};
          font-size: 13px;
          letter-spacing: 0.02em;
          padding: 15px 16px 15px 45px;
          box-sizing: border-box;
          border-radius: 16px;
        }
        .ardeno-field-control::placeholder {
          color: rgba(255,255,255,0.33);
        }
        .ardeno-field-control:-webkit-autofill,
        .ardeno-field-control:-webkit-autofill:hover,
        .ardeno-field-control:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          box-shadow: 0 0 0 1000px #18181a inset;
          transition: background-color 9999s ease-in-out 0s;
        }
        .ardeno-select-control {
          appearance: none;
          cursor: pointer;
          padding-right: 42px;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.55)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 10px;
        }
        .ardeno-select-control option {
          background: #141416;
          color: #ffffff;
        }
        .ardeno-error {
          display: block;
          margin-top: 7px;
          font-family: ${fontUi};
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #ff4d57;
          text-transform: uppercase;
        }
        @media (max-width: 639px) {
          .ardeno-field-label {
            margin-bottom: 7px;
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .ardeno-field-control {
            min-height: 48px;
            padding-top: 12px;
            padding-bottom: 12px;
          }
        }
      `}</style>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[80]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ background: "rgba(3,3,4,0.86)", backdropFilter: "blur(18px)" }}
                            onClick={onClose}
                        />

                        <motion.div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 md:p-8">
                            <motion.div
                                ref={modalRef}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="contact-modal-title"
                                aria-describedby="contact-modal-description"
                                tabIndex={-1}
                                initial={{ opacity: 0, y: 34, scale: 0.975 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 16, scale: 0.985 }}
                                transition={{ duration: 0.45, ease }}
                                className="ardeno-contact-modal pointer-events-auto relative h-[calc(100dvh-24px)] w-full max-w-5xl overflow-hidden rounded-[28px] sm:h-[min(92dvh,760px)]"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={trapFocus}
                            >
                                <h2 id="contact-modal-title" className="sr-only">
                                    Start a project with Ardeno Studio
                                </h2>
                                <p id="contact-modal-description" className="sr-only">
                                    Share your project goal, timeline, and contact details so Ardeno Studio can reply with the next step.
                                </p>
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close contact form"
                                    className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] text-white/60 transition-colors hover:border-[#E50914]/50 hover:bg-[#E50914]/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="relative grid h-full lg:grid-cols-[0.82fr_1.18fr]">
                                    <aside className="hidden border-r border-white/[0.08] p-8 lg:flex xl:p-10">
                                        <div className="flex w-full flex-col justify-between rounded-[24px] border border-white/[0.09] bg-black/20 p-7">
                                            <div>
                                                <div className="mb-8 flex items-center gap-4">
                                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E50914]/20 bg-[#E50914]/10">
                                                        <img src="/ardeno-logo.svg" alt="" className="h-8 w-8" aria-hidden="true" />
                                                    </span>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E50914]" style={{ fontFamily: fontUi }}>
                                                            Ardeno Studio
                                                        </p>
                                                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/38" style={{ fontFamily: fontUi }}>
                                                            Project Intake
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400" style={{ fontFamily: fontUi }}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#E50914] shadow-[0_0_14px_rgba(229,9,20,0.9)]" />
                                                    New Inquiry
                                                </p>
                                                <h2 className="max-w-[340px] text-[3.6rem] leading-[0.94] tracking-normal text-white" style={{ fontFamily: fontDisplay }}>
                                                    Let's build <span className="italic text-zinc-500">something</span> sharp.
                                                </h2>
                                                <p className="mt-6 max-w-[310px] text-sm leading-7 text-zinc-400" style={{ fontFamily: fontBody }}>
                                                    Share the goal, timeline, and current site. We will reply with the clearest next step.
                                                </p>
                                            </div>

                                            <div className="mt-10 space-y-3">
                                                {briefNotes.map(({ label, value, icon: Icon }) => (
                                                    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                                                        <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500" style={{ fontFamily: fontUi }}>
                                                            <Icon className="h-4 w-4 text-[#E50914]" strokeWidth={1.7} />
                                                            {label}
                                                        </span>
                                                        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-200" style={{ fontFamily: fontUi }}>
                                                            {value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </aside>

                                    <section className="ardeno-form-scroll h-full overflow-y-auto px-5 pb-3 pt-14 sm:px-7 sm:pb-7 sm:pt-16 md:px-10 md:pb-10 lg:pt-10">
                                        <div className="mb-5 sm:mb-7 lg:hidden">
                                            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400" style={{ fontFamily: fontUi }}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />
                                                New Inquiry
                                            </p>
                                            <h2 className="text-[2.35rem] leading-[0.95] text-white sm:text-[2.75rem]" style={{ fontFamily: fontDisplay }}>
                                                Let's build <span className="italic text-zinc-500">something</span> sharp.
                                            </h2>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {formState === "success" ? (
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, y: 18 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4, ease }}
                                                    className="flex min-h-[520px] flex-col items-center justify-center text-center"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.65, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.45, ease }}
                                                        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E50914]/30 bg-[#E50914]/10"
                                                    >
                                                        <CheckCircle2 className="h-10 w-10 text-[#E50914]" strokeWidth={1.6} />
                                                    </motion.div>
                                                    <h3 className="text-4xl text-white" style={{ fontFamily: fontDisplay }}>
                                                        Message received.
                                                    </h3>
                                                    <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400" style={{ fontFamily: fontBody }}>
                                                        We have your brief and will get back to you with the next step.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="mt-9 rounded-full border border-white/[0.12] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                                                        style={{ fontFamily: fontUi }}
                                                    >
                                                        Close
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.form
                                                    key="form"
                                                    initial={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onSubmit={(event) => {
                                                        event.preventDefault();
                                                        void handleSubmit();
                                                    }}
                                                >
                                                    <div className="mb-8 hidden lg:block">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E50914]" style={{ fontFamily: fontUi }}>
                                                            Start a Project
                                                        </p>
                                                        <h3 className="mt-3 text-[2.55rem] leading-none text-white" style={{ fontFamily: fontDisplay }}>
                                                            Tell us what needs to work.
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                        <div>
                                                            <label className="ardeno-field-label" htmlFor="contact-name">
                                                                Name <span className="text-[#E50914]">*</span>
                                                            </label>
                                                            <div className={fieldClass(errors.name)}>
                                                                <User className="ardeno-field-icon" />
                                                                <input
                                                                    id="contact-name"
                                                                    type="text"
                                                                    placeholder="Your name"
                                                                    value={fields.name}
                                                                    onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                                                                    className="ardeno-field-control"
                                                                    required
                                                                    aria-invalid={Boolean(errors.name)}
                                                                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                                                                />
                                                            </div>
                                                            {errors.name && (
                                                                <span id="contact-name-error" className="ardeno-error" role="alert">
                                                                    {errors.name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="ardeno-field-label" htmlFor="contact-email">
                                                                Email <span className="text-[#E50914]">*</span>
                                                            </label>
                                                            <div className={fieldClass(errors.email)}>
                                                                <Mail className="ardeno-field-icon" />
                                                                <input
                                                                    id="contact-email"
                                                                    type="email"
                                                                    placeholder="you@company.com"
                                                                    value={fields.email}
                                                                    onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
                                                                    className="ardeno-field-control"
                                                                    required
                                                                    aria-invalid={Boolean(errors.email)}
                                                                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                                                                />
                                                            </div>
                                                            {errors.email && (
                                                                <span id="contact-email-error" className="ardeno-error" role="alert">
                                                                    {errors.email}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="ardeno-field-label" htmlFor="contact-company">
                                                                Company
                                                            </label>
                                                            <div className="ardeno-field">
                                                                <Building2 className="ardeno-field-icon" />
                                                                <input
                                                                    id="contact-company"
                                                                    type="text"
                                                                    placeholder="Your company"
                                                                    value={fields.company}
                                                                    onChange={(e) => setFields((f) => ({ ...f, company: e.target.value }))}
                                                                    className="ardeno-field-control"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="ardeno-field-label" htmlFor="contact-budget">
                                                                Budget Range
                                                            </label>
                                                            <div className="ardeno-field">
                                                                <WalletCards className="ardeno-field-icon" />
                                                                <select
                                                                    id="contact-budget"
                                                                    value={fields.budget}
                                                                    onChange={(e) => setFields((f) => ({ ...f, budget: e.target.value }))}
                                                                    className="ardeno-field-control ardeno-select-control"
                                                                    style={{ color: fields.budget ? "#ffffff" : "rgba(255,255,255,0.33)" }}
                                                                >
                                                                    <option value="" disabled>
                                                                        Select a range
                                                                    </option>
                                                                    {budgetOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5">
                                                        <label className="ardeno-field-label" htmlFor="contact-message">
                                                            Message <span className="text-[#E50914]">*</span>
                                                        </label>
                                                        <div className={fieldClass(errors.message)}>
                                                            <MessageSquare className="ardeno-field-icon textarea" />
                                                            <textarea
                                                                id="contact-message"
                                                                rows={5}
                                                                placeholder="Project goals, current website, timeline, and anything important..."
                                                                value={fields.message}
                                                                onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
                                                                className="ardeno-field-control min-h-[84px] sm:min-h-[148px]"
                                                                style={{ resize: "vertical", paddingTop: 16 }}
                                                                required
                                                                aria-invalid={Boolean(errors.message)}
                                                                aria-describedby={errors.message ? "contact-message-error" : undefined}
                                                            />
                                                        </div>
                                                        {errors.message && (
                                                            <span id="contact-message-error" className="ardeno-error" role="alert">
                                                                {errors.message}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-6">
                                                        <Turnstile onVerify={setTurnstileToken} onExpire={clearTurnstileToken} />
                                                    </div>

                                                    <div className="mt-5 rounded-[20px] border border-white/[0.09] bg-[#111113]/95 p-2.5 backdrop-blur-xl sm:mt-7 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-4">
                                                        <p className="mb-3 text-[11px] leading-5 text-zinc-500 sm:mb-0" style={{ fontFamily: fontUi }}>
                                                            Required fields are marked <span className="text-[#E50914]">*</span>
                                                        </p>

                                                        <button
                                                            type="submit"
                                                            disabled={formState === "submitting"}
                                                            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#E50914] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff1420] disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto sm:py-3.5"
                                                            style={{ fontFamily: fontUi }}
                                                        >
                                                            <span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[350%]" />
                                                            <span className="relative flex items-center gap-2.5">
                                                                {formState === "submitting" ? (
                                                                    <>
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                        Sending
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Send Message
                                                                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                                    </>
                                                                )}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    {formState === "error" && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            role="alert"
                                                            className="mt-4 text-left text-[12px] text-[#ff4d57] sm:text-right"
                                                            style={{ fontFamily: fontUi }}
                                                        >
                                                            Could not send the message. Please try again or email us directly.
                                                        </motion.p>
                                                    )}
                                                </motion.form>
                                            )}
                                        </AnimatePresence>
                                    </section>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
