import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowUpRight,
    Bot,
    CheckCircle2,
    Clock3,
    Loader2,
    MessageCircle,
    RotateCcw,
    Send,
    ShieldCheck,
    Sparkles,
    X,
    Zap,
} from "lucide-react";

type QuickAction = {
    label: string;
    value: string;
    detail?: string;
    icon: React.ElementType;
};

type Message = {
    role: "user" | "assistant";
    content: string;
    id: string;
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Audit my site",
        detail: "Find trust, UX, and conversion gaps",
        value: "Can you audit my current website and tell me what Ardeno Studio would improve first?",
        icon: ShieldCheck,
    },
    {
        label: "Plan a redesign",
        detail: "Shape a sharper modern rebuild",
        value: "I want to redesign my current website. What should the first plan look like?",
        icon: Sparkles,
    },
    {
        label: "Estimate a build",
        detail: "Clarify scope, pricing, and timeline",
        value: "How much does a custom website usually cost and what affects the timeline?",
        icon: Clock3,
    },
    {
        label: "Add a system",
        detail: "Booking, order, portal, or AI workflow",
        value: "I need a portal, booking system, or custom business system. How would Ardeno scope it?",
        icon: Zap,
    },
];

const STARTER_PROMPTS: QuickAction[] = [
    {
        label: "What makes an Ardeno site different?",
        value: "What makes an Ardeno Studio website different from a basic template site?",
        icon: CheckCircle2,
    },
    {
        label: "What do you need from me?",
        value: "What information should I prepare before starting a project with Ardeno Studio?",
        icon: MessageCircle,
    },
    {
        label: "Can you build AI lead capture?",
        value: "Can you build an AI lead assistant for my business website?",
        icon: Bot,
    },
];

const STORAGE_KEY = "ardeno_ai_messages_v7";
const OPEN_KEY = "ardeno_ai_open_v7";
const AI_PANEL_ID = "ardeno-ai-panel";
const CHAR_LIMIT = 500;

const genId = () => Math.random().toString(36).slice(2, 9);

const RED = "#E50914";
const RED_RGB = "229,9,20";

const STYLES = `
  .aw * {
    box-sizing: border-box;
  }

  .aw {
    --aw-red: ${RED};
    --aw-red-rgb: ${RED_RGB};
    --aw-display: var(--font-display);
    --aw-body: var(--font-body);
    --aw-ui: var(--font-ui);
  }

  .aw button,
  .aw textarea {
    font-family: var(--aw-ui);
  }

  .aw button {
    -webkit-tap-highlight-color: transparent;
  }

  body.project-modal-open .aw-fab-wrapper,
  body.project-modal-open .aw-panel-wrapper,
  body.project-modal-open .aw-backdrop,
  body.contact-modal-open .aw-fab-wrapper,
  body.contact-modal-open .aw-panel-wrapper,
  body.contact-modal-open .aw-backdrop,
  body.cookie-banner-visible .aw-fab-wrapper,
  body.cookie-banner-visible .aw-panel-wrapper,
  body.cookie-banner-visible .aw-backdrop,
  body.nav-open .aw-fab-wrapper,
  body.nav-open .aw-panel-wrapper,
  body.nav-open .aw-backdrop {
    display: none !important;
    pointer-events: none !important;
  }

  body.ai-assistant-open .ardeno-cookie-banner {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
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

  .aw-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9997;
    background: rgba(3, 3, 4, 0.48);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .aw-fab-wrapper {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    transition: bottom 0.4s cubic-bezier(0.16,1,0.3,1);
    animation: awFabFloat 2.8s ease-in-out infinite;
  }

  .aw-fab {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    padding: 0;
    background: rgba(8,8,10,.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: #fff;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 22px;
    box-shadow:
      0 18px 56px rgba(0,0,0,.58),
      inset 0 1px 0 rgba(255,255,255,.04),
      0 0 22px rgba(229,9,20,.12);
    cursor: pointer;
    overflow: hidden;
    transition: all 180ms ease;
  }

  .aw-fab:hover {
    transform: translateY(-2px) scale(1.01);
  }

  .aw-fab:active {
    transform: translateY(0) scale(.985);
  }

  .aw-fab-mark {
    position: relative;
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    flex: 0 0 auto;
    border-radius: 15px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
      rgba(var(--aw-red-rgb), 0.08);
    border: 1px solid rgba(var(--aw-red-rgb), 0.22);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .aw-fab-mark::after {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: inherit;
    border: 1px solid rgba(var(--aw-red-rgb), 0.16);
    opacity: 0.9;
  }

  .aw-panel-wrapper {
    position: fixed;
    right: 24px;
    bottom: 104px;
    width: 430px;
    max-width: calc(100vw - 24px);
    height: min(680px, calc(100dvh - 130px));
    z-index: 9998;
  }

  .aw-panel {
    position: relative;
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    border-radius: 24px;
    background:
      radial-gradient(circle at 0% 0%, rgba(var(--aw-red-rgb), 0.18), transparent 34%),
      radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.05), transparent 34%),
      linear-gradient(145deg, rgba(20, 20, 22, 0.98), rgba(7, 7, 8, 0.99));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 38px 120px rgba(0, 0, 0, 0.78),
      0 0 0 1px rgba(var(--aw-red-rgb), 0.08);
  }

  .aw-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 150px;
  }

  .aw-top-line {
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--aw-red-rgb), 0.9), rgba(255,255,255,0.22), transparent);
  }

  .aw-header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .aw-brand {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 12px;
  }

  .aw-brand-mark {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    border-radius: 14px;
    background: rgba(var(--aw-red-rgb), 0.1);
    border: 1px solid rgba(var(--aw-red-rgb), 0.2);
  }

  .aw-brand-title {
    margin: 0;
    font-family: var(--aw-display);
    font-size: 21px;
    line-height: 1;
    font-weight: 400;
    color: #fff;
  }

  .aw-brand-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    font-family: var(--aw-ui);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.46);
  }

  .aw-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3ddc84;
    box-shadow: 0 0 12px rgba(61, 220, 132, 0.65);
  }

  .aw-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
  }

  .aw-icon-button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.045);
    color: rgba(255, 255, 255, 0.62);
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .aw-icon-button:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--aw-red-rgb), 0.36);
    background: rgba(var(--aw-red-rgb), 0.1);
    color: #fff;
  }

  .aw-scroll {
    position: relative;
    z-index: 1;
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    gap: 13px;
    overflow-y: auto;
    padding: 16px;
  }

  .aw-scroll > * {
    flex-shrink: 0;
  }

  .aw-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .aw-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .aw-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.14);
    border-radius: 999px;
  }

  .aw-empty-hero {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border-radius: 20px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
      rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .aw-empty-hero::after {
    content: "";
    position: absolute;
    right: -42px;
    top: -42px;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--aw-red-rgb), 0.18), transparent 66%);
    pointer-events: none;
  }

  .aw-kicker {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 12px;
    font-family: var(--aw-ui);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.56);
  }

  .aw-empty-title {
    position: relative;
    z-index: 1;
    margin: 0;
    max-width: 12ch;
    font-family: var(--aw-display);
    font-size: 36px;
    line-height: 0.98;
    font-weight: 400;
    color: #fff;
  }

  .aw-empty-title em {
    color: rgba(255, 255, 255, 0.42);
    font-style: italic;
  }

  .aw-empty-copy {
    position: relative;
    z-index: 1;
    margin: 14px 0 0;
    max-width: 32ch;
    font-family: var(--aw-body);
    font-size: 13px;
    line-height: 1.72;
    color: rgba(255, 255, 255, 0.68);
  }

  .aw-proof-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .aw-proof {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.035);
    padding: 10px;
    color: rgba(255, 255, 255, 0.68);
    font-family: var(--aw-ui);
    font-size: 11px;
    font-weight: 700;
  }

  .aw-proof svg {
    flex: 0 0 auto;
    color: var(--aw-red);
  }

  .aw-section-label {
    margin: 4px 0 0;
    font-family: var(--aw-ui);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.42);
  }

  .aw-quick-grid {
    display: grid;
    gap: 9px;
  }

  .aw-quick {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) 22px;
    align-items: center;
    gap: 11px;
    width: 100%;
    min-height: 68px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 10px 12px;
    text-align: left;
    color: #fff;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.035);
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .aw-quick:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--aw-red-rgb), 0.32);
    background: rgba(var(--aw-red-rgb), 0.075);
  }

  .aw-quick-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    color: var(--aw-red);
    background: rgba(var(--aw-red-rgb), 0.09);
    border: 1px solid rgba(var(--aw-red-rgb), 0.16);
  }

  .aw-quick-title {
    display: block;
    overflow-wrap: anywhere;
    font-family: var(--aw-ui);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.94);
  }

  .aw-quick-detail {
    display: block;
    margin-top: 4px;
    overflow-wrap: anywhere;
    font-family: var(--aw-body);
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.46);
  }

  .aw-quick-arrow {
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.35);
  }

  .aw-starters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .aw-starter {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 8px 11px;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    font-family: var(--aw-ui);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }

  .aw-starter:hover {
    border-color: rgba(var(--aw-red-rgb), 0.3);
    background: rgba(var(--aw-red-rgb), 0.08);
    color: #fff;
  }

  .aw-message {
    display: flex;
    max-width: 88%;
    flex-direction: column;
    gap: 6px;
  }

  .aw-message.user {
    align-self: flex-end;
  }

  .aw-message.assistant {
    align-self: flex-start;
  }

  .aw-message-meta {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-inline: 3px;
    font-family: var(--aw-ui);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.36);
  }

  .aw-message.user .aw-message-meta {
    justify-content: flex-end;
    color: rgba(var(--aw-red-rgb), 0.82);
  }

  .aw-bubble {
    overflow-wrap: anywhere;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 13px 14px;
    white-space: pre-wrap;
    color: rgba(255, 255, 255, 0.9);
    font-family: var(--aw-body);
    font-size: 13px;
    line-height: 1.7;
    background: rgba(255, 255, 255, 0.045);
  }

  .aw-message.user .aw-bubble {
    border-color: rgba(var(--aw-red-rgb), 0.28);
    background: linear-gradient(180deg, rgba(var(--aw-red-rgb), 0.22), rgba(var(--aw-red-rgb), 0.12));
    box-shadow: 0 12px 32px rgba(var(--aw-red-rgb), 0.12);
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

  .aw-loading {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 11px 13px;
    color: rgba(255, 255, 255, 0.72);
    background: rgba(255, 255, 255, 0.045);
    font-family: var(--aw-ui);
    font-size: 12px;
    font-weight: 700;
  }

  .aw-compose {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.18);
  }

  .aw-input-wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 46px;
    align-items: end;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.045);
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .aw-input-wrap.focused {
    border-color: rgba(var(--aw-red-rgb), 0.5);
    background: rgba(255, 255, 255, 0.065);
    box-shadow: 0 0 0 4px rgba(var(--aw-red-rgb), 0.08);
  }

  .aw-input {
    width: 100%;
    min-height: 44px;
    max-height: 124px;
    resize: none;
    overflow-y: auto;
    border: 0;
    outline: 0;
    border-radius: 12px;
    padding: 12px 10px;
    background: transparent;
    color: #fff;
    font-family: var(--aw-body);
    font-size: 13px;
    line-height: 1.5;
  }

  .aw-input::placeholder {
    color: rgba(255, 255, 255, 0.36);
  }

  .aw-send {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    flex: 0 0 auto;
    border: 1px solid rgba(var(--aw-red-rgb), 0.4);
    border-radius: 15px;
    color: #fff;
    background: var(--aw-red);
    cursor: pointer;
    box-shadow: 0 12px 28px rgba(var(--aw-red-rgb), 0.28);
    transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  }

  .aw-send:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 34px rgba(var(--aw-red-rgb), 0.36);
  }

  .aw-send:disabled {
    cursor: not-allowed;
    opacity: 0.42;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .aw-compose-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 9px;
    padding-inline: 4px;
    font-family: var(--aw-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.32);
  }

  .aw-compose-meta strong {
    color: rgba(var(--aw-red-rgb), 0.78);
    font-weight: 800;
  }

  .aw-disclaimer {
    margin: 0 0 8px;
    padding-inline: 4px;
    font-family: var(--aw-body);
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.38);
  }

  .aw-char-count {
    font-variant-numeric: tabular-nums;
  }

  .aw-char-count.near-limit {
    color: rgba(255, 180, 80, 0.9);
  }

  .aw-char-count.at-limit {
    color: rgba(255, 77, 87, 0.95);
  }

  .aw-reduced .aw-fab,
  .aw-reduced .aw-quick,
  .aw-reduced .aw-icon-button,
  .aw-reduced .aw-send {
    transition-duration: 0.01ms;
  }

  @media (max-width: 768px) {
    .aw-fab-wrapper {
      right: 16px;
      bottom: 16px;
    }
  }

  @media (max-width: 640px) {
    .aw-panel-wrapper {
      left: 10px;
      right: 10px;
      top: 84px;
      bottom: 88px;
      width: auto;
      max-width: none;
      height: auto;
    }

    .aw-panel {
      border-radius: 22px;
    }

    .aw-header {
      padding: 14px;
    }

    .aw-brand-title {
      font-size: 20px;
    }

    .aw-scroll {
      padding: 13px;
      gap: 11px;
    }

    .aw-empty-title {
      font-size: 31px;
    }

    .aw-proof-strip {
      grid-template-columns: 1fr;
    }

    .aw-quick {
      grid-template-columns: 32px minmax(0, 1fr) 18px;
      min-height: 62px;
      border-radius: 14px;
      padding: 9px 10px;
    }

    .aw-message {
      max-width: 94%;
    }

    .aw-compose {
      padding: 10px;
    }

    .aw-compose-meta {
      flex-wrap: wrap;
      gap: 4px 10px;
    }
  }
`;

const Logo: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <img
        src="/ardeno-logo.svg"
        alt=""
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
        draggable={false}
        aria-hidden="true"
    />
);

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
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");

        if (isBullet) {
            bulletBuffer.push(trimmed.replace(/^(-|\*|•)\s*/, ""));
            return;
        }

        flushBullets(`bullets-${index}`);
        elements.push(<p key={`p-${index}`}>{line}</p>);
    });

    flushBullets("bullets-final");

    return <div className="aw-text">{elements}</div>;
}

const panelMotion = {
    initial: { opacity: 0, y: 18, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.98 },
};

const ArdenoAIWidget: React.FC = () => {
    const reduced = useReducedMotion() ?? false;
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const isInputEmpty = useMemo(() => input.trim().length === 0, [input]);
    const charCount = input.length;
    const nearLimit = charCount >= CHAR_LIMIT - 50;
    const atLimit = charCount >= CHAR_LIMIT;

    const close = useCallback(() => {
        abortRef.current?.abort();
        setLoading(false);
        setOpen(false);
    }, []);

    const clearChat = useCallback(() => {
        abortRef.current?.abort();
        setLoading(false);
        setMessages([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage failures in private browsing or locked-down clients.
        }
    }, []);

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
            // Ignore malformed stored chat state.
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
        } catch {
            // Ignore storage failures.
        }
    }, [messages, mounted]);

    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(OPEN_KEY, String(open));
        } catch {
            // Ignore storage failures.
        }
    }, [open, mounted]);

    useEffect(() => {
        if (open) {
            document.body.classList.add("ai-assistant-open");
        } else {
            document.body.classList.remove("ai-assistant-open");
        }

        return () => {
            document.body.classList.remove("ai-assistant-open");
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const timeout = setTimeout(() => textareaRef.current?.focus(), 180);
        return () => clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        if (messages.length === 0 && !loading) return;
        bottomRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }, [messages, loading, reduced]);

    useEffect(() => {
        const onGlobalKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) close();
        };

        window.addEventListener("keydown", onGlobalKey);
        return () => window.removeEventListener("keydown", onGlobalKey);
    }, [close, open]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = `${Math.min(el.scrollHeight, 124)}px`;
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

    const toggle = useCallback(() => {
        if (open) close();
        else setOpen(true);
    }, [close, open]);

    const sendPrompt = async (value: string) => {
        const trimmed = value.trim().slice(0, CHAR_LIMIT);
        if (!trimmed || loading) return;

        const userMsg: Message = {
            role: "user",
            content: trimmed,
            id: genId(),
        };

        const next = [...messages, userMsg];
        setMessages(next);
        setInput("");
        setLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: trimmed,
                    history: messages.slice(-10).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "API error");
            }

            const reply = data?.content || "No response generated. Please try again.";

            setMessages([
                ...next,
                {
                    role: "assistant",
                    content: reply,
                    id: genId(),
                },
            ]);
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") return;

            setMessages([
                ...next,
                {
                    role: "assistant",
                    content:
                        e instanceof Error
                            ? `Something went wrong: ${e.message}`
                            : "Connection issue. Please try again.",
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
        <div className={`aw ${isAtBottom ? "aw-bottom" : ""} ${reduced ? "aw-reduced" : ""}`}>
            <style>{STYLES}</style>

            <AnimatePresence>
                {open && (
                    <motion.button
                        type="button"
                        className="aw-backdrop"
                        aria-label="Close AI assistant"
                        onClick={close}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                    />
                )}
            </AnimatePresence>

            <motion.button
                id="ardeno-ai-fab"
                type="button"
                onClick={toggle}
                aria-label={open ? "Close AI assistant" : "Open AI assistant"}
                aria-expanded={open}
                aria-controls={AI_PANEL_ID}
                className="aw-fab aw-fab-wrapper"
                whileTap={reduced ? undefined : { scale: 0.98 }}
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
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id={AI_PANEL_ID}
                        role="dialog"
                        aria-label="Ardeno AI assistant"
                        aria-modal="true"
                        className="aw-panel-wrapper"
                        {...panelMotion}
                        transition={{ duration: reduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="aw-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="aw-top-line" />

                            <header className="aw-header">
                                <div className="aw-brand">
                                    <span className="aw-brand-mark">
                                        <Logo size={22} />
                                    </span>
                                    <div>
                                        <h2 className="aw-brand-title">Ardeno AI</h2>
                                        <div className="aw-brand-meta">
                                            <span className="aw-status-dot" />
                                            <span>Online project advisor</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="aw-actions">
                                    <button
                                        type="button"
                                        className="aw-icon-button"
                                        onClick={clearChat}
                                        aria-label="Clear chat"
                                        title="Clear chat"
                                    >
                                        <RotateCcw size={15} strokeWidth={1.8} />
                                    </button>
                                    <button
                                        type="button"
                                        className="aw-icon-button"
                                        onClick={close}
                                        aria-label="Close chat"
                                        title="Close chat"
                                    >
                                        <X size={16} strokeWidth={1.8} />
                                    </button>
                                </div>
                            </header>

                            <div className="aw-scroll" aria-live="polite" aria-relevant="additions">
                                {messages.length === 0 && (
                                    <>
                                        <motion.section
                                            className="aw-empty-hero"
                                            initial={reduced ? false : { opacity: 0, y: 12 }}
                                            animate={reduced ? undefined : { opacity: 1, y: 0 }}
                                            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="aw-kicker">
                                                <Bot size={14} strokeWidth={1.8} />
                                                Website and system strategy
                                            </div>
                                            <h3 className="aw-empty-title">
                                                Shape the <em>right</em> build.
                                            </h3>
                                            <p className="aw-empty-copy">
                                                Bring the business, the current site, and the result you want. I will help turn it into a clear next step.
                                            </p>
                                        </motion.section>

                                        <div className="aw-proof-strip">
                                            {[
                                                { label: "Free audit", icon: ShieldCheck },
                                                { label: "Custom scope", icon: Sparkles },
                                                { label: "Launch focus", icon: CheckCircle2 },
                                            ].map(({ label, icon: Icon }) => (
                                                <div className="aw-proof" key={label}>
                                                    <Icon size={14} strokeWidth={1.8} />
                                                    <span>{label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="aw-section-label">Start with</p>

                                        <div className="aw-quick-grid">
                                            {QUICK_ACTIONS.map(({ label, detail, value, icon: Icon }) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    className="aw-quick"
                                                    onClick={() => sendPrompt(value)}
                                                >
                                                    <span className="aw-quick-icon">
                                                        <Icon size={16} strokeWidth={1.8} />
                                                    </span>
                                                    <span>
                                                        <span className="aw-quick-title">{label}</span>
                                                        {detail && <span className="aw-quick-detail">{detail}</span>}
                                                    </span>
                                                    <span className="aw-quick-arrow">
                                                        <ArrowUpRight size={15} strokeWidth={1.8} />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <p className="aw-section-label">Common questions</p>

                                        <div className="aw-starters">
                                            {STARTER_PROMPTS.map(({ label, value, icon: Icon }) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    className="aw-starter"
                                                    onClick={() => sendPrompt(value)}
                                                >
                                                    <Icon size={13} strokeWidth={1.8} />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {messages.map((msg, i) => {
                                    const isUser = msg.role === "user";
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            className={`aw-message ${isUser ? "user" : "assistant"}`}
                                            initial={reduced ? false : { opacity: 0, y: 8 }}
                                            animate={reduced ? undefined : { opacity: 1, y: 0 }}
                                            transition={{ duration: 0.22, delay: Math.min(i * 0.015, 0.08) }}
                                        >
                                            <span className="aw-message-meta">
                                                {!isUser && <Bot size={12} strokeWidth={1.9} />}
                                                {isUser ? "You" : "Ardeno AI"}
                                            </span>
                                            <div className="aw-bubble">{formatMessage(msg.content)}</div>
                                        </motion.div>
                                    );
                                })}

                                {loading && (
                                    <motion.div
                                        className="aw-message assistant"
                                        initial={reduced ? false : { opacity: 0, y: 8 }}
                                        animate={reduced ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: 0.22 }}
                                    >
                                        <span className="aw-message-meta">
                                            <Bot size={12} strokeWidth={1.9} />
                                            Ardeno AI
                                        </span>
                                        <div className="aw-loading">
                                            <Loader2 size={15} className="animate-spin" strokeWidth={1.8} />
                                            Thinking
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={bottomRef} style={{ height: 2 }} />
                            </div>

                            <footer className="aw-compose">
                                <p className="aw-disclaimer">
                                    AI may be inaccurate — contact us for final scope.
                                </p>
                                <div className={`aw-input-wrap${focused ? " focused" : ""}`}>
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value.slice(0, CHAR_LIMIT))}
                                        onKeyDown={onInputKeyDown}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        placeholder="Tell us what you want to build..."
                                        disabled={loading}
                                        rows={1}
                                        maxLength={CHAR_LIMIT}
                                        className="aw-input"
                                        aria-describedby="aw-char-count"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={isInputEmpty || loading}
                                        aria-label="Send message"
                                        title="Send message"
                                        className="aw-send"
                                    >
                                        {loading ? (
                                            <Loader2 size={18} className="animate-spin" strokeWidth={1.9} />
                                        ) : (
                                            <Send size={18} strokeWidth={1.9} />
                                        )}
                                    </button>
                                </div>

                                <div className="aw-compose-meta">
                                    <span>Server-side Ardeno context</span>
                                    <span
                                        id="aw-char-count"
                                        className={`aw-char-count${atLimit ? " at-limit" : nearLimit ? " near-limit" : ""}`}
                                    >
                                        {charCount}/{CHAR_LIMIT}
                                    </span>
                                </div>
                            </footer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArdenoAIWidget;
