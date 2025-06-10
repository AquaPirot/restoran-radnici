import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, Select, Input, Button } from '@/components/ui';
import { Employee, SalaryFormData } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';

interface SalaryFormProps {
  employees: Employee[];
  salaryForm: SalaryFormData;
  onFormChange: (form: SalaryFormData) => void;
  onAddSalary: () => void;
}

export function SalaryForm({ employees, salaryForm, onFormChange, onAddSalary }: SalaryFormProps) {
  const cashAmount = salaryForm.totalSalary && salaryForm.bankAmount 
    ? parseFloat(salaryForm.totalSalary) - parseFloat(salaryForm.bankAmount)
    : 0;

  return (
    <Card title="Unesi platu zaposlenog" icon={<DollarSign className="w-5 h-5" />}>
      <div className="space-y-3">
        <Select
          value={salaryForm.employee}
          onChange={(e) => onFormChange({...salaryForm, employee: e.target.value})}
          options={[
            { value: '', label: 'Izaberi zaposlenog' },
            ...employees.map(emp => ({
              value: emp.name,
              label: `${emp.name} - ${emp.position} (${DEPARTMENTS.find(d => d.id === emp.department)?.name})`
            }))
          ]}
        />
        
        <Input
          type="number"
          placeholder="Ukupna plata (RSD)"
          value={salaryForm.totalSalary}
          onChange={(e) => onFormChange({...salaryForm, totalSalary: e.target.value})}
        />
        
        <Input
          type="number"
          placeholder="Iznos na račun (RSD)"
          value={salaryForm.bankAmount}
          onChange={(e) => onFormChange({...salaryForm, bankAmount: e.target.value})}
        />
        
        {salaryForm.totalSalary && salaryForm.bankAmount && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💰 Gotovina za isplatu: <strong>{cashAmount.toLocaleString()} RSD</strong>
            </p>
          </div>
        )}
        
        <Button
          variant="success"
          onClick={onAddSalary}
          disabled={!salaryForm.employee || !salaryForm.totalSalary || !salaryForm.bankAmount}
          className="w-full"
        >
          Sačuvaj platu
        </Button>
      </div>
    </Card>
  );
}