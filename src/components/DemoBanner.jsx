import { resetDemo } from '../demoClient'

export default function DemoBanner() {
  function reset() {
    resetDemo()
    window.location.assign('/')
  }
  return (
    <div className="demo-banner">
      <span>Demo mode &middot; data stays in this browser</span>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
