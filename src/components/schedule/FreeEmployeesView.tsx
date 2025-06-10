// src/components/schedule/FreeEmployeesView.tsx
import React from 'react';
import { UserCheck, Calendar } from 'lucide-react';
import { Card } from '@/components/ui';
import { Employee } from '@/types';
import { DAYS_OF_WEEK, DEPARTMENTS } from '@/lib/constants';

interface FreeEmployeesViewProps {
  employees: Employee[];
  activeTab: string;
  currentWeek: number;
  getEmployeesForShift: (department: string, day: string, shift: string) => string[];
  availableShifts: string[];
}

export function FreeEmployeesView({ 
  employees, 
  activeTab, 
  currentWeek,
  getEmployeesForShift,
  availableShifts 
}: FreeEmployeesViewProps) {
  
  // Funkcija za proveru da li je zaposleni slobodan određenog dana
  const isFreeOnDay = (employeeName: string, day: string): boolean => {
    return !availableShifts.some(shift => 
      getEmployeesForShift(activeTab, day, shift).includes(employeeName)
    );
  };

  // Filtriraj zaposlene po odseku
  const departmentEmployees = employees.filter(emp => emp.department === activeTab);
  const currentDept = DEPARTMENTS.find(d => d.id === activeTab);

  // Grupisanje slobodnih zaposlenih po danima
  const freeEmployeesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = departmentEmployees.filter(emp => isFreeOnDay(emp.name, day));
    return acc;
  }, {} as Record<string, Employee[]>);

  // Pregled zaposlenih koji su slobodni celu nedelju
  const freeAllWeek = departmentEmployees.filter(emp => 
    DAYS_OF_WEEK.every(day => isFreeOnDay(emp.name, day))
  );

  const weekText = currentWeek === 0 ? 'TRENUTNA NEDELJA' : 
                  currentWeek > 0 ? `NEDELJA +${currentWeek}` : `NEDELJA ${currentWeek}`;

  return (
    <div className="space-y-6">
      {/* Pregled cele nedelje */}
      <Card 
        title={`Slobodni zaposleni - ${weekText}`} 
        icon={<UserCheck className="w-5 h-5" />}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Slobodni celu nedelju
          </h4>
          {freeAllWeek.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {freeAllWeek.map(emp => (
                <div key={emp.id} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-800">{emp.name}</div>
                  <div className="text-sm text-gray-600">{emp.position}</div>
                  {emp.phone && (
                    <div className="text-xs text-gray-500 mt-1">📞 {emp.phone}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-600 italic">Svi zaposleni imaju bar jednu smenu u nedelji</p>
          )}
        </div>

        {/* Brza statistika */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-800">{departmentEmployees.length}</div>
            <div className="text-sm text-gray-600">Ukupno zaposlenih</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{freeAllWeek.length}</div>
            <div className="text-sm text-gray-600">Slobodni celu nedelju</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((freeAllWeek.length / departmentEmployees.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Procenat slobodnih</div>
          </div>
        </div>
      </Card>

      {/* Pregled po danima */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const freeEmployees = freeEmployeesByDay[day];
          const workingEmployees = departmentEmployees.length - freeEmployees.length;
          
          return (
            <div key={day} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`${currentDept?.color} text-white p-3`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{day}</h3>
                  <div className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                    {freeEmployees.length} slobodno / {workingEmployees} radi
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {freeEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {freeEmployees.map(emp => (
                      <div key={emp.id} className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="font-medium text-green-800">{emp.name}</div>
                        <div className="text-sm text-green-600">{emp.position}</div>
                        {emp.phone && (
                          <div className="text-xs text-green-500 mt-1">📞 {emp.phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">Svi zaposleni rade ovog dana</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {workingEmployees} zaposlenih je raspoređeno u smene
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          💡 Korisni saveti
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Zeleni okviri</strong> - zaposleni slobodni tog dana</li>
          <li>• <strong>Crveni broj</strong> - broj zaposlenih koji radi</li>
          <li>• Koristite "Export" da podelite listu slobodnih sa timom</li>
          <li>• Za izmene raspoređa, idite na karticu "Raspored smena"</li>
        </ul>
      </div>
    </div>
  );
}