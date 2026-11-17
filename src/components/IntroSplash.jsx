import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroSplash({ onComplete }) {
  const [phase, setPhase] = useState('pgla') // 'pgla' -> 'seshmas' -> 'done'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('seshmas'), 1800)
    const t2 = setTimeout(() => {
      onComplete()
    }, 3800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onComplete])

  const skip = useCallback(
    (e) => {
      if (e) e.stopPropagation()
      onComplete()
    },
    [onComplete]
  )

  return (
    <div
      className="intro-splash"
      onClick={skip}
      role="button"
      tabIndex={0}
      aria-label="Click to skip intro"
    >
      <div className="intro-bg" />

      {/* Top skip button */}
      <button
        type="button"
        className="intro-skip-btn"
        onClick={skip}
        aria-label="Skip introduction"
      >
        Skip ✕
      </button>

      <AnimatePresence mode="wait">
        {phase === 'pgla' && (
          <motion.div
            key="pgla"
            className="intro-pgla"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="intro-logo-glow">
              <img
                src="/pgla-logo.png"
                alt="PGLA Presents"
                className="intro-pgla-logo"
              />
            </div>
            <motion.p
              className="intro-presents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              presents
            </motion.p>
          </motion.div>
        )}

        {phase === 'seshmas' && (
          <motion.div
            key="seshmas"
            className="intro-seshmas"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="intro-crown">👑</span>
            <h1 className="intro-wordmark wordmark">SeshMas</h1>
            <div className="intro-line" />
            <p className="intro-tagline">The Christmas Party Experience</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="intro-tap-hint">Tap anywhere to enter</div>
    </div>
  )
}
