import React, { useState } from 'react';
import Tooltip from './Tooltip';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = true,
  animated = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityGlow = {
    common: 'shadow-gray-500/50',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/50'
  };

  const isUnlocked = !!achievement.unlockedAt;
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  const tooltipContent = (
    <div className="text-center">
      <div className="font-bold text-white mb-1">{achievement.title}</div>
      <div className="text-gray-300 text-xs mb-2">{achievement.description}</div>
      {showProgress && achievement.progress !== undefined && achievement.maxProgress && (
        <div className="text-xs">
          Progress: {achievement.progress}/{achievement.maxProgress}
        </div>
      )}
      {achievement.unlockedAt && (
        <div className="text-xs text-green-400 mt-1">
          Unlocked: {achievement.unlockedAt.toLocaleDateString()}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <div
        className={`
          relative ${sizeClasses[size]} cursor-pointer
          ${animated ? 'transition-all duration-300 ease-out' : ''}
          ${isHovered && animated ? 'transform scale-110' : ''}
          ${onClick ? 'hover:scale-105' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge background */}
        <div
          className={`
            w-full h-full rounded-full
            bg-gradient-to-br ${rarityColors[achievement.rarity]}
            ${isUnlocked ? '' : 'grayscale opacity-50'}
            ${animated ? 'transition-all duration-300' : ''}
            ${isHovered ? `shadow-2xl ${rarityGlow[achievement.rarity]}` : 'shadow-lg'}
            flex items-center justify-center
            border-2 border-white/20
          `}
        >
          {/* Achievement icon */}
          <span className={`text-2xl ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {achievement.icon}
          </span>
        </div>

        {/* Progress ring */}
        {showProgress && achievement.progress !== undefined && achievement.maxProgress && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className={animated ? 'transition-all duration-500' : ''}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Unlock animation */}
        {isUnlocked && animated && isHovered && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}

        {/* New badge indicator */}
        {isUnlocked && achievement.unlockedAt && 
         Date.now() - achievement.unlockedAt.getTime() < 24 * 60 * 60 * 1000 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}

        {/* Rarity indicator */}
        <div className={`
          absolute -bottom-1 left-1/2 transform -translate-x-1/2
          px-2 py-0.5 rounded-full text-xs font-bold
          bg-gradient-to-r ${rarityColors[achievement.rarity]}
          text-white shadow-lg
          ${size === 'sm' ? 'text-xs px-1' : ''}
        `}>
          {achievement.rarity.toUpperCase()}
        </div>
      </div>
    </Tooltip>
  );
};

export default AchievementBadge;