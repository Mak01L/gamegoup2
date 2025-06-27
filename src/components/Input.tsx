import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm text-purple-200 font-medium mb-1">{label}</label>}
    <input
      className="px-4 py-2 rounded-lg bg-[#18122B] border border-purple-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      {...props}
    />
  </div>
);

export default Input;
