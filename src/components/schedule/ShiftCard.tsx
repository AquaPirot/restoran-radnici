import React from 'react';
import { Trash2 } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants';

interface ShiftCardProps {
  day: string;
  shifts: string[];
  activeTab: string;
  getEmployeesForShift: (department: string, day: string, shift: string) => string[];
  onRemoveEmployee: (day: string, shift: string, index: number) => void;
}

export function ShiftCard({ 
  day, 
  shifts, 
  activeTab, 
  getEmployeesForShift, 
  onRemoveEmployee 
}: ShiftCardProps) {
  const currentDept = DEPARTMENTS.find(d => d.id === activeTab);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`${currentDept?.color} text-white p-3`}>
        <h3 className="font-semibold text-lg">{day}</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {shifts.map(shift => {
          const employees = getEmployeesForShift(activeTab, day, shift);
          
          return (
            <div key={shift} className="border-l-4 border-gray-200 pl-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">{shift}</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {employees.length} osoba
                </span>
              </div>
              
              {employees.length > 0 ? (
                <div className="space-y-2">
                  {employees.map((employee, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-gray-800">{employee}</span>
                      <button
                        onClick={() => onRemoveEmployee(day, shift, index)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">Nema raspoređenih zaposlenih</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}