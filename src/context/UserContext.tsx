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

  useEffect(() => {
    // Al montar, intenta restaurar sesión de Supabase (NO localStorage manual)
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthUser(session.user);
        // Busca el perfil asociado
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (profileData) setProfile(profileData);
      } else {
        setAuthUser(null);
        setProfile(null);
      }
    };
    restoreSession();
    // Suscribirse a cambios de sesión (login/logout cross-tab)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => { if (data) setProfile(data); });
      } else {
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
