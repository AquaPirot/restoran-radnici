'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EmployeeList } from '@/components/employees/EmployeeList';
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
    availableShifts,
    
    // Forms
    employeeForm,
    setEmployeeForm,
    scheduleForm,
    setScheduleForm,
    
    // Actions
    addEmployee,
    removeEmployee,
    addEmployeeToSchedule,
    removeEmployeeFromSchedule,
    getEmployeesForShift,
    
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4">Plate - Uskoro</h3>
            <p className="text-gray-600">Ova sekcija će biti implementirana u sledećem koraku.</p>
          </div>
        )}

        {activeMenu === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4">Pregled - Uskoro</h3>
            <p className="text-gray-600">Ova sekcija će biti implementirana u sledećem koraku.</p>
          </div>
        )}

        {activeMenu === 'export' && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4">Export - Uskoro</h3>
            <p className="text-gray-600">Ova sekcija će biti implementirana u sledećem koraku.</p>
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