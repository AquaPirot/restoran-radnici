// src/components/schedule/ScheduleView.tsx - Sa novim position-based pristupom
import React, { useState } from 'react';
import { DepartmentTabs } from '@/components/layout/DepartmentTabs';
import { WeekNavigator } from './WeekNavigator';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftCard } from './ShiftCard';
import { FreeEmployeesView } from './FreeEmployeesView';
import { PositionBasedScheduler } from './PositionBasedScheduler';
import { MobileFriendlyScheduler } from './MobileFriendlyScheduler';
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
  schedules: Schedules;
  onUpdateSchedule: (updates: Record<string, Record<string, string[]>>) => void;
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
  onRemoveEmployee,
  schedules,
  onUpdateSchedule
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'positions' | 'mobile' | 'schedule' | 'free'>('mobile');

  return (
    <>
      <DepartmentTabs activeTab={activeTab} onTabChange={onTabChange} />
      
      <WeekNavigator currentWeek={currentWeek} onWeekChange={onWeekChange} />
      
      {/* Toggle između različitih prikaza */}
      <div className="flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setViewMode('mobile')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'mobile' 
              ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📱 Mobilni (PREPORUČENO)
        </button>
        <button
          onClick={() => setViewMode('positions')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'positions' 
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          🎯 Pozicije
        </button>
        <button
          onClick={() => setViewMode('schedule')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'schedule' 
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📅 Klasični
        </button>
        <button
          onClick={() => setViewMode('free')}
          className={`flex-1 py-3 px-4 text-center transition-colors ${
            viewMode === 'free' 
              ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          😎 Slobodni
        </button>
      </div>
      
      {viewMode === 'mobile' ? (
        <MobileFriendlyScheduler
          employees={employees}
          activeTab={activeTab}
          currentWeek={currentWeek}
          schedules={schedules}
          onUpdateSchedule={onUpdateSchedule}
        />
      ) : viewMode === 'positions' ? (
        <PositionBasedScheduler
          employees={employees}
          activeTab={activeTab}
          currentWeek={currentWeek}
          schedules={schedules}
          onUpdateSchedule={onUpdateSchedule}
        />
      ) : viewMode === 'schedule' ? (
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