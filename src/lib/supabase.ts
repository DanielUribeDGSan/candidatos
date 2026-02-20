import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://adsjwkdhfjpcrhqsjezz.supabase.co'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_v69cNViHMfA1aDWphcDxPg_3-Ml0IIR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
