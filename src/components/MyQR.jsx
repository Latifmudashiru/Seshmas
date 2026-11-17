import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import { IconLogout, IconEdit, IconInstagram, IconExternal } from './Icons'
import { supabase } from '../supabase'
import { normalizeHandle } from '../socials'

export default function MyQR({ playerId, onLeave, teamsState }) {
  const { ranked } = useStandings()
  const me = ranked.find((p) => p.id === playerId)
  const myTeam = teamsState?.myTeam

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    instagram: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (me) {
      setForm({
        name: me.name || '',
        instagram: me.instagram || '',
      })
    }
  }, [me])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    await supabase
      .from('players')
      .update({
        name: form.name.trim(),
        instagram: normalizeHandle(form.instagram) || null,
      })
      .eq('id', playerId)

    setSaving(false)
    setSaveSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const cleanIg = (me?.instagram || form.instagram || '').replace(/^@+/, '').trim()
  const igUrl = cleanIg ? `https://www.instagram.com/${cleanIg}/?hl=en` : null
  const qrTarget = igUrl || `${window.location.origin}/?p=${playerId}`

  return (
    <section className="screen">
      <header className="screen-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="screen-title-serif">My Instagram Pass</h1>
          <button
            type="button"
            className="btn-luxury-outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <IconEdit size={14} />
            <span>{isEditing ? 'Cancel' : 'Edit Pass'}</span>
          </button>
        </div>
        <p>Let guests scan to follow your Instagram instantly at SeshMas.</p>
      </header>

      {saveSuccess && (
        <div className="profile-save-banner">
          Instagram pass updated successfully.
        </div>
      )}

      {/* Main VIP Instagram Pass Card */}
      <div className="vip-pass-card luxury-card">
        <div className="vip-pass-top-bar">
          <span className="brand-presents-text">PGLA PRESENTS</span>
          <span className="vip-tier-tag">INSTAGRAM CONNECT</span>
        </div>

        <div className="vip-pass-header">
          <Avatar player={me} size={58} />
          <div className="vip-pass-user">
            <strong className="vip-pass-name">{me?.name || 'Guest'}</strong>
            <span className="vip-pass-tier" style={{ color: myTeam?.color || 'var(--gold-light)' }}>
              {myTeam ? myTeam.name : 'SeshMas Attendee'}
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="vip-qr-container">
          <div className="vip-qr-frame">
            <QRCodeSVG
              value={qrTarget}
              size={210}
              marginSize={0}
              fgColor="#0A0506"
              bgColor="#FFF8F0"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Instagram Handle Pill */}
          {cleanIg ? (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="vip-instagram-pill"
            >
              <IconInstagram size={18} />
              <span>@{cleanIg}</span>
              <IconExternal size={14} />
            </a>
          ) : (
            <button
              type="button"
              className="vip-instagram-pill add"
              onClick={() => setIsEditing(true)}
            >
              <IconInstagram size={18} />
              <span>Tap to Add Your Instagram</span>
            </button>
          )}

          <p className="vip-qr-caption">Scan with camera to open Instagram profile</p>
        </div>

        {/* Pass Footer Meta */}
        <div className="vip-pass-footer">
          <div>
            <span className="vip-pass-label">ALLIANCE</span>
            <span className="vip-pass-val" style={{ color: myTeam?.color || 'inherit' }}>
              {myTeam?.name || 'Independent'}
            </span>
          </div>
          <div>
            <span className="vip-pass-label">POINTS</span>
            <span className="vip-pass-val">{me?.total || 0} PTS</span>
          </div>
          <div>
            <span className="vip-pass-label">ROLE</span>
            <span className="vip-pass-val text-gold">
              {myTeam?.drinker_id === me?.id ? 'Drinker' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form className="profile-edit-card luxury-card" onSubmit={handleSave}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: 16 }}>
            Update Your Pass
          </h3>

          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label">Display Name</label>
            <div className="input-field">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 18 }}>
            <label className="input-label">
              <IconInstagram size={15} /> Instagram Username
            </label>
            <div className="input-field">
              <span className="input-prefix">@</span>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="your.instagram"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>

          <button type="submit" className="btn-luxury-gold" disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE INSTAGRAM PASS'}
          </button>
        </form>
      )}

      {/* Sign Out Action */}
      <p className="center footer-action">
        <button className="link danger" onClick={onLeave}>
          <IconLogout size={16} /> Sign Out / Switch Attendee
        </button>
      </p>
    </section>
  )
}
