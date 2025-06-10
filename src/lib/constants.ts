// src/lib/constants.ts - Ažurirane sa React tipovima
import { ChefHat, Utensils, Waves, Calendar, Users, DollarSign, BarChart3, Camera } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Department {
  id: 'kuhinja' | 'restoran' | 'bazen';
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface MenuItem {
  id: 'schedule' | 'employees' | 'salary' | 'analytics' | 'export';
  name: string;
  icon: LucideIcon;
}

export const DEPARTMENTS: Department[] = [
  { id: 'kuhinja', name: 'Kuhinja', icon: ChefHat, color: 'bg-gradient-to-br from-red-500 to-red-600' },
  { id: 'restoran', name: 'Restoran', icon: Utensils, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { id: 'bazen', name: 'Bazen', icon: Waves, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' }
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 'schedule', name: 'Raspored', icon: Calendar },
  { id: 'employees', name: 'Zaposleni', icon: Users },
  { id: 'salary', name: 'Plate', icon: DollarSign },
  { id: 'analytics', name: 'Pregled', icon: BarChart3 },
  { id: 'export', name: 'Export', icon: Camera }
];

export const DEFAULT_SHIFTS: readonly string[] = [
  '8-16',
  '16-00', 
  '10-14 i 18-22',
  '14-22',
  '10-19'
];

export const DAYS_OF_WEEK: readonly string[] = [
  'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'
];