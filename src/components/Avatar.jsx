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

// Muted, distinct colours that hold white initials on the dark background.
const PALETTE = ['#a24b3f', '#3f6f93', '#4f7a45', '#7a5aa0', '#2f7d78', '#a2476f', '#5d6577', '#96592c']

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
