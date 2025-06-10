import React from 'react';
import { Button } from '@/components/ui';

interface WeekNavigatorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export function WeekNavigator({ currentWeek, onWeekChange }: WeekNavigatorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => onWeekChange(currentWeek - 1)}
        >
          ← Prethodna
        </Button>
        <span className="font-medium">
          {currentWeek === 0 ? 'Trenutna nedelja' : 
           currentWeek > 0 ? `+${currentWeek} nedelja` : `${currentWeek} nedelja`}
        </span>
        <Button
          variant="secondary"
          onClick={() => onWeekChange(currentWeek + 1)}
        >
          Sledeća →
        </Button>
      </div>
    </div>
  );
}