import Avatar from './Avatar'
import { relTime } from '../time'
import { IconChat } from './Icons'

export default function Chats({ me, inbox, onOpenChat, onBrowseGuests }) {
  const { conversations, playerById } = inbox

  return (
    <section className="screen">
      <header className="screen-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="screen-title-serif">Messages</h1>
          <span className="live on" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
            <i className="live-dot" /> LIVE ENCRYPTED
          </span>
        </div>
        <p>Private communication with confirmed party guests</p>
      </header>

      {!conversations.length ? (
        <div className="empty luxury-card" style={{ padding: '48px 24px', marginTop: 12, textAlign: 'center' }}>
          <div className="empty-chat-icon-wrap">
            <IconChat size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', marginTop: 16 }}>
            No Active Conversations
          </h2>
          <p style={{ maxWidth: 280, margin: '8px auto 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Reach out to other attendees on the guest list to coordinate and connect.
          </p>
          <button className="btn-luxury-gold" onClick={onBrowseGuests} style={{ maxWidth: 240, margin: '0 auto' }}>
            BROWSE GUEST LIST
          </button>
        </div>
      ) : (
        <div className="chats-list-wrap">
          {conversations.map(({ peer, last, unread }) => {
            const p = playerById[peer] || { id: peer, name: 'Guest' }
            const isOnline = ((p.id.charCodeAt(p.id.length - 1) || 0) % 2 === 0)

            return (
              <button
                className={`conversation-item luxury-card ${unread ? 'unread' : ''}`}
                key={peer}
                onClick={() => onOpenChat(peer)}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar player={p} size={48} />
                  <span className={`guest-status-indicator ${isOnline ? 'online' : 'offline'}`} />
                </div>

                <div className="convo-main-col">
                  <div className="convo-top-row">
                    <strong className="convo-guest-name">{p.name}</strong>
                    <time className="convo-time">{relTime(Date.parse(last.created_at))}</time>
                  </div>
                  <div className="convo-bottom-row">
                    <span className="convo-snippet">
                      {last.sender_id === me ? 'You: ' : ''}{last.body}
                    </span>
                    {unread > 0 && (
                      <span className="convo-badge">{unread > 99 ? '99+' : unread}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
