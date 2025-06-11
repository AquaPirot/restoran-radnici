// src/components/schedule/PositionBasedScheduler.tsx
import React, { useState } from 'react';
import { Clock, Users, X } from 'lucide-react';
import { Card } from '@/components/ui';
import type { Employee, Schedules } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface PositionBasedSchedulerProps {
  employees: Employee[];
  activeTab: string;
  currentWeek: number;
  schedules: Schedules;
  onUpdateSchedule: (updates: Record<string, Record<string, string[]>>) => void;
}

interface ShiftPosition {
  id: string;
  name: string;
  time: string;
  type: 'required' | 'optional';
  count?: number;
}

const SHIFT_POSITIONS: ShiftPosition[] = [
  // Obavezne smene
  { id: 'morning-bartender', name: 'Šanker 1', time: '8-16', type: 'required' },
  { id: 'morning-waiter', name: 'Konobar 1', time: '8-16', type: 'required' },
  { id: 'split-waiter', name: 'Konobar 2', time: '10-14 i 18-22', type: 'required' },
  { id: 'evening-bartender', name: 'Šanker 2', time: '16-24', type: 'required' },
  { id: 'evening-waiter', name: 'Konobar 3', time: '16-24', type: 'required' },
  
  // Opcionalne smene
  { id: 'extra-waiter-1', name: 'Konobar 4', time: '18-22', type: 'optional' },
  { id: 'extra-waiter-2', name: 'Konobar 5', time: '18-22', type: 'optional' },
  { id: 'extra-waiter-3', name: 'Konobar 6', time: '18-22', type: 'optional' },
  { id: 'afternoon-shift', name: 'Dodatno', time: '14-22', type: 'optional' },
];

export function PositionBasedScheduler({
  employees,
  activeTab,
  currentWeek,
  schedules,
  onUpdateSchedule
}: PositionBasedSchedulerProps) {
  const [selectedDay, setSelectedDay] = useState<string>('Ponedeljak');
  const [draggedEmployee, setDraggedEmployee] = useState<string | null>(null);

  const weekKey = `week-${currentWeek}`;
  const currentSchedule = schedules[weekKey] || {};

  // Filtriraj zaposlene po odelenju
  const departmentEmployees = employees.filter(emp => emp.department === activeTab);

  // Funkcija za dobijanje zaposlenog za poziciju
  const getEmployeeForPosition = (day: string, positionId: string): string | null => {
    const key = `${activeTab}-${day}-${positionId}`;
    const assigned = currentSchedule[key];
    return assigned && assigned.length > 0 ? assigned[0] : null;
  };

  // Funkcija za dodelu zaposlenog na poziciju
  const assignEmployee = (day: string, positionId: string, employeeName: string) => {
    const key = `${activeTab}-${day}-${positionId}`;
    const updates = {
      [weekKey]: {
        ...currentSchedule,
        [key]: [employeeName]
      }
    };
    onUpdateSchedule(updates);
  };

  // Funkcija za uklanjanje zaposlenog sa pozicije
  const removeEmployee = (day: string, positionId: string) => {
    const key = `${activeTab}-${day}-${positionId}`;
    const updates = {
      [weekKey]: {
        ...currentSchedule,
        [key]: []
      }
    };
    onUpdateSchedule(updates);
  };

  // Dobij sve dodeljene zaposlene za određeni dan
  const getAssignedEmployees = (day: string): Set<string> => {
    const assigned = new Set<string>();
    SHIFT_POSITIONS.forEach(position => {
      const employee = getEmployeeForPosition(day, position.id);
      if (employee) assigned.add(employee);
    });
    return assigned;
  };

  // Dobij dostupne zaposlene (nisu dodeljeni)
  const getAvailableEmployees = (day: string): Employee[] => {
    const assigned = getAssignedEmployees(day);
    return departmentEmployees.filter(emp => !assigned.has(emp.name));
  };

  const handleDragStart = (e: React.DragEvent, employeeName: string) => {
    setDraggedEmployee(employeeName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: string, positionId: string) => {
    e.preventDefault();
    if (draggedEmployee) {
      // Ukloni sa prethodne pozicije ako je postojala
      SHIFT_POSITIONS.forEach(pos => {
        const currentEmployee = getEmployeeForPosition(day, pos.id);
        if (currentEmployee === draggedEmployee) {
          removeEmployee(day, pos.id);
        }
      });
      
      // Dodeli na novu poziciju
      assignEmployee(day, positionId, draggedEmployee);
      setDraggedEmployee(null);
    }
  };

  const weekText = currentWeek === 0 ? 'TRENUTNA NEDELJA' : 
                  currentWeek > 0 ? `NEDELJA +${currentWeek}` : `NEDELJA ${currentWeek}`;

  return (
    <div className="space-y-6">
      <Card title={`Raspored po pozicijama - ${weekText}`} icon={<Clock className="w-5 h-5" />}>
        {/* Izbor dana */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pozicije/smene */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pozicije za {selectedDay}
            </h3>
            
            {/* Obavezne smene */}
            <div className="space-y-3">
              <h4 className="font-medium text-red-700 bg-red-50 px-3 py-1 rounded">
                🔴 OBAVEZNE SMENE
              </h4>
              {SHIFT_POSITIONS.filter(p => p.type === 'required').map(position => {
                const assignedEmployee = getEmployeeForPosition(selectedDay, position.id);
                
                return (
                  <div
                    key={position.id}
                    className="bg-red-50 border-2 border-red-200 rounded-lg p-4 min-h-[80px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, selectedDay, position.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-red-800">{position.name}</div>
                        <div className="text-sm text-red-600">{position.time}</div>
                      </div>
                      {assignedEmployee && (
                        <button
                          onClick={() => removeEmployee(selectedDay, position.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {assignedEmployee ? (
                      <div className="bg-white p-2 rounded border border-red-300">
                        <div className="font-medium text-gray-800">{assignedEmployee}</div>
                        <div className="text-xs text-gray-600">
                          {departmentEmployees.find(e => e.name === assignedEmployee)?.position}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-red-300 rounded p-3 text-center text-red-500">
                        Prevucite zaposlenog ovde
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Opcionalne smene */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded">
                🔵 OPCIONALNE SMENE
              </h4>
              {SHIFT_POSITIONS.filter(p => p.type === 'optional').map(position => {
                const assignedEmployee = getEmployeeForPosition(selectedDay, position.id);
                
                return (
                  <div
                    key={position.id}
                    className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-h-[80px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, selectedDay, position.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-blue-800">{position.name}</div>
                        <div className="text-sm text-blue-600">{position.time}</div>
                      </div>
                      {assignedEmployee && (
                        <button
                          onClick={() => removeEmployee(selectedDay, position.id)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {assignedEmployee ? (
                      <div className="bg-white p-2 rounded border border-blue-300">
                        <div className="font-medium text-gray-800">{assignedEmployee}</div>
                        <div className="text-xs text-gray-600">
                          {departmentEmployees.find(e => e.name === assignedEmployee)?.position}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-blue-300 rounded p-3 text-center text-blue-500">
                        Opciono - prevucite ako je potrebno
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dostupni zaposleni */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dostupni zaposleni
            </h3>
            
            <div className="space-y-2">
              {getAvailableEmployees(selectedDay).map(employee => (
                <div
                  key={employee.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, employee.name)}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-move hover:bg-green-100 transition-colors"
                >
                  <div className="font-medium text-green-800">{employee.name}</div>
                  <div className="text-sm text-green-600">{employee.position}</div>
                  {employee.phone && (
                    <div className="text-xs text-green-500">📞 {employee.phone}</div>
                  )}
                </div>
              ))}
              
              {getAvailableEmployees(selectedDay).length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">
                  Svi zaposleni su raspoređeni za {selectedDay}
                </div>
              )}
            </div>

            {/* Statistike */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📊 Pregled za {selectedDay}</h4>
              <div className="space-y-1 text-sm">
                <div>Ukupno zaposlenih: {departmentEmployees.length}</div>
                <div>Raspoređeno: {getAssignedEmployees(selectedDay).size}</div>
                <div>Slobodno: {getAvailableEmployees(selectedDay).length}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Instrukcije */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">💡 Kako koristiti</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Prevucite zaposlene</strong> sa desne strane na pozicije levo</li>
          <li>• <strong>Crvene pozicije</strong> su obavezne i moraju biti popunjene</li>
          <li>• <strong>Plave pozicije</strong> su opcionalne, dodajte po potrebi</li>
          <li>• <strong>Zeleni okviri</strong> su slobodni zaposleni</li>
          <li>• Kliknite X da uklonite zaposlenog sa pozicije</li>
        </ul>
      </div>
    </div>
  );
}