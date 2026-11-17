import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, DEMO_MODE } from './supabase'
import JoinFlow from './components/JoinFlow'
import WaitingRoom from './components/WaitingRoom'
import Shell from './components/Shell'
import DemoBanner from './components/DemoBanner'
import FestiveAtmosphere from './components/FestiveAtmosphere'
import Profile from './components/Profile'

const KEY = 'seshmas_player_id'

export default function App() {
  return (
    <div className="app">
      {DEMO_MODE && <DemoBanner />}
      <FestiveAtmosphere />
      <Main />
    </div>
  )
}

function Main() {
  const [deepLink, setDeepLink] = useState(() => new URLSearchParams(window.location.search).get('p'))
  const [playerId, setPlayerId] = useState(undefined)
  const [joining, setJoining] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    if (!stored) {
      setPlayerId(null)
      return
    }
    supabase
      .from('players')
      .select('id,name')
      .eq('id', stored)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && !data) {
          localStorage.removeItem(KEY)
          setPlayerId(null)
        } else {
          setPlayerId(stored)
          if (data?.name) setGuestName(data.name)
        }
      })
  }, [])

  function joined(id, name) {
    localStorage.setItem(KEY, id)
    if (name) setGuestName(name)
    setShowWaiting(true)
    setTimeout(() => {
      setPlayerId(id)
    }, 100)
  }

  function handleWaitingReady() {
    setShowWaiting(false)
  }

  function leave() {
    localStorage.removeItem(KEY)
    setPlayerId(null)
    setJoining(false)
    setDeepLink(null)
    setShowWaiting(false)
    setGuestName('')
    window.history.replaceState(null, '', window.location.pathname)
  }

  if (playerId === undefined) {
    return (
      <div className="splash">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="splash-content"
          style={{ textAlign: 'center' }}
        >
          <div className="splash-monogram-ring">
            <span className="splash-monogram">SM</span>
          </div>
          <span className="brand-presents-text" style={{ display: 'block', marginBottom: 6 }}>
            PGLA PRESENTS
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '0.04em' }}>
            Preparing SeshMas Gala...
          </p>
        </motion.div>
      </div>
    )
  }

  // Waiting room
  if (showWaiting && playerId) {
    return <WaitingRoom onReady={handleWaitingReady} guestName={guestName || 'Guest'} />
  }

  if (!playerId) {
    // Scanned QR without having joined
    if (deepLink && !joining) {
      return (
        <div className="solo-profile">
          <Profile playerId={deepLink} viewerId={null} onJoin={() => setJoining(true)} />
        </div>
      )
    }
    return (
      <JoinFlow
        onJoined={(id, name) => {
          joined(id, name)
        }}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Shell playerId={playerId} onLeave={leave} initialProfile={deepLink} />
      </motion.div>
    </AnimatePresence>
  )
}
