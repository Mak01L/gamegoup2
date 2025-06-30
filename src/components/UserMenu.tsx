import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ProfileModal from '../modals/ProfileModal';
import MessagingSystem from './MessagingSystem';
import FindFriendsModal from './FindFriendsModal';
import { supabase } from '../lib/supabaseClient';
import { SessionManager } from '../lib/sessionManager';

const UserMenu: React.FC = () => {
  const { authUser, profile } = useUser();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showFindFriends, setShowFindFriends] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleOpenProfile = () => {
      setShowProfile(true);
      setOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('openProfileModal', handleOpenProfile);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('openProfileModal', handleOpenProfile);
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear stored session
      SessionManager.clearStoredSession();
      
      // Force reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Error logging out:', error);
      
      // Fallback: clear session and redirect anyway
      SessionManager.clearStoredSession();
      window.location.href = '/login';
    }
  };

  const handleDonate = () => {
    try {
      window.open('https://www.paypal.com/donate/?business=XXXXXXX&no_recurring=0&currency_code=USD', '_blank');
      setOpen(false);
    } catch (error) {
      console.error('Error opening donation link:', error);
    }
  };

  if (!authUser) return null;

  const displayName = profile?.username || authUser.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || '/default-avatar.png';

  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        <button
          onClick={() => setOpen(prev => !prev)}
          className={`flex items-center gap-2 bg-[#281e46]/[0.85] border border-purple-300 rounded-full px-4 py-1 cursor-pointer text-white font-semibold text-base shadow-md transition-all focus:outline-none ${open ? 'ring-2 ring-purple-400' : ''}`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-8 h-8 rounded-full border-2 border-purple-300 object-cover bg-[#18122B]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
          <span className="truncate max-w-[120px]">{displayName}</span>
        </button>
        
        {open && (
          <div className="absolute right-0 top-12 bg-[#281e46]/[0.97] rounded-xl shadow-lg min-w-[180px] z-50 border border-purple-400/30 p-2 flex flex-col">
            <button
              onClick={() => { 
                setShowProfile(true); 
                setOpen(false); 
              }}
              className="w-full bg-none border-none text-purple-300 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-purple-900/30 focus:outline-none transition-colors"
            >
              👤 View Profile
            </button>
            
            <button
              onClick={() => { 
                setShowMessaging(true); 
                setOpen(false); 
              }}
              className="w-full bg-none border-none text-purple-300 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-purple-900/30 focus:outline-none transition-colors"
            >
              💬 Messages
            </button>
            
            <button
              onClick={() => { 
                setShowFindFriends(true); 
                setOpen(false); 
              }}
              className="w-full bg-none border-none text-purple-300 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-purple-900/30 focus:outline-none transition-colors"
            >
              🤝 Find Friends
            </button>
            
            <button
              onClick={handleDonate}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 border-none text-white font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:from-yellow-600 hover:to-orange-600 focus:outline-none transition-all"
            >
              💖 Donate
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-none border-none text-red-400 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-red-900/30 focus:outline-none transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfile && (
        <ProfileModal 
          onClose={() => setShowProfile(false)} 
          userId={authUser.id} 
        />
      )}
      
      {showMessaging && (
        <MessagingSystem 
          onClose={() => setShowMessaging(false)} 
        />
      )}
      
      {showFindFriends && (
        <FindFriendsModal 
          onClose={() => setShowFindFriends(false)} 
        />
      )}
    </>
  );
};

export default UserMenu;