import { useEffect, useRef, useState } from 'react'
import { useInbox } from '../useInbox'
import Guests from './Guests'
import Leaderboard from './Leaderboard'
import Chats from './Chats'
import Chat from './Chat'
import MyQR from './MyQR'
import Profile from './Profile'
import LiveDot from './LiveDot'
import { IconChat, IconGuests, IconQR, IconTrophy } from './Icons'

const TABS = [
  { id: 'guests', label: 'Guests', Icon: IconGuests },
  { id: 'board', label: 'Leaderboard', Icon: IconTrophy },
  { id: 'chats', label: 'Chats', Icon: IconChat },
  { id: 'qr', label: 'My QR', Icon: IconQR },
]

const ROOT = { tab: 'guests', stack: [] }
const depthNow = () => window.history.state?.depth || 0

// Router-free navigation: the "view" is { tab, stack }, where stack holds full-screen pages
// ({type:'profile'|'chat', id}) opened on top of a tab. Each push also pushes a history entry,
// so the browser/phone back button closes the top page.
export default function Shell({ playerId, onLeave, initialProfile }) {
  const [view, setView] = useState(() =>
    initialProfile ? { tab: 'guests', stack: [{ type: 'profile', id: initialProfile }] } : ROOT,
  )
  const firstView = useRef(view)
  const inbox = useInbox(playerId)

  useEffect(() => {
    // normalise the first history entry (also strips ?p= from the address bar)
    window.history.replaceState({ view: firstView.current, depth: 0 }, '', window.location.pathname)
    const onPop = (e) => setView(e.state?.view || ROOT)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // only on mount
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
      window.history.back() // popstate restores the previous view
    } else {
      const next = { ...view, stack: stack.slice(0, -1) }
      window.history.replaceState({ view: next, depth: 0 }, '')
      setView(next)
    }
  }

  function setTab(tab) {
    const next = { tab, stack: [] }
    window.history.replaceState({ view: next, depth: depthNow() }, '')
    setView(next)
    window.scrollTo(0, 0)
  }

  const openProfile = (id) => push({ type: 'profile', id })

  function openChat(id) {
    const below = stack[stack.length - 2]
    if (top?.type === 'chat' && top.id === id) return
    if (top?.type === 'profile' && below?.type === 'chat' && below.id === id) return back()
    if (top?.type === 'profile') return replaceTop({ type: 'chat', id })
    push({ type: 'chat', id })
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-in">
          <span className="logo">Seshmas</span>
          <LiveDot live={inbox.live} />
        </div>
      </header>

      <main className="content">
        {view.tab === 'guests' && <Guests playerId={playerId} onOpenProfile={openProfile} />}
        {view.tab === 'board' && <Leaderboard onOpenProfile={openProfile} />}
        {view.tab === 'chats' && (
          <Chats me={playerId} inbox={inbox} onOpenChat={openChat} onBrowseGuests={() => setTab('guests')} />
        )}
        {view.tab === 'qr' && <MyQR playerId={playerId} onLeave={onLeave} />}
      </main>

      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-in">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`tab ${view.tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
              aria-current={view.tab === id ? 'page' : undefined}
            >
              <span className="tab-ico">
                <Icon size={24} />
                {id === 'chats' && inbox.unreadTotal > 0 && (
                  <span className="badge tab-badge">{inbox.unreadTotal > 99 ? '99+' : inbox.unreadTotal}</span>
                )}
              </span>
              <span className="tab-label">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {top && (
        <div className="overlay" key={`${top.type}-${top.id}-${stack.length}`}>
          {top.type === 'profile' && (
            <Profile
              playerId={top.id}
              viewerId={playerId}
              onBack={back}
              onMessage={openChat}
            />
          )}
          {top.type === 'chat' && (
            <Chat me={playerId} peerId={top.id} inbox={inbox} onBack={back} onOpenProfile={openProfile} />
          )}
        </div>
      )}
    </div>
  )
}
