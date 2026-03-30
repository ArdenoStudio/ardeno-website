"use client"

import React, { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
}

interface GlobePulseProps {
  markers?: PulseMarker[]
  className?: string
  speed?: number
  phi?: number
  theta?: number
}

// Exclusively Colombo, Sri Lanka
const colomboMarkers: PulseMarker[] = [
  { id: "colombo", location: [6.9271, 79.8612], delay: 0 },
]

export function GlobePulse({
  markers = colomboMarkers,
  className = "",
  speed = 0.0015,
  phi: initialPhi = 1.35,
  theta: initialTheta = 0.15,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let dynamicPhi = initialPhi

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        // Force high resolution rendering
        devicePixelRatio: Math.max(window.devicePixelRatio, 2),
        width: width,   // Using exactly base width so Cobe calculates anchors correctly
        height: width,
        phi: initialPhi, 
        theta: initialTheta, 
        dark: 1, 
        diffuse: 1.5,
        mapSamples: 32000, // Doubled samples for ultra-crisp coastlines
        mapBrightness: 8.5,
        baseColor: [0.1, 0.1, 0.12],
        markerColor: [0.9, 0.04, 0.08],
        glowColor: [0.1, 0.1, 0.1],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.025, id: m.id })),
        arcs: [], arcColor: [0.9, 0.04, 0.08],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.7,
      })
      
      function animate() {
        if (!isPausedRef.current) dynamicPhi += speed
        globe!.update({
          phi: dynamicPhi + phiOffsetRef.current + dragOffset.current.phi,
          theta: initialTheta + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed, initialPhi, initialTheta])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.0); opacity: 0; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(center)",
            left: "anchor(center)",
            translate: "-50% 50%",
            width: 16, height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span style={{
            position: "absolute", inset: 0,
            border: "1px solid rgba(229, 9, 20, 0.4)", borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 3s ease-out infinite ${m.delay}s`,
          }} />
          <span style={{
            position: "absolute", inset: 0,
            border: "1px solid rgba(229, 9, 20, 0.2)", borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 3s ease-out infinite ${m.delay + 1.5}s`,
          }} />
          <span style={{
            width: 4, height: 4, background: "#E50914", borderRadius: "50%",
            boxShadow: "0 0 6px rgba(229, 9, 20, 0.8), 0 0 12px rgba(229, 9, 20, 0.4)",
          }} />
        </div>
      ))}
    </div>
  )
}
