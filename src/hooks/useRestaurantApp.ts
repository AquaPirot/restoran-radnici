import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Employee, Schedule } from '@/types';
import { DEFAULT_SHIFTS } from '@/lib/constants';

export function useRestaurantApp() {
  // State management
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [activeTab, setActiveTab] = useState('kuhinja');
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // LocalStorage data
  const [schedules, setSchedules, schedulesLoaded] = useLocalStorage<Schedule>('restaurant-schedules', {});
  const [employees, setEmployees, employeesLoaded] = useLocalStorage<Employee[]>('restaurant-employees', []);
  const [salaries, setSalaries, salariesLoaded] = useLocalStorage<Record<string, any>>('restaurant-salaries', {});
  const [templates, setTemplates, templatesLoaded] = useLocalStorage<Record<string, any>>('restaurant-templates', {});
  const [availableShifts, setAvailableShifts, shiftsLoaded] = useLocalStorage<string[]>('custom-shifts', [...DEFAULT_SHIFTS]);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    department: 'kuhinja' as const,
    phone: '',
    notes: ''
  });

  const [salaryForm, setSalaryForm] = useState({
    employee: '',
    totalSalary: '',
    bankAmount: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    employee: '',
    day: '',
    shift: ''
  });

  const isLoaded = schedulesLoaded && employeesLoaded && salariesLoaded && templatesLoaded && shiftsLoaded;

  // Helper functions
  const getEmployeesForShift = (department: string, day: string, shift: string) => {
    const weekKey = `week-${currentWeek}`;
    const key = `${department}-${day}-${shift}`;
    return schedules[weekKey]?.[key] || [];
  };

  const addEmployeeToSchedule = () => {
    if (!scheduleForm.employee || !scheduleForm.day || !scheduleForm.shift) return;
    
    const weekKey = `week-${currentWeek}`;
    const key = `${activeTab}-${scheduleForm.day}-${scheduleForm.shift}`;
    
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

  const addEmployee = () => {
    if (!employeeForm.name.trim() || !employeeForm.position.trim()) return;
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeForm,
      createdAt: new Date().toISOString()
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    setEmployeeForm({ name: '', position: '', department: 'kuhinja', phone: '', notes: '' });
  };

  const removeEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
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
    templates,
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
    
    // Loading
    isLoaded
  };
}