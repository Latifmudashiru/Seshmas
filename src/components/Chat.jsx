import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Avatar from './Avatar'
import { IconBack, IconSend } from './Icons'
import { clock, dayLabel, sameDay } from '../time'

const GAP_LABEL = 15 * 60 * 1000 // show a centered timestamp after this much silence
const GAP_GROUP = 3 * 60 * 1000 // bubbles closer than this from the same sender are grouped

const ts = (m) => Date.parse(m.created_at) || 0

// Flatten messages into separators + bubbles, with first/last-in-group flags.
function buildItems(messages, me) {
  const items = []
  let prev = null
  messages.forEach((m, i) => {
    const t = ts(m)
    if (!prev || !sameDay(ts(prev), t)) items.push({ type: 'sep', key: 'd' + m.id, label: `${dayLabel(t)} · ${clock(t)}` })
    else if (t - ts(prev) > GAP_LABEL) items.push({ type: 'sep', key: 't' + m.id, label: clock(t) })
    const breakBefore = items[items.length - 1].type === 'sep'
    const next = messages[i + 1]
    const breakAfter = !next || next.sender_id !== m.sender_id || ts(next) - t > GAP_GROUP || !sameDay(t, ts(next))
    const joinPrev = !breakBefore && prev.sender_id === m.sender_id && t - ts(prev) <= GAP_GROUP
    items.push({ type: 'msg', key: m.id, m, mine: m.sender_id === me, first: !joinPrev, last: breakAfter })
    prev = m
  })
  return items
}

export default function Chat({ me, peerId, inbox, onBack, onOpenProfile }) {
  const { playerById, threads, markRead, send } = inbox
  const peer = playerById[peerId]
  const messages = useMemo(() => threads[peerId] || [], [threads, peerId])
  const items = useMemo(() => buildItems(messages, me), [messages, me])

  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const lastCount = useRef(0)

  // Mark everything incoming as read while this chat is open.
  const newestIncoming = messages.reduce((m, x) => (x.sender_id === peerId ? Math.max(m, ts(x)) : m), 0)
  useEffect(() => {
    markRead(peerId, newestIncoming)
  }, [markRead, peerId, newestIncoming])

  // Stick to the bottom: instantly on open, smoothly for new messages.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (lastCount.current === 0) el.scrollTop = el.scrollHeight
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    lastCount.current = messages.length
  }, [messages.length])

  // Keep the layout above the on-screen keyboard (iOS keeps the layout viewport tall, so track the visual one).
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const fit = () => {
      rootRef.current?.style.setProperty('--vvh', `${vv.height}px`)
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      window.scrollTo(0, 0)
    }
    vv.addEventListener('resize', fit)
    return () => vv.removeEventListener('resize', fit)
  }, [])

  // Auto-grow the textarea up to ~5 lines.
  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [text])

  const body = text.trim()

  async function submit() {
    if (!body) return
    setText('')
    setError('')
    const { error } = await send(peerId, body)
    if (error) {
      setText(body)
      setError(error.message || 'Could not send that message.')
    }
    inputRef.current?.focus()
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const peerForAvatar = peer || { id: peerId, name: '?' }

  return (
    <div className="chat" ref={rootRef}>
      <header className="overlay-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back"><IconBack size={22} /></button>
        <button className="chat-who" onClick={() => onOpenProfile(peerId)}>
          <Avatar player={peerForAvatar} size={38} />
          <span>
            <strong>{peer?.name || 'Someone'}</strong>
            <small>View profile</small>
          </span>
        </button>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {!messages.length && (
            <div className="chat-empty">
              <Avatar player={peerForAvatar} size={72} />
              <h2>Say hi to {peer?.name || 'them'}</h2>
              <p>Messages here are just between the two of you.</p>
            </div>
          )}
          {items.map((it) =>
            it.type === 'sep' ? (
              <div className="time-sep" key={it.key}>{it.label}</div>
            ) : (
              <div
                key={it.key}
                className={`bubble-row ${it.mine ? 'mine' : 'theirs'} ${it.first ? 'first' : ''} ${it.last ? 'last' : ''}`}
              >
                <div className="bubble" title={clock(ts(it.m))}>{it.m.body}</div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="composer">
        {error && <p className="error small composer-error" role="alert">{error}</p>}
        <div className="composer-row">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={1000}
            placeholder={`Message ${peer?.name || ''}`.trim()}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            enterKeyHint="send"
            aria-label="Message"
          />
          <button
            className="send"
            disabled={!body}
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            aria-label="Send"
          >
            <IconSend size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
