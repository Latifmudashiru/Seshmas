const DAY = 24 * 60 * 60 * 1000

const startOfDay = (ms) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

// "Today", "Yesterday", "Mon, Nov 17"
export function dayLabel(ms) {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ms)) / DAY)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(ms).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export const sameDay = (a, b) => startOfDay(a) === startOfDay(b)

// Compact relative time for the chat list: "now", "5m", "3h", "Yesterday", "Mon", "Nov 3"
export function relTime(ms) {
  const diff = Date.now() - ms
  if (diff < 60 * 1000) return 'now'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m`
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ms)) / DAY)
  if (days === 0) return `${Math.floor(diff / 3600000)}h`
  if (days === 1) return 'Yesterday'
  if (days < 7) return new Date(ms).toLocaleDateString([], { weekday: 'short' })
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })
}
