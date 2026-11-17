// Offline fake of the tiny slice of supabase-js that Seshmas uses, backed by localStorage.
// Same-tab listeners are fired directly; other tabs are notified via BroadcastChannel.

const PREFIX = 'seshmas_demo_'
const PLAYER_KEY = 'seshmas_player_id'
const TABLES = ['players', 'scores', 'teams', 'messages']

// ---- storage (localStorage with an in-memory fallback) ----
const memory = {}

function load(table) {
  let raw = null
  try {
    raw = localStorage.getItem(PREFIX + table)
  } catch {
    raw = memory[table] ?? null
  }
  if (raw == null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function save(table, rows) {
  const raw = JSON.stringify(rows)
  try {
    localStorage.setItem(PREFIX + table, raw)
  } catch {
    memory[table] = raw
  }
}

const rowsOf = (table) => load(table) || []

export function resetDemo() {
  for (const t of TABLES) {
    try {
      localStorage.removeItem(PREFIX + t)
    } catch {
      // ignore
    }
    delete memory[t]
  }
  try {
    localStorage.removeItem(PLAYER_KEY)
    // per-conversation "last read" markers written by the Chats UI
    for (const k of Object.keys(localStorage)) if (k.startsWith('seshmas_read_')) localStorage.removeItem(k)
  } catch {
    // ignore
  }
}

// ---- seed data (only when demo storage is empty) ----
function seed() {
  if (load('players') !== null) return
  const now = Date.now()
  const people = [
    { name: 'Ama', snapchat: 'ama.sparkles', instagram: 'ama.okoro', tiktok: 'amaokoro' },
    { name: 'Jordan', snapchat: 'jordan_snow', instagram: 'jordanmakes', tiktok: null },
    { name: 'Priya', snapchat: null, instagram: 'priya.patel', tiktok: 'priyadances' },
    { name: 'Tolu', snapchat: 'tolu.b', instagram: 'tolu_b', tiktok: 'tolub' },
    { name: 'Sam', snapchat: 'samthesnowman', instagram: null, tiktok: null },
  ]
  const players = people.map((p, i) => ({
    id: crypto.randomUUID(),
    ...p,
    team_id: null,
    created_at: new Date(now - (people.length - i) * 60000).toISOString(),
  }))
  const grid = [[1, 5, 1], [5, 1], [1, 1, 1, 5], [5, 5, 1], [1]]
  const scores = []
  players.forEach((p, i) => {
    grid[i].forEach((points, j) => {
      scores.push({
        id: crypto.randomUUID(),
        player_id: p.id,
        points,
        note: null,
        created_at: new Date(now - (30 - i * 3 - j) * 1000).toISOString(),
      })
    })
  })
  save('players', players)
  save('scores', scores)
  save('teams', [])
  save('messages', [])
}

// ---- change notification ----
const listeners = new Set() // { table, cb }
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('seshmas_demo') : null

function fire(table) {
  for (const l of [...listeners]) {
    if (l.table === table) l.cb({ eventType: '*', schema: 'public', table })
  }
}

function notify(table) {
  fire(table)
  try {
    bc?.postMessage({ table })
  } catch {
    // ignore
  }
}

if (bc) {
  bc.onmessage = (e) => {
    if (e.data && e.data.table) fire(e.data.table)
  }
}

// ---- query builder (thenable, lazy like postgrest-js) ----
const pick = (row, cols) => {
  if (!cols || cols === '*') return { ...row }
  const out = {}
  for (const c of cols.split(',').map((s) => s.trim()).filter(Boolean)) out[c] = row[c]
  return out
}

function compare(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  return a < b ? -1 : a > b ? 1 : 0
}

class Builder {
  constructor(table) {
    this.table = table
    this.action = 'select'
    this.cols = '*'
    this.payload = null
    this.filters = []
    this.orderBy = null
    this.limitN = null
    this.mode = 'many' // 'many' | 'single' | 'maybeSingle'
    this.returning = true // select() after insert/delete asks for rows back
  }

  select(cols = '*') {
    this.cols = cols
    if (this.action !== 'select') this.returning = true
    return this
  }

  insert(payload) {
    this.action = 'insert'
    this.payload = payload
    this.returning = false
    return this
  }

  delete() {
    this.action = 'delete'
    this.returning = false
    return this
  }

  eq(col, val) {
    this.filters.push((r) => r[col] === val)
    return this
  }

  in(col, vals) {
    this.filters.push((r) => vals.includes(r[col]))
    return this
  }

  limit(n) {
    this.limitN = n
    return this
  }

  not(col, op, val) {
    if (op === 'is') this.filters.push((r) => (val === null ? r[col] != null : r[col] !== val))
    else if (op === 'eq') this.filters.push((r) => r[col] !== val)
    else throw new Error(`demo client: not(${op}) is not supported`)
    return this
  }

  order(col, { ascending = true } = {}) {
    this.orderBy = { col, ascending }
    return this
  }

  single() {
    this.mode = 'single'
    return this
  }

  maybeSingle() {
    this.mode = 'maybeSingle'
    return this
  }

  async run() {
    const { table } = this
    if (!TABLES.includes(table)) return { data: null, error: { message: `Unknown table "${table}"` } }
    const all = rowsOf(table)
    const match = (r) => this.filters.every((f) => f(r))
    let result
    let changed = false

    if (this.action === 'insert') {
      const incoming = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((p) => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...p,
      }))
      if (table === 'messages') {
        // keep created_at strictly increasing so ordering is stable even for rapid sends
        let last = all.reduce((m, r) => Math.max(m, Date.parse(r.created_at) || 0), 0)
        for (const row of incoming) {
          last = Math.max(Date.parse(row.created_at) || 0, last + 1)
          row.created_at = new Date(last).toISOString()
        }
      }
      for (const row of incoming) {
        if (table === 'players' && !row.name) {
          return { data: null, error: { message: 'null value in column "name" violates not-null constraint' } }
        }
        if (table === 'scores' && (row.player_id == null || row.points == null)) {
          return { data: null, error: { message: 'null value in a required column of "scores"' } }
        }
        if (table === 'messages') {
          const players = rowsOf('players')
          const body = typeof row.body === 'string' ? row.body : ''
          if (!row.sender_id || !row.recipient_id) {
            return { data: null, error: { message: 'null value in a required column of "messages"' } }
          }
          if (body.length < 1 || body.length > 1000) {
            return { data: null, error: { message: 'new row for relation "messages" violates check constraint "messages_body_check"' } }
          }
          if (!players.some((p) => p.id === row.sender_id) || !players.some((p) => p.id === row.recipient_id)) {
            return { data: null, error: { message: 'insert on table "messages" violates foreign key constraint' } }
          }
        }
      }
      save(table, [...all, ...incoming])
      changed = true
      result = incoming
    } else if (this.action === 'delete') {
      const removed = all.filter(match)
      save(table, all.filter((r) => !match(r)))
      if (table === 'players' && removed.length) {
        // mimic "on delete cascade" for scores and messages
        const gone = new Set(removed.map((r) => r.id))
        const msgs = rowsOf('messages')
        const keptMsgs = msgs.filter((m) => !gone.has(m.sender_id) && !gone.has(m.recipient_id))
        if (keptMsgs.length !== msgs.length) {
          save('messages', keptMsgs)
          notify('messages')
        }
        const scores = rowsOf('scores')
        const kept = scores.filter((s) => !gone.has(s.player_id))
        if (kept.length !== scores.length) {
          save('scores', kept)
          notify('scores')
        }
      }
      changed = removed.length > 0
      result = removed
    } else {
      result = all.filter(match)
    }

    if (this.orderBy) {
      const { col, ascending } = this.orderBy
      result = [...result].sort((a, b) => (ascending ? 1 : -1) * compare(a[col], b[col]))
    }

    if (changed) notify(table)

    if (this.action !== 'select' && !this.returning) return { data: null, error: null }

    if (this.limitN != null) result = result.slice(0, this.limitN)

    const rows = result.map((r) => pick(r, this.cols))
    if (this.mode === 'many') return { data: rows, error: null }
    if (rows.length === 1) return { data: rows[0], error: null }
    if (rows.length === 0 && this.mode === 'maybeSingle') return { data: null, error: null }
    return {
      data: null,
      error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' },
    }
  }

  then(resolve, reject) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject)
  }
}

// ---- realtime channel ----
function makeChannel() {
  const mine = []
  const ch = {
    on(type, filter, cb) {
      if (type === 'postgres_changes') mine.push({ table: filter?.table, cb })
      return ch
    },
    subscribe(statusCb) {
      for (const l of mine) listeners.add(l)
      if (statusCb) setTimeout(() => statusCb('SUBSCRIBED'), 0)
      return ch
    },
    _unsubscribe() {
      for (const l of mine) listeners.delete(l)
    },
  }
  return ch
}

seed()

export const demoClient = {
  from: (table) => new Builder(table),
  channel: () => makeChannel(),
  removeChannel: async (ch) => {
    ch?._unsubscribe?.()
    return 'ok'
  },
}
