import React from 'react';
import { MENU_ITEMS } from '@/lib/constants';

interface NavigationProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export function Navigation({ activeMenu, onMenuChange }: NavigationProps) {
  return (
    <div className="flex overflow-x-auto bg-white border-b">
      {MENU_ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={`flex-shrink-0 py-3 px-4 text-center border-b-2 transition-colors ${
              activeMenu === item.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">{item.name}</div>
          </button>
        );
      })}
    </div>
  );
}