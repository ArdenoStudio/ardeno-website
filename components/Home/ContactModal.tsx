import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

    const [formState, setFormState] = useState<FormState>("idle");
    const [fields, setFields] = useState({ name: "", email: "", company: "", budget: "", message: "" });
    const [errors, setErrors] = useState<Partial<typeof fields>>({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setTimeout(() => {
                setFormState("idle");
                setFields({ name: "", email: "", company: "", budget: "", message: "" });
                setErrors({});
            }, 400);
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const validate = () => {
        const errs: Partial<typeof fields> = {};
        if (!fields.name.trim()) errs.name = "Required";
        if (!fields.email.trim()) errs.email = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Invalid email";
        if (!fields.message.trim()) errs.message = "Required";
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setFormState("submitting");
        try {
            // Replace YOUR_FORM_ID with your Formspree form ID.
            // In Formspree dashboard, set the notification email to ardenostudio@gmail.com
            const res = await fetch("https://formspree.io/f/mreaalww", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    _replyto: fields.email,
                    name: fields.name,
                    email: fields.email,
                    company: fields.company || "—",
                    budget: fields.budget || "Not specified",
                    message: fields.message,
                }),
            });
            setFormState(res.ok ? "success" : "error");
        } catch {
            setFormState("error");
        }
    };

    // Sri Lankan market budget options
    const budgetOptions = [
        "Under LKR 50,000",
        "LKR 50,000 – 150,000",
        "LKR 150,000 – 500,000",
        "LKR 500,000 – 1,000,000",
        "LKR 1,000,000+",
        "Let's discuss",
    ];

    return (
        <>
            {/* ── All focus/placeholder styles handled in CSS — no JS state needed ── */}
            <style>{`
        .ardeno-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.04em;
          outline: none;
          padding: 13px 16px;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          display: block;
          box-sizing: border-box;
        }
        .ardeno-input::placeholder {
          color: rgba(255,255,255,0.32);
        }
        .ardeno-input:focus {
          border-color: rgba(229,9,20,0.7);
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(229,9,20,0.08);
        }
        .ardeno-input.has-error {
          border-color: rgba(229,9,20,0.8);
          box-shadow: 0 0 0 3px rgba(229,9,20,0.1);
        }
        .ardeno-select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 10px;
          padding-right: 36px !important;
        }
        .ardeno-select option {
          background: #141416;
          color: #fff;
        }
        .ardeno-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .ardeno-error {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: #ff4d57;
          margin-top: 5px;
          display: block;
          letter-spacing: 0.1em;
        }
      `}</style>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* ── Backdrop ── */}
                        <motion.div
                            className="fixed inset-0 z-[80]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ background: "rgba(4,4,5,0.88)", backdropFilter: "blur(14px)" }}
                            onClick={onClose}
                        />

                        {/* ── Modal ── */}
                        <motion.div className="fixed z-[90] inset-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                                transition={{ duration: 0.45, ease }}
                                className="pointer-events-auto relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                style={{
                                    background: "#141416",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 20,
                                    boxShadow: "0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(229,9,20,0.08)",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Top accent */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px]"
                                    style={{ background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.8) 40%, rgba(229,9,20,0.4) 70%, transparent)" }}
                                />

                                {/* Grain */}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.025] rounded-[20px]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                        backgroundSize: "128px",
                                    }}
                                />

                                <div className="relative p-8 md:p-10">

                                    {/* ── Header ── */}
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#E50914]" style={{ boxShadow: "0 0 8px rgba(229,9,20,0.9)" }} />
                                                <span className="text-[10px] tracking-[0.28em] text-zinc-400 uppercase font-semibold">New Inquiry</span>
                                            </div>
                                            <h2
                                                className="text-3xl md:text-4xl text-white leading-none tracking-[-0.02em]"
                                                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                            >
                                                Let's <span style={{ color: "#8c8c96" }}>build</span>
                                                <br />
                                                <span className="italic text-zinc-400 font-light">something great</span>
                                            </h2>
                                        </div>

                                        <button
                                            onClick={onClose}
                                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 mt-1"
                                            style={{
                                                border: "1px solid rgba(255,255,255,0.18)",
                                                background: "rgba(255,255,255,0.06)",
                                                color: "rgba(255,255,255,0.6)",
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(229,9,20,0.5)";
                                                (e.currentTarget as HTMLElement).style.color = "#fff";
                                                (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.08)";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                                                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="w-full h-px mb-8" style={{ background: "rgba(255,255,255,0.08)" }} />

                                    {/* ── Success ── */}
                                    <AnimatePresence mode="wait">
                                        {formState === "success" ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4, ease }}
                                                className="flex flex-col items-center justify-center py-16 text-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5, ease }}
                                                    className="mb-6"
                                                >
                                                    <CheckCircle2 className="w-14 h-14 text-[#E50914]" strokeWidth={1.5} />
                                                </motion.div>
                                                <h3 className="text-2xl text-white mb-3 tracking-[-0.02em]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                                                    Message received!
                                                </h3>
                                                <p className="text-[12px] text-zinc-400 tracking-[0.08em] max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                                    We'll get back to you within 24–48 hours.
                                                </p>
                                                <button
                                                    onClick={onClose}
                                                    className="mt-8 text-[11px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
                                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                                >
                                                    Close
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                                {/* Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                                                    {/* Name */}
                                                    <div>
                                                        <label className="ardeno-label">Name <span style={{ color: "#E50914" }}>*</span></label>
                                                        <input
                                                            type="text"
                                                            placeholder="Your name"
                                                            value={fields.name}
                                                            onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                                                            className={`ardeno-input${errors.name ? " has-error" : ""}`}
                                                        />
                                                        {errors.name && <span className="ardeno-error">✕ {errors.name}</span>}
                                                    </div>

                                                    {/* Email */}
                                                    <div>
                                                        <label className="ardeno-label">Email <span style={{ color: "#E50914" }}>*</span></label>
                                                        <input
                                                            type="email"
                                                            placeholder="you@company.com"
                                                            value={fields.email}
                                                            onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
                                                            className={`ardeno-input${errors.email ? " has-error" : ""}`}
                                                        />
                                                        {errors.email && <span className="ardeno-error">✕ {errors.email}</span>}
                                                    </div>

                                                    {/* Company */}
                                                    <div>
                                                        <label className="ardeno-label">Company</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Your company (optional)"
                                                            value={fields.company}
                                                            onChange={e => setFields(f => ({ ...f, company: e.target.value }))}
                                                            className="ardeno-input"
                                                        />
                                                    </div>

                                                    {/* Budget */}
                                                    <div>
                                                        <label className="ardeno-label">Budget Range</label>
                                                        <select
                                                            value={fields.budget}
                                                            onChange={e => setFields(f => ({ ...f, budget: e.target.value }))}
                                                            className="ardeno-input ardeno-select"
                                                            style={{ color: fields.budget ? "#ffffff" : "rgba(255,255,255,0.32)" }}
                                                        >
                                                            <option value="" disabled>Select a range</option>
                                                            {budgetOptions.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Message */}
                                                <div className="mb-8">
                                                    <label className="ardeno-label">Message <span style={{ color: "#E50914" }}>*</span></label>
                                                    <textarea
                                                        rows={4}
                                                        placeholder="Tell us about your project, goals, and timeline..."
                                                        value={fields.message}
                                                        onChange={e => setFields(f => ({ ...f, message: e.target.value }))}
                                                        className={`ardeno-input${errors.message ? " has-error" : ""}`}
                                                        style={{ resize: "vertical", minHeight: 120 }}
                                                    />
                                                    {errors.message && <span className="ardeno-error">✕ {errors.message}</span>}
                                                </div>

                                                {/* Submit row */}
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
                                                        * Required fields
                                                    </span>

                                                    <div className="relative group">
                                                        <motion.div
                                                            className="pointer-events-none absolute -inset-2 rounded-full blur-xl bg-[#E50914]/20"
                                                            initial={{ opacity: 0 }}
                                                            whileHover={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="absolute -left-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                                initial={{ x: "0%" }}
                                                                whileHover={{ x: "350%" }}
                                                                transition={{ duration: 0.65, ease: "easeInOut" }}
                                                                style={{ skewX: "-15deg" }}
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={handleSubmit}
                                                            disabled={formState === "submitting"}
                                                            className="relative flex items-center gap-2.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                                            style={{
                                                                fontFamily: "'DM Sans', sans-serif",
                                                                padding: "12px 26px",
                                                                background: "#E50914",
                                                                border: "1px solid rgba(229,9,20,0.6)",
                                                                transition: "box-shadow 0.3s ease, background 0.3s ease",
                                                            }}
                                                            onMouseEnter={e => {
                                                                if (formState !== "submitting") {
                                                                    (e.currentTarget as HTMLElement).style.background = "#ff1420";
                                                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(229,9,20,0.45)";
                                                                }
                                                            }}
                                                            onMouseLeave={e => {
                                                                (e.currentTarget as HTMLElement).style.background = "#E50914";
                                                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                                            }}
                                                        >
                                                            {formState === "submitting" ? (
                                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</>
                                                            ) : (
                                                                <>Send Message<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" /></>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {formState === "error" && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-4 text-[11px] text-right"
                                                        style={{ fontFamily: "'DM Sans', sans-serif", color: "#ff4d57" }}
                                                    >
                                                        Something went wrong — please try again or email us directly.
                                                    </motion.p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};