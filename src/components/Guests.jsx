import { useState } from 'react'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import { IconSearch } from './Icons'

export default function Guests({ playerId, onOpenProfile }) {
  const { ranked, loaded } = useStandings()
  const [q, setQ] = useState('')

  const people = ranked
    .filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (a.id === playerId ? -1 : b.id === playerId ? 1 : a.name.localeCompare(b.name)))

  return (
    <section className="screen">
      <header className="screen-head">
        <h1>Guests</h1>
        <p>{loaded ? `${ranked.length} ${ranked.length === 1 ? 'guest' : 'guests'}` : 'Loading...'}</p>
      </header>

      {ranked.length > 5 && (
        <label className="search">
          <IconSearch size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests" aria-label="Search guests" />
        </label>
      )}

      <div className="list">
        {people.map((p) => (
          <button className="person" key={p.id} onClick={() => onOpenProfile(p.id)}>
            <Avatar player={p} size={46} />
            <span className="person-main">
              <strong>
                {p.name}
                {p.id === playerId && <em className="chip">You</em>}
              </strong>
              <span className="muted small">{p.total} pts</span>
            </span>
          </button>
        ))}
        {loaded && !people.length && <p className="empty-note">No one matches "{q}".</p>}
      </div>
    </section>
  )
}
