import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './authConfig';

// Auto-configured values from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzdyauqqvbsusrnovzhs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZHlhdXFxdmJzdXNybm92emhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzUwMjUsImV4cCI6MjA2NjM1MTAyNX0.C4P0_T-8ueu66ivqEuilLU-g_C0LsznYTk1rspfxDyo';

// Connection status
export const CONNECTION_STATUS = {
  UNKNOWN: 'unknown',
  CONNECTING: 'connecting', 
  CONNECTED: 'connected',
  ERROR: 'error'
};

let connectionStatus = CONNECTION_STATUS.UNKNOWN;

// Function to create a Supabase client with persistent sessions
export function createSupabaseClient(): SupabaseClient {
  console.log('🔧 Creating Supabase client with URL:', SUPABASE_URL);
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: AUTH_CONFIG.SUPABASE_AUTH_OPTIONS,
    global: {
      headers: {
        'X-Client-Info': 'gamegoup-web'
      }
    }
  });
}

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    connectionStatus = CONNECTION_STATUS.CONNECTING;
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('user_id').limit(1);
    
    if (error) {
      connectionStatus = CONNECTION_STATUS.ERROR;
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    connectionStatus = CONNECTION_STATUS.CONNECTED;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    connectionStatus = CONNECTION_STATUS.ERROR;
    console.error('💥 Supabase connection failed:', err);
    return false;
  }
}

// Get current connection status
export function getConnectionStatus() {
  return connectionStatus;
}

// Mutable export for the current client instance
export let supabase = createSupabaseClient();

// Test connection on client creation
testSupabaseConnection();

// Helper to re-initialize the client
export function reinitSupabaseClient() {
  supabase = createSupabaseClient();
}