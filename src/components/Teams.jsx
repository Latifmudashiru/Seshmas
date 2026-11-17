import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from './Avatar'
import { IconShot } from './Icons'

export default function Teams({ teamsState, onOpenProfile }) {
  const { teams, myTeam, me, joinTeam, setDedicatedDrinker, claimForfeitShot } = teamsState
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [actionMsg, setActionMsg] = useState('')
  const [shotAnimating, setShotAnimating] = useState(false)

  async function handleJoin(teamId) {
    setActionMsg('')
    const { error } = await joinTeam(teamId)
    if (error) {
      setActionMsg(error)
    } else {
      setActionMsg('Team updated successfully.')
      setTimeout(() => setActionMsg(''), 2500)
    }
  }

  async function handleDrinkerAssignment(teamId, memberId) {
    const { error } = await setDedicatedDrinker(teamId, memberId)
    if (!error) {
      setActionMsg('Dedicated team drinker updated.')
      setTimeout(() => setActionMsg(''), 2500)
    }
  }

  async function handleTakeShot() {
    setShotAnimating(true)
    await claimForfeitShot('Forfeit Redemption')
    setTimeout(() => {
      setShotAnimating(false)
      setActionMsg('Shot claimed! +2 points added to your team.')
      setTimeout(() => setActionMsg(''), 3000)
    }, 800)
  }

  return (
    <section className="screen">
      <header className="screen-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="screen-title-serif">Teams & Rosters</h1>
          <span className="live on" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
            <i className="live-dot" /> 4 TEAMS
          </span>
        </div>
        <p>Choose your alliance. Compete for the crown and drink for redemption.</p>
      </header>

      {/* Notification Banner */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            className="team-toast-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Current Team Summary */}
      {myTeam ? (
        <div className="my-team-banner luxury-card">
          <div className="my-team-top">
            <span className="my-team-pill" style={{ color: myTeam.color }}>
              YOUR CURRENT TEAM
            </span>
            <span className="my-team-score">{myTeam.totalPoints} PTS</span>
          </div>
          <h2 className="my-team-title" style={{ color: myTeam.color }}>
            {myTeam.name}
          </h2>

          <div className="my-team-meta-row">
            <div>
              <span className="meta-sub">CAPACITY</span>
              <strong className="meta-stat">{myTeam.memberCount} / {myTeam.maxMembers}</strong>
            </div>
            <div>
              <span className="meta-sub">DEDICATED DRINKER</span>
              <strong className="meta-stat" style={{ color: 'var(--gold-light)' }}>
                {myTeam.drinker?.name || 'Unassigned'}
              </strong>
            </div>
            <div>
              <span className="meta-sub">YOUR ROLE</span>
              <strong className="meta-stat">
                {myTeam.drinker_id === me?.id ? 'Designated Drinker' : 'Team Member'}
              </strong>
            </div>
          </div>

          {/* Quick Forfeit Button inside My Team */}
          <div className="my-team-forfeit-box">
            <button
              type="button"
              className={`btn-forfeit-shot ${shotAnimating ? 'firing' : ''}`}
              onClick={handleTakeShot}
              disabled={shotAnimating}
            >
              <IconShot size={16} />
              <span>{shotAnimating ? 'RECORDING SHOT...' : 'CLAIM FORFEIT SHOT (+2 PTS)'}</span>
            </button>
            <span className="forfeit-caption">
              Lost a round? Drink a forfeit shot to claw back 2 points for {myTeam.name}.
            </span>
          </div>
        </div>
      ) : (
        <div className="no-team-nudge luxury-card">
          <strong>You have not joined a team yet</strong>
          <p>Choose an available team below with an open roster slot.</p>
        </div>
      )}

      {/* Team Cards Roster */}
      <div className="teams-cards-stack">
        {teams.map((team) => {
          const isSelected = selectedTeamId === team.id
          const hasJoined = team.isMyTeam

          return (
            <div
              key={team.id}
              className={`team-roster-card luxury-card ${hasJoined ? 'current' : ''}`}
              style={{ borderColor: hasJoined ? team.color : undefined }}
            >
              {/* Team Top Header */}
              <div className="team-card-head">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="team-card-name" style={{ color: team.color }}>
                      {team.name}
                    </h3>
                    {hasJoined && <span className="chip-team-current">YOU</span>}
                  </div>
                  <span className="team-tagline">{team.tagline || 'SeshMas Contenders'}</span>
                </div>

                <div className="team-points-col">
                  <span className="team-pts-val">{team.totalPoints}</span>
                  <span className="team-pts-lbl">PTS</span>
                </div>
              </div>

              {/* Capacity Bar & Status */}
              <div className="team-capacity-wrap">
                <div className="capacity-label-row">
                  <span className="capacity-title">ROSTER CAPACITY</span>
                  <span className="capacity-count">
                    {team.memberCount} / {team.maxMembers} MEMBERS {team.isFull && '· FULL'}
                  </span>
                </div>
                <div className="capacity-bar-track">
                  <div
                    className="capacity-bar-fill"
                    style={{
                      width: `${(team.memberCount / team.maxMembers) * 100}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
              </div>

              {/* Dedicated Drinker Pill */}
              <div className="drinker-info-row">
                <span className="drinker-icon-wrap">
                  <IconShot size={14} />
                </span>
                <span className="drinker-text">
                  Designated Drinker: <strong>{team.drinker?.name || 'Unassigned'}</strong>
                </span>
              </div>

              {/* Roster Preview (Who's In There) */}
              <div className="team-roster-preview">
                <div className="roster-preview-header">
                  <span>CONFIRMED MEMBERS ({team.members.length})</span>
                  <button
                    type="button"
                    className="roster-toggle-btn"
                    onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                  >
                    {isSelected ? 'Hide Roster' : 'View Members'}
                  </button>
                </div>

                {/* Always-visible avatar bubbles */}
                <div className="roster-avatar-strip">
                  {team.members.length > 0 ? (
                    team.members.map((m) => (
                      <div
                        key={m.id}
                        className="roster-avatar-chip"
                        onClick={() => onOpenProfile(m.id)}
                        role="button"
                        tabIndex={0}
                        title={`${m.name} (${m.points} pts)`}
                      >
                        <Avatar player={m} size={34} />
                        {m.isDrinker && <span className="drinker-badge-dot" title="Drinker" />}
                      </div>
                    ))
                  ) : (
                    <span className="empty-roster-msg">No members yet. Be the first to join!</span>
                  )}
                </div>

                {/* Expanded Member Details */}
                {isSelected && team.members.length > 0 && (
                  <motion.div
                    className="roster-expanded-list"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {team.members.map((m) => (
                      <div key={m.id} className="roster-member-row">
                        <div
                          className="member-id-part"
                          onClick={() => onOpenProfile(m.id)}
                          role="button"
                          tabIndex={0}
                        >
                          <Avatar player={m} size={28} />
                          <strong>{m.name}</strong>
                          {m.id === me?.id && <span className="chip">You</span>}
                          {m.isDrinker && <span className="chip-drinker">Drinker</span>}
                        </div>
                        <div className="member-actions-part">
                          <span className="member-points">{m.points} pts</span>
                          {hasJoined && !m.isDrinker && (
                            <button
                              type="button"
                              className="btn-set-drinker"
                              onClick={() => handleDrinkerAssignment(team.id, m.id)}
                              title="Make Designated Drinker"
                            >
                              Make Drinker
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Join Team Button */}
              <div className="team-action-row">
                {hasJoined ? (
                  <button type="button" className="btn-team-joined" disabled>
                    ✓ ASSIGNED TO THIS TEAM
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-team-select"
                    disabled={team.isFull}
                    onClick={() => handleJoin(team.id)}
                  >
                    {team.isFull ? 'TEAM AT CAPACITY (6/6)' : `JOIN ${team.name.toUpperCase()}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
