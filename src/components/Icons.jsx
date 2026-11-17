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

export const IconHome = make(
  <>
    <path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9z" />
    <path d="M9 21v-7h6v7" />
  </>,
)

export const IconTeams = make(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
)

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

export const IconShot = make(
  <>
    <path d="M5 4h14l-2 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 4z" />
    <path d="M7 10h10" />
  </>,
)

export const IconChat = make(
  <path d="M20.5 11.5c0 4.1-3.6 7-8.5 7-1 0-1.9-.1-2.8-.3L4.5 20l1.2-3.7C4.3 15.1 3.5 13.4 3.5 11.5c0-4.1 3.6-7 8.5-7s8.5 2.9 8.5 7z" />,
)

export const IconQR = make(
  <>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" />
    <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM18 14h2.5M14 19v1.5" />
  </>,
)

export const IconUser = make(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </>,
)

export const IconCamera = make(
  <>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </>,
)

export const IconCheck = make(
  <path d="M20 6L9 17l-5-5" />,
  { strokeWidth: 2.4 },
)

export const IconEdit = make(
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

// Brand glyphs
export const IconInstagram = make(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </>,
  { strokeWidth: 1.9 },
)

export const IconSnapchat = make(
  <path d="M12 3.2c-2.9 0-4.7 2.1-4.7 4.9v1.9c-.5.3-1.2.4-1.9.5.3.9 1 1.2 1.9 1.3-.5 1.3-1.5 2.3-3 2.9.2.5.9.8 2 .9.3.5.4 1 .8 1 .5 0 1-.4 1.9-.4 1.1 0 1.5 1.6 3 1.6s1.9-1.6 3-1.6c.9 0 1.4.4 1.9.4.4 0 .5-.5.8-1 1.1-.1 1.8-.4 2-.9-1.5-.6-2.5-1.6-3-2.9.9-.1 1.6-.4 1.9-1.3-.7-.1-1.4-.2-1.9-.5V8.1c0-2.8-1.8-4.9-4.7-4.9z" />,
  { fill: 'currentColor', stroke: 'none' },
)

export const IconTikTok = make(
  <path d="M16.2 3c.3 2.3 1.7 3.8 4 4v3.1c-1.5 0-2.9-.4-4-1.2v6.2a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a2.9 2.9 0 1 0 2 2.7V3z" />,
  { fill: 'currentColor', stroke: 'none' },
)

export const SOCIAL_ICONS = { instagram: IconInstagram, snapchat: IconSnapchat, tiktok: IconTikTok }
