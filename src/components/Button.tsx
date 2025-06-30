import React, { useState } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'neon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          gradient-primary
          hover:shadow-glow-subtle
          text-white font-medium
          border border-primary-500/30
          hover:border-primary-400/50
          shadow-professional
        `;
      case 'secondary':
        return `
          glass-surface
          hover:glass-surface-light
          text-secondary-100 hover:text-white
          shadow-professional
          hover:shadow-elevated
        `;
      case 'success':
        return `
          gradient-success
          hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)]
          text-white font-medium
          border border-success/30
          shadow-professional
        `;
      case 'danger':
        return `
          gradient-error
          hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)]
          text-white font-medium
          border border-error/30
          shadow-professional
        `;
      case 'warning':
        return `
          gradient-warning
          hover:shadow-[0_4px_20px_rgba(245,158,11,0.3)]
          text-white font-medium
          border border-warning/30
          shadow-professional
        `;
      case 'ghost':
        return `
          bg-transparent hover:glass-surface-light
          text-secondary-300 hover:text-white
          border border-secondary-600/30 hover:border-primary-500/50
          hover:shadow-glow-subtle
        `;
      case 'neon':
        return `
          bg-transparent text-accent-cyan
          border-2 border-accent-cyan/60
          hover:bg-accent-cyan/10 hover:border-accent-cyan
          shadow-[0_0_20px_rgba(6,182,212,0.3)]
          hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]
          font-medium
        `;
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm font-medium';
      case 'md':
        return 'px-6 py-3 text-base font-medium';
      case 'lg':
        return 'px-8 py-4 text-lg font-semibold';
      case 'xl':
        return 'px-10 py-5 text-xl font-semibold';
      default:
        return 'px-6 py-3 text-base font-medium';
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${fullWidth ? 'w-full' : ''}
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        transform
        ${animate ? 'hover:scale-105 active:scale-95' : ''}
        ${isPressed ? 'scale-95' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent
        ${animate ? 'hover-lift' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Content */}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        
        <span className="relative">
          {children}
        </span>
        
        {icon && iconPosition === 'right' && (
          <span className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
      </div>

      {/* Shine effect */}
      {animate && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out"></div>
      )}
    </button>
  );
};

export default Button;