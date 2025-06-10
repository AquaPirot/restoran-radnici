// src/components/schedule/ScheduleView.tsx - Sa tabom za slobodne
import React, { useState } from 'react';
import { DepartmentTabs } from '@/components/layout/DepartmentTabs';
import { WeekNavigator } from './WeekNavigator';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftCard } from './ShiftCard';
import { FreeEmployeesView } from './FreeEmployeesView';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { Employee, ScheduleFormData } from '@/types';

interface ScheduleViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentWeek: number;
  onWeekChange: (week: number) => void;
  employees: Employee[];
  availableShifts: string[];
  scheduleForm: ScheduleFormData;
  onFormChange: (form: ScheduleFormData) => void;
  onAddEmployee: () => void;
  getEmployeesForShift: (department: string, day: string, shift: string) => string[];
  onRemoveEmployee: (day: string, shift: string, index: number) => void;
}

export function ScheduleView({
  activeTab,
  onTabChange,
  currentWeek,
  onWeekChange,
  employees,
  availableShifts,
  scheduleForm,
  onFormChange,
  onAddEmployee,
  getEmployeesForShift,
  onRemoveEmployee
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'schedule' | 'free'>('schedule');

  return (
    <>
      <DepartmentTabs activeTab={activeTab} onTabChange={onTabChange} />
      
      <WeekNavigator currentWeek={currentWeek} onWeekChange={onWeekChange} />
      
      {/* Toggle između rasporeda i slobodnih */}
      <div className="flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setViewMode('schedule')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'schedule' 
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📅 Raspored smena
        </button>
        <button
          onClick={() => setViewMode('free')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'free' 
              ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          😎 Ko je slobodan?
        </button>
      </div>
      
      {viewMode === 'schedule' ? (
        <>
          <EmployeeSelector
            employees={employees}
            activeTab={activeTab}
            availableShifts={availableShifts}
            scheduleForm={scheduleForm}
            onFormChange={onFormChange}
            onAddEmployee={onAddEmployee}
          />
          
          <div className="space-y-4 mt-4">
            {DAYS_OF_WEEK.map(day => (
              <ShiftCard
                key={day}
                day={day}
                shifts={availableShifts}
                activeTab={activeTab}
                getEmployeesForShift={getEmployeesForShift}
                onRemoveEmployee={onRemoveEmployee}
              />
            ))}
          </div>
        </>
      ) : (
        <FreeEmployeesView
          employees={employees}
          activeTab={activeTab}
          currentWeek={currentWeek}
          getEmployeesForShift={getEmployeesForShift}
          availableShifts={availableShifts}
        />
      )}
    </>
  );
}