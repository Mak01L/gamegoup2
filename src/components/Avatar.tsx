import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  bordered?: boolean;
  animated?: boolean;
  onClick?: () => void;
  theme?: 'default' | 'gaming' | 'neon' | 'minimal';
  badge?: React.ReactNode;
  level?: number;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className = '',
  status,
  showStatus = false,
  bordered = false,
  animated = true,
  onClick,
  theme = 'default',
  badge,
  level
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'gaming':
        return 'ring-2 ring-primary-500 ring-offset-2 ring-offset-bg-primary shadow-glow';
      case 'neon':
        return 'ring-2 ring-accent-cyan ring-offset-2 ring-offset-bg-primary shadow-[0_0_20px_rgba(6,182,212,0.5)]';
      case 'minimal':
        return 'ring-1 ring-secondary-600';
      default:
        return bordered ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-transparent' : '';
    }
  };

  const getBackgroundGradient = () => {
    switch (theme) {
      case 'gaming':
        return 'bg-gradient-to-br from-primary-500 via-accent-purple to-accent-blue';
      case 'neon':
        return 'bg-gradient-to-br from-accent-cyan via-accent-blue to-primary-500';
      case 'minimal':
        return 'bg-gradient-to-br from-secondary-600 to-secondary-700';
      default:
        return 'bg-gradient-to-br from-purple-500 to-blue-500';
    }
  };

  // Handle numeric size (backward compatibility)
  const isNumericSize = typeof size === 'number';
  const sizeStyle = isNumericSize ? { width: size, height: size } : {};
  const sizeClass = isNumericSize ? '' : sizeClasses[size as keyof typeof sizeClasses];

  return (
    <div 
      className={`
        relative inline-block
        ${onClick ? 'cursor-pointer' : ''}
        ${animated ? 'transition-all duration-300 ease-out' : ''}
        ${isHovered && animated ? 'transform scale-110' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Image/Placeholder */}
      <div
      className={`
      ${sizeClass}
      rounded-full 
      overflow-hidden
      ${getThemeClasses()}
      ${animated ? 'transition-all duration-300' : ''}
      ${isHovered && animated ? 'scale-110' : ''}
      relative
      `}
      style={sizeStyle}
      >
      {!imageError && src ? (
      <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={handleImageError}
      />
      ) : (
      <div className={`w-full h-full ${getBackgroundGradient()} flex items-center justify-center text-white font-bold`}>
      {alt ? getInitials(alt) : '?'}
      </div>
      )}
        
        {/* Hover overlay */}
        {animated && isHovered && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {showStatus && status && !isNumericSize && (
        <div
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size as keyof typeof statusSizes]}
            ${statusColors[status]}
            rounded-full
            border-2 border-white
            ${animated ? 'animate-pulse' : ''}
          `}
          title={`Status: ${status}`}
        />
      )}

      {/* Level indicator */}
      {level && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            {level}
          </div>
        </div>
      )}

      {/* Custom badge */}
      {badge && (
        <div className="absolute -top-1 -right-1">
          {badge}
        </div>
      )}

      {/* Animated border */}
      {animated && theme === 'gaming' && isHovered && (
        <div
          className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-primary-400 via-accent-purple to-accent-blue
            opacity-100 transition-opacity duration-300
            animate-spin-slow
          `}
          style={{
            padding: '2px',
            background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #3b82f6, #6366f1)',
          }}
        >
          <div className={`w-full h-full rounded-full bg-bg-primary`} />
        </div>
      )}
    </div>
  );
};

export default Avatar;