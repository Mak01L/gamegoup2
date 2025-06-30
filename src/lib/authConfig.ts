// Authentication configuration
export const AUTH_CONFIG = {
  // Session persistence settings
  STORAGE_KEY: 'gamegoup-auth-token',
  LOADING_TIMEOUT: 10000, // 10 seconds
  
  // Supabase auth options
  SUPABASE_AUTH_OPTIONS: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    storageKey: 'gamegoup-auth-token',
    debug: false
  },
  
  // Session restoration settings
  RESTORE_SESSION: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    profileLoadDelay: 100 // 100ms delay before loading profile
  }
};