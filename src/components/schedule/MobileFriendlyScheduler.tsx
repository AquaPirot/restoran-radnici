// src/components/schedule/MobileFriendlyScheduler.tsx
import React, { useState } from 'react';
import { Clock, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { Employee, Schedules } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface MobileFriendlySchedulerProps {
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

export function MobileFriendlyScheduler({
  employees,
  activeTab,
  currentWeek,
  schedules,
  onUpdateSchedule
}: MobileFriendlySchedulerProps) {
  const [selectedDay, setSelectedDay] = useState('Ponedeljak');
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [showAvailable, setShowAvailable] = useState(false);

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
    setExpandedPosition(null);
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

  const requiredPositions = SHIFT_POSITIONS.filter(p => p.type === 'required');
  const optionalPositions = SHIFT_POSITIONS.filter(p => p.type === 'optional');

  const weekText = currentWeek === 0 ? 'TRENUTNA' : 
                  currentWeek > 0 ? `+${currentWeek}` : `${currentWeek}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Raspored smena
        </h1>
        <p className="text-sm text-gray-600">Nedelja: {weekText} | {activeTab}</p>
      </div>

      {/* Dan selector - horizontal scroll */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-hidden">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Izaberite dan:</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistike */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">📊 {selectedDay}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{departmentEmployees.length}</div>
            <div className="text-xs text-gray-500">Ukupno</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {getAssignedEmployees(selectedDay).size}
            </div>
            <div className="text-xs text-gray-500">Dodeljeno</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {getAvailableEmployees(selectedDay).length}
            </div>
            <div className="text-xs text-gray-500">Slobodno</div>
          </div>
        </div>
      </div>

      {/* Obavezne pozicije */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-medium text-red-700 mb-3 bg-red-50 px-3 py-1 rounded">
          🔴 OBAVEZNE POZICIJE
        </h3>
        <div className="space-y-3">
          {requiredPositions.map(position => {
            const assignedEmployee = getEmployeeForPosition(selectedDay, position.id);
            const isExpanded = expandedPosition === position.id;
            
            return (
              <div key={position.id} className="border border-red-200 rounded-lg overflow-hidden">
                {/* Position header */}
                <div className="bg-red-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-red-800 text-sm">{position.name}</div>
                      <div className="text-xs text-red-600">{position.time}</div>
                    </div>
                    {assignedEmployee && (
                      <button
                        onClick={() => removeEmployee(selectedDay, position.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Assigned employee or add button */}
                  {assignedEmployee ? (
                    <div className="mt-2 bg-white p-2 rounded border border-red-300">
                      <div className="font-medium text-gray-800 text-sm">{assignedEmployee}</div>
                      <div className="text-xs text-gray-500">
                        {departmentEmployees.find(e => e.name === assignedEmployee)?.position}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
                      className="mt-2 w-full bg-red-100 border-2 border-dashed border-red-300 rounded p-3 text-center text-red-600 text-sm flex items-center justify-center gap-2 hover:bg-red-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Dodaj zaposlenog
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                
                {/* Employee selection */}
                {isExpanded && !assignedEmployee && (
                  <div className="p-3 bg-white border-t border-red-200">
                    <div className="space-y-2">
                      {getAvailableEmployees(selectedDay).map(employee => (
                        <button
                          key={employee.id}
                          onClick={() => assignEmployee(selectedDay, position.id, employee.name)}
                          className="w-full text-left p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-800 text-sm">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.position}</div>
                          {employee.phone && (
                            <div className="text-xs text-gray-400">📞 {employee.phone}</div>
                          )}
                        </button>
                      ))}
                      {getAvailableEmployees(selectedDay).length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm italic">
                          Nema dostupnih zaposlenih
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Opcionalne pozicije */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-700 mb-3 bg-blue-50 px-3 py-1 rounded">
          🔵 OPCIONALNE POZICIJE
        </h3>
        <div className="space-y-3">
          {optionalPositions.map(position => {
            const assignedEmployee = getEmployeeForPosition(selectedDay, position.id);
            const isExpanded = expandedPosition === position.id;
            
            return (
              <div key={position.id} className="border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-blue-800 text-sm">{position.name}</div>
                      <div className="text-xs text-blue-600">{position.time}</div>
                    </div>
                    {assignedEmployee && (
                      <button
                        onClick={() => removeEmployee(selectedDay, position.id)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {assignedEmployee ? (
                    <div className="mt-2 bg-white p-2 rounded border border-blue-300">
                      <div className="font-medium text-gray-800 text-sm">{assignedEmployee}</div>
                      <div className="text-xs text-gray-500">
                        {departmentEmployees.find(e => e.name === assignedEmployee)?.position}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
                      className="mt-2 w-full bg-blue-100 border-2 border-dashed border-blue-300 rounded p-3 text-center text-blue-600 text-sm flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Dodaj po potrebi
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                
                {isExpanded && !assignedEmployee && (
                  <div className="p-3 bg-white border-t border-blue-200">
                    <div className="space-y-2">
                      {getAvailableEmployees(selectedDay).map(employee => (
                        <button
                          key={employee.id}
                          onClick={() => assignEmployee(selectedDay, position.id, employee.name)}
                          className="w-full text-left p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-800 text-sm">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.position}</div>
                          {employee.phone && (
                            <div className="text-xs text-gray-400">📞 {employee.phone}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dostupni zaposleni */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-20">
        <button
          onClick={() => setShowAvailable(!showAvailable)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded">
            😎 SLOBODNI ({getAvailableEmployees(selectedDay).length})
          </h3>
          {showAvailable ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {showAvailable && (
          <div className="mt-3 space-y-2">
            {getAvailableEmployees(selectedDay).map(employee => (
              <div key={employee.id} className="bg-green-50 border border-green-200 rounded p-3">
                <div className="font-medium text-green-800 text-sm">{employee.name}</div>
                <div className="text-xs text-green-600">{employee.position}</div>
                {employee.phone && (
                  <div className="text-xs text-green-500">📞 {employee.phone}</div>
                )}
              </div>
            ))}
            {getAvailableEmployees(selectedDay).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm italic">
                Svi su raspoređeni za {selectedDay}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instrukcije - sticky na dnu */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-sm text-blue-700">
            💡 <strong>Tap</strong> na poziciju → dodaj zaposlenog<br/>
            <strong>X</strong> dugme → ukloni sa pozicije
          </p>
        </div>
      </div>
    </div>
  );
}