import React, { useEffect, useRef, useState, memo } from "react";

// ─── Font loader (runs once) ──────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("avl-fonts")) {
  const link = document.createElement("link");
  link.id = "avl-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,300" +
    "&family=Cormorant+Garamond:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400" +
    "&family=Sora:wght@300;400" +
    "&family=Cinzel:wght@400;600" +
    "&display=swap";
  document.head.appendChild(link);
}

// ─── Global keyframes (injected once) ─────────────────────────────────────────
const STYLES = `
  @keyframes avl-breathe {
    0%,100% { opacity:.5; transform:scale(1); }
    50%      { opacity:1;  transform:scale(1.1); }
  }
  @keyframes avl-drawPath {
    from { stroke-dashoffset: 2000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes avl-fillFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes avl-charIn {
    from { opacity:0; transform:translateY(14px); filter:blur(5px); }
    to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
  }
  @keyframes avl-charInUp {
    from { opacity:0; transform:translateY(24px); filter:blur(8px); }
    to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
  }
  @keyframes avl-scaleX {
    from { transform:scaleX(0); opacity:0; }
    to   { transform:scaleX(1); opacity:1; }
  }
  @keyframes avl-shimmerSlide {
    from { left:-14px; }
    to   { left:calc(100% - 14px); }
  }
  @keyframes avl-flashRed {
    0%   { opacity:0; }
    40%  { opacity:1; }
    100% { opacity:0; }
  }
  @keyframes avl-fadeOutPhase {
    from { opacity:1; transform:scale(1); }
    to   { opacity:0; transform:scale(1.04); }
  }
  @keyframes avl-crownReveal {
    from { opacity:0; transform:translateY(-14px) scale(0.92); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes avl-fadeInSimple {
    from { opacity:0; }
    to   { opacity:1; }
  }
`;

// ─── SVG path constant ────────────────────────────────────────────────────────
const A_MARK_PATH =
  "M 514.300781 878.699219 L 434.792969 718.777344 " +
  "C 411.382812 739.714844 390.78125 776.453125 391.929688 806.554688 " +
  "L 415.984375 853.996094 " +
  "C 416.851562 855.699219 418.324219 857.015625 420.113281 857.679688 " +
  "L 504.851562 889.203125 " +
  "C 511.304688 891.605469 517.367188 884.867188 514.300781 878.699219 Z " +
  "M 371.617188 791.304688 " +
  "C 371.410156 791.605469 371.222656 791.925781 371.054688 792.265625 " +
  "L 340.871094 853.445312 " +
  "C 340.011719 855.183594 338.523438 856.527344 336.707031 857.207031 " +
  "L 250.40625 889.308594 " +
  "C 243.988281 891.699219 237.9375 885.042969 240.917969 878.878906 " +
  "L 369.019531 614.007812 " +
  "C 371.769531 608.324219 379.851562 608.277344 382.664062 613.929688 " +
  "L 432.074219 713.316406 " +
  "C 404.980469 732.679688 383.765625 759.746094 371.617188 791.304688";

// ─── Grain data URI ───────────────────────────────────────────────────────────
const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' " +
  "numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ─── Shared style constants ───────────────────────────────────────────────────
const FULL_COVER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const GRAIN_STYLE: React.CSSProperties = {
  ...FULL_COVER,
  backgroundImage: GRAIN_BG,
  opacity: 0.06,
  mixBlendMode: "overlay" as const,
  pointerEvents: "none",
};

const VIGNETTE_STYLE: React.CSSProperties = {
  ...FULL_COVER,
  background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
  pointerEvents: "none",
};

const CENTER_FLEX: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PageLoaderProps {
  onComplete?: () => void;
  minDuration?: number;
}

// ─── StaggerWord ──────────────────────────────────────────────────────────────
interface StaggerWordProps {
  text: string;
  baseDelay: number;
  charStyle: React.CSSProperties;
  animName?: string;
}

const StaggerWord = memo<StaggerWordProps>(({ text, baseDelay, charStyle, animName = "avl-charIn" }) => (
  <span style={{ display: "inline-block", overflow: "hidden" }}>
    {text.split("").map((ch, i) => (
      <span
        key={i}
        style={{
          ...charStyle,
          display: "inline-block",
          opacity: 0,
          animation: `${animName} 0.7s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.06}s forwards`,
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ))}
  </span>
));
StaggerWord.displayName = "StaggerWord";

// ─── SVG gradient defs — brand red ───────────────────────────────────────────
const SvgDefs = memo(() => (
  <defs>
    <linearGradient id="avl-aGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff3301" />
      <stop offset="50%" stopColor="#ff6633" />
      <stop offset="100%" stopColor="#ff3301" />
    </linearGradient>
    <linearGradient id="avl-aStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff3301" />
      <stop offset="50%" stopColor="#ff6633" />
      <stop offset="100%" stopColor="#ff3301" />
    </linearGradient>
    <filter id="avl-aGlow">
      <feGaussianBlur stdDeviation="6" result="g" />
      <feMerge>
        <feMergeNode in="g" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
));
SvgDefs.displayName = "SvgDefs";

// ─── Main phase ───────────────────────────────────────────────────────────────
interface PhaseProps {
  exiting: boolean;
  flashRed: boolean;
  progress: number;
}

const ArdenoPhase = memo<PhaseProps>(({ exiting, flashRed, progress }) => (
  <div
    style={{
      ...FULL_COVER,
      background: "radial-gradient(ellipse at 50% 45%, #1a1210 0%, #0d0a08 55%, #050303 100%)",
      animation: exiting ? "avl-fadeOutPhase 0.8s cubic-bezier(0.4,0,0.2,1) forwards" : undefined,
      zIndex: 3,
    }}
  >
    <div style={GRAIN_STYLE} />
    <div style={VIGNETTE_STYLE} />

    {/* Ambient red glow */}
    <div
      style={{
        ...FULL_COVER,
        background: "radial-gradient(circle at 50% 50%, rgba(255,51,1,0.12) 0%, transparent 65%)",
        animation: "avl-breathe 4.5s ease-in-out infinite",
        pointerEvents: "none",
      }}
    />

    {/* Center content */}
    <div style={CENTER_FLEX}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

        {/* A-mark */}
        <div style={{
          width: 70, height: 70, marginBottom: 6,
          opacity: 0,
          animation: "avl-crownReveal 1s cubic-bezier(0.22,1,0.36,1) 0.15s forwards",
        }}>
          <svg
            viewBox="200 580 360 340"
            style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 12px rgba(255,51,1,0.25))" }}
          >
            <SvgDefs />
            <path
              d={A_MARK_PATH}
              fill="none"
              stroke="url(#avl-aStroke)"
              strokeWidth="3"
              style={{ strokeDasharray: 2000, animation: "avl-drawPath 2s cubic-bezier(0.22,1,0.36,1) 0.3s forwards" }}
            />
            <path
              d={A_MARK_PATH}
              fill="url(#avl-aGrad)"
              filter="url(#avl-aGlow)"
              style={{ opacity: 0, animation: "avl-fillFade 1.2s ease 1.6s forwards" }}
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <StaggerWord
            text="ARDENO"
            baseDelay={0.6}
            charStyle={{
              fontFamily: "'Cinzel', serif",
              fontSize: 28,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "0.18em",
            }}
          />
          <StaggerWord
            text="STUDIO"
            baseDelay={1.1}
            charStyle={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 14,
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(255,51,1,0.6)",
              letterSpacing: "0.4em",
            }}
            animName="avl-charInUp"
          />
        </div>
      </div>
    </div>

    {/* Progress bar — full width, pinned to very bottom */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: 3,
        background: "rgba(255,51,1,0.08)",
        opacity: 0,
        animation: "avl-fadeInSimple 0.8s ease 0.5s forwards",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "linear-gradient(90deg, rgba(255,51,1,0.5) 0%, #ff3301 60%, #ff6633 100%)",
          transformOrigin: "left",
          transform: `scaleX(${progress / 100})`,
          transition: "transform 0.12s linear",
          boxShadow: "0 0 12px rgba(255,51,1,0.7), 0 0 24px rgba(255,51,1,0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          width: 40,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,140,80,0.8), transparent)",
          animation: "avl-shimmerSlide 1.8s ease-in-out 0.6s infinite",
        }}
      />
    </div>

    {/* Red flash on exit */}
    {flashRed && (
      <div
        style={{
          ...FULL_COVER,
          background: "radial-gradient(circle at 50% 50%, rgba(255,51,1,0.15) 0%, transparent 70%)",
          animation: "avl-flashRed 0.7s ease-out forwards",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    )}
  </div>
));
ArdenoPhase.displayName = "ArdenoPhase";

// ─── Root export ──────────────────────────────────────────────────────────────
export const PageLoader: React.FC<PageLoaderProps> = ({
  onComplete,
  minDuration = 2700,
}) => {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [flashRed, setFlashRed] = useState(false);

  const rafRef = useRef(0);
  const lastProgressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById("avl-keyframes")) return;
    const style = document.createElement("style");
    style.id = "avl-keyframes";
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // rAF progress — drives the bar
  useEffect(() => {
    const start = Date.now();
    const duration = minDuration * 0.85;
    const tick = () => {
      const raw = Math.min(((Date.now() - start) / duration) * 100, 100);
      const rounded = Math.round(raw);
      if (rounded !== lastProgressRef.current) {
        lastProgressRef.current = rounded;
        setProgress(rounded);
      }
      if (raw < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [minDuration]);

  // Sequencer
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    t(() => setFlashRed(true), minDuration);
    t(() => setExiting(true), minDuration + 100);
    t(() => {
      setDone(true);
      onCompleteRef.current?.();
    }, minDuration + 900);

    return () => timers.forEach(clearTimeout);
  }, [minDuration]);

  if (done) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden", background: "#050303" }}>
      <ArdenoPhase exiting={exiting} flashRed={flashRed} progress={progress} />
    </div>
  );
};

export default PageLoader;
