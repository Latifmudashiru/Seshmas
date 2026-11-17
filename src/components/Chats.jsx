import Avatar from './Avatar'
import { relTime } from '../time'

export default function Chats({ me, inbox, onOpenChat, onBrowseGuests }) {
  const { conversations, playerById } = inbox

  return (
    <section className="screen">
      <header className="screen-head">
        <h1>Chats</h1>
      </header>

      {!conversations.length ? (
        <div className="empty">
          <h2>No messages yet</h2>
          <p>Tap a guest to start a chat.</p>
          <button className="btn primary" onClick={onBrowseGuests}>Browse guests</button>
        </div>
      ) : (
        <div className="list">
          {conversations.map(({ peer, last, unread }) => {
            const p = playerById[peer] || { id: peer, name: 'Someone' }
            return (
              <button className={`person convo ${unread ? 'unread' : ''}`} key={peer} onClick={() => onOpenChat(peer)}>
                <Avatar player={p} size={48} />
                <span className="person-main">
                  <strong>{p.name}</strong>
                  <span className="preview">{last.sender_id === me ? 'You: ' : ''}{last.body}</span>
                </span>
                <span className="convo-meta">
                  <time>{relTime(Date.parse(last.created_at))}</time>
                  {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
