import { useState } from 'react'
import { supabase } from '../supabase'
import { useStandings } from '../useStandings'
import { GAMES_TIMELINE } from '../mockData'
import Avatar from './Avatar'
import { IconTrophy } from './Icons'

function Score({ value }) {
  return (
    <span className="score">{value}</span>
  )
}

const PLACES = ['gold', 'silver', 'bronze']
const ROMAN_NUMERALS = ['I', 'II', 'III']

export default function Leaderboard({ onOpenProfile, teamsState, playerId }) {
  const { ranked, loaded } = useStandings()
  const [activeSubTab, setActiveSubTab] = useState('timeline') // 'timeline' | 'standings'
  const [notice, setNotice] = useState('')

  const myTeam = teamsState?.myTeam

  // Individual and Team scores
  const addPoints = async (pid, points) => {
    await supabase.from('scores').insert({ player_id: pid, points })
  }

  async function resetAll() {
    if (!window.confirm('Reset all scores?')) return
    await supabase.from('scores').delete().not('id', 'is', null)
  }

  const top = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  return (
    <section className="screen">
      <header className="screen-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="screen-title-serif">Tournament Games</h1>
          <span className="live on" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
            <i className="live-dot" /> LIVE ROUND 02
          </span>
        </div>
        <p>Party timeline, round schedule, and live standings.</p>
      </header>

      {/* Sub Navigation Bar */}
      <div className="games-subnav-bar">
        <button
          type="button"
          className={`games-subnav-btn ${activeSubTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('timeline')}
        >
          Game Timeline
        </button>
        <button
          type="button"
          className={`games-subnav-btn ${activeSubTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('standings')}
        >
          Leaderboard Standings
        </button>
      </div>

      {notice && <div className="team-toast-banner">{notice}</div>}

      {/* 1. TIMELINE OF GAMES */}
      {activeSubTab === 'timeline' && (
        <div className="games-timeline-container">
          <div className="timeline-intro luxury-card">
            <span className="brand-presents-text">GALA ITINERARY</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--gold-light)' }}>
              Tournament Rounds
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>
              Teams compete across 5 rounds. Losers may invoke the Forfeit Shot clause to claw back lost points.
            </p>
          </div>

          <div className="timeline-cards-list">
            {GAMES_TIMELINE.map((game) => {
              const isLive = game.status === 'live'
              const isDone = game.status === 'completed'

              return (
                <div
                  key={game.id}
                  className={`timeline-game-card luxury-card ${isLive ? 'live-border' : ''}`}
                >
                  <div className="game-card-top-row">
                    <span className="game-round-pill">{game.round}</span>
                    <span className={`game-status-pill ${game.status}`}>
                      {isLive ? 'LIVE NOW' : isDone ? 'COMPLETED' : game.scheduledTime}
                    </span>
                  </div>

                  <h3 className="game-card-title">{game.title}</h3>
                  <p className="game-card-type">{game.type} · Worth {game.points} Points</p>

                  <div className="game-card-footer">
                    {isDone && (
                      <span className="game-winner-text">
                        Winner: <strong className="text-gold">{game.winner}</strong>
                      </span>
                    )}
                    {isLive && (
                      <span className="game-live-text">
                        Round active · Forfeit window open
                      </span>
                    )}
                    {!isDone && !isLive && (
                      <span className="game-upcoming-text">
                        Scheduled for {game.scheduledTime}
                      </span>
                    )}
                    <span className="game-forfeits-tag">
                      {game.forfeitsCount} Forfeits
                    </span>
                  </div>

                  <p className="game-note-subtext">{game.note}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. LEADERBOARD STANDINGS */}
      {activeSubTab === 'standings' && (
        <div className="standings-screen-container">
          {/* Team Standings Highlights */}
          {teamsState?.teams && (
            <div className="team-standings-card luxury-card" style={{ marginBottom: 20 }}>
              <div className="team-standings-head">
                <IconTrophy size={18} />
                <span className="brand-presents-text" style={{ fontSize: '11px' }}>
                  TEAM STANDINGS
                </span>
              </div>
              <div className="team-scores-stack">
                {teamsState.teams.map((t, idx) => (
                  <div key={t.id} className="team-score-line">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="team-rank-digit">{idx + 1}</span>
                      <strong style={{ color: t.color }}>{t.name}</strong>
                    </div>
                    <span className="team-score-pill">{t.totalPoints} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Podium for Top 3 Individuals */}
          {top.length > 0 && (
            <div className="podium">
              {top.map((p, i) => (
                <div className={`pod pod-${i + 1} ${PLACES[i]}`} key={p.id}>
                  <button className="pod-who" onClick={() => onOpenProfile(p.id)}>
                    <Avatar player={p} size={i === 0 ? 64 : 52} />
                    <strong className="pod-name">{p.name}</strong>
                  </button>
                  <div className="pod-block">
                    <span className="pod-place">{ROMAN_NUMERALS[i]}</span>
                    <Score value={p.total} />
                    <span className="pod-pts">PTS</span>
                  </div>
                  <span className="test-btns">
                    <button onClick={() => addPoints(p.id, 1)}>+1</button>
                    <button onClick={() => addPoints(p.id, 5)}>+5</button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Rest of the attendees */}
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
                  <span className="test-btns">
                    <button onClick={() => addPoints(p.id, 1)}>+1</button>
                    <button onClick={() => addPoints(p.id, 5)}>+5</button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {ranked.length > 0 && (
            <p className="center footer-action">
              <button className="link danger" onClick={resetAll}>Reset All Tournament Scores</button>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
