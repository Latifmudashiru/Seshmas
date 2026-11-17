import { SOCIALS } from '../socials'
import { SOCIAL_ICONS, IconExternal } from './Icons'

// Tappable rows linking out to each social the player added.
export default function SocialButtons({ player }) {
  const shown = SOCIALS.filter((s) => player[s.key])
  if (!shown.length) return <p className="muted small center no-socials">No socials added yet</p>
  return (
    <div className="socials">
      {shown.map((s) => {
        const Icon = SOCIAL_ICONS[s.key]
        return (
          <a key={s.key} className={`social ${s.key}`} href={s.url(player[s.key])} target="_blank" rel="noopener noreferrer">
            <span className="social-ico"><Icon size={22} /></span>
            <span className="social-text">
              <strong>{s.label}</strong>
              <span>@{player[s.key]}</span>
            </span>
            <IconExternal size={18} className="social-go" />
          </a>
        )
      })}
    </div>
  )
}
