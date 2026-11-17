import { useState } from 'react'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import SocialButtons from './SocialButtons'
import TeamModal from './TeamModal'
import { IconBack, IconChat, IconTeams, IconShot } from './Icons'

export default function Profile({ playerId, viewerId, onBack, onMessage, onJoin, teamsState }) {
  const { ranked, loaded } = useStandings()
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [modalFocusTeamId, setModalFocusTeamId] = useState(null)

  const player = ranked.find((p) => p.id === playerId)
  const isMe = viewerId && viewerId === playerId
  const isOnline = player ? (isMe || ((player.id.charCodeAt(player.id.length - 1) || 0) % 2 === 0)) : false

  // Find player's team
  const playerTeam = teamsState?.teams?.find((t) => t.members?.some((m) => m.id === playerId)) || null

  const openTeamPeek = (teamId = null) => {
    setModalFocusTeamId(teamId)
    setShowTeamModal(true)
  }

  return (
    <div className="profile-view">
      <header className="overlay-head">
        {onBack ? (
          <button className="btn-icon" onClick={onBack} aria-label="Back">
            <IconBack size={22} />
          </button>
        ) : (
          <div style={{ width: 44 }} />
        )}
        <span className="overlay-title">{isMe ? 'My Profile' : (player?.name || 'Guest Profile')}</span>
        <div style={{ width: 44 }} />
      </header>

      <div className="overlay-scroll">
        {!loaded && <p className="muted center pad">Loading profile...</p>}
        {loaded && !player && <p className="error center pad">Guest not found.</p>}

        {player && (
          <div className="profile-card">
            <div className="profile-hero luxury-card" style={{ marginTop: 8 }}>
              <div style={{ position: 'relative' }}>
                <Avatar player={player} size={96} />
                <span
                  className={`guest-status-indicator ${isOnline ? 'online' : 'offline'}`}
                  style={{ width: 14, height: 14, bottom: 2, right: 2, borderWidth: 3 }}
                />
              </div>

              <h1 className="profile-name" style={{ fontFamily: 'var(--font-heading)' }}>
                {player.name}
              </h1>
              <p className="profile-presence-tag">
                {isOnline ? 'ACTIVE AT SESHMAS' : 'CONFIRMED ATTENDEE'}
              </p>

              <div className="stats" style={{ width: '100%', justifyContent: 'center' }}>
                <div>
                  <b className="text-gold">{player.total || 0}</b>
                  <span>points</span>
                </div>
                <div>
                  <b>#{player.rank || 1}</b>
                  <span>rank of {ranked.length}</span>
                </div>
              </div>
            </div>

            {/* Team Alliance Card & Peek Section */}
            <div className="profile-team-card luxury-card" style={{ marginTop: 14 }}>
              <div className="profile-team-header">
                <span className="section-caption-tag" style={{ color: 'var(--gold)' }}>
                  TOURNAMENT ALLIANCE
                </span>
                {playerTeam?.drinker_id === player.id && (
                  <span className="team-drinker-pill">
                    <IconShot size={12} /> Designated Drinker
                  </span>
                )}
              </div>

              {playerTeam ? (
                <div className="profile-team-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="team-color-dot" style={{ backgroundColor: playerTeam.color }} />
                    <div>
                      <h3 className="profile-team-name" style={{ color: playerTeam.color }}>
                        {playerTeam.name}
                      </h3>
                      <span className="profile-team-meta">
                        {playerTeam.memberCount} / {playerTeam.maxMembers} members · {playerTeam.totalPoints} team pts
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-profile-team-action"
                    onClick={() => openTeamPeek(playerTeam.id)}
                  >
                    <IconTeams size={15} />
                    {isMe ? 'Change Team / Peek' : `Peek ${playerTeam.name}`}
                  </button>
                </div>
              ) : (
                <div className="profile-no-team-box">
                  <p className="no-team-warn">
                    {isMe
                      ? 'You have not joined a party team yet! You must choose an alliance to play games.'
                      : `${player.name} has not chosen a team alliance yet.`}
                  </p>
                  {isMe && (
                    <button
                      type="button"
                      className="btn-luxury-gold"
                      style={{ marginTop: 10, width: '100%' }}
                      onClick={() => openTeamPeek(null)}
                    >
                      CHOOSE A TEAM TO JOIN →
                    </button>
                  )}
                </div>
              )}
            </div>

            <h2 className="section-label">Connect on Socials</h2>
            <SocialButtons player={player} />

            <div className="profile-cta">
              {isMe && (
                <div className="this-is-you">
                  THIS IS YOUR PROFILE
                </div>
              )}
              {!isMe && viewerId && (
                <button
                  type="button"
                  className="btn-luxury-gold"
                  onClick={() => onMessage(player.id)}
                >
                  <IconChat size={18} /> Message {player.name}
                </button>
              )}
              {!viewerId && (
                <button type="button" className="btn-luxury-gold" onClick={onJoin}>
                  JOIN SESHMAS TO MESSAGE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Team Peek & Select Modal */}
      {teamsState && (
        <TeamModal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          teamsState={teamsState}
          initialTeamId={modalFocusTeamId}
          onOpenProfile={(id) => {
            // Already inside profile overlay, could stay or navigate
          }}
        />
      )}
    </div>
  )
}
