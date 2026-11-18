import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import TeamModal from './TeamModal'
import { IconSearch, IconChat, IconTeams, IconShot, IconCheck } from './Icons'

export default function Guests({ playerId, onOpenProfile, teamsState }) {
  const { ranked, loaded } = useStandings()
  const { teams = [], myTeam, me, joinTeam } = teamsState || {}

  const [q, setQ] = useState('')
  const [sectionTab, setSectionTab] = useState('all') // 'all' | 'teams' | 'online'
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [modalFocusTeamId, setModalFocusTeamId] = useState(null)
  const [expandedTeamId, setExpandedTeamId] = useState(null)

  const isOnline = (id) => {
    if (id === playerId) return true
    const code = id.charCodeAt(id.length - 1) || 0
    return code % 2 === 0
  }

  // Map player ID to their enriched team
  const playerTeamMap = {}
  teams.forEach((t) => {
    t.members?.forEach((m) => {
      playerTeamMap[m.id] = t
    })
  })

  const onlineCount = ranked.filter((p) => isOnline(p.id)).length

  // Filtered guest list
  const filteredGuests = ranked.filter((p) => {
    const team = playerTeamMap[p.id]
    const matchesQuery =
      p.name.toLowerCase().includes(q.trim().toLowerCase()) ||
      (team?.name && team.name.toLowerCase().includes(q.trim().toLowerCase()))
    if (!matchesQuery) return false
    if (sectionTab === 'online') return isOnline(p.id)
    return true
  }).sort((a, b) => {
    if (a.id === playerId) return -1
    if (b.id === playerId) return 1
    return a.name.localeCompare(b.name)
  })

  const openTeamPeek = (teamId = null) => {
    setModalFocusTeamId(teamId)
    setShowTeamModal(true)
  }

  const toggleInlineTeamPeek = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId)
  }

  return (
    <section className="screen">
      <header className="screen-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 className="screen-title-serif">Guests & Teams</h1>
          <span className="live on" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
            <i className="live-dot" /> {onlineCount} ACTIVE
          </span>
        </div>
        <p>Browse party guests, peek team rosters, and choose your tournament alliance.</p>
      </header>

      {/* ======================================================== */}
      {/* 1. MANDATORY TEAM ALLIANCE STATUS / JOIN BANNER          */}
      {/* ======================================================== */}
      {!myTeam ? (
        <motion.div
          className="guest-no-team-banner luxury-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="banner-glow-tag">
            <span>⚔️ TOURNAMENT REQUIREMENT</span>
          </div>
          <h2 className="banner-callout-title">You Haven't Chosen a Team Yet!</h2>
          <p className="banner-callout-sub">
            All guests must join one of the 4 party alliances to compete in games, rack up points, and drink for forfeits tonight.
          </p>
          <button
            type="button"
            className="btn-luxury-gold"
            style={{ width: '100%', marginTop: 12 }}
            onClick={() => openTeamPeek(null)}
          >
            CHOOSE YOUR TEAM NOW →
          </button>
        </motion.div>
      ) : (
        <div className="guest-my-team-pill-card luxury-card">
          <div className="my-team-pill-left">
            <span className="my-team-subtag" style={{ color: myTeam.color }}>
              YOUR CURRENT TEAM
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span className="team-color-dot" style={{ backgroundColor: myTeam.color }} />
              <strong className="my-team-pill-name" style={{ color: myTeam.color }}>
                {myTeam.name}
              </strong>
              <span className="my-team-pill-members">
                ({myTeam.memberCount} / {myTeam.maxMembers})
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-luxury-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => openTeamPeek(myTeam.id)}
          >
            <IconTeams size={14} /> Peek / Switch
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. COMBINED SECTION TABS                                */}
      {/* ======================================================== */}
      <div className="guest-filter-tabs" style={{ marginTop: 14 }}>
        <button
          className={`guest-filter-pill ${sectionTab === 'all' ? 'active' : ''}`}
          onClick={() => setSectionTab('all')}
        >
          All Guests ({ranked.length})
        </button>
        <button
          className={`guest-filter-pill ${sectionTab === 'teams' ? 'active' : ''}`}
          onClick={() => setSectionTab('teams')}
        >
          Teams & Rosters ({teams.length})
        </button>
        <button
          className={`guest-filter-pill ${sectionTab === 'online' ? 'active' : ''}`}
          onClick={() => setSectionTab('online')}
        >
          Active Now ({onlineCount})
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TEAMS & ROSTERS VIEW (when 'teams' tab is selected)   */}
      {/* ======================================================== */}
      {sectionTab === 'teams' && (
        <div className="teams-tab-container">
          <div className="teams-grid-stack">
            {teams.map((team) => {
              const isMy = team.id === myTeam?.id
              const isExpanded = expandedTeamId === team.id

              return (
                <div
                  key={team.id}
                  className={`team-card-unified luxury-card ${isMy ? 'is-my-team' : ''}`}
                  style={{ borderLeftColor: team.color }}
                >
                  <div className="team-card-head-row">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="team-color-dot" style={{ backgroundColor: team.color }} />
                        <h3 className="team-title-text" style={{ color: team.color }}>
                          {team.name}
                        </h3>
                        {isMy && (
                          <span className="team-my-badge">
                            <IconCheck size={11} /> YOU
                          </span>
                        )}
                      </div>
                      <span className="team-meta-desc">
                        {team.memberCount} of {team.maxMembers} members · {team.totalPoints} points
                      </span>
                    </div>

                    <div className="team-action-col">
                      {isMy ? (
                        <span className="team-status-joined">YOUR TEAM</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-team-join-sm"
                          style={{ borderColor: team.color, color: team.color }}
                          disabled={team.isFull}
                          onClick={() => joinTeam(team.id)}
                        >
                          {team.isFull ? 'FULL' : 'JOIN →'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dedicated Drinker notice */}
                  {team.drinker && (
                    <div className="team-drinker-strip">
                      <IconShot size={12} />
                      <span>Dedicated Drinker: <strong>{team.drinker.name}</strong></span>
                    </div>
                  )}

                  {/* Member Pfps Preview Bar */}
                  <div className="team-pfps-preview-row">
                    <span className="pfps-label">ROSTER PFPS:</span>
                    <div className="pfps-avatars-stack">
                      {team.members.length === 0 ? (
                        <span className="no-members-pill">No members yet</span>
                      ) : (
                        team.members.map((m) => (
                          <div
                            key={m.id}
                            className="pfp-thumb-wrap"
                            title={`${m.name} (${m.points} pts)`}
                            onClick={() => onOpenProfile(m.id)}
                          >
                            <Avatar player={m} size={32} />
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-peek-toggle"
                      onClick={() => toggleInlineTeamPeek(team.id)}
                    >
                      {isExpanded ? 'Hide ▲' : 'Peek ▼'}
                    </button>
                  </div>

                  {/* Expanded Peeking Roster */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="team-peek-expanded-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {team.members.map((m) => (
                          <div
                            key={m.id}
                            className="peek-row-item"
                            onClick={() => onOpenProfile(m.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <Avatar player={m} size={36} />
                            <div className="peek-row-text">
                              <strong>
                                {m.name} {m.id === me?.id && '(You)'}
                              </strong>
                              <span>{m.isDrinker ? '🍷 Dedicated Drinker · ' : ''}{m.points} pts</span>
                            </div>
                            <span className="peek-view-arrow">Profile →</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. GUEST LIST VIEW (when 'all' or 'online' is selected)   */}
      {/* ======================================================== */}
      {sectionTab !== 'teams' && (
        <>
          {/* Search Bar */}
          <div className="search">
            <IconSearch size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by attendee or team name..."
              aria-label="Search guests"
            />
            {q && (
              <button
                type="button"
                className="btn-ghost"
                style={{ minHeight: 'auto', padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setQ('')}
              >
                Clear
              </button>
            )}
          </div>

          <div className="guest-cards-list">
            {filteredGuests.map((p, idx) => {
              const online = isOnline(p.id)
              const isMe = p.id === playerId
              const team = playerTeamMap[p.id]

              return (
                <motion.div
                  key={p.id}
                  className="guest-card luxury-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
                  onClick={() => onOpenProfile(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="guest-card-left">
                    <div style={{ position: 'relative' }}>
                      <Avatar player={p} size={50} />
                      <span
                        className={`guest-status-indicator ${online ? 'online' : 'offline'}`}
                      />
                    </div>

                    <div className="guest-card-info">
                      <div className="guest-card-title-row">
                        <strong className="guest-card-name">
                          {p.name} {isMe && <span className="you-tag">(You)</span>}
                        </strong>
                      </div>

                      {/* Team Pill & Points */}
                      <div className="guest-card-meta-row">
                        {team ? (
                          <span
                            className="guest-team-pill"
                            style={{
                              color: team.color,
                              borderColor: `${team.color}4D`,
                              backgroundColor: `${team.color}14`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openTeamPeek(team.id)
                            }}
                          >
                            <span className="pill-dot" style={{ backgroundColor: team.color }} />
                            {team.name}
                          </span>
                        ) : (
                          <span
                            className="guest-team-pill unassigned"
                            onClick={(e) => {
                              e.stopPropagation()
                              openTeamPeek(null)
                            }}
                          >
                            No Team
                          </span>
                        )}

                        <span className="guest-card-points">
                          {p.total || 0} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="guest-card-actions">
                    <span className="guest-card-arrow">→</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Team Selection & Peek Modal */}
      <TeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        teamsState={teamsState}
        initialTeamId={modalFocusTeamId}
        onOpenProfile={onOpenProfile}
      />
    </section>
  )
}
