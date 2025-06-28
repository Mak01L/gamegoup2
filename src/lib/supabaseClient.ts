import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xzdyauqqvbsusrnovzhs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZHlhdXFxdmJzdXNybm92emhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzUwMjUsImV4cCI6MjA2NjM1MTAyNX0.C4P0_T-8ueu66ivqEuilLU-g_C0LsznYTk1rspfxDyo';

// Function to create a Supabase client with the correct storage
export function createSupabaseClient(): SupabaseClient {
  const rememberMe = typeof window !== 'undefined' && window.localStorage.getItem('rememberMe') === 'true';
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Mutable export for the current client instance
export let supabase = createSupabaseClient();

// Helper to re-initialize the client (call after changing rememberMe)
export function reinitSupabaseClient() {
  supabase = createSupabaseClient();
}
