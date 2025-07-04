import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SessionManager } from '../lib/sessionManager';
import { AUTH_CONFIG } from '../lib/authConfig';

interface UserContextType {
  authUser: any;
  profile: any;
  loading: boolean;
  setAuthUser: (user: any) => void;
  setProfile: (profile: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, stopping loading state');
      setLoading(false);
    }, AUTH_CONFIG.LOADING_TIMEOUT);
    
    // On mount, try to restore Supabase session
    const restoreSession = async () => {
      try {
        console.log('🔄 Restoring session...');
        setLoading(true);
        
        // Debug stored sessions
        SessionManager.debugStoredSessions();
        
        // Check if we have a stored session
        const hasStored = SessionManager.hasStoredSession();
        console.log('💾 Has stored session:', hasStored);
        
        // First check if there's a stored session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }
        
        const session = data.session;
        
        if (session?.user) {
          console.log('✅ Session restored for:', session.user.email);
          setAuthUser(session.user);
          
          // Load profile asynchronously
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (profileData) {
              console.log('👤 Profile loaded:', profileData.username || 'No username');
              setProfile(profileData);
            } else {
              console.log('👤 No profile found, will be created when needed');
            }
          } catch (profileError) {
            console.log('👤 Profile will be created when needed');
          }
        } else {
          console.log('❌ No session found');
          setAuthUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('💥 Exception in restoreSession:', error);
      } finally {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };
    
    restoreSession();
    
    // Subscribe to session changes (login/logout cross-tab)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        console.log('User logged in:', session.user.email);
        setAuthUser(session.user);
        
        // Load profile asynchronously without blocking
        setTimeout(async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (data) {
              console.log('Profile loaded on auth change:', data);
              setProfile(data);
            }
          } catch (error) {
            console.log('Profile will be created when needed');
          }
        }, 100);
      } else {
        console.log('User logged out');
        setAuthUser(null);
        setProfile(null);
      }
    });
    
    return () => {
      listener?.subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <UserContext.Provider value={{ authUser, profile, loading, setAuthUser, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};