import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabaseClient';

const ProfileCompletionBanner: React.FC = () => {
  const { authUser, profile } = useUser();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!authUser || dismissed) return;

    const checkProfileCompletion = async () => {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username, bio, country, game_tags')
          .eq('user_id', authUser.id)
          .single();

        // Show banner if profile is incomplete
        const isIncomplete = !userProfile || 
          !userProfile.username || 
          userProfile.username.startsWith('User_') ||
          (!userProfile.bio && !userProfile.country && !userProfile.game_tags);

        setShowBanner(isIncomplete);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setShowBanner(true); // Show banner if there's an error (likely no profile)
      }
    };

    checkProfileCompletion();
  }, [authUser, profile, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  const handleCompleteProfile = () => {
    // This will be handled by the parent component (UserMenu)
    const event = new CustomEvent('openProfileModal');
    window.dispatchEvent(event);
    handleDismiss();
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg shadow-lg border border-orange-400 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">👤</div>
          <div>
            <div className="font-semibold text-sm">Complete Your Profile!</div>
            <div className="text-xs opacity-90">
              Add your username, bio, and favorite games to connect with other players
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCompleteProfile}
            className="bg-white text-orange-600 px-3 py-1 rounded-md text-xs font-semibold hover:bg-orange-50 transition-colors"
          >
            Complete Profile
          </button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-orange-200 text-lg font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;