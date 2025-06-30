import React, { useRef, useState } from 'react';

interface FriendCardProps {
  profile: {
    username: string;
    country: string;
    city: string;
    gameTags: string[];
    interests: string[];
    connectionType: string;
    bio: string;
    socialLinks: { type: string; url: string }[];
    avatarUrl?: string;
  };
  onLike: () => void;
  onPass: () => void;
}

const SWIPE_THRESHOLD = 120;

const FriendCard: React.FC<FriendCardProps> = ({ profile, onLike, onPass }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });
  const [animating, setAnimating] = useState(false);

  // Touch/mouse events
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (animating) return;
    setDrag({ x: getX(e), y: getY(e), isDragging: true });
  };
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drag.isDragging || animating) return;
    const dx = getX(e) - drag.x;
    const dy = getY(e) - drag.y;
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 15}deg)`;
    }
  };
  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drag.isDragging || animating) return;
    const dx = getX(e) - drag.x;
    setDrag({ ...drag, isDragging: false });
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      setAnimating(true);
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.4s cubic-bezier(.68,-0.55,.27,1.55)';
        cardRef.current.style.transform = `translate(${dx > 0 ? 1000 : -1000}px, 0) rotate(${dx > 0 ? 45 : -45}deg)`;
      }
      setTimeout(() => {
        if (dx > 0) onLike();
        else onPass();
        resetCard();
      }, 400);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s';
        cardRef.current.style.transform = 'translate(0,0)';
      }
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = '';
      }, 300);
    }
  };
  const resetCard = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = '';
      cardRef.current.style.transform = '';
    }
    setAnimating(false);
  };
  function getX(e: any) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }
  function getY(e: any) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  return (
    <div
      ref={cardRef}
      className="max-w-md mx-auto bg-[#18122B] rounded-2xl shadow-2xl p-6 border border-purple-700 flex flex-col items-center text-white font-inter select-none cursor-grab touch-none"
      style={{ userSelect: 'none' }}
      onMouseDown={handleDragStart}
      onMouseMove={drag.isDragging ? handleDragMove : undefined}
      onMouseUp={handleDragEnd}
      onMouseLeave={drag.isDragging ? handleDragEnd : undefined}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      tabIndex={0}
      aria-label="Friend profile card. Swipe right to connect, left to pass."
    >
      <img
        src={profile.avatarUrl || '/avatars/avatar1.png'}
        alt="avatar"
        className="w-24 h-24 rounded-full border-4 border-purple-400 mb-3"
      />
      <div className="text-2xl font-bold text-purple-200">{profile.username}</div>
      <div className="text-sm text-purple-400 mb-2">{profile.country}, {profile.city}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {profile.gameTags.map(tag => (
          <span key={tag} className="bg-purple-800 text-purple-200 px-3 py-1 rounded-full text-xs">{tag}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {profile.interests.map(interest => (
          <span key={interest} className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full text-xs">{interest}</span>
        ))}
      </div>
      <div className="mb-2 text-xs text-green-400">{profile.connectionType}</div>
      <div className="mb-3 text-center text-sm text-gray-200">{profile.bio}</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {profile.socialLinks.map(link => (
          <a
            key={link.type}
            href={link.url}
            className="text-xs underline text-purple-300 hover:text-purple-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.type}
          </a>
        ))}
      </div>
      <div className="flex gap-6 mt-2">
        <button
          onClick={() => { if (!animating) onPass(); }}
          className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-2 rounded-xl font-bold shadow hover:from-gray-600 hover:to-gray-800 transition-all"
          aria-label="Pass"
        >
          ❌ Pass
        </button>
        <button
          onClick={() => { if (!animating) onLike(); }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow hover:from-green-600 hover:to-blue-600 transition-all"
          aria-label="Like"
        >
          💚 Connect
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2">Swipe right to connect, left to pass</div>
    </div>
  );
};

export default FriendCard;
