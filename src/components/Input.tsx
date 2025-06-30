import React, { useState, useRef, useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
  variant?: 'default' | 'floating' | 'minimal';
  animate?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  success,
  icon,
  iconPosition = 'left',
  helperText,
  variant = 'default',
  animate = true,
  className, 
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      setHasValue(!!inputRef.current.value);
    }
  }, [props.value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Micro-interaction: slight scale and glow
    if (inputRef.current) {
      inputRef.current.style.transform = 'scale(1.02)';
    }
    
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    
    // Reset micro-interaction
    if (inputRef.current) {
      inputRef.current.style.transform = 'scale(1)';
    }
    
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    
    // Micro-interaction: subtle bounce on typing
    if (inputRef.current && e.target.value) {
      inputRef.current.style.animation = 'none';
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.animation = 'micro-bounce 0.3s ease-out';
        }
      }, 10);
    }
    
    props.onChange?.(e);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'floating':
        return `
          relative pt-6 pb-2 px-4
          glass-surface-light
          border border-primary-500/30
          focus-within:border-primary-400
          rounded-xl
          transition-all var(--transition-normal)
          ${isFocused ? 'shadow-glow-subtle glass-surface' : ''}
        `;
      case 'minimal':
        return `
          px-0 py-3
          bg-transparent
          border-0 border-b-2 border-secondary-600/30
          focus-within:border-primary-400
          rounded-none
          transition-all var(--transition-normal)
        `;
      default:
        return `
          px-4 py-3
          glass-surface-light
          border border-secondary-600/30
          focus-within:border-primary-400
          rounded-xl
          transition-all var(--transition-normal)
          ${isFocused ? 'shadow-glow-subtle glass-surface' : ''}
        `;
    }
  };

  const getStatusClasses = () => {
    if (error) return 'border-error focus-within:border-error shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (success) return 'border-success focus-within:border-success shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    return '';
  };

  return (
    <div className="mb-4">
      {/* Standard label for non-floating variant */}
      {label && variant !== 'floating' && (
        <label className="block text-sm font-medium text-purple-300 mb-2">
          {label}
        </label>
      )}
      
      <div className={`
        relative w-full
        ${getVariantClasses()}
        ${getStatusClasses()}
        ${animate ? 'transform hover:scale-[1.02]' : ''}
        ${className}
      `}>
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className={`
            absolute left-3 top-1/2 transform -translate-y-1/2
            text-purple-400 transition-colors duration-200
            ${isFocused ? 'text-purple-300' : ''}
            ${variant === 'floating' ? 'top-1/2' : ''}
          `}>
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={inputRef}
          className={`
            w-full bg-transparent text-white
            placeholder-purple-400/50
            focus:outline-none
            transition-all duration-300 ease-out
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${variant === 'floating' ? 'placeholder-transparent' : ''}
            ${variant === 'minimal' ? 'px-0' : ''}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />

        {/* Floating label */}
        {label && variant === 'floating' && (
          <label className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${isFocused || hasValue 
              ? 'top-2 text-xs text-purple-300' 
              : 'top-1/2 transform -translate-y-1/2 text-base text-purple-400/70'
            }
            ${icon && iconPosition === 'left' ? 'left-10' : ''}
          `}>
            {label}
          </label>
        )}

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <div className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            text-purple-400 transition-colors duration-200
            ${isFocused ? 'text-purple-300' : ''}
          `}>
            {icon}
          </div>
        )}

        {/* Status icons */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <span className="text-red-400">❌</span>}
            {success && <span className="text-green-400">✅</span>}
          </div>
        )}

        {/* Focus ring effect */}
        {animate && isFocused && (
          <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Helper text or error */}
      {(error || helperText) && (
        <div className="mt-2 text-sm">
          {error && (
            <p className="text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-purple-400/70">{helperText}</p>
          )}
        </div>
      )}

      {/* Success message */}
      {success && !error && (
        <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
          <span>✅</span>
          Looks good!
        </p>
      )}
    </div>
  );
};

export default Input;