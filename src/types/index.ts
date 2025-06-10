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

export interface Department {
  id: string;
  name: string;
  color: string;
  icon: any;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: any;
}