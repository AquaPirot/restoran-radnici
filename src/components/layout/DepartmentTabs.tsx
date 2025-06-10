import React from 'react';
import { DEPARTMENTS, type Department } from '@/lib/constants';

interface DepartmentTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DepartmentTabs({ activeTab, onTabChange }: DepartmentTabsProps) {
  return (
    <div className="flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      {DEPARTMENTS.map((dept: Department) => {
        const Icon = dept.icon;
        const isActive = activeTab === dept.id;
        return (
          <button
            key={dept.id}
            onClick={() => onTabChange(dept.id)}
            className={`flex-1 py-3 px-2 text-center transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">{dept.name}</div>
          </button>
        );
      })}
    </div>
  );
}