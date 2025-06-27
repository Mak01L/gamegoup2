import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const base =
    'px-5 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary:
      'bg-gradient-to-r from-purple-400 to-purple-600 text-[#18122B] shadow-lg hover:from-purple-300 hover:to-purple-500',
    secondary:
      'bg-[#2D2350] text-white border border-purple-400 hover:bg-[#3B2F5C] shadow',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
