// src/app/page.tsx - Ažurirana verzija sa novim funkcionalnostima
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { SalaryForm } from '@/components/salary/SalaryForm';
import { SalaryList } from '@/components/salary/SalaryList';
import { MonthlySalaryView } from '@/components/salary/MonthlySalaryView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { SimpleExport } from '@/components/export/SimpleExport';
import { useRestaurantApp } from '@/hooks/useRestaurantApp';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { MonthlySalary } from '@/types';

export default function HomePage() {
  const {
    // State
    activeMenu,
    setActiveMenu,
    activeTab,
    setActiveTab,
    currentWeek,
    setCurrentWeek,
    
    // Data
    employees,
    schedules,
    salaries,
    availableShifts,
    
    // Forms
    employeeForm,
    setEmployeeForm,
    salaryForm,
    setSalaryForm,
    scheduleForm,
    setScheduleForm,
    
    // Actions
    addEmployee,
    removeEmployee,
    addEmployeeToSchedule,
    removeEmployeeFromSchedule,
    getEmployeesForShift,
    updateSchedule,
    addSalary,
    removeSalary,
    
    // Loading
    isLoaded
  } = useRestaurantApp();

  // Mesečne plate - nova funkcionalnost
  const [monthlySalaries, setMonthlySalaries, monthlySalariesLoaded] = useLocalStorage<Record<string, MonthlySalary>>(
    'monthly-salaries', 
    {}
  );

  const [salaryViewMode, setSalaryViewMode] = useState<'current' | 'monthly'>('monthly');

  const handleAddMonthlySalary = (salary: MonthlySalary) => {
    const key = `${salary.employee}-${salary.year}-${String(salary.month).padStart(2, '0')}`;
    setMonthlySalaries(prev => ({
      ...prev,
      [key]: salary
    }));
  };

  const handleRemoveMonthlySalary = (key: string) => {
    if (confirm('Da li ste sigurni da želite da uklonite ovu platu?')) {
      setMonthlySalaries(prev => {
        const newSalaries = { ...prev };
        delete newSalaries[key];
        return newSalaries;
      });
    }
  };

  if (!isLoaded || !monthlySalariesLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navigation activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      <div className="p-4">
        {activeMenu === 'schedule' && (
          <ScheduleView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            employees={employees}
            availableShifts={availableShifts}
            scheduleForm={scheduleForm}
            onFormChange={setScheduleForm}
            onAddEmployee={addEmployeeToSchedule}
            getEmployeesForShift={getEmployeesForShift}
            onRemoveEmployee={removeEmployeeFromSchedule}
            schedules={schedules}
            onUpdateSchedule={updateSchedule}
          />
        )}

        {activeMenu === 'employees' && (
          <>
            <EmployeeForm
              employeeForm={employeeForm}
              onFormChange={setEmployeeForm}
              onAddEmployee={addEmployee}
            />
            <div className="mt-4">
              <EmployeeList
                employees={employees}
                onRemoveEmployee={removeEmployee}
              />
            </div>
          </>
        )}

        {activeMenu === 'salary' && (
          <>
            {/* Toggle između trenutnih i mesečnih plata */}
            <div className="flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setSalaryViewMode('monthly')}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  salaryViewMode === 'monthly' 
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                📅 Mesečni obračun
              </button>
              <button
                onClick={() => setSalaryViewMode('current')}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  salaryViewMode === 'current' 
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                💰 Trenutne plate
              </button>
            </div>

            {salaryViewMode === 'monthly' ? (
              <MonthlySalaryView
                employees={employees}
                monthlySalaries={monthlySalaries}
                onAddMonthlySalary={handleAddMonthlySalary}
                onRemoveMonthlySalary={handleRemoveMonthlySalary}
              />
            ) : (
              <>
                <SalaryForm
                  employees={employees}
                  salaryForm={salaryForm}
                  onFormChange={setSalaryForm}
                  onAddSalary={addSalary}
                />
                <div className="mt-4">
                  <SalaryList 
                    salaries={salaries} 
                    onRemoveSalary={removeSalary}
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeMenu === 'analytics' && (
          <AnalyticsView
            employees={employees}
            schedules={schedules}
          />
        )}

        {activeMenu === 'export' && (
          <SimpleExport
            employees={employees}
            schedules={schedules}
            salaries={salaries}
            currentWeek={currentWeek}
          />
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Nove funkcionalnosti:</strong> Pregled slobodnih zaposlenih, mesečni obračun plata i analitika radnih sati!
          </p>
        </div>
      </div>
    </div>
  );
}