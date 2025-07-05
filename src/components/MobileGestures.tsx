import React, { useState, useEffect } from 'react';
import { useMobileOptimized } from '../hooks/useDevice';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = ''
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipping, setIsSwipping] = useState(false);
  const { isMobile, touchEnabled } = useMobileOptimized();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchEnabled) return;
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwipping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchEnabled) return;
    setCurrentX(e.touches[0].clientX);
    const deltaX = Math.abs(e.touches[0].clientX - startX);
    if (deltaX > 10) {
      setIsSwipping(true);
    }
  };

  const handleTouchEnd = () => {
    if (!touchEnabled) return;
    const deltaX = currentX - startX;
    const threshold = 100;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (!isSwipping && onTap) {
      onTap();
    }

    setStartX(0);
    setCurrentX(0);
    setIsSwipping(false);
  };

  const swipeOffset = isSwipping ? currentX - startX : 0;

  return (
    <div
      className={`
        ${isMobile ? 'touch-manipulation' : ''}
        transition-transform duration-200
        ${className}
      `}
      style={{
        transform: isMobile && isSwipping ? `translateX(${swipeOffset * 0.3}px)` : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={!isMobile ? onTap : undefined}
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const { isMobile } = useMobileOptimized();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || window.scrollY > 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      setPullDistance(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = async () => {
    if (!isMobile || isRefreshing) return;
    
    if (pullDistance > 80) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <div
      className={isMobile ? 'overflow-hidden' : ''}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isMobile && (
        <div 
          className="flex items-center justify-center transition-all duration-200"
          style={{ 
            height: pullDistance,
            transform: `translateY(${pullDistance - 80}px)`
          }}
        >
          <div className={`
            w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full
            ${isRefreshing || pullDistance > 80 ? 'animate-spin' : ''}
            transition-opacity duration-200
            ${pullDistance > 20 ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>
      )}
      
      <div
        style={{
          transform: isMobile ? `translateY(${pullDistance}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false
}) => {
  const { isMobile } = useMobileOptimized();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-gray-900 border border-gray-700
        ${isMobile 
          ? fullScreen 
            ? 'h-full w-full rounded-none' 
            : 'h-full w-full rounded-t-3xl mt-auto'
          : 'max-w-lg mx-auto mt-20 rounded-xl max-h-[80vh]'
        }
        ${isMobile ? 'animate-slide-up' : 'animate-fade-in'}
        overflow-hidden flex flex-col
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
