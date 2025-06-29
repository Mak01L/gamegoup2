import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UserContextType {
  authUser: any;
  profile: any;
  setAuthUser: (user: any) => void;
  setProfile: (profile: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al montar, intenta restaurar sesión de Supabase
    const restoreSession = async () => {
      try {
        console.log('Restoring session...');
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        const session = data.session;
        
        if (session?.user) {
          console.log('Session found:', session.user.email);
          setAuthUser(session.user);
          
          // Busca el perfil asociado (no bloquea si falla)
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              if (profileData) {
                console.log('Profile found:', profileData);
                setProfile(profileData);
              }
            } catch (error) {
              console.log('Profile not found, will be created when needed');
            }
          }, 100);
        } else {
          console.log('No session found');
          setAuthUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Exception in restoreSession:', error);
      } finally {
        setLoading(false);
      }
    };
    
    restoreSession();
    
    // Suscribirse a cambios de sesión (login/logout cross-tab)
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
    };
  }, []);

  return (
    <UserContext.Provider value={{ authUser, profile, setAuthUser, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};