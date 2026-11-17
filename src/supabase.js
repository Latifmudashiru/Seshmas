import { createClient } from '@supabase/supabase-js'
import { demoClient } from './demoClient'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Without Supabase env vars the app runs in offline demo mode (data lives in localStorage).
export const DEMO_MODE = !(url && key)
export const supabase = DEMO_MODE ? demoClient : createClient(url, key)
export const PARTY_CODE = import.meta.env.VITE_PARTY_CODE || 'SESHMAS'
