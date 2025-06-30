import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
  animation = 'wave'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
        return 'rounded-none';
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-shimmer';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
        ${getVariantClasses()}
        ${getAnimationClasses()}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundSize: '200% 100%'
      }}
    />
  );
};

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="1rem"
        width={i === lines - 1 ? '75%' : '100%'}
        variant="text"
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <Skeleton
    width={size}
    height={size}
    variant="circular"
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 space-y-4 ${className}`}>
    <div className="flex items-center space-x-4">
      <SkeletonAvatar size={50} />
      <div className="flex-1 space-y-2">
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.75rem" width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex space-x-2">
      <Skeleton height="2rem" width="5rem" variant="rounded" />
      <Skeleton height="2rem" width="5rem" variant="rounded" />
    </div>
  </div>
);

export const SkeletonRoomCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-surface rounded-xl p-6 space-y-4 border border-primary-500/20 ${className}`}>
    {/* Shimmer overlay */}
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
           style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
    </div>
    
    {/* Header */}
    <div className="flex justify-between items-start relative">
      <div className="flex-1 space-y-2">
        <Skeleton height="1.5rem" width="70%" variant="text" animation="wave" />
        <Skeleton height="1rem" width="50%" variant="text" animation="wave" />
      </div>
      <Skeleton height="2rem" width="4rem" variant="rounded" animation="wave" />
    </div>
    
    {/* Content */}
    <div className="relative">
      <SkeletonText lines={2} />
    </div>
    
    {/* User previews */}
    <div className="flex items-center space-x-2 relative">
      <div className="flex -space-x-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonAvatar key={i} size={24} />
        ))}
      </div>
      <Skeleton height="0.75rem" width="8rem" animation="wave" />
    </div>
    
    {/* Footer */}
    <div className="flex justify-between items-center relative">
      <Skeleton height="0.75rem" width="6rem" animation="wave" />
      <Skeleton height="0.75rem" width="4rem" animation="wave" />
    </div>
  </div>
);

export const SkeletonSearchBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-surface-light rounded-xl p-4 border border-secondary-600/30 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton width={20} height={20} variant="circular" />
      <Skeleton height="1.25rem" width="60%" variant="text" />
      <Skeleton width={20} height={20} variant="circular" />
    </div>
  </div>
);

export const SkeletonFilters: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-surface rounded-2xl p-7 border border-primary-500/20 ${className}`}>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton height="2.5rem" variant="rounded" />
        <Skeleton height="2.5rem" variant="rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton height="2.5rem" variant="rounded" />
        <Skeleton height="2.5rem" variant="rounded" />
        <Skeleton height="2.5rem" variant="rounded" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton height="2.5rem" width="5rem" variant="rounded" />
        <Skeleton height="2.5rem" width="8rem" variant="rounded" />
      </div>
    </div>
  </div>
);

export default Skeleton;