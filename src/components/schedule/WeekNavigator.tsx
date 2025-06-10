// src/components/schedule/WeekNavigator.tsx - Sa realnim datumima
import React from 'react';
import { Button } from '@/components/ui';

interface WeekNavigatorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

// Helper funkcija za računanje datuma nedelje
function getWeekDates(weekOffset: number): { start: Date; end: Date; weekText: string } {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = nedelja, 1 = ponedeljak...
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Koliko dana do ponedeljka
  
  // Pronađi ponedeljak trenutne nedelje
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + mondayOffset);
  
  // Dodaj week offset
  const targetMonday = new Date(currentMonday);
  targetMonday.setDate(currentMonday.getDate() + (weekOffset * 7));
  
  // Nedelja je 6 dana posle ponedeljka
  const targetSunday = new Date(targetMonday);
  targetSunday.setDate(targetMonday.getDate() + 6);
  
  // Format teksta
  let weekText;
  if (weekOffset === 0) {
    weekText = 'Trenutna nedelja';
  } else if (weekOffset > 0) {
    weekText = `+${weekOffset} ${weekOffset === 1 ? 'nedelja' : 'nedelje'}`;
  } else {
    weekText = `${weekOffset} ${Math.abs(weekOffset) === 1 ? 'nedelja' : 'nedelje'}`;
  }
  
  return {
    start: targetMonday,
    end: targetSunday,
    weekText
  };
}

// Helper funkcija za formatiranje datuma
function formatDate(date: Date): string {
  const months = [
    'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
    'jul', 'avg', 'sep', 'okt', 'nov', 'dec'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${day}.${month}`;
}

export function WeekNavigator({ currentWeek, onWeekChange }: WeekNavigatorProps) {
  const { start, end, weekText } = getWeekDates(currentWeek);
  const dateRange = `${formatDate(start)} - ${formatDate(end)}`;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => onWeekChange(currentWeek - 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm"
        >
          ← Prethodna
        </Button>
        
        <div className="text-center">
          <div className="font-semibold text-gray-800 text-lg">
            {weekText}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {dateRange}
          </div>
          {currentWeek === 0 && (
            <div className="text-xs text-blue-600 mt-1 font-medium">
              📅 Pon-Ned
            </div>
          )}
        </div>
        
        <Button
          variant="secondary"
          onClick={() => onWeekChange(currentWeek + 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm"
        >
          Sledeća →
        </Button>
      </div>
    </div>
  );
}