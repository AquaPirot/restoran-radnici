// src/types/index.ts
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  phone?: string;
  notes?: string; // Dodano za napomene
}

export interface EmployeeFormData {
  name: string;
  position: string;
  department: string;
  phone: string;
  notes: string; // Dodano za napomene
}

export interface Salary {
  employee: string;
  total: number;
  bank: number;
  cash: number;
  createdAt: string;
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

export interface Schedule {
  [key: string]: string[]; // key: "department-day-shift", value: employee names
}

export interface Schedules {
  [weekKey: string]: Schedule; // weekKey: "week-0", "week-1", etc.
}

export interface MonthlySalary {
  employee: string;
  month: string;
  year: number;
  total: number;
  bank: number;
  cash: number;
  createdAt: string;
}