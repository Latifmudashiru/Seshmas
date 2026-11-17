import { QRCodeSVG } from 'qrcode.react'
import { useStandings } from '../useStandings'
import Avatar from './Avatar'
import { IconLogout } from './Icons'

export default function MyQR({ playerId, onLeave }) {
  const { ranked } = useStandings()
  const me = ranked.find((p) => p.id === playerId)

  return (
    <section className="screen">
      <header className="screen-head">
        <h1>My QR</h1>
      </header>

      <div className="qr-wrap">
        <div className="qr-card">
          <div className="qr-who">
            {me && <Avatar player={me} size={52} />}
            <strong>{me?.name || ' '}</strong>
          </div>
          <div className="qr-code">
            <QRCodeSVG
              value={`${window.location.origin}/?p=${playerId}`}
              size={256}
              marginSize={0}
              fgColor="#000000"
              bgColor="#ffffff"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <p className="qr-cap">Scan to add me</p>
        </div>
      </div>

      <p className="center footer-action">
        <button className="link" onClick={onLeave}>
          <IconLogout size={16} /> Leave / switch user
        </button>
      </p>
    </section>
  )
}
