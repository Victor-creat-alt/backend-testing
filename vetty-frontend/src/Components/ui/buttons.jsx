// /components/ui/button.jsx

import React from 'react';

export const Button = ({ onClick, children, size = 'md', variant = 'primary', className }) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-md',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md focus:outline-none ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};


