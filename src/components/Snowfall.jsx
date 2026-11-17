import { useEffect, useRef, useCallback } from 'react'

// Animated snowfall background using Canvas for performance
export default function Snowfall({ intensity = 60, wind = 0.3, opacity = 0.7 }) {
  const canvasRef = useRef(null)
  const flakesRef = useRef([])
  const rafRef = useRef(null)

  const createFlake = useCallback((canvas) => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      radius: Math.random() * 3 + 0.5,
      speed: Math.random() * 1.2 + 0.3,
      wind: (Math.random() - 0.5) * wind,
      opacity: Math.random() * 0.6 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }
  }, [wind])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize flakes
    flakesRef.current = Array.from({ length: intensity }, () => createFlake(canvas))

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      // Draw static snow for reduced motion
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const flake of flakesRef.current) {
        flake.y = Math.random() * canvas.height
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * opacity * 0.5})`
        ctx.fill()
      }
      return () => window.removeEventListener('resize', resize)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const flake of flakesRef.current) {
        flake.wobble += flake.wobbleSpeed
        flake.x += flake.wind + Math.sin(flake.wobble) * 0.3
        flake.y += flake.speed

        // Reset when off screen
        if (flake.y > canvas.height + 10) {
          flake.y = -10
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width + 10) flake.x = -10
        if (flake.x < -10) flake.x = canvas.width + 10

        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * opacity})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [intensity, wind, opacity, createFlake])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
