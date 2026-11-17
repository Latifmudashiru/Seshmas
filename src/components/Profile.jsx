import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import SocialButtons from './SocialButtons'
import { IconBack, IconChat } from './Icons'

// Full profile view. `viewerId` is null when the viewer has not joined (e.g. arrived via a QR code).
export default function Profile({ playerId, viewerId, onBack, onMessage, onJoin }) {
  const { ranked, loaded } = useStandings()
  const player = ranked.find((p) => p.id === playerId)
  const isMe = viewerId && viewerId === playerId

  return (
    <div className="profile-view">
      <header className="overlay-head">
        {onBack ? (
          <button className="icon-btn" onClick={onBack} aria-label="Back"><IconBack size={22} /></button>
        ) : (
          <span className="icon-btn ghost" aria-hidden="true" />
        )}
        <span className="overlay-title">{onBack ? 'Profile' : 'Seshmas'}</span>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <div className="overlay-scroll">
        {!loaded && <p className="muted center pad">Loading...</p>}
        {loaded && !player && <p className="error center pad">Player not found.</p>}

        {player && (
          <div className="profile-card">
            <div className="profile-hero">
              <Avatar player={player} size={104} />
              <h1 className="profile-name">{player.name}</h1>
              <div className="stats">
                <div><b>{player.total}</b><span>points</span></div>
                <div><b>#{player.rank}</b><span>of {ranked.length}</span></div>
              </div>
            </div>

            <h2 className="section-label">Socials</h2>
            <SocialButtons player={player} />

            <div className="profile-cta">
              {isMe && <p className="this-is-you">This is you</p>}
              {!isMe && viewerId && (
                <button className="btn primary block" onClick={() => onMessage(player.id)}>
                  <IconChat size={20} /> Message {player.name}
                </button>
              )}
              {!viewerId && (
                <button className="btn primary block" onClick={onJoin}>Join Seshmas to message</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
