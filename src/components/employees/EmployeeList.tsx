import React from 'react';
import { Trash2 } from 'lucide-react';
import { Employee } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';

interface EmployeeListProps {
  employees: Employee[];
  onRemoveEmployee: (id: string) => void;
}

export function EmployeeList({ employees, onRemoveEmployee }: EmployeeListProps) {
  return (
    <div className="space-y-4">
      {DEPARTMENTS.map(dept => {
        const deptEmployees = employees.filter(emp => emp.department === dept.id);
        if (deptEmployees.length === 0) return null;
        
        return (
          <div key={dept.id} className="bg-white rounded-lg shadow-sm">
            <div className={`${dept.color} text-white p-3 rounded-t-lg`}>
              <h3 className="font-semibold text-lg">{dept.name} ({deptEmployees.length})</h3>
            </div>
            
            <div className="p-4 space-y-3">
              {deptEmployees.map(employee => (
                <div key={employee.id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    {employee.phone && (
                      <p className="text-sm text-gray-500">📞 {employee.phone}</p>
                    )}
                    {employee.notes && (
                      <p className="text-sm text-gray-500 italic mt-1">{employee.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveEmployee(employee.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}