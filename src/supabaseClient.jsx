// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nhwxighofwbyxzdxsliv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5od3hpZ2hvZndieXh6ZHhzbGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzcyODgsImV4cCI6MjA1MDk1MzI4OH0.xPCL1xs-52pcZNDv2DIfC8C8rlI5Zkd0qObzwhXfBc4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase