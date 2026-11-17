// Turn whatever the user typed/pasted into a bare handle.
// "@bob", " bob ", "instagram.com/bob/", "snapchat.com/add/bob", "tiktok.com/@bob?x=1" -> "bob"
export function normalizeHandle(input) {
  let s = (input || '').trim()
  if (!s) return ''
  if (s.includes('/')) {
    // looks like a URL: drop protocol, query and hash, then pick the right path segment
    s = s.replace(/^[a-z]+:\/\//i, '').split(/[?#]/)[0]
    const parts = s.split('/').filter(Boolean).slice(1) // drop the domain
    s = parts[0] === 'add' ? parts[1] || '' : parts[0] || ''
  }
  return s.replace(/^@+/, '').trim()
}

export const SOCIALS = [
  { key: 'snapchat', label: 'Snapchat', url: (h) => `https://www.snapchat.com/add/${h}` },
  { key: 'instagram', label: 'Instagram', url: (h) => `https://www.instagram.com/${h}` },
  { key: 'tiktok', label: 'TikTok', url: (h) => `https://www.tiktok.com/@${h}` },
]
