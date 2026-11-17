import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'

// Score number: flashes briefly whenever the value changes (but not on first paint).
function Score({ value }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setFlash((f) => f + 1)
    }
  }, [value])
  return (
    <span key={flash} className={`score ${flash ? 'bump' : ''}`}>
      {value}
    </span>
  )
}

const PLACES = ['gold', 'silver', 'bronze']

export default function Leaderboard({ onOpenProfile }) {
  const { ranked, loaded } = useStandings()

  // builders only run when awaited, so this must be async/await
  const add = async (playerId, points) => {
    await supabase.from('scores').insert({ player_id: playerId, points })
  }

  async function reset() {
    if (!window.confirm('Delete ALL scores?')) return
    // delete needs a filter; this matches every row
    await supabase.from('scores').delete().not('id', 'is', null)
  }

  const top = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  const testButtons = (p) => (
    <span className="test-btns">
      <button onClick={() => add(p.id, 1)} aria-label={`Add 1 point to ${p.name}`}>+1</button>
      <button onClick={() => add(p.id, 5)} aria-label={`Add 5 points to ${p.name}`}>+5</button>
    </span>
  )

  return (
    <section className="screen">
      <header className="screen-head">
        <h1>Leaderboard</h1>
      </header>

      {loaded && !ranked.length && <p className="empty-note">No players yet.</p>}

      {top.length > 0 && (
        <div className="podium">
          {top.map((p, i) => (
            <div className={`pod pod-${i + 1} ${PLACES[i]}`} key={p.id}>
              <button className="pod-who" onClick={() => onOpenProfile(p.id)}>
                <Avatar player={p} size={i === 0 ? 64 : 52} />
                <strong className="pod-name">{p.name}</strong>
              </button>
              <div className="pod-block">
                <span className="pod-place">{i + 1}</span>
                <Score value={p.total} />
                <span className="pod-pts">pts</span>
              </div>
              {testButtons(p)}
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="list">
          {rest.map((p) => (
            <div className="rank-row" key={p.id}>
              <span className="rank-num">{p.rank}</span>
              <button className="rank-who" onClick={() => onOpenProfile(p.id)}>
                <Avatar player={p} size={36} />
                <strong>{p.name}</strong>
              </button>
              <Score value={p.total} />
              {testButtons(p)}
            </div>
          ))}
        </div>
      )}

      {ranked.length > 0 && (
        <p className="center footer-action">
          <button className="link danger" onClick={reset}>Reset all scores</button>
        </p>
      )}
    </section>
  )
}
