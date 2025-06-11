// src/components/analytics/AnalyticsView.tsx
import React, { useMemo } from 'react';
import { Card } from '@/components/ui';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { Employee, Schedules } from '@/types';

// Fallback ako konstanta nije dostupna
const FALLBACK_DAYS = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const SAFE_DAYS_OF_WEEK = DAYS_OF_WEEK || FALLBACK_DAYS;

interface AnalyticsViewProps {
  employees: Employee[];
  schedules: Schedules; // Schedules = { [weekKey: string]: Schedule }
}

// Helper funkcija za parsiranje sati iz smene
const parseShiftHours = (shift: string): number => {
  if (!shift || typeof shift !== 'string') return 0;
  
  // Specijalni slučajevi
  if (shift.includes('i')) {
    // Split shift poput "10-14 i 18-22"
    const parts = shift.split(' i ');
    return parts.reduce((total, part) => total + parseShiftHours(part.trim()), 0);
  }
  
  // Normalna smena poput "8-16"
  const match = shift.match(/(\d+)-(\d+)/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    return end > start ? end - start : (24 - start) + end; // Handle overnight shifts
  }
  
  return 8; // Default 8 sati
};

export function AnalyticsView({ employees, schedules }: AnalyticsViewProps) {
  const analytics = useMemo(() => {
    const stats = {
      totalEmployees: employees.length,
      weeklySchedules: Object.keys(schedules).length,
      busyDays: [] as string[],
      totalShifts: 0,
      employeeWorkload: {} as Record<string, number>,
      departmentStats: {} as Record<string, { employees: number; shifts: number; hours: number }>
    };

    // Analiziraj schedule podatke
    Object.entries(schedules).forEach(([weekKey, weekSchedule]) => {
      if (!weekSchedule || typeof weekSchedule !== 'object') return;
      
      Object.entries(weekSchedule).forEach(([scheduleKey, employeeNames]) => {
        if (!employeeNames || !Array.isArray(employeeNames)) return;
        
        const keyParts = scheduleKey.split('-');
        if (keyParts.length < 3) return;
        
        const [department, day, ...shiftParts] = keyParts;
        const shift = shiftParts.join('-');
        
        // Preskoči ako nema validne smene
        if (!shift || !shift.trim()) return;
        
        const shiftHours = parseShiftHours(shift);
        stats.totalShifts += employeeNames.length;
        
        // Department statistics
        if (!stats.departmentStats[department]) {
          stats.departmentStats[department] = { employees: 0, shifts: 0, hours: 0 };
        }
        stats.departmentStats[department].shifts += employeeNames.length;
        stats.departmentStats[department].hours += shiftHours * employeeNames.length;
        
        employeeNames.forEach(employeeName => {
          if (typeof employeeName === 'string' && employeeName.trim()) {
            stats.employeeWorkload[employeeName] = (stats.employeeWorkload[employeeName] || 0) + shiftHours;
          }
        });
      });
    });

    // Count unique employees per department
    Object.keys(stats.departmentStats).forEach(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      stats.departmentStats[dept].employees = deptEmployees.length;
    });

    // Find busiest days
    const dayActivity: Record<string, number> = {};
    SAFE_DAYS_OF_WEEK.forEach(day => {
      dayActivity[day] = 0;
      Object.entries(schedules).forEach(([, weekSchedule]) => {
        if (!weekSchedule) return;
        Object.entries(weekSchedule).forEach(([key, empList]) => {
          if (key.includes(`-${day}-`) && Array.isArray(empList)) {
            dayActivity[day] += empList.length;
          }
        });
      });
    });

    stats.busyDays = [...SAFE_DAYS_OF_WEEK]
      .sort((a, b) => dayActivity[b] - dayActivity[a])
      .slice(0, 3);

    return stats;
  }, [employees, schedules]);

  const topWorkers = useMemo(() => {
    const workloadEntries = Object.entries(analytics.employeeWorkload || {});
    if (workloadEntries.length === 0) return [];
    
    return workloadEntries
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 5)
      .map(([name, hours]) => {
        const employee = employees.find(emp => emp.name === name);
        return {
          name,
          hours: hours || 0,
          position: employee?.position || 'N/A',
          department: employee?.department || 'N/A'
        };
      });
  }, [analytics.employeeWorkload, employees]);

  return (
    <div className="space-y-6">
      {/* Osnovne statistike */}
      <Card title="📊 Osnovne statistike">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalEmployees}</div>
            <div className="text-sm text-blue-700">Ukupno zaposlenih</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.weeklySchedules}</div>
            <div className="text-sm text-green-700">Nedelja u sistemu</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.totalShifts}</div>
            <div className="text-sm text-purple-700">Ukupno smena</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(analytics.totalShifts / Math.max(analytics.totalEmployees, 1))}
            </div>
            <div className="text-sm text-orange-700">Smena po zaposlenom</div>
          </div>
        </div>
      </Card>

      {/* Statistike po odeljenjima */}
      <Card title="🏢 Statistike po odeljenjima">
        <div className="space-y-4">
          {Object.entries(analytics.departmentStats).map(([dept, stats]) => (
            <div key={dept} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 capitalize">{dept}</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{stats.employees}</div>
                  <div className="text-xs text-gray-600">Zaposlenih</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{stats.shifts}</div>
                  <div className="text-xs text-gray-600">Smena</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{stats.hours}</div>
                  <div className="text-xs text-gray-600">Sati</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Najaktivniji zaposleni */}
      <Card title="🏆 Najaktivniji zaposleni">
        <div className="space-y-3">
          {topWorkers.length > 0 ? topWorkers.map((worker, index) => (
            <div key={worker.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{worker.name}</div>
                  <div className="text-sm text-gray-600">{worker.position} • {worker.department}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{worker.hours}h</div>
                <div className="text-xs text-gray-600">ukupno</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              Nema podataka o smenama
            </div>
          )}
        </div>
      </Card>

      {/* Najaktivniji dani */}
      <Card title="📅 Najaktivniji dani">
        <div className="space-y-2">
          {analytics.busyDays.length > 0 ? analytics.busyDays.map((day, index) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-red-500' : 
                  index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-gray-800">{day}</span>
              </div>
              <span className="text-sm text-gray-600">Najaktivniji</span>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500">
              Nema podataka o aktivnosti
            </div>
          )}
        </div>
      </Card>

      {/* Upozorenja i predlozi */}
      <Card title="⚠️ Upozorenja i predlozi">
        <div className="space-y-3">
          {analytics.totalEmployees === 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Nema zaposlenih u sistemu</div>
              <div className="text-red-600 text-sm">Dodajte zaposlene u sekciju "Zaposleni"</div>
            </div>
          )}
          
          {analytics.totalShifts === 0 && analytics.totalEmployees > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 font-medium">Nema kreiraných smena</div>
              <div className="text-yellow-600 text-sm">Idite na "Raspored smena" da kreirate raspored</div>
            </div>
          )}

          {analytics.totalShifts / Math.max(analytics.totalEmployees, 1) > 40 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-orange-800 font-medium">Visoko opterećenje zaposlenih</div>
              <div className="text-orange-600 text-sm">Razmislite o zapošljavanju dodatnih radnika</div>
            </div>
          )}

          {Object.keys(analytics.departmentStats).length === 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-800 font-medium">Samo jedno odeljenje aktivno</div>
              <div className="text-blue-600 text-sm">Dodajte zaposlene u ostala odeljenja za bolje pokrivanje</div>
            </div>
          )}

          {analytics.totalShifts > 0 && analytics.totalShifts < analytics.totalEmployees && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 font-medium">Dobra balansiranost</div>
              <div className="text-green-600 text-sm">Raspored izgleda uravnoteženo</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}