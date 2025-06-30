import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'error':
        return 'bg-error/20 text-error border-error/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'info':
        return 'bg-info/20 text-info border-info/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      case 'secondary':
        return 'bg-secondary-700/50 text-secondary-200 border-secondary-600/30';
      default:
        return 'bg-primary-500/20 text-primary-300 border-primary-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${getVariantClasses()}
        ${getSizeClasses()}
        border rounded-full
        font-medium
        transition-all var(--transition-normal)
        backdrop-blur-sm
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;