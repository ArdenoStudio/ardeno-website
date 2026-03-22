import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ARDENO_AI_PROMPT } from "../../ardeno-ai-prompt";
import { ARDENO_AI_CONTEXT } from "../../ardeno-ai-context";

// @ts-ignore
const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();

type QuickAction = { label: string; value: string };
type Message = {
    role: "user" | "assistant";
    content: string;
    id: string;
};

const QUICK_ACTIONS: QuickAction[] = [
    { label: "New Website", value: "I need a website for my business." },
    { label: "Redesign", value: "I want to redesign my current website." },
    { label: "Pricing", value: "How much does a website project usually cost?" },
    { label: "Portal / System", value: "I need a portal or custom system for my business." },
];

const STARTER_PROMPTS: QuickAction[] = [
    { label: "What is your process?", value: "What is your process for building a website?" },
    { label: "How much does it cost?", value: "How much does a website project usually cost?" },
    { label: "Do you build portals?", value: "Do you build custom business portals and internal systems?" },
];

const STORAGE_KEY = "ardeno_ai_messages_v9";
const OPEN_KEY = "ardeno_ai_open_v9";

const genId = () => Math.random().toString(36).slice(2, 10);

const RED = "#E50914";
const RED_RGB = "229,9,20";
const SYNE = "'Syne', sans-serif";
const MANROPE = "'Manrope', sans-serif";

const Logo: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <img
        src="/ardeno-logo.svg"
        alt="AI assistant"
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
        draggable={false}
    />
);

const SendIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const Spinner = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "awSpin .85s linear infinite", display: "block" }}
    >
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.16)" strokeWidth="2.5" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

const STYLES = `
  .aw * { box-sizing: border-box; }
  .aw button, .aw textarea { font-family: ${MANROPE}; }
  .aw button { -webkit-tap-highlight-color: transparent; }

  @keyframes awPanelIn {
    0% { opacity: 0; transform: translateY(18px) scale(.965); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes awPanelOut {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(14px) scale(.975); }
  }

  @keyframes awMsgIn {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes awDot {
    0%, 60%, 100% { transform: translateY(0); opacity: .35; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  @keyframes awSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes awPulseRing {
    0% { transform: scale(1); opacity: .42; }
    100% { transform: scale(1.95); opacity: 0; }
  }

  @keyframes awGlow {
    0%, 100% { box-shadow: 0 0 0 rgba(${RED_RGB}, 0); }
    50% { box-shadow: 0 0 28px rgba(${RED_RGB}, .18); }
  }

  @keyframes awFabFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }

  @keyframes awFabHalo {
    0%, 100% { opacity: .38; transform: scale(1); }
    50% { opacity: .68; transform: scale(1.06); }
  }

  @keyframes awRotateSlow {
    to { transform: rotate(360deg); }
  }

  .aw-panel-in { animation: awPanelIn 260ms cubic-bezier(.22,.68,0,1.08) both; }
  .aw-panel-out { animation: awPanelOut 220ms ease both; }
  .aw-msg { animation: awMsgIn 220ms cubic-bezier(.22,.68,0,1.08) both; }

  .aw-scroll::-webkit-scrollbar { width: 5px; }
  .aw-scroll::-webkit-scrollbar-track { background: transparent; }
  .aw-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 999px; }
  .aw-scroll::-webkit-scrollbar-thumb:hover { background: rgba(${RED_RGB}, .72); }

  .aw-fab,
  .aw-chip,
  .aw-ctrl,
  .aw-send,
  .aw-starter {
    transition: all 180ms ease;
  }

  .aw-fab:hover { transform: translateY(-2px) scale(1.01); }
  .aw-fab:active { transform: translateY(0) scale(.985); }

  .aw-chip:hover,
  .aw-starter:hover {
    border-color: rgba(${RED_RGB}, .30) !important;
    background: rgba(${RED_RGB}, .10) !important;
    color: #fff !important;
  }

  .aw-ctrl:hover {
    background: rgba(255,255,255,.06) !important;
    color: rgba(255,255,255,.95) !important;
    border-color: rgba(255,255,255,.14) !important;
  }

  .aw-send:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(${RED_RGB}, .34) !important;
  }

  .aw-send:active:not(:disabled) {
    transform: translateY(0) scale(.97);
  }

  .aw-input-wrap {
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .aw-input-wrap.focused {
    border-color: rgba(${RED_RGB}, .30) !important;
    box-shadow: 0 0 0 3px rgba(${RED_RGB}, .08) !important;
    background: rgba(255,255,255,.045) !important;
  }

  .aw-text p {
    margin: 0 0 10px;
  }

  .aw-text p:last-child {
    margin-bottom: 0;
  }

  .aw-text ul {
    margin: 8px 0 0;
    padding-left: 18px;
  }

  .aw-text li {
    margin: 5px 0;
  }

  .aw-panel-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at top right, rgba(${RED_RGB}, .10), transparent 30%),
      radial-gradient(circle at bottom left, rgba(${RED_RGB}, .06), transparent 26%);
  }

  .aw-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9997;
    background: rgba(0,0,0,.18);
    backdrop-filter: blur(4px);
  }

  .aw-fab-wrapper {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    transition: bottom 0.4s cubic-bezier(0.16,1,0.3,1);
    animation: awFabFloat 2.8s ease-in-out infinite;
  }

  .aw-panel-wrapper {
    position: fixed;
    right: 24px;
    bottom: 112px;
    width: 388px;
    max-width: calc(100vw - 20px);
    height: min(620px, calc(100vh - 112px));
    z-index: 9998;
    transition: bottom 0.4s cubic-bezier(0.16,1,0.3,1);
  }

  .aw.aw-bottom .aw-fab-wrapper {
    bottom: 24px;
  }

  .aw.aw-bottom .aw-panel-wrapper {
    bottom: 112px;
  }

  @media (max-width: 768px) {
    .aw-fab-wrapper {
      right: 16px;
      bottom: 16px;
    }
    .aw-panel-wrapper {
      right: 10px;
      left: 10px;
      top: 12px;
      bottom: 104px;
      width: auto;
      max-width: none;
      height: auto;
    }
    .aw.aw-bottom .aw-fab-wrapper {
      bottom: 16px;
    }
    .aw.aw-bottom .aw-panel-wrapper {
      top: 12px;
      bottom: 104px;
    }
  }

  body.nav-open .aw-fab-wrapper,
  body.nav-open .aw-panel-wrapper,
  body.nav-open .aw-backdrop {
    display: none !important;
  }
`;

function formatMessage(content: string) {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const elements: React.ReactNode[] = [];
    let bulletBuffer: string[] = [];

    const flushBullets = (key: string) => {
        if (!bulletBuffer.length) return;
        elements.push(
            <ul key={key}>
                {bulletBuffer.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        );
        bulletBuffer = [];
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ");

        if (isBullet) {
            bulletBuffer.push(trimmed.replace(/^(-|•)\s*/, ""));
        } else {
            flushBullets(`bullets-${index}`);
            elements.push(<p key={`p-${index}`}>{line}</p>);
        }
    });

    flushBullets("bullets-final");

    return <div className="aw-text">{elements}</div>;
}

function isPricingQuery(text: string) {
    const value = text.toLowerCase();
    return [
        "price",
        "pricing",
        "cost",
        "budget",
        "estimate",
        "quote",
        "starting price",
        "how much",
        "charges",
        "rate",
        "package",
        "packages",
        "fee",
        "fees",
    ].some((term) => value.includes(term));
}

function getSafePricingFallback() {
    return `Pricing depends on the scope of the project, including the number of pages, required features, integrations, design requirements, and overall complexity.

Because every Ardeno project is custom-coded, we do not use fixed packages or one-size-fits-all pricing.

The best next step is to share a few details about your project through the LET'S TALK button or the contact form, and Ardeno can then advise you properly.`;
}

function looksLikeInvalidToolOutput(text: string) {
    const value = text.trim().toLowerCase();

    const suspiciousPatterns = [
        '"tool"',
        '"function"',
        '"channel"',
        '"arguments"',
        '"schedule_meeting"',
        '"google meet"',
        '"zoom"',
        '"personal call"',
        "<tool_call",
        "tool_call",
        "function_call",
        "schedule_meeting",
        "```json",
    ];

    const matchedCount = suspiciousPatterns.filter((pattern) => value.includes(pattern)).length;

    const looksStructured =
        (value.startsWith("{") || value.startsWith("[") || value.startsWith("```json") || value.includes('"tool"')) &&
        matchedCount >= 1;

    return looksStructured;
}

const ArdenoAIWidget: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [animOut, setAnimOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const isInputEmpty = useMemo(() => input.trim().length === 0, [input]);

    useEffect(() => {
        setMounted(true);
        try {
            const savedMessages = localStorage.getItem(STORAGE_KEY);
            const savedOpen = localStorage.getItem(OPEN_KEY);

            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                if (Array.isArray(parsed)) setMessages(parsed.slice(-24));
            }

            if (savedOpen === "true") setOpen(true);
        } catch {
            //
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
        } catch {
            //
        }
    }, [messages, mounted]);

    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(OPEN_KEY, String(open));
        } catch {
            //
        }
    }, [open, mounted]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (!open) return;
        const timeout = setTimeout(() => textareaRef.current?.focus(), 180);
        return () => clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        const onGlobalKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) close();
        };

        window.addEventListener("keydown", onGlobalKey);
        return () => window.removeEventListener("keydown", onGlobalKey);
    }, [open]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!open || !panelRef.current) return;
            const target = e.target as Node;
            const fab = document.getElementById("ardeno-ai-fab");

            if (panelRef.current.contains(target)) return;
            if (fab?.contains(target)) return;

            close();
        };

        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [open]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [input]);

    useEffect(() => {
        const handleScroll = () => {
            const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 70;
            setIsAtBottom(bottom);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const buildAPI = useCallback((conversation: Message[]) => {
        return [
            {
                role: "system",
                content: `${ARDENO_AI_CONTEXT}\n\n${ARDENO_AI_PROMPT}`,
            },
            ...conversation.slice(-14).map((m) => ({
                role: m.role,
                content: m.content,
            })),
        ];
    }, []);

    const close = useCallback(() => {
        abortRef.current?.abort();
        setAnimOut(true);

        setTimeout(() => {
            setOpen(false);
            setAnimOut(false);
            setLoading(false);
        }, 220);
    }, []);

    const toggle = useCallback(() => {
        if (open) close();
        else setOpen(true);
    }, [open, close]);

    const clearChat = () => {
        abortRef.current?.abort();
        setLoading(false);
        setMessages([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            //
        }
    };

    const requestAssistantReply = useCallback(
        async (conversation: Message[], controller: AbortController) => {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.25,
                    max_tokens: 500,
                    top_p: 0.9,
                    messages: buildAPI(conversation),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const apiMsg = data?.error?.message || "API error";
                if (res.status === 401) {
                    throw new Error("Your GROQ API key is invalid or expired. Update VITE_GROQ_API_KEY.");
                }
                throw new Error(apiMsg);
            }

            const reply = data?.choices?.[0]?.message?.content?.trim();

            if (!reply) {
                throw new Error("No response generated.");
            }

            return reply;
        },
        [buildAPI]
    );

    const sendPrompt = async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = {
            role: "user",
            content: trimmed,
            id: genId(),
        };

        const nextConversation = [...messages, userMsg];
        setMessages(nextConversation);
        setInput("");
        setLoading(true);

        if (!GROQ_API_KEY) {
            setMessages([
                ...nextConversation,
                {
                    role: "assistant",
                    content: "AI service is not configured. Add VITE_GROQ_API_KEY to your environment variables.",
                    id: genId(),
                },
            ]);
            setLoading(false);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            let reply = await requestAssistantReply(nextConversation, controller);

            if (looksLikeInvalidToolOutput(reply)) {
                const recoveryConversation: Message[] = [
                    ...nextConversation,
                    {
                        role: "assistant",
                        content:
                            "Internal recovery instruction: Your previous reply was invalid because it looked like a tool call or structured command. Reply again in plain text only as Ardeno AI. Do not output JSON, code, tool calls, booking commands, schemas, pricing figures, ranges, or estimates. Answer the user's request normally.",
                        id: genId(),
                    },
                ];

                reply = await requestAssistantReply(recoveryConversation, controller);

                if (looksLikeInvalidToolOutput(reply)) {
                    throw new Error("Invalid AI output format detected.");
                }
            }

            // Deterministic pricing override:
            // Every pricing-related query gets the approved safe response only.
            if (isPricingQuery(trimmed)) {
                reply = getSafePricingFallback();
            }

            setMessages([
                ...nextConversation,
                {
                    role: "assistant",
                    content: reply,
                    id: genId(),
                },
            ]);
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") return;

            const fallbackMessage =
                e instanceof Error && e.message === "Invalid AI output format detected."
                    ? "I’m here to help with Ardeno Studio’s websites, redesigns, portals, pricing direction, and process. For project enquiries, please use the LET'S TALK button or the contact form, and Ardeno will respond within 24 hours."
                    : e instanceof Error
                    ? `Something went wrong: ${e.message}`
                    : "Connection issue. Please try again.";

            setMessages([
                ...nextConversation,
                {
                    role: "assistant",
                    content: fallbackMessage,
                    id: genId(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        await sendPrompt(input);
    };

    const onInputKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSend();
        }
    };

    return (
        <div className={`aw ${isAtBottom ? "aw-bottom" : ""}`}>
            <style>{STYLES}</style>

            {open && <div className="aw-backdrop" />}

            <button
                id="ardeno-ai-fab"
                onClick={toggle}
                aria-label={open ? "Close AI assistant" : "Open AI assistant"}
                className="aw-fab aw-fab-wrapper"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 72,
                    height: 72,
                    padding: 0,
                    background: "rgba(8,8,10,.82)",
                    backdropFilter: "blur(16px)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: "22px",
                    boxShadow:
                        open
                            ? "0 22px 64px rgba(0,0,0,.66), 0 0 0 1px rgba(255,255,255,.03), 0 0 40px rgba(229,9,20,.22)"
                            : "0 18px 56px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.04), 0 0 22px rgba(229,9,20,.12)",
                    cursor: "pointer",
                    position: "fixed",
                    overflow: "hidden",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        inset: -18,
                        borderRadius: 999,
                        background: `radial-gradient(circle, rgba(${RED_RGB}, .26) 0%, rgba(${RED_RGB}, .1) 36%, transparent 70%)`,
                        animation: "awFabHalo 2.8s ease-in-out infinite",
                        pointerEvents: "none",
                    }}
                />

                <span
                    style={{
                        position: "absolute",
                        inset: 8,
                        borderRadius: 16,
                        border: `1px solid rgba(${RED_RGB}, .22)`,
                        animation: "awPulseRing 2.8s ease-out infinite",
                        pointerEvents: "none",
                    }}
                />

                <span
                    style={{
                        position: "absolute",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background:
                            "conic-gradient(from 0deg, rgba(229,9,20,0) 0deg, rgba(229,9,20,.22) 100deg, rgba(229,9,20,0) 220deg, rgba(229,9,20,.16) 320deg, rgba(229,9,20,0) 360deg)",
                        animation: "awRotateSlow 8s linear infinite",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.015))",
                        border: "1px solid rgba(255,255,255,.07)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 0 22px rgba(229,9,20,.16)",
                        animation: "awGlow 2.8s ease-in-out infinite",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Logo size={24} />
                </div>
            </button>

            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="AI assistant"
                    aria-modal="true"
                    className={`aw-panel-wrapper ${animOut ? "aw-panel-out" : "aw-panel-in"}`}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        borderRadius: "20px",
                        background: "linear-gradient(180deg, rgba(14,14,16,.97) 0%, rgba(9,9,11,.985) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,.08)",
                        boxShadow:
                            "0 30px 100px rgba(0,0,0,.74), 0 0 0 1px rgba(255,255,255,.02), 0 0 42px rgba(229,9,20,.08)",
                    }}
                >
                    <div className="aw-panel-glow" />

                    <div
                        style={{
                            position: "relative",
                            height: 1,
                            background: `linear-gradient(90deg, rgba(${RED_RGB}, .94) 0%, rgba(${RED_RGB}, .18) 42%, transparent 100%)`,
                            flexShrink: 0,
                            zIndex: 1,
                        }}
                    />

                    <div
                        style={{
                            position: "relative",
                            padding: "13px 13px 12px",
                            borderBottom: "1px solid rgba(255,255,255,.07)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012))",
                            zIndex: 1,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 11,
                                    display: "grid",
                                    placeItems: "center",
                                    background: "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015))",
                                    border: "1px solid rgba(255,255,255,.06)",
                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
                                }}
                            >
                                <Logo size={18} />
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontFamily: SYNE,
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        color: "#fff",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Ardeno AI
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        marginTop: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: "#3ddc84",
                                            boxShadow: "0 0 8px rgba(61,220,132,.6)",
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontFamily: MANROPE,
                                            fontSize: "10px",
                                            fontWeight: 500,
                                            color: "rgba(255,255,255,.42)",
                                            letterSpacing: "0.13em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Online · Website Project Advisor
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={clearChat}
                                className="aw-ctrl"
                                style={{
                                    height: "31px",
                                    padding: "0 10px",
                                    borderRadius: "9px",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    background: "rgba(255,255,255,.02)",
                                    color: "rgba(255,255,255,.55)",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>

                            <button
                                onClick={close}
                                aria-label="Close chat"
                                className="aw-ctrl"
                                style={{
                                    width: "31px",
                                    height: "31px",
                                    borderRadius: "9px",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    background: "rgba(255,255,255,.02)",
                                    color: "rgba(255,255,255,.55)",
                                    cursor: "pointer",
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    <div
                        className="aw-scroll"
                        style={{
                            position: "relative",
                            flex: 1,
                            overflowY: "auto",
                            padding: "18px 16px 12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            zIndex: 1,
                        }}
                    >
                        {messages.length === 0 && (
                            <>
                                <div
                                    className="aw-msg"
                                    style={{
                                        padding: "18px",
                                        borderRadius: "20px",
                                        background: "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.022))",
                                        border: "1px solid rgba(255,255,255,.07)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: SYNE,
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#fff",
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        Talk to <span style={{ color: RED }}>Ardeno AI</span>
                                    </div>

                                    <p
                                        style={{
                                            margin: "10px 0 0",
                                            fontFamily: MANROPE,
                                            fontSize: "14px",
                                            lineHeight: 1.7,
                                            color: "rgba(255,255,255,.79)",
                                        }}
                                    >
                                        Ask about new websites, redesigns, pricing direction, portals, timelines, or the best setup for your business.
                                    </p>

                                    <div
                                        style={{
                                            marginTop: 13,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 10px",
                                            borderRadius: 999,
                                            background: "rgba(255,255,255,.025)",
                                            border: "1px solid rgba(255,255,255,.06)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: "50%",
                                                background: "#3ddc84",
                                                boxShadow: "0 0 10px rgba(61,220,132,.55)",
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "rgba(255,255,255,.42)",
                                                letterSpacing: ".08em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Best for serious project enquiries
                                        </span>
                                    </div>
                                </div>

                                <div className="aw-msg" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {QUICK_ACTIONS.map((action) => (
                                        <button
                                            key={action.label}
                                            onClick={() => sendPrompt(action.value)}
                                            className="aw-chip"
                                            style={{
                                                padding: "9px 13px",
                                                borderRadius: "999px",
                                                background: "rgba(255,255,255,.03)",
                                                border: "1px solid rgba(255,255,255,.08)",
                                                color: "rgba(255,255,255,.64)",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="aw-msg">
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            color: "rgba(255,255,255,.28)",
                                            letterSpacing: ".14em",
                                            textTransform: "uppercase",
                                            marginBottom: 10,
                                        }}
                                    >
                                        Suggested questions
                                    </div>

                                    <div style={{ display: "grid", gap: 8 }}>
                                        {STARTER_PROMPTS.map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => sendPrompt(item.value)}
                                                className="aw-starter"
                                                style={{
                                                    textAlign: "left",
                                                    padding: "13px 14px",
                                                    borderRadius: "16px",
                                                    background: "rgba(255,255,255,.025)",
                                                    border: "1px solid rgba(255,255,255,.07)",
                                                    color: "rgba(255,255,255,.8)",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                    lineHeight: 1.45,
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {messages.map((msg, i) => {
                            const isUser = msg.role === "user";

                            return (
                                <div
                                    key={msg.id}
                                    className="aw-msg"
                                    style={{
                                        alignSelf: isUser ? "flex-end" : "flex-start",
                                        maxWidth: "87%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                        animationDelay: `${Math.min(i * 10, 50)}ms`,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: SYNE,
                                            fontSize: "9px",
                                            fontWeight: 700,
                                            letterSpacing: ".16em",
                                            textTransform: "uppercase",
                                            color: isUser ? "rgba(229,9,20,.72)" : "rgba(255,255,255,.28)",
                                            alignSelf: isUser ? "flex-end" : "flex-start",
                                            paddingInline: 2,
                                        }}
                                    >
                                        {isUser ? "You" : "Ardeno AI"}
                                    </span>

                                    <div
                                        style={{
                                            padding: "13px 15px",
                                            borderRadius: isUser ? "18px 18px 7px 18px" : "7px 18px 18px 18px",
                                            background: isUser
                                                ? "linear-gradient(180deg, rgba(229,9,20,.19), rgba(229,9,20,.11))"
                                                : "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.028))",
                                            border: isUser
                                                ? "1px solid rgba(229,9,20,.25)"
                                                : "1px solid rgba(255,255,255,.07)",
                                            color: "rgba(255,255,255,.92)",
                                            fontSize: "13.5px",
                                            lineHeight: 1.68,
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            boxShadow: isUser ? "0 8px 24px rgba(229,9,20,.11)" : "none",
                                        }}
                                    >
                                        {formatMessage(msg.content)}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div
                                className="aw-msg"
                                style={{
                                    alignSelf: "flex-start",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: SYNE,
                                        fontSize: "9px",
                                        fontWeight: 700,
                                        letterSpacing: ".16em",
                                        textTransform: "uppercase",
                                        color: "rgba(255,255,255,.28)",
                                        paddingLeft: 2,
                                    }}
                                >
                                    Ardeno AI
                                </span>

                                <div
                                    style={{
                                        padding: "12px 14px",
                                        borderRadius: "7px 18px 18px 18px",
                                        background: "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.03))",
                                        border: "1px solid rgba(255,255,255,.07)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    {[0, 1, 2].map((n) => (
                                        <span
                                            key={n}
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                background: RED,
                                                animation: `awDot 1.3s ${n * 0.18}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} style={{ height: 2 }} />
                    </div>

                    <div
                        style={{
                            position: "relative",
                            padding: "12px 14px 14px",
                            borderTop: "1px solid rgba(255,255,255,.07)",
                            background: "rgba(0,0,0,.18)",
                            flexShrink: 0,
                            zIndex: 1,
                        }}
                    >
                        <div
                            className={`aw-input-wrap${focused ? " focused" : ""}`}
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-end",
                                padding: "8px",
                                borderRadius: "18px",
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid rgba(255,255,255,.08)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,.02)",
                            }}
                        >
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onInputKeyDown}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="Ask about websites, pricing, portals, redesigns..."
                                disabled={loading}
                                rows={1}
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    maxHeight: 120,
                                    resize: "none",
                                    overflowY: "auto",
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    color: "#fff",
                                    fontFamily: MANROPE,
                                    fontSize: "13.5px",
                                    lineHeight: 1.5,
                                    padding: "8px 6px 8px 8px",
                                }}
                            />

                            <button
                                onClick={handleSend}
                                disabled={isInputEmpty || loading}
                                aria-label="Send message"
                                className="aw-send"
                                style={{
                                    width: 42,
                                    height: 42,
                                    flexShrink: 0,
                                    borderRadius: "14px",
                                    border: "none",
                                    background: isInputEmpty || loading ? "rgba(255,255,255,.05)" : RED,
                                    color: isInputEmpty || loading ? "rgba(255,255,255,.22)" : "#fff",
                                    cursor: isInputEmpty || loading ? "not-allowed" : "pointer",
                                    display: "grid",
                                    placeItems: "center",
                                    boxShadow: isInputEmpty || loading ? "none" : "0 8px 24px rgba(229,9,20,.28)",
                                }}
                            >
                                {loading ? <Spinner /> : <SendIcon />}
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                paddingInline: 4,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "10px",
                                    color: "rgba(255,255,255,.25)",
                                    letterSpacing: ".04em",
                                }}
                            >
                                Enter to send · Shift + Enter for new line
                            </span>

                            <span
                                style={{
                                    fontFamily: SYNE,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: "rgba(229,9,20,.55)",
                                    letterSpacing: ".08em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Ardeno Studio
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArdenoAIWidget;