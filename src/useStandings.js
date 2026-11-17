import { useState } from 'react'
import { supabase } from './supabase'
import { useLive } from './useLive'

// Players + score totals, ranked highest first. Re-fetches whenever players or scores change.
export function useStandings() {
  const [players, setPlayers] = useState([])
  const [scores, setScores] = useState([])
  const [loaded, setLoaded] = useState(false)

  const live = useLive(['players', 'scores'], async () => {
    const [p, s] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('scores').select('player_id, points'),
    ])
    setPlayers(p.data || [])
    setScores(s.data || [])
    setLoaded(true)
  })

  const totals = {}
  for (const s of scores) totals[s.player_id] = (totals[s.player_id] || 0) + s.points
  const ranked = players
    .map((p) => ({ ...p, total: totals[p.id] || 0 }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  ranked.forEach((p, i) => (p.rank = i + 1))

  return { ranked, loaded, live }
}
