// src/hooks/useRestaurantApp.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { 
  Employee, 
  EmployeeFormData, 
  Salary, 
  SalaryFormData, 
  ScheduleFormData, 
  Schedules 
} from '@/types';

export function useRestaurantApp() {
  // Navigation state
  const [activeMenu, setActiveMenu] = useState<string>('schedule');
  const [activeTab, setActiveTab] = useState<string>('kitchen');
  const [currentWeek, setCurrentWeek] = useState<number>(0);

  // Data storage
  const [employees, setEmployees, employeesLoaded] = useLocalStorage<Employee[]>('employees', []);
  const [schedules, setSchedules, schedulesLoaded] = useLocalStorage<Schedules>('schedules', {});
  const [salaries, setSalaries, salariesLoaded] = useLocalStorage<Record<string, Salary>>('salaries', {});

  // Form states
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>({
    name: '',
    position: '',
    department: 'kitchen',
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
    day: 'Ponedeljak',
    shift: '8-16'
  });

  // Available shifts
  const availableShifts = ['8-16', '10-14', '14-22', '16-24', '18-22', '10-14 i 18-22'];

  // Loading state
  const isLoaded = employeesLoaded && schedulesLoaded && salariesLoaded;

  // Employee management
  const addEmployee = () => {
    if (!employeeForm.name.trim() || !employeeForm.position.trim()) {
      alert('Molimo unesite ime i poziciju zaposlenog');
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeForm.name.trim(),
      position: employeeForm.position.trim(),
      department: employeeForm.department,
      phone: employeeForm.phone.trim() || undefined,
      notes: employeeForm.notes.trim() || undefined
    };

    setEmployees(prev => [...prev, newEmployee]);
    setEmployeeForm({
      name: '',
      position: '',
      department: 'kitchen',
      phone: '',
      notes: ''
    });
  };

  const removeEmployee = (id: string) => {
    if (confirm('Da li ste sigurni da želite da uklonite ovog zaposlenog?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      
      // Remove from all schedules
      setSchedules(prev => {
        const newSchedules = { ...prev };
        Object.keys(newSchedules).forEach(weekKey => {
          Object.keys(newSchedules[weekKey]).forEach(scheduleKey => {
            const employeeName = employees.find(e => e.id === id)?.name;
            if (employeeName) {
              newSchedules[weekKey][scheduleKey] = newSchedules[weekKey][scheduleKey].filter(
                name => name !== employeeName
              );
            }
          });
        });
        return newSchedules;
      });

      // Remove salary
      const employeeName = employees.find(e => e.id === id)?.name;
      if (employeeName) {
        setSalaries(prev => {
          const newSalaries = { ...prev };
          delete newSalaries[employeeName];
          return newSalaries;
        });
      }
    }
  };

  // Schedule management
  const addEmployeeToSchedule = () => {
    if (!scheduleForm.employee) {
      alert('Molimo izaberite zaposlenog');
      return;
    }

    const weekKey = `week-${currentWeek}`;
    const scheduleKey = `${activeTab}-${scheduleForm.day}-${scheduleForm.shift}`;

    setSchedules(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        [scheduleKey]: [
          ...(prev[weekKey]?.[scheduleKey] || []),
          scheduleForm.employee
        ]
      }
    }));

    setScheduleForm(prev => ({ ...prev, employee: '' }));
  };

  const removeEmployeeFromSchedule = (day: string, shift: string, index: number) => {
    const weekKey = `week-${currentWeek}`;
    const scheduleKey = `${activeTab}-${day}-${shift}`;

    setSchedules(prev => {
      const newSchedules = { ...prev };
      if (newSchedules[weekKey]?.[scheduleKey]) {
        newSchedules[weekKey][scheduleKey] = newSchedules[weekKey][scheduleKey].filter(
          (_, i) => i !== index
        );
      }
      return newSchedules;
    });
  };

  const getEmployeesForShift = (department: string, day: string, shift: string): string[] => {
    const weekKey = `week-${currentWeek}`;
    const scheduleKey = `${department}-${day}-${shift}`;
    return schedules[weekKey]?.[scheduleKey] || [];
  };

  // New function for position-based scheduler
  const updateSchedule = (updates: Record<string, Record<string, string[]>>) => {
    setSchedules(prev => {
      const newSchedules = { ...prev };
      Object.entries(updates).forEach(([weekKey, weekData]) => {
        newSchedules[weekKey] = { ...prev[weekKey], ...weekData };
      });
      return newSchedules;
    });
  };

  // Salary management
  const addSalary = () => {
    if (!salaryForm.employee || !salaryForm.totalSalary || !salaryForm.bankAmount) {
      alert('Molimo popunite sva polja');
      return;
    }

    const total = parseFloat(salaryForm.totalSalary);
    const bank = parseFloat(salaryForm.bankAmount);
    
    if (isNaN(total) || total <= 0) {
      alert('Molimo unesite validnu ukupnu platu');
      return;
    }
    
    if (isNaN(bank) || bank < 0 || bank > total) {
      alert('Molimo unesite validan iznos za račun');
      return;
    }

    const salary: Salary = {
      employee: salaryForm.employee,
      total,
      bank,
      cash: total - bank,
      createdAt: new Date().toISOString()
    };

    setSalaries(prev => ({
      ...prev,
      [salaryForm.employee]: salary
    }));

    setSalaryForm({
      employee: '',
      totalSalary: '',
      bankAmount: ''
    });
  };

  const removeSalary = (employeeName: string) => {
    if (confirm('Da li ste sigurni da želite da uklonite platu?')) {
      setSalaries(prev => {
        const newSalaries = { ...prev };
        delete newSalaries[employeeName];
        return newSalaries;
      });
    }
  };

  // Debug logging
  useEffect(() => {
    if (isLoaded) {
      console.log('App loaded:', {
        employees: employees.length,
        schedules: Object.keys(schedules).length,
        salaries: Object.keys(salaries).length
      });
    }
  }, [isLoaded, employees.length, schedules, salaries]);

  return {
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
    updateSchedule, // Nova funkcija za position-based scheduler
    addSalary,
    removeSalary,
    
    // Loading
    isLoaded
  };
}