"use client"

import { useEffect, useRef } from "react"

export function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      container.style.setProperty("--mouse-x", `${clientX}px`)
      container.style.setProperty("--mouse-y", `${clientY}px`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 [--mouse-x:50%] [--mouse-y:50%]"
    >
      {/* Revealed Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-primary) 1px, transparent 1px), 
                            linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 20%, transparent 100%)',
        }}
      />
    </div>
  )
}
