// src/types/index.ts - Popravljena verzija
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: 'kuhinja' | 'restoran' | 'bazen';
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface Salary {
  total: number;
  bank: number;
  cash: number;
}

export interface Schedule {
  [weekKey: string]: {
    [scheduleKey: string]: string[];
  };
}

// Department i MenuItem su sada u constants.ts

// Novi interfejsi za forme
export interface EmployeeFormData {
  name: string;
  position: string;
  department: 'kuhinja' | 'restoran' | 'bazen';
  phone: string;
  notes: string;
}

export interface SalaryFormData {
  employee: string;
  totalSalary: string;
  bankAmount: string;
}

export interface ScheduleFormData {
  employee: string;
  day: string;
  shift: string;
}