import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300': variant === 'secondary',
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
          'bg-green-500 text-white hover:bg-green-600 active:bg-green-700': variant === 'success',
        },
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}