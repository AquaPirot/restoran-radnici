// src/app/page.tsx - Simplifikovana verzija
'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { SalaryForm } from '@/components/salary/SalaryForm';
import { SalaryList } from '@/components/salary/SalaryList';
import { SimpleExport } from '@/components/export/SimpleExport';
import { useRestaurantApp } from '@/hooks/useRestaurantApp';

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
    addSalary,
    removeSalary,
    
    // Loading
    isLoaded
  } = useRestaurantApp();

  if (!isLoaded) {
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

        {activeMenu === 'export' && (
          <SimpleExport
            employees={employees}
            schedules={schedules}
            salaries={salaries}
            currentWeek={currentWeek}
          />
        )}

        {/* Placeholder za buduće funkcionalnosti */}
        {activeMenu === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Pregled - Uskoro</h3>
            <p className="text-gray-600 mb-4">Napredne analitike će biti dodane u sledećem ažuriranju.</p>
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 U sledećoj verziji: praćenje radnih sati, troškovi po nedelji, analiza efikasnosti
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Svi podaci se čuvaju lokalno u browseru. Aplikacija radi offline i podaci neće biti izgubljeni.
          </p>
        </div>
      </div>
    </div>
  );
}