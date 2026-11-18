import { useEffect, useRef, useState } from 'react'
import { useInbox } from '../useInbox'
import { useStandings } from '../useStandings'
import { useTeams } from '../useTeams'
import Dashboard from './Dashboard'
import Guests from './Guests'
import Leaderboard from './Leaderboard'
import MyQR from './MyQR'
import Profile from './Profile'
import LiveDot from './LiveDot'
import { IconHome, IconTrophy, IconGuests, IconQR } from './Icons'

// 4 clean, perfectly spaced tabs for all mobile screens
const TABS = [
  { id: 'home', label: 'Party', Icon: IconHome },
  { id: 'guests', label: 'Guests', Icon: IconGuests },
  { id: 'board', label: 'Games', Icon: IconTrophy },
  { id: 'qr', label: 'My QR', Icon: IconQR },
]

const ROOT = { tab: 'home', stack: [] }
const depthNow = () => window.history.state?.depth || 0

export default function Shell({ playerId, onLeave, initialProfile }) {
  const [view, setView] = useState(() =>
    initialProfile ? { tab: 'guests', stack: [{ type: 'profile', id: initialProfile }] } : ROOT,
  )
  const firstView = useRef(view)
  const inbox = useInbox(playerId)
  const { ranked } = useStandings()
  const teamsState = useTeams(playerId)

  const me = ranked.find((p) => p.id === playerId)
  const onlineCount = ranked.filter((p) => {
    if (p.id === playerId) return true
    const code = p.id.charCodeAt(p.id.length - 1) || 0
    return code % 2 === 0
  }).length

  useEffect(() => {
    window.history.replaceState({ view: firstView.current, depth: 0 }, '', window.location.pathname)
    const onPop = (e) => setView(e.state?.view || ROOT)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const { stack } = view
  const top = stack[stack.length - 1]

  function push(entry) {
    const next = { ...view, stack: [...stack, entry] }
    window.history.pushState({ view: next, depth: depthNow() + 1 }, '')
    setView(next)
  }

  function replaceTop(entry) {
    const next = { ...view, stack: [...stack.slice(0, -1), entry] }
    window.history.replaceState({ view: next, depth: depthNow() }, '')
    setView(next)
  }

  function back() {
    if (depthNow() > 0) {
      window.history.back()
    } else {
      const next = { ...view, stack: stack.slice(0, -1) }
      window.history.replaceState({ view: next, depth: 0 }, '')
      setView(next)
    }
  }

  function setTab(tab) {
    // If navigation targets 'teams', route smoothly to 'guests' tab
    const targetTab = tab === 'teams' ? 'guests' : tab
    const next = { tab: targetTab, stack: [] }
    window.history.replaceState({ view: next, depth: depthNow() }, '')
    setView(next)
    window.scrollTo(0, 0)
  }

  const openProfile = (id) => push({ type: 'profile', id })

  return (
    <div className="shell">
      {/* Top Header - Pure writing branding */}
      <header className="topbar">
        <div className="topbar-in">
          <div className="topbar-brand-wrap">
            <span className="brand-presents-text" style={{ fontSize: '8px', letterSpacing: '0.28em' }}>
              PGLA PRESENTS
            </span>
            <span className="logo" style={{ fontSize: '22px' }}>SeshMas</span>
          </div>
          <LiveDot live={inbox.live} />
        </div>
      </header>

      <main className="content">
        {view.tab === 'home' && (
          <Dashboard
            guestName={me?.name}
            guestCount={ranked.length}
            onlineCount={onlineCount}
            onNavigate={setTab}
            teamsState={teamsState}
          />
        )}
        {(view.tab === 'guests' || view.tab === 'teams') && (
          <Guests
            playerId={playerId}
            onOpenProfile={openProfile}
            teamsState={teamsState}
          />
        )}
        {view.tab === 'board' && (
          <Leaderboard
            onOpenProfile={openProfile}
            teamsState={teamsState}
            playerId={playerId}
          />
        )}
        {view.tab === 'qr' && (
          <MyQR
            playerId={playerId}
            onLeave={onLeave}
            teamsState={teamsState}
          />
        )}
      </main>

      {/* Bottom 4-Tab Bar: No wrap, equal distribution */}
      <nav className="tabbar" aria-label="Main navigation">
        <div className="tabbar-in four-tabs">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = view.tab === id || (id === 'guests' && view.tab === 'teams')
            return (
              <button
                key={id}
                className={`tab ${isActive ? 'active' : ''}`}
                onClick={() => setTab(id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="tab-ico">
                  <Icon size={22} />
                </span>
                <span className="tab-label">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {top && (
        <div className="overlay" key={`${top.type}-${top.id}-${stack.length}`}>
          {top.type === 'profile' && (
            <Profile
              playerId={top.id}
              viewerId={playerId}
              onBack={back}
              teamsState={teamsState}
            />
          )}
        </div>
      )}
    </div>
  )
}
