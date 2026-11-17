import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'
import { useStandings } from '../useStandings'
import { GAMES_TIMELINE, INITIAL_FORFEITS } from '../mockData'
import Avatar from './Avatar'
import { IconShot, IconTrophy } from './Icons'

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
const ROMAN_NUMERALS = ['I', 'II', 'III']

export default function Leaderboard({ onOpenProfile, teamsState, playerId }) {
  const { ranked, loaded } = useStandings()
  const [activeSubTab, setActiveSubTab] = useState('timeline') // 'timeline' | 'forfeits' | 'standings'
  const [forfeitsLog, setForfeitsLog] = useState(INITIAL_FORFEITS)
  const [shotPouring, setShotPouring] = useState(false)
  const [notice, setNotice] = useState('')

  const myTeam = teamsState?.myTeam
  const claimForfeitShot = teamsState?.claimForfeitShot

  // Individual and Team scores
  const addPoints = async (pid, points) => {
    await supabase.from('scores').insert({ player_id: pid, points })
  }

  async function handleTakeShotForfeit() {
    if (!playerId) return
    setShotPouring(true)

    if (claimForfeitShot) {
      await claimForfeitShot('Shot Redemption')
    } else {
      await addPoints(playerId, 2)
    }

    const currentMe = ranked.find((p) => p.id === playerId) || { name: 'You' }
    const newLog = {
      id: 'f-' + Date.now(),
      playerName: currentMe.name,
      teamName: myTeam?.name || 'Independent',
      round: 'Live Round',
      pointsGained: 2,
      timestamp: 'Just now',
    }
    setForfeitsLog([newLog, ...forfeitsLog])

    setTimeout(() => {
      setShotPouring(false)
      setNotice('Shot forfeit validated. +2 Points granted.')
      setTimeout(() => setNotice(''), 3000)
    }, 700)
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
          <h1 className="screen-title-serif">Games & Standings</h1>
          <span className="live on" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
            <i className="live-dot" /> LIVE ROUND 02
          </span>
        </div>
        <p>Party timeline, team forfeits, and live scores.</p>
      </header>

      {/* Sub Navigation Bar */}
      <div className="games-subnav-bar">
        <button
          type="button"
          className={`games-subnav-btn ${activeSubTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('timeline')}
        >
          Timeline
        </button>
        <button
          type="button"
          className={`games-subnav-btn ${activeSubTab === 'forfeits' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('forfeits')}
        >
          Forfeits & Shots
        </button>
        <button
          type="button"
          className={`games-subnav-btn ${activeSubTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('standings')}
        >
          Leaderboard
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

      {/* 2. FORFEITS & SHOTS REDEMPTION */}
      {activeSubTab === 'forfeits' && (
        <div className="forfeits-screen-container">
          {/* Main Forfeit Shot Claim Card */}
          <div className="forfeit-hero-card luxury-card">
            <div className="forfeit-hero-badge">
              <IconShot size={18} />
              <span>SHOT FORFEIT CLAUSE</span>
            </div>
            <h2 className="forfeit-hero-title">Redeem Lost Points</h2>
            <p className="forfeit-hero-body">
              Lost a round? Any member—or your team's Dedicated Drinker—can take a full shot of Hennessy or Tequila to claw back <strong>+2 points</strong> for your team.
            </p>

            <button
              type="button"
              className={`btn-luxury-gold ${shotPouring ? 'pouring' : ''}`}
              onClick={handleTakeShotForfeit}
              disabled={shotPouring}
            >
              <IconShot size={18} />
              <span>{shotPouring ? 'VALIDATING SHOT...' : 'CLAIM SHOT FORFEIT (+2 PTS)'}</span>
            </button>
            <span className="forfeit-disclaimer">
              Points automatically sync to your individual and team score.
            </span>
          </div>

          {/* Dedicated Team Drinker Rules Card */}
          <div className="drinker-rules-card luxury-card">
            <h3 className="drinker-rules-heading">Designated Drinker Rules</h3>
            <div className="drinker-rules-list">
              <div className="rule-item">
                <span className="rule-num">1</span>
                <span>Each team selects 1 Dedicated Drinker for up to 3 consecutive rounds.</span>
              </div>
              <div className="rule-item">
                <span className="rule-num">2</span>
                <span>The Designated Drinker can drink on behalf of any teammate to save them from penalties.</span>
              </div>
              <div className="rule-item">
                <span className="rule-num">3</span>
                <span>Max 3 forfeit shots per team per game round. Drink responsibly.</span>
              </div>
            </div>
          </div>

          {/* Live Forfeits Log */}
          <div className="forfeits-log-section">
            <h3 className="forfeits-log-title">Recent Shots Taken Tonight</h3>
            <div className="forfeits-log-list">
              {forfeitsLog.map((f) => (
                <div key={f.id} className="forfeit-log-item luxury-card">
                  <div className="forfeit-log-who">
                    <strong>{f.playerName}</strong>
                    <span className="text-gold">({f.teamName})</span>
                  </div>
                  <div className="forfeit-log-right">
                    <span className="forfeit-pts-badge">+{f.pointsGained} PTS</span>
                    <time className="forfeit-time">{f.timestamp}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. LEADERBOARD STANDINGS */}
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
