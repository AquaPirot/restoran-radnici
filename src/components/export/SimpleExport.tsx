// src/components/export/SimpleExport.tsx - Fokus na WhatsApp export
import React, { useState } from 'react';
import { Copy, Share, Download, MessageCircle } from 'lucide-react';
import { Card, Select, Button } from '@/components/ui';
import { Employee, Schedule } from '@/types';
import { DEPARTMENTS, DAYS_OF_WEEK } from '@/lib/constants';

interface SimpleExportProps {
  employees: Employee[];
  schedules: Schedule;
  salaries: Record<string, { total: number; bank: number; cash: number }>;
  currentWeek: number;
}

export function SimpleExport({ employees, schedules, salaries, currentWeek }: SimpleExportProps) {
  const [exportType, setExportType] = useState<'schedule' | 'salaries'>('schedule');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const generateScheduleExport = () => {
    const weekKey = `week-${currentWeek}`;
    const currentSchedule = schedules[weekKey] || {};
    const weekText = currentWeek === 0 ? 'TRENUTNA NEDELJA' : 
                    currentWeek > 0 ? `NEDELJA +${currentWeek}` : `NEDELJA ${currentWeek}`;
    
    const filteredDepts = selectedDepartment === 'all' ? DEPARTMENTS : DEPARTMENTS.filter(d => d.id === selectedDepartment);
    
    let content = `🗓️ RASPORED SMENA\n${weekText}\n`;
    content += `${'='.repeat(30)}\n\n`;
    
    filteredDepts.forEach(dept => {
      content += `🏢 ${dept.name.toUpperCase()}\n`;
      content += `${'-'.repeat(dept.name.length + 5)}\n\n`;
      
      DAYS_OF_WEEK.forEach(day => {
        const dayShifts = Object.entries(currentSchedule)
          .filter(([key]) => key.startsWith(`${dept.id}-${day}-`))
          .map(([key, employees]) => {
            const shift = key.split('-').slice(2).join('-');
            return { shift, employees };
          });
        
        if (dayShifts.length > 0) {
          content += `📅 ${day.toUpperCase()}\n`;
          dayShifts.forEach(({ shift, employees }) => {
            content += `   ⏰ ${shift}\n`;
            employees.forEach((emp: string) => {
              content += `     • ${emp}\n`;
            });
          });
          content += '\n';
        }
      });
    });
    
    content += `\n📱 Generirano: ${new Date().toLocaleDateString('sr-RS')} u ${new Date().toLocaleTimeString('sr-RS')}\n`;
    content += `🏢 Restoran Management`;
    
    return content;
  };

  const generateSalariesExport = () => {
    const filteredEmployees = selectedDepartment === 'all' ? 
      employees : employees.filter(emp => emp.department === selectedDepartment);
    
    let content = `💰 LISTA PLATA\n`;
    content += `${'-'.repeat(20)}\n\n`;
    
    const totalStats = { total: 0, bank: 0, cash: 0 };
    let processedCount = 0;
    
    filteredEmployees.forEach(emp => {
      const salary = salaries[emp.name];
      if (salary) {
        const dept = DEPARTMENTS.find(d => d.id === emp.department);
        content += `👤 ${emp.name}\n`;
        content += `🏢 ${dept?.name} - ${emp.position}\n`;
        content += `💵 Ukupno: ${salary.total.toLocaleString()} RSD\n`;
        content += `🏦 Račun: ${salary.bank.toLocaleString()} RSD\n`;
        content += `💸 Keš: ${salary.cash.toLocaleString()} RSD\n`;
        content += `${'─'.repeat(25)}\n\n`;
        
        totalStats.total += salary.total;
        totalStats.bank += salary.bank;
        totalStats.cash += salary.cash;
        processedCount++;
      }
    });
    
    if (processedCount === 0) {
      content += `⚠️ Nema podataka o platama za izabrano odelenje.\n\n`;
    } else {
      content += `📊 UKUPNO (${processedCount} zaposlenih)\n`;
      content += `💵 Ukupne plate: ${totalStats.total.toLocaleString()} RSD\n`;
      content += `🏦 Za račune: ${totalStats.bank.toLocaleString()} RSD\n`;
      content += `💸 Potreban keš: ${totalStats.cash.toLocaleString()} RSD\n\n`;
      
      content += `⚠️ NAPOMENA ZA MENADŽERE:\n`;
      content += `Pripremiti ${totalStats.cash.toLocaleString()} RSD u gotovini!\n\n`;
    }
    
    content += `📱 Generirano: ${new Date().toLocaleDateString('sr-RS')} u ${new Date().toLocaleTimeString('sr-RS')}\n`;
    content += `🏢 Restoran Management`;
    
    return content;
  };

  const content = exportType === 'schedule' ? generateScheduleExport() : generateSalariesExport();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('✅ Kopirano! Možete da nalepite u WhatsApp grupu.');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('❌ Greška pri kopiranju. Pokušajte ponovo.');
    }
  };

  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(content);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: exportType === 'schedule' ? 'Raspored smena' : 'Lista plata',
          text: content,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
        shareViaWhatsApp();
      }
    } else {
      shareViaWhatsApp();
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restoran-${exportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Export opcije */}
      <Card title="Export opcije">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Šta da exportujem?
            </label>
            <Select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as 'schedule' | 'salaries')}
              options={[
                { value: 'schedule', label: '📅 Raspored smena' },
                { value: 'salaries', label: '💰 Lista plata' }
              ]}
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

      {/* Preview i akcije */}
      <Card title="Spreman za deljenje">
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={copyToClipboard} 
              className="flex items-center gap-2"
              variant="primary"
            >
              <Copy className="w-4 h-4" />
              Kopiraj tekst
            </Button>
            <Button 
              onClick={shareViaWhatsApp} 
              variant="success" 
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button 
              onClick={shareContent} 
              variant="secondary" 
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Podeli
            </Button>
            <Button 
              onClick={downloadAsFile} 
              variant="secondary" 
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Preuzmi
            </Button>
          </div>
          
          {/* Preview */}
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {content}
            </pre>
          </div>
          
          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">📱 Kako koristiti:</h4>
            <ul className="space-y-1 text-green-700">
              <li><strong>📋 Kopiraj tekst:</strong> Za ručno lepljenje bilo gde</li>
              <li><strong>💬 WhatsApp:</strong> Direktno otvara WhatsApp sa tekstom</li>
              <li><strong>📤 Podeli:</strong> Koristi telefon za deljenje</li>
              <li><strong>💾 Preuzmi:</strong> Čuva kao .txt fajl</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}