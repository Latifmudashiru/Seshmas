import { motion } from 'framer-motion'
import { IconTeams, IconTrophy, IconGuests, IconQR, IconShot } from './Icons'

export default function Dashboard({ guestName, guestCount, onlineCount, onNavigate, teamsState }) {
  const myTeam = teamsState?.myTeam

  return (
    <section className="dashboard-view">
      {/* SECTION 1: Event Hero */}
      <motion.div
        className="dash-hero-card luxury-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dash-hero-meta-bar">
          <span className="brand-presents-text">PGLA PRESENTS</span>
          <span className="live-status-pill">
            <span className="status-dot-pulse" />
            LIVE IN THE HOUSE
          </span>
        </div>

        <div className="dash-hero-title-block">
          <h1 className="dash-welcome-name">Welcome, {guestName || 'Guest'}</h1>
          <p className="dash-event-subtitle">SeshMas Christmas Party</p>
        </div>

        {/* Live Party Status Banner */}
        <div className="dash-party-live-status">
          <div className="live-status-item">
            <span className="live-status-lbl">CURRENT ROUND</span>
            <strong className="live-status-val text-gold">Round 02 · Trivia</strong>
          </div>
          <div className="meta-divider-vertical" />
          <div className="live-status-item">
            <span className="live-status-lbl">YOUR ALLIANCE</span>
            <strong className="live-status-val" style={{ color: myTeam?.color || 'var(--text-primary)' }}>
              {myTeam?.name || 'No Team Yet'}
            </strong>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: Party Overview Metrics */}
      <div className="dash-section-wrap">
        <div className="section-title-row">
          <h2 className="dash-section-title">Party Overview</h2>
          <span className="section-caption-tag">Live Sync</span>
        </div>

        <div className="dash-metrics-grid">
          <div
            className="metric-card luxury-card"
            onClick={() => onNavigate('guests')}
            role="button"
            tabIndex={0}
          >
            <span className="metric-num-gold">{guestCount || 24}</span>
            <span className="metric-label">Guests in House</span>
            <span className="metric-arrow">Guest List →</span>
          </div>

          <div
            className="metric-card luxury-card"
            onClick={() => onNavigate('guests')}
            role="button"
            tabIndex={0}
          >
            <span className="metric-num-emerald">{onlineCount || 8}</span>
            <span className="metric-label">Active on App</span>
            <span className="metric-arrow">Connect →</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: My Team & Dedicated Drinker Status */}
      <div className="dash-section-wrap">
        <div className="section-title-row">
          <h2 className="dash-section-title">Team Status</h2>
          <span className="section-caption-tag" style={{ color: 'var(--gold)' }}>
            Tournament
          </span>
        </div>

        {myTeam ? (
          <div className="dash-my-team-box luxury-card">
            <div className="dash-team-header-row">
              <div>
                <span className="my-team-pill" style={{ color: myTeam.color }}>YOUR TEAM</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: myTeam.color, marginTop: 4 }}>
                  {myTeam.name}
                </h3>
              </div>
              <div className="dash-team-score-badge">
                <span>{myTeam.totalPoints} PTS</span>
              </div>
            </div>

            <div className="dash-team-drinker-row">
              <span className="drinker-icon-wrap"><IconShot size={14} /></span>
              <span className="drinker-text">
                Dedicated Drinker: <strong>{myTeam.drinker?.name || 'Unassigned'}</strong>
              </span>
            </div>

            <div className="dash-team-action-bar">
              <button
                type="button"
                className="btn-luxury-outline"
                onClick={() => onNavigate('teams')}
                style={{ width: '100%' }}
              >
                View Team Roster ({myTeam.memberCount} / {myTeam.maxMembers})
              </button>
            </div>
          </div>
        ) : (
          <div
            className="dash-no-team-card luxury-card"
            onClick={() => onNavigate('teams')}
            role="button"
            tabIndex={0}
          >
            <div>
              <strong style={{ fontSize: '15px', color: 'var(--gold-light)' }}>Join a SeshMas Team</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>
                Pick an alliance to play games, compete, and claim drink forfeits.
              </p>
            </div>
            <span className="btn-luxury-outline" style={{ flex: 'none' }}>Choose Team →</span>
          </div>
        )}
      </div>

      {/* SECTION 4: Interactive Forfeits & Games Shortcut */}
      <div className="dash-section-wrap">
        <div className="section-title-row">
          <h2 className="dash-section-title">Games & Forfeits</h2>
        </div>

        <div className="dash-forfeit-banner luxury-card">
          <div className="forfeit-banner-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="drinker-icon-wrap"><IconShot size={15} /></span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Shot Forfeit Clause</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4 }}>
              Lost a round? Anyone or your Dedicated Drinker can take a shot to redeem +2 points!
            </p>
          </div>
          <button
            type="button"
            className="btn-luxury-gold"
            onClick={() => onNavigate('board')}
            style={{ minHeight: '40px', fontSize: '12px', padding: '0 16px' }}
          >
            VIEW GAMES & FORFEITS →
          </button>
        </div>
      </div>

      {/* SECTION 5: Directory & Navigation Hub */}
      <div className="dash-section-wrap">
        <div className="section-title-row">
          <h2 className="dash-section-title">Quick Actions</h2>
        </div>

        <div className="dash-quick-nav-grid">
          <div
            className="quick-nav-box luxury-card"
            onClick={() => onNavigate('teams')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-nav-icon-wrap">
              <IconTeams size={20} />
            </div>
            <div className="quick-nav-text">
              <strong>Teams & Rosters</strong>
              <span>Roster limit 6/6 per team</span>
            </div>
          </div>

          <div
            className="quick-nav-box luxury-card"
            onClick={() => onNavigate('board')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-nav-icon-wrap">
              <IconTrophy size={20} />
            </div>
            <div className="quick-nav-text">
              <strong>Games Timeline</strong>
              <span>5 rounds & shot forfeits</span>
            </div>
          </div>

          <div
            className="quick-nav-box luxury-card"
            onClick={() => onNavigate('guests')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-nav-icon-wrap">
              <IconGuests size={20} />
            </div>
            <div className="quick-nav-text">
              <strong>Party Guests</strong>
              <span>Discover & see Instagrams</span>
            </div>
          </div>

          <div
            className="quick-nav-box luxury-card"
            onClick={() => onNavigate('qr')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-nav-icon-wrap">
              <IconQR size={20} />
            </div>
            <div className="quick-nav-text">
              <strong>My QR Pass</strong>
              <span>Instant Instagram sharing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dash-legal-footer">
        <span>PRESENTED BY PGLA · PRIVATE SOCIAL EXPERIENCE</span>
      </footer>
    </section>
  )
}
