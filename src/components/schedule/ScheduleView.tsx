import React from 'react';
import { DepartmentTabs } from '@/components/layout/DepartmentTabs';
import { WeekNavigator } from './WeekNavigator';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftCard } from './ShiftCard';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { Employee } from '@/types';

interface ScheduleViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentWeek: number;
  onWeekChange: (week: number) => void;
  employees: Employee[];
  availableShifts: string[];
  scheduleForm: {
    employee: string;
    day: string;
    shift: string;
  };
  onFormChange: (form: any) => void;
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
  return (
    <>
      <DepartmentTabs activeTab={activeTab} onTabChange={onTabChange} />
      
      <WeekNavigator currentWeek={currentWeek} onWeekChange={onWeekChange} />
      
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
  );
}