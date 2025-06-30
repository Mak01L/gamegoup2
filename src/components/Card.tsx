import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = 'xl',
  hover = false,
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'glass-surface shadow-elevated border border-primary-500/20';
      case 'outlined':
        return 'bg-transparent border-2 border-primary-500/30 hover:border-primary-400/50';
      case 'glass':
        return 'glass-surface-light border border-secondary-600/20';
      default:
        return 'glass-surface shadow-professional border border-primary-500/20';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded-lg';
      case 'md':
        return 'rounded-xl';
      case 'lg':
        return 'rounded-2xl';
      case 'xl':
        return 'rounded-3xl';
      case '2xl':
        return 'rounded-[2rem]';
      default:
        return 'rounded-xl';
    }
  };

  const hoverClasses = hover ? `
    hover:glass-surface-light hover:shadow-elevated hover:border-primary-400/40
    hover:transform hover:scale-[1.02] transition-all var(--transition-normal)
    cursor-pointer
  ` : '';

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${getPaddingClasses()}
        ${getRoundedClasses()}
        ${hoverClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;