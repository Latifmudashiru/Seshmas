import { useState } from 'react'
import { supabase, PARTY_CODE, DEMO_MODE } from '../supabase'
import { normalizeHandle } from '../socials'

export default function Join({ onJoined }) {
  const [form, setForm] = useState({ code: '', name: '', snapchat: '', instagram: '', tiktok: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (form.code.trim().toLowerCase() !== PARTY_CODE.toLowerCase()) return setError('That party code is not right.')
    if (!form.name.trim()) return setError('Please enter your name.')

    setBusy(true)
    const { data, error } = await supabase
      .from('players')
      .insert({
        name: form.name.trim(),
        snapchat: normalizeHandle(form.snapchat) || null,
        instagram: normalizeHandle(form.instagram) || null,
        tiktok: normalizeHandle(form.tiktok) || null,
      })
      .select()
      .single()
    setBusy(false)

    if (error) return setError(error.message)
    onJoined(data.id)
  }

  const handle = (key, label) => {
    return (
      <label className={`field handle ${key}`}>
        <span className="field-label">{label}</span>
        <span className="field-box">
          <span className="field-prefix">@</span>
          <input
            value={form[key]}
            onChange={set(key)}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </span>
      </label>
    )
  }

  return (
    <main className="join">
      <div className="hero">
        <h1 className="wordmark">Seshmas</h1>
      </div>

      <form className="join-card" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Party code</span>
          <span className="field-box">
            <input
              value={form.code}
              onChange={set('code')}
              placeholder="Enter the code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="code-input"
            />
          </span>
        </label>
        {DEMO_MODE && (
          <button type="button" className="demo-code" onClick={() => setForm({ ...form, code: PARTY_CODE })}>
            Demo code: <b>{PARTY_CODE}</b> &middot; tap to fill
          </button>
        )}

        <label className="field">
          <span className="field-label">Your name</span>
          <span className="field-box">
            <input value={form.name} onChange={set('name')} placeholder="What do friends call you?" autoComplete="given-name" />
          </span>
        </label>

        <div className="divider">Socials (optional)</div>
        {handle('snapchat', 'Snapchat')}
        {handle('instagram', 'Instagram')}
        {handle('tiktok', 'TikTok')}
        <p className="hint">You can paste a profile link instead of a username.</p>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Joining...' : 'Join the party'}</button>
      </form>
    </main>
  )
}
