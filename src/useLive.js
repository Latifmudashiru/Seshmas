import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Calls `refetch` now and whenever any of `tables` changes. Returns true once the channel is SUBSCRIBED.
export function useLive(tables, refetch) {
  const [live, setLive] = useState(false)

  useEffect(() => {
    refetch()
    let channel = supabase.channel('seshmas-' + tables.join('-') + '-' + Math.random().toString(36).slice(2))
    for (const table of tables) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => refetch())
    }
    channel.subscribe((status) => setLive(status === 'SUBSCRIBED'))
    return () => {
      supabase.removeChannel(channel)
    }
    // run once on mount; refetch/tables are stable for our callers
  }, [])

  return live
}
