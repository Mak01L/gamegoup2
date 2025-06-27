import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ProfileModal from '../modals/ProfileModal';
import { supabase } from '../lib/supabaseClient';

const UserMenu: React.FC = () => {
  const { authUser, profile } = useUser();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!authUser || !profile) return null;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 bg-[#281e46]/[0.85] border border-purple-300 rounded-full px-4 py-1 cursor-pointer text-white font-semibold text-base shadow-md transition-all focus:outline-none ${open ? 'ring-2 ring-purple-400' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <img
          src={profile.avatar_url || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full border-2 border-purple-300 object-cover bg-[#18122B]"
        />
        <span className="truncate max-w-[120px]">{profile.username || authUser.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 bg-[#281e46]/[0.97] rounded-xl shadow-lg min-w-[180px] z-20 border border-purple-400/30 p-2 flex flex-col">
          <button
            onClick={() => { setShowProfile(true); setOpen(false); }}
            className="w-full bg-none border-none text-purple-300 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-purple-900/30 focus:outline-none"
          >
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-none border-none text-red-400 font-semibold text-base py-2 rounded-md cursor-pointer text-left hover:bg-red-900/30 focus:outline-none"
          >
            Logout
          </button>
        </div>
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} userId={authUser.id} />}
    </div>
  );
};

export default UserMenu;
