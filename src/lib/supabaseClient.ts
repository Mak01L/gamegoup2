import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './authConfig';

// Hardcoded values for development
const SUPABASE_URL = 'https://xzdyauqqvbsusrnovzhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZHlhdXFxdmJzdXNybm92emhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzUwMjUsImV4cCI6MjA2NjM1MTAyNX0.C4P0_T-8ueu66ivqEuilLU-g_C0LsznYTk1rspfxDyo';

// Function to create a Supabase client with persistent sessions
export function createSupabaseClient(): SupabaseClient {
  console.log('Creating Supabase client with URL:', SUPABASE_URL);
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: AUTH_CONFIG.SUPABASE_AUTH_OPTIONS,
    global: {
      headers: {
        'X-Client-Info': 'gamegoup-web'
      }
    }
  });
}

// Mutable export for the current client instance
export let supabase = createSupabaseClient();

// Helper to re-initialize the client
export function reinitSupabaseClient() {
  supabase = createSupabaseClient();
}