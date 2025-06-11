// src/components/export/SimpleExport.tsx
import React, { useState } from 'react';
import { Download, Calendar, Users, DollarSign } from 'lucide-react';
import { Card, Button, Select } from '@/components/ui';
import { DAYS_OF_WEEK } from '@/lib/constants';
import type { Employee, Schedules, Salary } from '@/types';

interface SimpleExportProps {
  employees: Employee[];
  schedules: Schedules;
  salaries: Record<string, Salary>;
  currentWeek: number;
}

export function SimpleExport({ employees, schedules, salaries, currentWeek }: SimpleExportProps) {
  const [exportType, setExportType] = useState<'schedule' | 'free' | 'salaries'>('schedule');

  const weekKey = `week-${currentWeek}`;
  const currentSchedule = schedules[weekKey] || {};

  // Export rasporeda smena
  const exportSchedule = () => {
    let content = `RASPORED SMENA - NEDELJA ${currentWeek === 0 ? 'TRENUTNA' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}\n`;
    content += '='.repeat(50) + '\n\n';

    DAYS_OF_WEEK.forEach(day => {
      content += `📅 ${day.toUpperCase()}\n`;
      content += '-'.repeat(30) + '\n';

      let hasSchedule = false;

      // Grupa po smenama
      const shifts = ['8-16', '10-14', '14-22', '16-24', '18-22', '10-14 i 18-22'];
      
      shifts.forEach(shift => {
        const employeesInShift: string[] = [];
        
        Object.entries(currentSchedule).forEach(([key, employeeNames]) => {
          if (key.includes(`-${day}-${shift}`) || key.includes(`-${day}-`) && key.endsWith(`-${shift}`)) {
            employeesInShift.push(...(employeeNames as string[]));
          }
        });

        if (employeesInShift.length > 0) {
          content += `⏰ ${shift}h:\n`;
          employeesInShift.forEach(empName => {
            const employee = employees.find(e => e.name === empName);
            content += `   • ${empName}`;
            if (employee?.position) content += ` (${employee.position})`;
            if (employee?.phone) content += ` - 📞 ${employee.phone}`;
            content += '\n';
          });
          content += '\n';
          hasSchedule = true;
        }
      });

      if (!hasSchedule) {
        content += '   Nema zakazanih smena\n\n';
      }
      content += '\n';
    });

    content += '\n📊 STATISTIKE:\n';
    content += '-'.repeat(20) + '\n';
    content += `Ukupno zaposlenih: ${employees.length}\n`;
    
    const totalScheduled = new Set();
    Object.values(currentSchedule).forEach(employeeNames => {
      (employeeNames as string[]).forEach(name => totalScheduled.add(name));
    });
    
    content += `Raspoređeno: ${totalScheduled.size}\n`;
    content += `Slobodno: ${employees.length - totalScheduled.size}\n`;

    downloadTextFile(`raspored-nedelja-${currentWeek}.txt`, content);
  };

  // Export slobodnih zaposlenih
  const exportFreeEmployees = () => {
    let content = `SLOBODNI ZAPOSLENI - NEDELJA ${currentWeek === 0 ? 'TRENUTNA' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}\n`;
    content += '='.repeat(50) + '\n\n';

    DAYS_OF_WEEK.forEach(day => {
      content += `📅 ${day.toUpperCase()}\n`;
      content += '-'.repeat(30) + '\n';

      // Pronađi sve dodeljene zaposlene za taj dan
      const assignedEmployees = new Set<string>();
      Object.entries(currentSchedule).forEach(([key, employeeNames]) => {
        if (key.includes(`-${day}-`)) {
          (employeeNames as string[]).forEach(name => assignedEmployees.add(name));
        }
      });

      // Pronađi slobodne
      const freeEmployees = employees.filter(emp => !assignedEmployees.has(emp.name));

      if (freeEmployees.length > 0) {
        content += '😎 SLOBODNI:\n';
        freeEmployees.forEach(emp => {
          content += `   • ${emp.name} (${emp.position})`;
          if (emp.phone) content += ` - 📞 ${emp.phone}`;
          content += '\n';
        });
      } else {
        content += '   Nema slobodnih zaposlenih\n';
      }

      // Prikaži i ko radi
      if (assignedEmployees.size > 0) {
        content += `\n👷 RADI (${assignedEmployees.size}):\n`;
        Array.from(assignedEmployees).forEach(name => {
          const emp = employees.find(e => e.name === name);
          content += `   • ${name}`;
          if (emp?.position) content += ` (${emp.position})`;
          content += '\n';
        });
      }

      content += '\n';
    });

    downloadTextFile(`slobodni-nedelja-${currentWeek}.txt`, content);
  };

  // Export plata
  const exportSalaries = () => {
    let content = 'PREGLED PLATA\n';
    content += '='.repeat(30) + '\n\n';

    if (Object.keys(salaries).length === 0) {
      content += 'Nema unetih plata.\n';
    } else {
      let totalSalaries = 0;
      let totalBank = 0;
      let totalCash = 0;

      Object.values(salaries).forEach(salary => {
        content += `👤 ${salary.employee}\n`;
        content += `   💰 Ukupno: ${salary.total.toLocaleString()} RSD\n`;
        content += `   🏦 Na račun: ${salary.bank.toLocaleString()} RSD\n`;
        content += `   💵 Kesh: ${salary.cash.toLocaleString()} RSD\n`;
        content += `   📅 Datum: ${new Date(salary.createdAt).toLocaleDateString('sr-RS')}\n\n`;

        totalSalaries += salary.total;
        totalBank += salary.bank;
        totalCash += salary.cash;
      });

      content += '📊 UKUPNO:\n';
      content += '-'.repeat(20) + '\n';
      content += `💰 Ukupne plate: ${totalSalaries.toLocaleString()} RSD\n`;
      content += `🏦 Ukupno na račun: ${totalBank.toLocaleString()} RSD\n`;
      content += `💵 Ukupno kesh: ${totalCash.toLocaleString()} RSD\n`;
      content += `👥 Broj zaposlenih: ${Object.keys(salaries).length}\n`;
      content += `📈 Prosečna plata: ${Math.round(totalSalaries / Object.keys(salaries).length).toLocaleString()} RSD\n`;
    }

    const today = new Date().toLocaleDateString('sr-RS');
    content += `\n📅 Generisano: ${today}\n`;

    downloadTextFile(`plate-${today.replace(/\./g, '-')}.txt`, content);
  };

  // Helper funkcija za download
  const downloadTextFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = () => {
    switch (exportType) {
      case 'schedule':
        exportSchedule();
        break;
      case 'free':
        exportFreeEmployees();
        break;
      case 'salaries':
        exportSalaries();
        break;
    }
  };

  const getExportDescription = () => {
    switch (exportType) {
      case 'schedule':
        return 'Kompletni raspored smena sa kontakt informacijama';
      case 'free':
        return 'Lista slobodnih zaposlenih po danima';
      case 'salaries':
        return 'Pregled svih plata sa statistikama';
      default:
        return '';
    }
  };

  return (
    <Card title="📤 Export podataka" icon={<Download className="w-5 h-5" />}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip exporta
          </label>
          <Select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as 'schedule' | 'free' | 'salaries')}
            className="w-full"
          >
            <option value="schedule">📅 Raspored smena</option>
            <option value="free">😎 Slobodni zaposleni</option>
            <option value="salaries">💰 Plate</option>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            {exportType === 'schedule' && <Calendar className="w-5 h-5 text-blue-500 mt-1" />}
            {exportType === 'free' && <Users className="w-5 h-5 text-green-500 mt-1" />}
            {exportType === 'salaries' && <DollarSign className="w-5 h-5 text-yellow-500 mt-1" />}
            <div>
              <p className="font-medium text-gray-800">
                {exportType === 'schedule' && 'Raspored smena'}
                {exportType === 'free' && 'Slobodni zaposleni'}
                {exportType === 'salaries' && 'Pregled plata'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getExportDescription()}
              </p>
              {(exportType === 'schedule' || exportType === 'free') && (
                <p className="text-xs text-gray-500 mt-2">
                  Nedelja: {currentWeek === 0 ? 'Trenutna' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleExport}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
        >
          <Download className="w-4 h-4 mr-2" />
          Preuzmi {exportType === 'schedule' ? 'raspored' : exportType === 'free' ? 'slobodne' : 'plate'}
        </Button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 Saveti za export</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Fajlovi se čuvaju kao .txt format koji možete otvoriti u bilo kom editoru</li>
            <li>• Možete kopirati sadržaj i poslati putem WhatsApp, SMS ili email-a</li>
            <li>• Export uključuje sve relevantne informacije i kontakte</li>
            <li>• Za štampanje koristite obični tekst editor</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}