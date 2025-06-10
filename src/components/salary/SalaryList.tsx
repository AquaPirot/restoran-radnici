// src/components/salary/SalaryList.tsx - Poboljšana verzija
import React from 'react';
import { Trash2, Calculator } from 'lucide-react';

interface SalaryListProps {
  salaries: Record<string, { total: number; bank: number; cash: number }>;
  onRemoveSalary: (employeeName: string) => void;
}

export function SalaryList({ salaries, onRemoveSalary }: SalaryListProps) {
  const totalSalaries = Object.values(salaries).reduce((sum, s) => ({
    total: sum.total + s.total,
    bank: sum.bank + s.bank,
    cash: sum.cash + s.cash
  }), { total: 0, bank: 0, cash: 0 });

  if (Object.keys(salaries).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Pregled plata
        </h3>
        <p className="text-gray-500 italic">Nema unetih plata</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5" />
        Pregled plata ({Object.keys(salaries).length} zaposlenih)
      </h3>
      
      <div className="space-y-3">
        {Object.entries(salaries).map(([employee, salary]) => (
          <div key={employee} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-2">{employee}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Ukupno</span>
                    <p className="font-semibold text-lg">{salary.total.toLocaleString()} RSD</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600 uppercase tracking-wide">Na račun</span>
                    <p className="font-medium text-blue-700">{salary.bank.toLocaleString()} RSD</p>
                  </div>
                  <div>
                    <span className="text-xs text-green-600 uppercase tracking-wide">Gotovina</span>
                    <p className="font-medium text-green-700">{salary.cash.toLocaleString()} RSD</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemoveSalary(employee)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded ml-4"
                title="Ukloni platu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Ukupan pregled */}
        <div className="border-t pt-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💰 Ukupno za sve zaposlene
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <span className="text-xs text-gray-600 uppercase tracking-wide block">Ukupno</span>
                <p className="font-bold text-xl text-gray-800">{totalSalaries.total.toLocaleString()} RSD</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-blue-600 uppercase tracking-wide block">Računi</span>
                <p className="font-bold text-xl text-blue-700">{totalSalaries.bank.toLocaleString()} RSD</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-green-600 uppercase tracking-wide block">Gotovina</span>
                <p className="font-bold text-xl text-green-700">{totalSalaries.cash.toLocaleString()} RSD</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-sm text-yellow-800">
                <strong>💡 Treba da pripremite:</strong> {totalSalaries.cash.toLocaleString()} RSD u gotovini za isplatu plata
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
