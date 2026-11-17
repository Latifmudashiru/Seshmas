import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Avatar from './Avatar'
import { IconBack, IconSend } from './Icons'
import { clock, dayLabel, sameDay } from '../time'
import { supabase } from '../supabase'

const GAP_LABEL = 15 * 60 * 1000
const GAP_GROUP = 3 * 60 * 1000

const ts = (m) => Date.parse(m.created_at) || 0

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

const LUXURY_REPLIES = [
  "Looking forward to SeshMas tonight. What time are you arriving?",
  "Confirmed! Let's connect at the main reception lounge.",
  "Great to hear from you. The gala atmosphere is incredible.",
  "See you there shortly.",
  "Let's link up near the mezzanine area.",
  "Sounds great. Looking forward to the evening.",
]

export default function Chat({ me, peerId, inbox, onBack, onOpenProfile }) {
  const { playerById, threads, markRead, send } = inbox
  const peer = playerById[peerId]
  const messages = useMemo(() => threads[peerId] || [], [threads, peerId])
  const items = useMemo(() => buildItems(messages, me), [messages, me])

  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const lastCount = useRef(0)

  const newestIncoming = messages.reduce((m, x) => (x.sender_id === peerId ? Math.max(m, ts(x)) : m), 0)
  useEffect(() => {
    markRead(peerId, newestIncoming)
  }, [markRead, peerId, newestIncoming])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (lastCount.current === 0) el.scrollTop = el.scrollHeight
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    lastCount.current = messages.length
  }, [messages.length, isTyping])

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

  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [text])

  const body = text.trim()

  async function triggerMockReply() {
    setIsTyping(true)
    const replyDelay = 1400 + Math.random() * 800

    setTimeout(async () => {
      setIsTyping(false)
      const randomReply = LUXURY_REPLIES[Math.floor(Math.random() * LUXURY_REPLIES.length)]
      try {
        await supabase
          .from('messages')
          .insert({ sender_id: peerId, recipient_id: me, body: randomReply })
      } catch {
        // ignore
      }
    }, replyDelay)
  }

  async function submit() {
    if (!body) return
    const currentBody = body
    setText('')
    setError('')
    const { error: err } = await send(peerId, currentBody)
    if (err) {
      setText(currentBody)
      setError(err.message || 'Could not deliver message.')
    } else {
      triggerMockReply()
    }
    inputRef.current?.focus()
  }

  function sendQuickReply(quickText) {
    setText(quickText)
    setTimeout(() => {
      submit()
    }, 50)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const peerForAvatar = peer || { id: peerId, name: 'Guest' }

  return (
    <div className="chat" ref={rootRef}>
      {/* Header */}
      <header className="overlay-head">
        <button className="btn-icon" onClick={onBack} aria-label="Back">
          <IconBack size={22} />
        </button>
        <button className="chat-who" onClick={() => onOpenProfile(peerId)}>
          <div style={{ position: 'relative' }}>
            <Avatar player={peerForAvatar} size={38} />
            <span className="guest-status-indicator online" style={{ width: 8, height: 8 }} />
          </div>
          <span>
            <strong className="chat-header-name">{peer?.name || 'Guest'}</strong>
            <small className="chat-status-sub">
              {isTyping ? 'Typing...' : 'View Profile'}
            </small>
          </span>
        </button>
        <div style={{ width: 44 }} />
      </header>

      {/* Messages Scroll Area */}
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {!messages.length && (
            <div className="chat-empty">
              <Avatar player={peerForAvatar} size={72} />
              <h2 className="chat-empty-title">Conversation with {peer?.name || 'Guest'}</h2>
              <p className="chat-empty-desc">Direct private messaging for SeshMas attendees.</p>

              <div className="chat-quick-starters">
                <button
                  type="button"
                  className="quick-starter-pill"
                  onClick={() => sendQuickReply("Are you attending the gala reception?")}
                >
                  "Are you attending the gala reception?"
                </button>
                <button
                  type="button"
                  className="quick-starter-pill"
                  onClick={() => sendQuickReply("Let's connect at the main lounge.")}
                >
                  "Let's connect at the main lounge."
                </button>
              </div>
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
                <div className="bubble" title={clock(ts(it.m))}>
                  {it.m.body}
                </div>
              </div>
            ),
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="bubble-row theirs first last">
              <div className="bubble chat-typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Quick Responses */}
      {messages.length > 0 && (
        <div className="chat-quick-reactions">
          <button type="button" onClick={() => sendQuickReply('See you there.')}>See you there</button>
          <button type="button" onClick={() => sendQuickReply('On my way.')}>On my way</button>
          <button type="button" onClick={() => sendQuickReply('Sounds good.')}>Sounds good</button>
        </div>
      )}

      {/* Composer */}
      <div className="composer">
        {error && <p className="error small composer-error" role="alert">{error}</p>}
        <div className="composer-row">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={1000}
            placeholder={`Message ${peer?.name || 'attendee'}...`}
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
