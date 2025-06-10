// src/components/salary/MonthlySalaryView.tsx
import React, { useState } from 'react';
import { Calendar, DollarSign, Trash2, Download } from 'lucide-react';
import { Card, Select, Input, Button } from '@/components/ui';
import { Employee } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';

interface MonthlySalary {
  employee: string;
  month: string;
  year: number;
  total: number;
  bank: number;
  cash: number;
  createdAt: string;
}

interface MonthlySalaryViewProps {
  employees: Employee[];
  monthlySalaries: Record<string, MonthlySalary>; // key: "employee-YYYY-MM"
  onAddMonthlySalary: (salary: MonthlySalary) => void;
  onRemoveMonthlySalary: (key: string) => void;
}

export function MonthlySalaryView({ 
  employees, 
  monthlySalaries, 
  onAddMonthlySalary, 
  onRemoveMonthlySalary 
}: MonthlySalaryViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [salaryForm, setSalaryForm] = useState({
    employee: '',
    totalSalary: '',
    bankAmount: ''
  });

  // Generiši opcije za mesece (poslednje 2 godine + naredne 6 meseci)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Dodaj mesece od prošle godine do narednih 6 meseci
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
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
    
    return options.reverse(); // Najnoviji meseci na vrhu
  };

  const handleAddSalary = () => {
    if (!salaryForm.employee || !salaryForm.totalSalary || !salaryForm.bankAmount) {
      alert('Molimo popunite sva polja');
      return;
    }

    const total = parseFloat(salaryForm.totalSalary);
    const bank = parseFloat(salaryForm.bankAmount);
    
    if (isNaN(total) || total <= 0) {
      alert('Molimo unesite validnu ukupnu platu');
      return;
    }
    
    if (isNaN(bank) || bank < 0 || bank > total) {
      alert('Molimo unesite validan iznos za račun');
      return;
    }

    const [year, month] = selectedMonth.split('-');
    const key = `${salaryForm.employee}-${selectedMonth}`;
    
    // Proveri da li već postoji plata za ovaj mesec
    if (monthlySalaries[key]) {
      if (!confirm(`Plata za ${salaryForm.employee} za ${month}/${year} već postoji. Da li želite da je prepišete?`)) {
        return;
      }
    }

    const salary: MonthlySalary = {
      employee: salaryForm.employee,
      month,
      year: parseInt(year),
      total,
      bank,
      cash: total - bank,
      createdAt: new Date().toISOString()
    };

    onAddMonthlySalary(salary);
    setSalaryForm({ employee: '', totalSalary: '', bankAmount: '' });
  };

  // Filtriraj plate za izabrani mesec
  const currentMonthSalaries = Object.entries(monthlySalaries)
    .filter(([key]) => key.endsWith(`-${selectedMonth}`))
    .map(([key, salary]) => ({ key, ...salary }));

  // Izračunaj ukupne statistike za mesec
  const monthlyStats = currentMonthSalaries.reduce((acc, salary) => ({
    total: acc.total + salary.total,
    bank: acc.bank + salary.bank,
    cash: acc.cash + salary.cash,
    count: acc.count + 1
  }), { total: 0, bank: 0, cash: 0, count: 0 });

  // Lista zaposlenih koji još nemaju platu za ovaj mesec
  const employeesWithoutSalary = employees.filter(emp => 
    !currentMonthSalaries.some(salary => salary.employee === emp.name)
  );

  const cashAmount = salaryForm.totalSalary && salaryForm.bankAmount 
    ? parseFloat(salaryForm.totalSalary) - parseFloat(salaryForm.bankAmount)
    : 0;

  const exportMonthlyReport = () => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    const monthName = monthNames[parseInt(month) - 1];

    let content = `💰 MESEČNI OBRAČUN PLATA\n`;
    content += `📅 ${monthName} ${year}\n`;
    content += `${'='.repeat(40)}\n\n`;

    if (currentMonthSalaries.length === 0) {
      content += `⚠️ Nema unetih plata za ovaj mesec.\n\n`;
    } else {
      // Grupisanje po odeljenjima
      DEPARTMENTS.forEach(dept => {
        const deptSalaries = currentMonthSalaries.filter(salary => {
          const emp = employees.find(e => e.name === salary.employee);
          return emp?.department === dept.id;
        });

        if (deptSalaries.length > 0) {
          content += `🏢 ${dept.name.toUpperCase()}\n`;
          content += `${'-'.repeat(dept.name.length + 5)}\n`;

          deptSalaries.forEach(salary => {
            const emp = employees.find(e => e.name === salary.employee);
            content += `👤 ${salary.employee}\n`;
            content += `📋 ${emp?.position || 'N/A'}\n`;
            content += `💵 Ukupno: ${salary.total.toLocaleString()} RSD\n`;
            content += `🏦 Račun: ${salary.bank.toLocaleString()} RSD\n`;
            content += `💸 Keš: ${salary.cash.toLocaleString()} RSD\n`;
            content += `${'─'.repeat(25)}\n\n`;
          });
        }
      });

      // Ukupna statistika
      content += `📊 UKUPNO ZA ${monthName.toUpperCase()} ${year}\n`;
      content += `${'-'.repeat(30)}\n`;
      content += `👥 Broj zaposlenih: ${monthlyStats.count}\n`;
      content += `💵 Ukupne plate: ${monthlyStats.total.toLocaleString()} RSD\n`;
      content += `🏦 Za račune: ${monthlyStats.bank.toLocaleString()} RSD\n`;
      content += `💸 Potreban keš: ${monthlyStats.cash.toLocaleString()} RSD\n\n`;

      // Zaposleni bez plate
      if (employeesWithoutSalary.length > 0) {
        content += `⚠️ BEZ OBRAČUNA (${employeesWithoutSalary.length}):\n`;
        employeesWithoutSalary.forEach(emp => {
          content += `• ${emp.name} (${emp.position})\n`;
        });
        content += '\n';
      }
    }

    content += `📱 Generirano: ${new Date().toLocaleDateString('sr-RS')} u ${new Date().toLocaleTimeString('sr-RS')}\n`;
    content += `🏢 Restoran Management`;

    // Download as file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plate-${selectedMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Izbor meseca */}
      <Card title="Mesečni obračun plata" icon={<Calendar className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Izaberite mesec
            </label>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={generateMonthOptions()}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={exportMonthlyReport}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={currentMonthSalaries.length === 0}
            >
              <Download className="w-4 h-4" />
              Izvoz izveštaja
            </Button>
          </div>
        </div>
      </Card>

      {/* Forma za dodavanje */}
      <Card title="Dodaj platu za izabrani mesec" icon={<DollarSign className="w-5 h-5" />}>
        <div className="space-y-3">
          <Select
            value={salaryForm.employee}
            onChange={(e) => setSalaryForm({...salaryForm, employee: e.target.value})}
            options={[
              { value: '', label: 'Izaberite zaposlenog' },
              ...employees.map(emp => ({
                value: emp.name,
                label: `${emp.name} - ${emp.position} (${DEPARTMENTS.find(d => d.id === emp.department)?.name})`
              }))
            ]}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Ukupna plata (RSD)"
              value={salaryForm.totalSalary}
              onChange={(e) => setSalaryForm({...salaryForm, totalSalary: e.target.value})}
            />
            
            <Input
              type="number"
              placeholder="Iznos na račun (RSD)"
              value={salaryForm.bankAmount}
              onChange={(e) => setSalaryForm({...salaryForm, bankAmount: e.target.value})}
            />
          </div>
          
          {salaryForm.totalSalary && salaryForm.bankAmount && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💰 Gotovina za isplatu: <strong>{cashAmount.toLocaleString()} RSD</strong>
              </p>
            </div>
          )}
          
          <Button
            variant="success"
            onClick={handleAddSalary}
            disabled={!salaryForm.employee || !salaryForm.totalSalary || !salaryForm.bankAmount}
            className="w-full"
          >
            Sačuvaj platu za {selectedMonth.split('-').reverse().join('/')}
          </Button>
        </div>
      </Card>

      {/* Statistike meseca */}
      {monthlyStats.count > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            📊 Pregled za {selectedMonth.split('-').reverse().join('/')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{monthlyStats.count}</div>
              <div className="text-sm text-gray-600">Zaposlenih</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{monthlyStats.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Ukupno RSD</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{monthlyStats.bank.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Na račune</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{monthlyStats.cash.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Gotovina</div>
            </div>
          </div>
          
          {employeesWithoutSalary.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 rounded border">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>{employeesWithoutSalary.length} zaposlenih</strong> još nema obračun za ovaj mesec
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista plata za mesec */}
      <Card title={`Plate za ${selectedMonth.split('-').reverse().join('/')}`}>
        {currentMonthSalaries.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            Nema unetih plata za izabrani mesec
          </p>
        ) : (
          <div className="space-y-3">
            {currentMonthSalaries.map((salary) => {
              const emp = employees.find(e => e.name === salary.employee);
              const dept = DEPARTMENTS.find(d => d.id === emp?.department);
              
              return (
                <div key={salary.key} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-800">{salary.employee}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${dept?.color}`}>
                          {dept?.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{emp?.position}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">UKUPNO</span>
                          <p className="font-semibold">{salary.total.toLocaleString()} RSD</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">RAČUN</span>
                          <p className="font-medium text-blue-700">{salary.bank.toLocaleString()} RSD</p>
                        </div>
                        <div>
                          <span className="text-xs text-green-600">GOTOVINA</span>
                          <p className="font-medium text-green-700">{salary.cash.toLocaleString()} RSD</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveMonthlySalary(salary.key)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                      title="Ukloni platu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}