import { useState, useCallback, useMemo } from 'react'
import { supabase } from './supabase'
import { useLive } from './useLive'
import { INITIAL_TEAMS } from './mockData'

export function useTeams(playerId) {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [scores, setScores] = useState([])
  const [loaded, setLoaded] = useState(false)

  const refetch = useCallback(async () => {
    const [tRes, pRes, sRes] = await Promise.all([
      supabase.from('teams').select('*'),
      supabase.from('players').select('*'),
      supabase.from('scores').select('*'),
    ])

    // Fallback if teams table is empty
    let teamData = tRes.data || []
    if (!teamData.length) {
      teamData = INITIAL_TEAMS.map((it) => ({
        id: it.id,
        name: it.name,
        color: it.color,
        max_members: it.maxMembers,
        drinker_id: null,
      }))
    }

    setTeams(teamData)
    setPlayers(pRes.data || [])
    setScores(sRes.data || [])
    setLoaded(true)
  }, [])

  useLive(['teams', 'players', 'scores'], refetch)

  // Current player
  const me = useMemo(() => players.find((p) => p.id === playerId) || null, [players, playerId])
  const myTeamId = me?.team_id || null

  // Player totals map
  const playerScores = useMemo(() => {
    const map = {}
    for (const s of scores) {
      map[s.player_id] = (map[s.player_id] || 0) + s.points
    }
    return map
  }, [scores])

  // Enhanced teams with members, scores, and drinker info
  const enrichedTeams = useMemo(() => {
    return teams.map((team) => {
      const members = players
        .filter((p) => p.team_id === team.id)
        .map((p) => ({
          ...p,
          points: playerScores[p.id] || 0,
          isDrinker: team.drinker_id === p.id,
        }))
        .sort((a, b) => b.points - a.points)

      const totalPoints = members.reduce((sum, m) => sum + m.points, 0)
      const maxMembers = team.max_members || 6
      const isFull = members.length >= maxMembers
      const isMyTeam = team.id === myTeamId
      const drinker = members.find((m) => m.id === team.drinker_id) || null

      return {
        ...team,
        members,
        memberCount: members.length,
        maxMembers,
        isFull,
        isMyTeam,
        totalPoints,
        drinker,
      }
    }).sort((a, b) => b.totalPoints - a.totalPoints)
  }, [teams, players, playerScores, myTeamId])

  // Join or switch team
  const joinTeam = useCallback(
    async (teamId) => {
      const targetTeam = enrichedTeams.find((t) => t.id === teamId)
      if (!targetTeam) return { error: 'Team not found' }
      if (targetTeam.isFull && targetTeam.id !== myTeamId) {
        return { error: 'This team has reached its capacity limit (6/6).' }
      }

      const { error } = await supabase
        .from('players')
        .update({ team_id: teamId })
        .eq('id', playerId)

      if (!error) {
        // If team had no dedicated drinker, automatically assign first joiner
        if (!targetTeam.drinker_id) {
          await supabase.from('teams').update({ drinker_id: playerId }).eq('id', teamId)
        }
      }
      return { error }
    },
    [enrichedTeams, myTeamId, playerId],
  )

  // Designate dedicated drinker
  const setDedicatedDrinker = useCallback(
    async (teamId, targetPlayerId) => {
      const { error } = await supabase
        .from('teams')
        .update({ drinker_id: targetPlayerId })
        .eq('id', teamId)
      return { error }
    },
    [],
  )

  // Claim a shot forfeit (+2 points back)
  const claimForfeitShot = useCallback(
    async (roundLabel = 'Game Round') => {
      if (!playerId) return { error: 'Not joined' }
      const { error } = await supabase.from('scores').insert({
        player_id: playerId,
        points: 2,
        note: `Forfeit Shot · ${roundLabel}`,
      })
      return { error }
    },
    [playerId],
  )

  return {
    teams: enrichedTeams,
    myTeam: enrichedTeams.find((t) => t.isMyTeam) || null,
    me,
    loaded,
    joinTeam,
    setDedicatedDrinker,
    claimForfeitShot,
  }
}
