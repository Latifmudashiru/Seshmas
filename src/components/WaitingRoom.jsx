import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RECEPTION_UPDATES = [
  'Verifying your all-access invitation...',
  'The reception hall is welcoming guests.',
  'Finalizing your digital guest credentials.',
  'Preparing your private social network.',
  'Access granted. Entering SeshMas.',
]

export default function WaitingRoom({ onReady, guestName }) {
  const [progress, setProgress] = useState(0)
  const [updateIdx, setUpdateIdx] = useState(0)
  const [position, setPosition] = useState(2)

  // Smooth, luxurious progress timing (~3.5 - 4s)
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return Math.min(100, prev + Math.random() * 2.8 + 1.8)
      })
    }, 100)
    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    const textInterval = setInterval(() => {
      setUpdateIdx((prev) => (prev + 1) % RECEPTION_UPDATES.length)
    }, 1600)
    return () => clearInterval(textInterval)
  }, [])

  useEffect(() => {
    if (position <= 0) return
    const queueInterval = setInterval(() => {
      setPosition((prev) => Math.max(0, prev - 1))
    }, 1800)
    return () => clearInterval(queueInterval)
  }, [position])

  useEffect(() => {
    if (progress >= 100 && position <= 0) {
      const timer = setTimeout(onReady, 600)
      return () => clearTimeout(timer)
    }
  }, [progress, position, onReady])

  return (
    <div className="waiting-room-screen">
      <div className="waiting-room-card luxury-card">
        {/* Luxury Gala Monogram */}
        <div className="waiting-monogram-ring">
          <span className="waiting-monogram">SM</span>
        </div>

        <span className="waiting-brand-presents">PGLA PRESENTS</span>
        <h1 className="waiting-event-title">SeshMas</h1>

        {guestName && (
          <div className="waiting-guest-integrated">
            <span className="guest-prefix">VIP PASS ·</span>
            <span className="guest-name-text">{guestName}</span>
          </div>
        )}

        {/* Dynamic Reception Notice */}
        <div className="waiting-notice-container">
          <AnimatePresence mode="wait">
            <motion.p
              key={updateIdx}
              className="waiting-notice-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {RECEPTION_UPDATES[updateIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Shimmering Gold Progress Bar */}
        <div className="waiting-progress-container">
          <div className="waiting-track">
            <div
              className="waiting-fill-gold"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="waiting-meta-row">
            <span>{position > 0 ? `Queue position: #${position}` : 'Admitting now'}</span>
            <span className="waiting-pct">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
