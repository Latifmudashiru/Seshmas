import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { normalizeHandle } from '../socials'
import { MOCK_PARTY_CODE } from '../mockData'
import { supabase, PARTY_CODE, DEMO_MODE } from '../supabase'
import { IconInstagram, IconCamera, IconCheck, IconBack } from './Icons'

function ChristmasWreathDecoration() {
  return (
    <svg
      className="festive-wreath-svg"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Garland / Twinkle Ring */}
      <circle cx="80" cy="80" r="56" stroke="url(#goldWreathGrad)" strokeWidth="2.5" strokeDasharray="3 4" opacity="0.9" />
      <circle cx="80" cy="80" r="61" stroke="rgba(221, 168, 58, 0.35)" strokeWidth="1" />

      {/* Top Winter Holly & Berries */}
      <g className="wreath-holly-top" transform="translate(80, 15)">
        {/* Left leaf */}
        <path d="M0,0 C-12,-8 -16,-2 -14,6 C-10,10 -4,8 0,4 Z" fill="#1C5D38" stroke="#0D331E" strokeWidth="0.8" />
        <path d="M0,0 C-6,-2 -10,2 -8,4" stroke="#48B875" strokeWidth="0.7" fill="none" />
        {/* Right leaf */}
        <path d="M0,0 C12,-8 16,-2 14,6 C10,10 4,8 0,4 Z" fill="#1E653D" stroke="#0D331E" strokeWidth="0.8" />
        <path d="M0,0 C6,-2 10,2 8,4" stroke="#48B875" strokeWidth="0.7" fill="none" />
        {/* Red Berries */}
        <circle cx="-4" cy="5" r="4" fill="#D90429" stroke="#5E000D" strokeWidth="0.8" />
        <circle cx="-5" cy="3.5" r="1.2" fill="#FFA5B2" />
        <circle cx="4" cy="5" r="4" fill="#EF233C" stroke="#5E000D" strokeWidth="0.8" />
        <circle cx="3" cy="3.5" r="1.2" fill="#FFA5B2" />
        <circle cx="0" cy="8" r="4.2" fill="#BA181B" stroke="#5E000D" strokeWidth="0.8" />
        <circle cx="-1" cy="6.5" r="1.2" fill="#FFA5B2" />
      </g>

      {/* Festive Gold Sparkles */}
      <path d="M22,48 L24,40 L32,38 L24,36 L22,28 L20,36 L12,38 L20,40 Z" fill="#F4DB8D" opacity="0.95" />
      <path d="M138,48 L140,40 L148,38 L140,36 L138,28 L136,36 L128,38 L136,40 Z" fill="#F4DB8D" opacity="0.95" />
      <path d="M24,116 L26,110 L32,108 L26,106 L24,100 L22,106 L16,108 L22,110 Z" fill="#DDA83A" opacity="0.85" />
      <path d="M136,116 L138,110 L144,108 L138,106 L136,100 L134,106 L128,108 L134,110 Z" fill="#DDA83A" opacity="0.85" />

      {/* Golden & Crimson Christmas Baubles */}
      <circle cx="32" cy="78" r="3.6" fill="url(#goldBaubleGrad)" />
      <circle cx="128" cy="78" r="3.6" fill="url(#goldBaubleGrad)" />
      <circle cx="46" cy="136" r="3" fill="#D90429" />
      <circle cx="114" cy="136" r="3" fill="#DDA83A" />

      {/* Twinkling Fairy Lights */}
      <circle cx="40" cy="32" r="2.2" fill="#FFF8E7" className="wreath-light-pulse-1" />
      <circle cx="120" cy="32" r="2.2" fill="#FFF8E7" className="wreath-light-pulse-2" />
      <circle cx="134" cy="92" r="2.2" fill="#FFD166" className="wreath-light-pulse-3" />
      <circle cx="26" cy="92" r="2.2" fill="#FFD166" className="wreath-light-pulse-2" />
      <circle cx="80" cy="148" r="2.5" fill="#EF233C" opacity="0.85" />

      <defs>
        <linearGradient id="goldWreathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#DDA83A" />
          <stop offset="100%" stopColor="#8A5A1A" />
        </linearGradient>
        <radialGradient id="goldBaubleGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF7CC" />
          <stop offset="40%" stopColor="#DDA83A" />
          <stop offset="100%" stopColor="#6E450E" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function JoinFlow({ onJoined }) {
  // Step 1: 'code' | Step 2: 'profile'
  const [currentStep, setCurrentStep] = useState('code')

  const [partyCodeInput, setPartyCodeInput] = useState('')
  const [name, setName] = useState('')
  const [instagram, setInstagram] = useState('')
  const [selfie, setSelfie] = useState(null)
  const [selfieError, setSelfieError] = useState('')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef(null)
  const partyCode = DEMO_MODE ? MOCK_PARTY_CODE : PARTY_CODE

  const fillDemoCode = () => {
    setPartyCodeInput(partyCode)
    setError('')
  }

  // Handle party code submission (Step 1 -> Step 2)
  const handleVerifyCode = (e) => {
    e.preventDefault()
    setError('')

    const trimmed = partyCodeInput.trim().toUpperCase()
    if (!trimmed) {
      setError('Please enter your party access code.')
      return
    }

    if (trimmed !== partyCode.toUpperCase() && trimmed !== 'SESHMAS' && trimmed !== 'SESHMAS24') {
      setError('Invalid party code. Please check with your host.')
      return
    }

    // Code is valid -> proceed to Step 2
    setCurrentStep('profile')
  }

  // Handle Selfie capture and downscaling to lightweight Base64
  const handlePhotoCapture = (e) => {
    setSelfieError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSelfieError('Please select or capture a valid image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 400
        let w = img.width
        let h = img.height

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }

        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)

        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setSelfie(compressed)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // Handle final submission (Step 2)
  const handleProfileSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setSelfieError('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Please enter your name.')
      return
    }

    if (!selfie) {
      setSelfieError('A party selfie is mandatory to enter SeshMas.')
      return
    }

    setIsSubmitting(true)

    try {
      const cleanInstagram = normalizeHandle(instagram) || null
      const { data, error: err } = await supabase
        .from('players')
        .insert({
          name: trimmedName,
          instagram: cleanInstagram,
          avatar_url: selfie,
          photo: selfie,
        })
        .select()
        .single()

      if (err) {
        setError(err.message)
        setIsSubmitting(false)
        return
      }

      onJoined(data.id, trimmedName)
    } catch {
      setError('Failed to join. Please try again.')
      setIsSubmitting(false)
    }
  }, [name, instagram, selfie, onJoined])

  return (
    <div className="join-screen-container">
      <div className="join-scrollable-content">
        {/* Brand Header */}
        <header className="join-brand-header">
          <span className="brand-presents-text">PGLA PRESENTS</span>
          <h1 className="brand-title-gold">SeshMas</h1>
          <div className="brand-gold-divider" />
          <p className="brand-tagline-text">Private Holiday Experience</p>
        </header>

        <AnimatePresence mode="wait">
          {currentStep === 'code' ? (
            /* =================================================== */
            /* STEP 1: PARTY CODE ONLY                             */
            /* =================================================== */
            <motion.form
              key="step-code"
              className="join-unified-form"
              onSubmit={handleVerifyCode}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="form-section-card luxury-card">
                <div className="section-header-row">
                  <span className="section-number">01</span>
                  <div>
                    <h2 className="section-heading">Enter Party Code</h2>
                    <p className="section-subtext">Enter the private access code from your invitation</p>
                  </div>
                </div>

                <div className="input-field-wrap">
                  <input
                    value={partyCodeInput}
                    onChange={(e) => {
                      setError('')
                      setPartyCodeInput(e.target.value)
                    }}
                    placeholder="ENTER PARTY CODE"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    className="party-code-input"
                    autoFocus
                  />

                  {DEMO_MODE && (
                    <button
                      type="button"
                      className="demo-code-pill"
                      onClick={fillDemoCode}
                    >
                      Fill Demo: <strong>{partyCode}</strong>
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  className="join-error-banner"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="form-submit-area">
                <button type="submit" className="btn-luxury-gold">
                  CONTINUE TO GUEST PROFILE →
                </button>
              </div>

              <footer className="join-footer-credit">
                <span>PRESENTED BY PGLA · ALL RIGHTS RESERVED</span>
              </footer>
            </motion.form>
          ) : (
            /* =================================================== */
            /* STEP 2: ALL-IN-ONE PROFILE (NAME + SELFIE + IG)     */
            /* =================================================== */
            <motion.form
              key="step-profile"
              className="join-unified-form"
              onSubmit={handleProfileSubmit}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Back to code button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn-luxury-outline"
                  onClick={() => {
                    setError('')
                    setCurrentStep('code')
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px' }}
                >
                  <IconBack size={14} /> Back
                </button>
                <span className="section-caption-tag" style={{ color: 'var(--gold)' }}>
                  Step 2 of 2
                </span>
              </div>

              {/* 1. Name Input */}
              <div className="form-section-card luxury-card">
                <div className="section-header-row">
                  <span className="section-number">01</span>
                  <div>
                    <h2 className="section-heading">Your Name</h2>
                    <p className="section-subtext">What should other attendees and your team call you?</p>
                  </div>
                </div>

                <div className="input-field-wrap">
                  <input
                    value={name}
                    onChange={(e) => {
                      setError('')
                      setName(e.target.value)
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="luxury-text-input"
                    autoFocus
                  />
                </div>
              </div>

              {/* 2. Mandatory Selfie Capture */}
              <div className="form-section-card luxury-card" style={{ borderColor: !selfie ? 'rgba(221, 168, 58, 0.4)' : undefined }}>
                <div className="section-header-row">
                  <span className="section-number" style={{ background: selfie ? 'rgba(46, 213, 115, 0.15)' : undefined, color: selfie ? '#2ED573' : undefined }}>
                    {selfie ? '✓' : '02'}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 className="section-heading">Take Your Selfie</h2>
                      <span className="mandatory-badge">REQUIRED</span>
                    </div>
                    <p className="section-subtext">Mandatory party photo for your VIP pass & guest badge</p>
                  </div>
                </div>

                {/* Hidden native camera/file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoCapture}
                  style={{ display: 'none' }}
                />

                <div className="selfie-capture-wrapper">
                  {selfie ? (
                    <div className="selfie-preview-box centered">
                      <div className="selfie-festive-wreath-wrap">
                        <ChristmasWreathDecoration />
                        <div className="selfie-preview-container">
                          <div className="selfie-preview-frame">
                            <img src={selfie} alt="Selfie preview" className="selfie-img" />
                          </div>
                          <span className="selfie-verified-circle" title="Verified">
                            <IconCheck size={11} />
                          </span>
                        </div>
                      </div>
                      <div className="selfie-action-info centered">
                        <strong className="selfie-ready-text">SELFIE CAPTURED</strong>
                        <button
                          type="button"
                          className="btn-retake-selfie"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <IconCamera size={12} /> Retake Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="selfie-placeholder-box festive"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="placeholder-festive-stars">
                        <span>✦</span>
                        <span>✦</span>
                      </div>
                      <div className="selfie-cam-ring">
                        <IconCamera size={28} />
                      </div>
                      <strong className="selfie-cta-title">Tap to Take Party Selfie</strong>
                      <span className="selfie-cta-sub">Opens your front camera instantly</span>
                      <div className="placeholder-holiday-tag">
                        <span>🎄 Holiday VIP Photo Pass</span>
                      </div>
                    </div>
                  )}

                  {selfieError && (
                    <div className="selfie-error-text">
                      {selfieError}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Instagram Handle */}
              <div className="form-section-card luxury-card">
                <div className="section-header-row">
                  <span className="section-number">03</span>
                  <div>
                    <h2 className="section-heading">Instagram Profile</h2>
                    <p className="section-subtext">Guests will scan your VIP QR code to follow your Instagram</p>
                  </div>
                </div>

                <div className="social-inputs-stack">
                  <div className="social-input-group">
                    <span className="social-icon-badge instagram">
                      <IconInstagram size={16} />
                    </span>
                    <div className="social-input-inner">
                      <span className="input-prefix-tag">@</span>
                      <input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="your.instagram"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="join-error-banner"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit CTA */}
              <div className="form-submit-area">
                <button
                  type="submit"
                  className="btn-luxury-gold"
                  disabled={isSubmitting || !name.trim() || !selfie}
                >
                  {isSubmitting
                    ? 'GRANTING ALL-ACCESS PASS...'
                    : !selfie
                    ? 'TAKE SELFIE TO JOIN'
                    : 'JOIN THE PARTY'}
                </button>
              </div>

              <footer className="join-footer-credit">
                <span>PRESENTED BY PGLA · ALL RIGHTS RESERVED</span>
              </footer>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
