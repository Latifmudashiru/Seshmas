import { useEffect, useRef } from 'react'

export default function FestiveAtmosphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Floating embers and gold bokeh flakes
    const particleCount = prefersReduced ? 15 : 45
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.8 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.15), // Gentle upward drift like fire embers
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      colorType: Math.random() > 0.4 ? 'gold' : 'amber',
    }))

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.pulse += p.pulseSpeed
        p.y += p.speedY
        p.x += p.speedX + Math.sin(p.pulse) * 0.25

        if (p.y < -20) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20

        const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4)
        const color = p.colorType === 'gold'
          ? `rgba(229, 193, 88, ${alpha})`
          : `rgba(240, 140, 60, ${alpha * 0.8})`

        // Soft glow halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = p.colorType === 'gold'
          ? `rgba(229, 193, 88, ${alpha * 0.25})`
          : `rgba(240, 120, 50, ${alpha * 0.2})`
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }

      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="festive-atmosphere" aria-hidden="true">
      {/* 1. High-Resolution Luxury Poster Backdrop */}
      <div className="atmosphere-backdrop" />

      {/* 2. Cozy Campfire / Hearth Glow at the Base */}
      <div className="campfire-hearth-glow" />
      <div className="campfire-flicker-flame" />

      {/* 3. Blurred-out Christmas Tree Silhouette & Soft Twinkling Tree Lights */}
      <div className="blurred-tree-container">
        <div className="tree-silhouette" />
        <div className="tree-lights">
          <span className="tree-light tl-1" />
          <span className="tree-light tl-2" />
          <span className="tree-light tl-3" />
          <span className="tree-light tl-4" />
          <span className="tree-light tl-5" />
          <span className="tree-light tl-6" />
          <span className="tree-light tl-7" />
          <span className="tree-light tl-8" />
        </div>
      </div>

      {/* 4. Canvas Floating Gold & Ember Dust */}
      <canvas ref={canvasRef} className="atmosphere-canvas" />

      {/* 5. Luxury Velvet Vignette Overlay for Crisp Readability */}
      <div className="atmosphere-vignette" />
    </div>
  )
}
