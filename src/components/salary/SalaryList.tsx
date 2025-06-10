import React from 'react';

interface SalaryListProps {
  salaries: Record<string, { total: number; bank: number; cash: number }>;
}

export function SalaryList({ salaries }: SalaryListProps) {
  const totalSalaries = Object.values(salaries).reduce((sum, s) => ({
    total: sum.total + s.total,
    bank: sum.bank + s.bank,
    cash: sum.cash + s.cash
  }), { total: 0, bank: 0, cash: 0 });

  if (Object.keys(salaries).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Pregled plata</h3>
        <p className="text-gray-500 italic">Nema unetih plata</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Pregled plata</h3>
      
      <div className="space-y-3">
        {Object.entries(salaries).map(([employee, salary]) => (
          <div key={employee} className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-800">{employee}</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div>
                <span className="text-gray-500">Ukupno:</span>
                <p className="font-medium">{salary.total.toLocaleString()} RSD</p>
              </div>
              <div>
                <span className="text-gray-500">Na račun:</span>
                <p className="font-medium text-blue-600">{salary.bank.toLocaleString()} RSD</p>
              </div>
              <div>
                <span className="text-gray-500">Gotovina:</span>
                <p className="font-medium text-green-600">{salary.cash.toLocaleString()} RSD</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-t pt-3 mt-4">
          <div className="bg-yellow-50 p-3 rounded">
            <h4 className="font-medium text-gray-800 mb-2">📊 Ukupno za sve zaposlene:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Ukupno:</span>
                <p className="font-bold">{totalSalaries.total.toLocaleString()} RSD</p>
              </div>
              <div>
                <span className="text-gray-500">Računi:</span>
                <p className="font-bold text-blue-600">{totalSalaries.bank.toLocaleString()} RSD</p>
              </div>
              <div>
                <span className="text-gray-500">Gotovina:</span>
                <p className="font-bold text-green-600">{totalSalaries.cash.toLocaleString()} RSD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}