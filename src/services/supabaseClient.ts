import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnburxmyrhzjdpzyhqvy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnVyeG15cmh6amRwenlocXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDQ3NDcsImV4cCI6MjEwMjIyMDc0N30.06anmyCEczHdYwxV2l4wthm_3o40ardtIanuPdeCPkE';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co'
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
