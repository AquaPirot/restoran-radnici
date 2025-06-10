// src/lib/constants.ts - Ažurirane boje
import { ChefHat, Utensils, Waves, Calendar, Users, DollarSign, BarChart3, Camera } from 'lucide-react';

export const DEPARTMENTS = [
  { id: 'kuhinja', name: 'Kuhinja', icon: ChefHat, color: 'bg-gradient-to-br from-red-500 to-red-600' },
  { id: 'restoran', name: 'Restoran', icon: Utensils, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { id: 'bazen', name: 'Bazen', icon: Waves, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' }
] as const;

export const MENU_ITEMS = [
  { id: 'schedule', name: 'Raspored', icon: Calendar },
  { id: 'employees', name: 'Zaposleni', icon: Users },
  { id: 'salary', name: 'Plate', icon: DollarSign },
  { id: 'analytics', name: 'Pregled', icon: BarChart3 },
  { id: 'export', name: 'Export', icon: Camera }
] as const;

export const DEFAULT_SHIFTS = [
  '8-16',
  '16-00', 
  '10-14 i 18-22',
  '14-22',
  '10-19'
] as const;

export const DAYS_OF_WEEK = [
  'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'
] as const;