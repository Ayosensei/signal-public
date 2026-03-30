import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkqgdzkwewlyydopvzjf.supabase.co'
const supabaseKey = 'sb_publishable_b6XdoWbyC7b2PAZzA1uQEQ_6Tbp1mIz'

export const supabase = createClient(supabaseUrl, supabaseKey)
