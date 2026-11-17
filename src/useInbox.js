import { useCallback, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'
import { useLive } from './useLive'

const readsKey = (me) => `seshmas_read_${me}`

function loadReads(me) {
  try {
    return JSON.parse(localStorage.getItem(readsKey(me))) || {}
  } catch {
    return {}
  }
}

const ts = (m) => Date.parse(m.created_at) || 0

// Union of message lists by id, oldest first.
function merge(prev, ...lists) {
  const map = new Map(prev.map((m) => [m.id, m]))
  for (const list of lists) for (const m of list || []) map.set(m.id, m)
  return [...map.values()].sort((a, b) => ts(a) - ts(b))
}

// All of the viewer's DMs, grouped into conversations, with unread tracking ("last read" lives in localStorage).
export function useInbox(me) {
  const [players, setPlayers] = useState([])
  const [messages, setMessages] = useState([])
  const [reads, setReads] = useState(() => loadReads(me))
  const readsRef = useRef(reads)

  // Two plain eq() queries (sent + received) instead of an or() filter, so the demo client needs nothing fancy.
  const live = useLive(['messages', 'players'], async () => {
    const [p, sent, recv] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('messages').select('*').eq('sender_id', me),
      supabase.from('messages').select('*').eq('recipient_id', me),
    ])
    setPlayers(p.data || [])
    setMessages((prev) => merge(prev, sent.data, recv.data))
  })

  const playerById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players])

  const { threads, conversations, unreadByPeer, unreadTotal } = useMemo(() => {
    const threads = {}
    for (const m of messages) {
      const peer = m.sender_id === me ? m.recipient_id : m.sender_id
      ;(threads[peer] ||= []).push(m)
    }
    const unreadByPeer = {}
    let unreadTotal = 0
    for (const [peer, list] of Object.entries(threads)) {
      const since = reads[peer] || 0
      const n = list.filter((m) => m.sender_id === peer && ts(m) > since).length
      if (n) {
        unreadByPeer[peer] = n
        unreadTotal += n
      }
    }
    const conversations = Object.entries(threads)
      .map(([peer, list]) => ({ peer, last: list[list.length - 1], unread: unreadByPeer[peer] || 0 }))
      .sort((a, b) => ts(b.last) - ts(a.last))
    return { threads, conversations, unreadByPeer, unreadTotal }
  }, [messages, reads, me])

  // Call with the timestamp of the newest incoming message the user has now seen.
  const markRead = useCallback(
    (peer, upTo) => {
      if (!upTo || upTo <= (readsRef.current[peer] || 0)) return
      const next = { ...readsRef.current, [peer]: upTo }
      readsRef.current = next
      setReads(next)
      try {
        localStorage.setItem(readsKey(me), JSON.stringify(next))
      } catch {
        // ignore
      }
    },
    [me],
  )

  const send = useCallback(
    async (peer, body) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: me, recipient_id: peer, body })
        .select()
        .single()
      if (error) return { error }
      setMessages((prev) => merge(prev, [data]))
      return { error: null }
    },
    [me],
  )

  return { live, playerById, threads, conversations, unreadByPeer, unreadTotal, markRead, send }
}
