import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export function Card({ children, className, title, icon }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border', className)}>
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {icon}
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}