import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from './Avatar'
import { IconShot, IconCheck } from './Icons'

export default function TeamModal({ isOpen, onClose, teamsState, onOpenProfile, initialTeamId = null }) {
  const { teams, myTeam, me, joinTeam } = teamsState
  const [expandedTeamId, setExpandedTeamId] = useState(initialTeamId)
  const [actionMsg, setActionMsg] = useState('')
  const [joiningId, setJoiningId] = useState(null)

  if (!isOpen) return null

  async function handleJoin(teamId) {
    setJoiningId(teamId)
    setActionMsg('')
    const { error } = await joinTeam(teamId)
    setJoiningId(null)
    if (error) {
      setActionMsg(error)
    } else {
      setActionMsg('Successfully joined team!')
      setTimeout(() => setActionMsg(''), 2500)
    }
  }

  function togglePeek(teamId) {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId)
  }

  return (
    <div className="team-modal-backdrop" onClick={onClose}>
      <motion.div
        className="team-modal-sheet luxury-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Modal Header */}
        <div className="team-modal-header">
          <div>
            <span className="brand-presents-text" style={{ fontSize: '8px' }}>
              TOURNAMENT ALLIANCES
            </span>
            <h2 className="team-modal-title">Choose Your Team</h2>
            <p className="team-modal-subtitle">
              Peek rosters, see member profiles & photos, and join your alliance
            </p>
          </div>
          <button type="button" className="team-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {actionMsg && (
            <motion.div
              className="team-modal-toast"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {actionMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams List */}
        <div className="team-modal-body">
          {teams.map((team) => {
            const isMyTeam = team.id === myTeam?.id
            const isExpanded = expandedTeamId === team.id
            const isFull = team.isFull && !isMyTeam

            return (
              <div
                key={team.id}
                className={`team-option-card ${isMyTeam ? 'active-team' : ''}`}
                style={{
                  borderLeftColor: team.color,
                  boxShadow: isMyTeam ? `0 0 16px ${team.color}26` : undefined,
                }}
              >
                {/* Team Card Header */}
                <div className="team-option-main">
                  <div className="team-option-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="team-color-dot" style={{ backgroundColor: team.color }} />
                      <h3 className="team-option-name" style={{ color: team.color }}>
                        {team.name}
                      </h3>
                      {isMyTeam && (
                        <span className="team-joined-badge">
                          <IconCheck size={11} /> YOUR TEAM
                        </span>
                      )}
                    </div>
                    <div className="team-option-tags">
                      <span className="team-capacity-pill">
                        {team.memberCount} / {team.maxMembers} Members
                      </span>
                      <span className="team-score-pill">
                        {team.totalPoints} PTS
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="team-option-actions">
                    <button
                      type="button"
                      className="btn-peek-team"
                      onClick={() => togglePeek(team.id)}
                    >
                      {isExpanded ? 'Hide Roster ▲' : `Peek Team (${team.memberCount}) ▼`}
                    </button>

                    {isMyTeam ? (
                      <span className="btn-team-current">CURRENT ALLIANCE</span>
                    ) : (
                      <button
                        type="button"
                        className="btn-team-join"
                        style={{
                          borderColor: team.color,
                          color: team.color,
                        }}
                        disabled={isFull || joiningId === team.id}
                        onClick={() => handleJoin(team.id)}
                      >
                        {isFull
                          ? 'FULL (6/6)'
                          : joiningId === team.id
                          ? 'JOINING...'
                          : 'JOIN TEAM →'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Peeking Roster Section (Expanded View with Pfps & Names) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="team-peek-roster-box"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="peek-roster-header">
                        <span className="peek-roster-label">TEAM MEMBERS & ROSTER</span>
                        {team.drinker && (
                          <span className="peek-drinker-badge">
                            <IconShot size={12} /> Drinker: <strong>{team.drinker.name}</strong>
                          </span>
                        )}
                      </div>

                      {team.members.length === 0 ? (
                        <p className="peek-empty-text">No guests in this team yet. Be the first to join!</p>
                      ) : (
                        <div className="peek-members-grid">
                          {team.members.map((member) => (
                            <div
                              key={member.id}
                              className="peek-member-item"
                              onClick={() => {
                                onClose()
                                onOpenProfile(member.id)
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="peek-member-avatar-wrap">
                                <Avatar player={member} size={42} />
                                {member.isDrinker && (
                                  <span className="drinker-icon-tag" title="Designated Drinker">
                                    <IconShot size={10} />
                                  </span>
                                )}
                              </div>
                              <div className="peek-member-info">
                                <span className="peek-member-name">
                                  {member.name} {member.id === me?.id && '(You)'}
                                </span>
                                <span className="peek-member-sub">
                                  {member.isDrinker ? 'Dedicated Drinker · ' : ''}{member.points} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
