// Deterministic solid avatar: the player id hashes to one colour from a small palette, the name gives the initials.
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = Array.from(parts[0])[0]
  const second = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : ''
  return (first + second).toUpperCase()
}

// Solid, muted colours that pop on the dark red/black wash and hold white initials at AA contrast.
const PALETTE = ['#1f7a6d', '#3b6fb0', '#7a4fa8', '#a63c78', '#a8661a', '#5b7f2e', '#1f6f8b', '#b0405a']

function colour(id = '') {
  return PALETTE[hash(String(id)) % PALETTE.length]
}

export default function Avatar({ player, size = 44, className = '' }) {
  const name = player?.name || ''
  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{ '--size': `${size}px`, background: colour(player?.id) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
