import { useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from './supabase'
import Join from './components/Join'
import Profile from './components/Profile'
import Shell from './components/Shell'
import DemoBanner from './components/DemoBanner'

const KEY = 'seshmas_player_id'

export default function App() {
  return (
    <div className="app">
      {DEMO_MODE && <DemoBanner />}
      <Main />
    </div>
  )
}

function Main() {
  // QR codes link to /?p=<id>; remember it for the lifetime of this page load
  const [deepLink, setDeepLink] = useState(() => new URLSearchParams(window.location.search).get('p'))
  // undefined = still checking, null = not joined, string = player id
  const [playerId, setPlayerId] = useState(undefined)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    if (!stored) {
      setPlayerId(null)
      return
    }
    // make sure the stored player still exists in the DB
    supabase
      .from('players')
      .select('id')
      .eq('id', stored)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && !data) {
          localStorage.removeItem(KEY)
          setPlayerId(null)
        } else {
          setPlayerId(stored)
        }
      })
  }, [])

  function joined(id) {
    localStorage.setItem(KEY, id)
    setPlayerId(id)
  }

  function leave() {
    localStorage.removeItem(KEY)
    setPlayerId(null)
    setJoining(false)
    setDeepLink(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  if (playerId === undefined) return <div className="splash">Loading...</div>
  if (!playerId) {
    // scanned a QR without having joined: show the profile first, with a nudge to join
    if (deepLink && !joining) {
      return (
        <div className="solo-profile">
          <Profile playerId={deepLink} viewerId={null} onJoin={() => setJoining(true)} />
        </div>
      )
    }
    return <Join onJoined={joined} />
  }
  return <Shell playerId={playerId} onLeave={leave} initialProfile={deepLink} />
}
