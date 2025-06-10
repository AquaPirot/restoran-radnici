import React from 'react';
import { Calendar } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Restoran Menadžment
        </h1>
      </div>
    </div>
  );
}