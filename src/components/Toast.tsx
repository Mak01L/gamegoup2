import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto remove
    const timer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '���';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'gradient-success border-success/50 shadow-[0_4px_20px_rgba(16,185,129,0.3)]';
      case 'error':
        return 'gradient-error border-error/50 shadow-[0_4px_20px_rgba(239,68,68,0.3)]';
      case 'warning':
        return 'gradient-warning border-warning/50 shadow-[0_4px_20px_rgba(245,158,11,0.3)]';
      case 'info':
        return 'gradient-primary border-info/50 shadow-[0_4px_20px_rgba(59,130,246,0.3)]';
      default:
        return 'gradient-primary border-primary-500/50 shadow-glow-subtle';
    }
  };

  return (
    <div
      className={`
        transform transition-all var(--transition-normal) ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColors()}
        text-white rounded-xl backdrop-blur-sm
        p-4 mb-3 max-w-sm w-full
        hover:scale-105 cursor-pointer
        relative overflow-hidden
        font-medium
      `}
      onClick={handleRemove}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
      
      <div className="relative flex items-start gap-3">
        <div className="text-2xl animate-bounce">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-1">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
          )}
          
          {toast.action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.action!.onClick();
                handleRemove();
              }}
              className="mt-2 text-xs font-semibold underline hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="text-white/70 hover:text-white text-lg font-bold transition-colors"
        >
          ×
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
        <div 
          className="h-full bg-white/60 animate-pulse"
          style={{
            animation: `shrink ${toast.duration || 5000}ms linear forwards`
          }}
        ></div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
};