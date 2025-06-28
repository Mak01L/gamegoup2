import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

export const useUserPresence = () => {
  const { authUser } = useUser();

  useEffect(() => {
    if (!authUser) return;

    // Update user status to online when component mounts
    const updatePresence = async (status: 'online' | 'offline') => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: authUser.id,
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    };

    // Set user as online
    updatePresence('online');

    // Update presence every 30 seconds
    const interval = setInterval(() => {
      updatePresence('online');
    }, 30000);

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('offline');
      } else {
        updatePresence('online');
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence('offline');
    };
  }, [authUser]);
};

export default useUserPresence;