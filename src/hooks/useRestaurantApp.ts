// src/hooks/useRestaurantApp.ts - Fokus na osnove
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Employee, Schedule, EmployeeFormData, SalaryFormData, ScheduleFormData } from '@/types';
import { DEFAULT_SHIFTS } from '@/lib/constants';

export function useRestaurantApp() {
  // State management
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [activeTab, setActiveTab] = useState('kuhinja');
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // LocalStorage data
  const [schedules, setSchedules, schedulesLoaded] = useLocalStorage<Schedule>('restaurant-schedules', {});
  const [employees, setEmployees, employeesLoaded] = useLocalStorage<Employee[]>('restaurant-employees', []);
  const [salaries, setSalaries, salariesLoaded] = useLocalStorage<Record<string, { total: number; bank: number; cash: number }>>('restaurant-salaries', {});
  const [availableShifts,, shiftsLoaded] = useLocalStorage<string[]>('custom-shifts', [...DEFAULT_SHIFTS]);

  // Form states
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>({
    name: '',
    position: '',
    department: 'kuhinja',
    phone: '',
    notes: ''
  });

  const [salaryForm, setSalaryForm] = useState<SalaryFormData>({
    employee: '',
    totalSalary: '',
    bankAmount: ''
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    employee: '',
    day: '',
    shift: ''
  });

  const isLoaded = schedulesLoaded && employeesLoaded && salariesLoaded && shiftsLoaded;

  // Schedule functions
  const getEmployeesForShift = (department: string, day: string, shift: string) => {
    const weekKey = `week-${currentWeek}`;
    const key = `${department}-${day}-${shift}`;
    return schedules[weekKey]?.[key] || [];
  };

  const addEmployeeToSchedule = () => {
    if (!scheduleForm.employee || !scheduleForm.day || !scheduleForm.shift) {
      alert('Molimo izaberite zaposlenog, dan i smenu');
      return;
    }
    
    const weekKey = `week-${currentWeek}`;
    const key = `${activeTab}-${scheduleForm.day}-${scheduleForm.shift}`;
    
    // Check if employee is already scheduled for this shift
    const existingEmployees = schedules[weekKey]?.[key] || [];
    if (existingEmployees.includes(scheduleForm.employee)) {
      alert('Zaposleni je već raspoređen u ovoj smeni');
      return;
    }
    
    setSchedules(prev => {
      const newSchedules = { ...prev };
      if (!newSchedules[weekKey]) newSchedules[weekKey] = {};
      if (!newSchedules[weekKey][key]) newSchedules[weekKey][key] = [];
      
      newSchedules[weekKey][key] = [...newSchedules[weekKey][key], scheduleForm.employee];
      return newSchedules;
    });
    
    setScheduleForm({ employee: '', day: '', shift: '' });
  };

  const removeEmployeeFromSchedule = (day: string, shift: string, employeeIndex: number) => {
    const weekKey = `week-${currentWeek}`;
    const key = `${activeTab}-${day}-${shift}`;
    
    setSchedules(prev => {
      const newSchedules = { ...prev };
      if (newSchedules[weekKey]?.[key]) {
        newSchedules[weekKey][key].splice(employeeIndex, 1);
        if (newSchedules[weekKey][key].length === 0) {
          delete newSchedules[weekKey][key];
        }
      }
      return newSchedules;
    });
  };

  // Employee functions
  const addEmployee = () => {
    if (!employeeForm.name.trim()) {
      alert('Molimo unesite ime zaposlenog');
      return;
    }
    if (!employeeForm.position.trim()) {
      alert('Molimo unesite poziciju zaposlenog');
      return;
    }
    
    // Check if employee already exists
    const existingEmployee = employees.find(emp => 
      emp.name.toLowerCase().trim() === employeeForm.name.toLowerCase().trim()
    );
    
    if (existingEmployee) {
      alert('Zaposleni sa tim imenom već postoji');
      return;
    }
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeForm,
      name: employeeForm.name.trim(),
      position: employeeForm.position.trim(),
      createdAt: new Date().toISOString()
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    setEmployeeForm({ name: '', position: '', department: 'kuhinja', phone: '', notes: '' });
  };

  const removeEmployee = (employeeId: string) => {
    const employeeToRemove = employees.find(emp => emp.id === employeeId);
    if (!employeeToRemove) return;
    
    if (confirm(`Da li ste sigurni da želite da uklonite ${employeeToRemove.name}? Ovo će ukloniti i svu istoriju raspoređa za ovog zaposlenog.`)) {
      // Remove from employees list
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      // Remove from salaries
      setSalaries(prev => {
        const newSalaries = { ...prev };
        delete newSalaries[employeeToRemove.name];
        return newSalaries;
      });
      
      // Remove from all schedules
      setSchedules(prev => {
        const newSchedules = { ...prev };
        Object.keys(newSchedules).forEach(weekKey => {
          Object.keys(newSchedules[weekKey]).forEach(scheduleKey => {
            newSchedules[weekKey][scheduleKey] = newSchedules[weekKey][scheduleKey]
              .filter(name => name !== employeeToRemove.name);
            
            // Remove empty schedule entries
            if (newSchedules[weekKey][scheduleKey].length === 0) {
              delete newSchedules[weekKey][scheduleKey];
            }
          });
          
          // Remove empty weeks
          if (Object.keys(newSchedules[weekKey]).length === 0) {
            delete newSchedules[weekKey];
          }
        });
        return newSchedules;
      });
    }
  };

  // Salary functions
  const addSalary = () => {
    if (!salaryForm.employee) {
      alert('Molimo izaberite zaposlenog');
      return;
    }
    
    const total = parseFloat(salaryForm.totalSalary);
    const bank = parseFloat(salaryForm.bankAmount);
    
    if (isNaN(total) || total <= 0) {
      alert('Molimo unesite validnu ukupnu platu');
      return;
    }
    
    if (isNaN(bank) || bank < 0) {
      alert('Molimo unesite validan iznos za račun');
      return;
    }
    
    if (bank > total) {
      alert('Iznos za račun ne može biti veći od ukupne plate');
      return;
    }
    
    const cash = total - bank;
    
    setSalaries(prev => ({
      ...prev,
      [salaryForm.employee]: { total, bank, cash }
    }));
    
    setSalaryForm({ employee: '', totalSalary: '', bankAmount: '' });
  };

  const removeSalary = (employeeName: string) => {
    if (confirm(`Da li ste sigurni da želite da uklonite podatke o plati za ${employeeName}?`)) {
      setSalaries(prev => {
        const newSalaries = { ...prev };
        delete newSalaries[employeeName];
        return newSalaries;
      });
    }
  };

  return {
    // State
    activeMenu,
    setActiveMenu,
    activeTab,
    setActiveTab,
    currentWeek,
    setCurrentWeek,
    
    // Data
    schedules,
    employees,
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
  };
}