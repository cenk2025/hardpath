import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjexclnomzfsrvlsfnut.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXhjbG5vbXpmc3J2bHNmbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTg2MjQsImV4cCI6MjA4NzE5NDYyNH0.eGs2e0RnefVDl_lNISsSIkFq0GC7_lXLckprkjTspWA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
