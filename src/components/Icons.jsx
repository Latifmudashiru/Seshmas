// Tiny inline SVG icon set (no icon library). All icons inherit `currentColor`.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const make = (children, extra) =>
  function Icon({ size, ...props }) {
    return (
      <svg {...base} {...extra} {...(size ? { width: size, height: size } : {})} {...props}>
        {children}
      </svg>
    )
  }

export const IconGuests = make(
  <>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 19.5c.6-3.3 3-5 6.2-5s5.6 1.7 6.2 5" />
    <path d="M16 4.9a3.2 3.2 0 0 1 0 6.2" />
    <path d="M18 14.9c1.8.5 3 2 3.3 4.6" />
  </>,
)
export const IconTrophy = make(
  <>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 6H4.5c0 3 1.3 4.5 3.7 4.8M16 6h3.5c0 3-1.3 4.5-3.7 4.8" />
    <path d="M12 13v4M8.5 20h7M9.5 17h5" />
  </>,
)
export const IconChat = make(<path d="M20.5 11.5c0 4.1-3.6 7-8.5 7-1 0-1.9-.1-2.8-.3L4.5 20l1.2-3.7C4.3 15.1 3.5 13.4 3.5 11.5c0-4.1 3.6-7 8.5-7s8.5 2.9 8.5 7z" />)
export const IconQR = make(
  <>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" />
    <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM18 14h2.5M14 19v1.5" />
  </>,
)
export const IconBack = make(<path d="M15 5l-7 7 7 7" />, { strokeWidth: 2.2 })
export const IconSend = make(<path d="M4.5 12l15-7-5.5 15-2.6-6.4zM11.4 13.6L19.5 5" />, { strokeWidth: 2 })
export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </>,
)
export const IconExternal = make(<path d="M8 16L16 8M9 8h7v7" />, { strokeWidth: 2 })
export const IconLogout = make(
  <>
    <path d="M9.5 4.5h-4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h4" />
    <path d="M15 8l4 4-4 4M19 12H9.5" />
  </>,
)

// Brand-ish glyphs (simplified, filled)
export const IconSnapchat = make(
  <path d="M12 3.2c-2.9 0-4.7 2.1-4.7 4.9v1.9c-.5.3-1.2.4-1.9.5.3.9 1 1.2 1.9 1.3-.5 1.3-1.5 2.3-3 2.9.2.5.9.8 2 .9.3.5.4 1 .8 1 .5 0 1-.4 1.9-.4 1.1 0 1.5 1.6 3 1.6s1.9-1.6 3-1.6c.9 0 1.4.4 1.9.4.4 0 .5-.5.8-1 1.1-.1 1.8-.4 2-.9-1.5-.6-2.5-1.6-3-2.9.9-.1 1.6-.4 1.9-1.3-.7-.1-1.4-.2-1.9-.5V8.1c0-2.8-1.8-4.9-4.7-4.9z" />,
  { fill: 'currentColor', stroke: 'none' },
)
export const IconInstagram = make(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </>,
  { strokeWidth: 1.9 },
)
export const IconTikTok = make(
  <path d="M16.2 3c.3 2.3 1.7 3.8 4 4v3.1c-1.5 0-2.9-.4-4-1.2v6.2a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a2.9 2.9 0 1 0 2 2.7V3z" />,
  { fill: 'currentColor', stroke: 'none' },
)

export const SOCIAL_ICONS = { snapchat: IconSnapchat, instagram: IconInstagram, tiktok: IconTikTok }
