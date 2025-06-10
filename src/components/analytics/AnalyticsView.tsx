// src/components/analytics/AnalyticsView.tsx
import React, { useState } from 'react';
import { BarChart3, Clock, Users, Calendar, TrendingUp } from 'lucide-react';
import { Card, Select } from '@/components/ui';
import { Employee, Schedule } from '@/types';
import { DEPARTMENTS, DAYS_OF_WEEK } from '@/lib/constants';

interface AnalyticsViewProps {
  employees: Employee[];
  schedules: Schedule;
}

interface WorkingHours {
  employee: string;
  department: string;
  position: string;
  totalHours: number;
  daysWorked: number;
  averageHoursPerDay: number;
  shifts: Array<{
    day: string;
    shift: string;
    hours: number;
  }>;
}

export function AnalyticsView({ employees, schedules }: AnalyticsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Funkcija za parsiranje sati iz shift stringa
  const parseShiftHours = (shift: string): number => {
    // Pokušaj da parsira standardne formate smena
    const patterns = [
      /^(\d{1,2})-(\d{1,2})$/, // 8-16, 16-00
      /^(\d{1,2})-(\d{1,2})\s*i\s*(\d{1,2})-(\d{1,2})$/, // 10-14 i 18-22
      /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/, // 08:00-16:00
    ];

    // Pattern 1: 8-16
    const match1 = shift.match(patterns[0]);
    if (match1) {
      const start = parseInt(match1[1]);
      const end = parseInt(match1[2]);
      if (end === 0) return 24 - start; // Preko ponoći
      if (end > start) return end - start;
      return (24 - start) + end; // Preko ponoći
    }

    // Pattern 2: 10-14 i 18-22 (split shift)
    const match2 = shift.match(patterns[1]);
    if (match2) {
      const morning = parseInt(match2[2]) - parseInt(match2[1]);
      const evening = parseInt(match2[4]) - parseInt(match2[3]);
      return morning + evening;
    }

    // Default: pokušaj da izvučeš brojeve i pretpostavi 8 sati
    const numbers = shift.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const start = parseInt(numbers[0]);
      const end = parseInt(numbers[1]);
      if (end > start) return end - start;
      if (end === 0) return 24 - start;
    }

    // Fallback - pretpostavi 8 sati
    return 8;
  };

  // Generiši opcije meseca
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
          'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'
        ];
        const label = `${monthNames[month - 1]} ${year}`;
        options.push({ value: monthStr, label });
      }
    }
    
    return options.reverse();
  };

  // Izračunaj sate rada za izabrani mesec
  const calculateMonthlyHours = (): WorkingHours[] => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    const employeeHours: Record<string, WorkingHours> = {};
    
    // Inicijalizuj sve zaposlene
    employees.forEach(emp => {
      employeeHours[emp.name] = {
        employee: emp.name,
        department: emp.department,
        position: emp.position,
        totalHours: 0,
        daysWorked: 0,
        averageHoursPerDay: 0,
        shifts: []
      };
    });

    // Prođi kroz sve nedelje u mesecu
    const weeksInMonth = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const currentDay = weekStart.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      weekStart.setDate(weekStart.getDate() + mondayOffset);
      
      // Izračunaj offset nedelje u odnosu na trenutnu
      const now = new Date();
      const currentMonday = new Date(now);
      const nowDay = now.getDay();
      const nowMondayOffset = nowDay === 0 ? -6 : 1 - nowDay;
      currentMonday.setDate(now.getDate() + nowMondayOffset);
      
      const weeksDiff = Math.round((weekStart.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
      weeksInMonth.push(weeksDiff);
      
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Prođi kroz sve relevantne nedelje
    [...new Set(weeksInMonth)].forEach(weekOffset => {
      const weekKey = `week-${weekOffset}`;
      const weekSchedule = schedules[weekKey] || {};
      
      // Prođi kroz sve smene u toj nedelji
      Object.entries(weekSchedule).forEach(([scheduleKey, employeeNames]) => {
        const [department, day, ...shiftParts] = scheduleKey.split('-');
        const shift = shiftParts.join('-');
        
        // Proveri da li je dan u izabranom mesecu
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        if (dayIndex === -1) return;
        
        const weekStart = new Date();
        const currentDay = weekStart.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        weekStart.setDate(weekStart.getDate() + mondayOffset + (weekOffset * 7));
        
        const shiftDate = new Date(weekStart);
        shiftDate.setDate(weekStart.getDate() + dayIndex);
        
        if (shiftDate >= startDate && shiftDate <= endDate) {
          const shiftHours = parseShiftHours(shift);
          
          employeeNames.forEach(empName => {
            if (employeeHours[empName]) {
              employeeHours[empName].totalHours += shiftHours;
              employeeHours[empName].shifts.push({
                day,
                shift,
                hours: shiftHours
              });
            }
          });
        }
      });
    });

    // Izračunaj dodatne statistike
    Object.values(employeeHours).forEach(empData => {
      const uniqueDays = new Set(empData.shifts.map(s => s.day)).size;
      empData.daysWorked = uniqueDays;
      empData.averageHoursPerDay = uniqueDays > 0 ? empData.totalHours / uniqueDays : 0;
    });

    return Object.values(employeeHours);
  };

  const monthlyHours = calculateMonthlyHours();
  
  // Filtriraj po odelenju
  const filteredHours = selectedDepartment === 'all' 
    ? monthlyHours 
    : monthlyHours.filter(emp => emp.department === selectedDepartment);

  // Sortiraj po broju sati (opadajuće)
  const sortedHours = [...filteredHours].sort((a, b) => b.totalHours - a.totalHours);

  // Izračunaj ukupne statistike
  const totalStats = sortedHours.reduce((acc, emp) => ({
    totalHours: acc.totalHours + emp.totalHours,
    totalDays: acc.totalDays + emp.daysWorked,
    activeEmployees: emp.totalHours > 0 ? acc.activeEmployees + 1 : acc.activeEmployees
  }), { totalHours: 0, totalDays: 0, activeEmployees: 0 });

  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  const monthName = monthNames[parseInt(selectedMonthNum) - 1];

  return (
    <div className="space-y-6">
      {/* Kontrole */}
      <Card title="Analitika radnih sati" icon={<BarChart3 className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesec
            </label>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={generateMonthOptions()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Odelenje
            </label>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              options={[
                { value: 'all', label: 'Sva odelenja' },
                ...DEPARTMENTS.map(dept => ({ value: dept.id, label: dept.name }))
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Ukupne statistike */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalStats.totalHours}</div>
            <div className="text-sm text-gray-600">Ukupno sati</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalStats.activeEmployees}</div>
            <div className="text-sm text-gray-600">Aktivnih zaposlenih</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {totalStats.activeEmployees > 0 ? Math.round(totalStats.totalHours / totalStats.activeEmployees) : 0}
            </div>
            <div className="text-sm text-gray-600">Prosek sati/zaposleni</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {totalStats.activeEmployees > 0 ? Math.round(totalStats.totalDays / totalStats.activeEmployees) : 0}
            </div>
            <div className="text-sm text-gray-600">Prosek dana/zaposleni</div>
          </div>
        </Card>
      </div>

      {/* Detaljni pregled */}
      <Card title={`Detaljni pregled - ${monthName} ${selectedYear}`}>
        {sortedHours.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            Nema podataka o radnim satima za izabrani period
          </p>
        ) : (
          <div className="space-y-4">
            {sortedHours.map((empData, index) => {
              const dept = DEPARTMENTS.find(d => d.id === empData.department);
              const isInactive = empData.totalHours === 0;
              
              return (
                <div 
                  key={empData.employee} 
                  className={`p-4 rounded-lg border-l-4 ${
                    isInactive 
                      ? 'bg-gray-50 border-gray-300' 
                      : index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className={`font-semibold text-lg ${isInactive ? 'text-gray-500' : 'text-gray-800'}`}>
                          {index < 3 && !isInactive && '🏆'} {empData.employee}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${dept?.color}`}>
                          {dept?.name}
                        </span>
                      </div>
                      <p className={`text-sm ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>
                        {empData.position}
                      </p>
                    </div>
                    
                    {!isInactive && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{empData.totalHours}h</div>
                        <div className="text-sm text-gray-500">{empData.daysWorked} dana</div>
                      </div>
                    )}
                  </div>
                  
                  {!isInactive && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-700">{empData.totalHours}h</div>
                          <div className="text-xs text-blue-600">Ukupno sati</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-700">{empData.daysWorked}</div>
                          <div className="text-xs text-green-600">Dana radio</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold text-purple-700">
                            {empData.averageHoursPerDay.toFixed(1)}h
                          </div>
                          <div className="text-xs text-purple-600">Prosek/dan</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-semibold text-orange-700">{empData.shifts.length}</div>
                          <div className="text-xs text-orange-600">Smena ukupno</div>
                        </div>
                      </div>
                      
                      {/* Prikaz smena (samo za top 5) */}
                      {index < 5 && empData.shifts.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                            Prikaži sve smene ({empData.shifts.length})
                          </summary>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                            {empData.shifts.map((shift, idx) => (
                              <div key={idx} className="bg-gray-100 p-2 rounded">
                                <div className="font-medium">{shift.day}</div>
                                <div className="text-gray-600">{shift.shift}</div>
                                <div className="text-blue-600 font-semibold">{shift.hours}h</div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </>
                  )}
                  
                  {isInactive && (
                    <p className="text-sm text-gray-400 italic">
                      Nije radio u ovom mesecu
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Napomene */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">📊 Objašnjenja</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Sati se računaju</strong> na osnovu unetih smena u rasporedu</li>
          <li>• <strong>🏆 Top 3</strong> zaposlena su označena zlatnom pozadinom</li>
          <li>• <strong>Prosek sati/dan</strong> = ukupno sati / broj dana rada</li>
          <li>• Smene poput "8-16" se računaju kao 8 sati, "10-14 i 18-22" kao 8 sati</li>
          <li>• Podaci se ažuriraju automatski kada menjate raspored</li>
        </ul>
      </div>
    </div>
  );
}