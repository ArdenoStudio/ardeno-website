import React, { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AnimatedBeamProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  className?: string;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
};

/**
 * Lightweight Animated Beam (Magic UI / React Bits inspired)
 * Draws a curved SVG path between two elements inside a shared container.
 */
export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 48,
  className = "",
  pathColor = "rgba(255,255,255,0.08)",
  pathWidth = 1.5,
  pathOpacity = 1,
  gradientStartColor = "#E50914",
  gradientStopColor = "#E50914",
  delay = 0,
  duration = 3.2,
}) => {
  const id = useId();
  const reduced = useReducedMotion();
  const [pathD, setPathD] = useState("");
  const [svgBox, setSvgBox] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!container || !from || !to) return;

      const c = container.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();

      const startX = a.left - c.left + a.width / 2;
      const startY = a.top - c.top + a.height / 2;
      const endX = b.left - c.left + b.width / 2;
      const endY = b.top - c.top + b.height / 2;
      const midY = (startY + endY) / 2 - curvature;

      setSvgBox({ width: c.width, height: c.height, left: 0, top: 0 });
      setPathD(`M ${startX},${startY} Q ${(startX + endX) / 2},${midY} ${endX},${endY}`);
    };

    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("resize", schedule);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (containerRef.current && ro) ro.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [containerRef, fromRef, toRef, curvature]);

  if (!pathD || !svgBox.width) return null;

  return (
    <svg
      fill="none"
      width={svgBox.width}
      height={svgBox.height}
      className={`pointer-events-none absolute left-0 top-0 transform-gpu ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      {!reduced && (
        <path
          d={pathD}
          strokeWidth={pathWidth}
          stroke={`url(#${id})`}
          strokeOpacity="1"
          strokeLinecap="round"
        />
      )}
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={
            reduced
              ? undefined
              : {
                  x1: ["0%", "100%"],
                  x2: ["0%", "95%"],
                  y1: ["0%", "100%"],
                  y2: ["0%", "95%"],
                }
          }
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
