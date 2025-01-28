// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mavyhzsvvmykletifxvp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdnloenN2dm15a2xldGlmeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTU3NjUsImV4cCI6MjA1MzU3MTc2NX0.TofUGiWDIsF3KTf_Qs8iNC7pFB7EP4fPM6WIW50zItA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase