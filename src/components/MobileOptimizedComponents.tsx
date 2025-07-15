import React from 'react';
import { useMobileOptimized } from '../hooks/useDevice';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  withHover?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  withHover = true 
}) => {
  const { isMobile, containerClass } = useMobileOptimized();
  
  return (
    <div 
      className={`
        ${isMobile ? 'rounded-2xl' : 'rounded-xl'}
        bg-gray-800 border border-gray-700
        ${containerClass}
        ${withHover ? 'hover:bg-gray-750 hover:border-gray-600 transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer active:scale-95 touch-manipulation' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  as?: React.ElementType;
  to?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'button',
  as: Component = 'button',
  ...props
}) => {
  const { isMobile, buttonSize } = useMobileOptimized();
  
  const sizeClass = size === 'sm' ? 'px-4 py-2 text-sm' :
                   size === 'lg' || (isMobile && buttonSize === 'lg') ? 'px-8 py-4 text-lg min-h-[56px]' :
                   'px-6 py-3 text-base min-h-[48px]';
  
  const variantClass = variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      variant === 'secondary' ? 'bg-gray-700 hover:bg-gray-600 text-white' :
                      'border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-transparent';
  
  return (
    <Component
      className={`
        ${sizeClass}
        ${variantClass}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-semibold transition-all duration-200
        active:scale-95 touch-manipulation
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isMobile ? 'focus:ring-4 focus:ring-blue-500/30' : 'focus:ring-2 focus:ring-blue-500/50'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      type={Component === 'button' ? type : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

interface MobileInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  icon?: React.ReactNode;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  icon
}) => {
  const { isMobile } = useMobileOptimized();
  
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400
          ${isMobile ? 'px-4 py-4 text-lg min-h-[56px]' : 'px-4 py-3 text-base'}
          ${icon ? 'pl-12' : ''}
          focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500
          transition-all duration-200
          ${className}
        `}
      />
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({ children, className = '' }) => {
  const { gridCols, spacing } = useMobileOptimized();
  
  return (
    <div className={`
      grid gap-4 ${spacing}
      ${gridCols === 1 ? 'grid-cols-1' : 
        gridCols === 2 ? 'grid-cols-2' : 
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
      ${className}
    `}>
      {children}
    </div>
  );
};
