import React, { useState } from 'react';
import { PlusIcon } from './Icons';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <PlusIcon size={24} />,
  className = '',
  size = 'md'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        fixed bottom-6 right-6 z-50
        ${getSizeClasses()}
        gradient-primary
        rounded-full
        shadow-2xl hover:shadow-glow-strong
        flex items-center justify-center
        text-white
        transition-all var(--transition-normal)
        hover:scale-110 active:scale-95
        ${isPressed ? 'scale-95' : ''}
        border border-primary-400/30
        backdrop-blur-sm
        ${className}
      `}
      style={{
        boxShadow: isPressed 
          ? '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 8px 32px rgba(99, 102, 241, 0.3)'
      }}
    >
      <div className={`transition-transform duration-200 ${isPressed ? 'rotate-45' : ''}`}>
        {icon}
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 animate-ping" />
      </div>
    </button>
  );
};

export default FloatingActionButton;