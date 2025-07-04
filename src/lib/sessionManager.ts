import { AUTH_CONFIG } from './authConfig';

// Session management utilities
export const SessionManager = {
  // Check if there's a stored session in localStorage
  hasStoredSession(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const authToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      return authToken !== null && authToken !== 'undefined';
    } catch (error) {
      console.error('Error checking stored session:', error);
      return false;
    }
  },

  // Get session info from localStorage
  getStoredSessionInfo(): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const authToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      if (authToken && authToken !== 'undefined') {
        return JSON.parse(authToken);
      }
    } catch (error) {
      console.error('Error parsing stored session:', error);
    }
    return null;
  },

  // Clear stored session
  clearStoredSession(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
      localStorage.removeItem('sb-xzdyauqqvbsusrnovzhs-auth-token'); // Default Supabase key
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('🧹 Cleared stored session');
      }
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  },

  // Debug: Log all auth-related localStorage items
  debugStoredSessions(): void {
    if (typeof window === 'undefined') return;
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🔍 Debug: Stored sessions');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase'))) {
          console.log(`  ${key}:`, localStorage.getItem(key));
        }
      }
    }
  }
};