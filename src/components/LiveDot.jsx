export default function LiveDot({ live }) {
  return (
    <span className={`live ${live ? 'on' : ''}`} title={live ? 'Connected - updates are live' : 'Connecting...'}>
      <i className="live-dot" />
      {live ? 'Live' : 'Connecting'}
    </span>
  )
}
