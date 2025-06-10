import React from 'react';
import { User } from 'lucide-react';
import { Card, Input, Select, Button } from '@/components/ui';
import { DEPARTMENTS } from '@/lib/constants';
import { EmployeeFormData } from '@/types';

interface EmployeeFormProps {
  employeeForm: EmployeeFormData;
  onFormChange: (form: EmployeeFormData) => void;
  onAddEmployee: () => void;
}

export function EmployeeForm({ employeeForm, onFormChange, onAddEmployee }: EmployeeFormProps) {
  return (
    <Card title="Dodaj novog zaposlenog" icon={<User className="w-5 h-5" />}>
      <div className="space-y-3">
        <Input
          placeholder="Ime i prezime"
          value={employeeForm.name}
          onChange={(e) => onFormChange({...employeeForm, name: e.target.value})}
        />
        
        <Input
          placeholder="Pozicija (konobar, kuvar, sanker...)"
          value={employeeForm.position}
          onChange={(e) => onFormChange({...employeeForm, position: e.target.value})}
        />
        
        <Select
          value={employeeForm.department}
          onChange={(e) => onFormChange({...employeeForm, department: e.target.value as 'kuhinja' | 'restoran' | 'bazen'})}
          options={DEPARTMENTS.map(dept => ({ value: dept.id, label: dept.name }))}
        />
        
        <Input
          type="tel"
          placeholder="Telefon"
          value={employeeForm.phone}
          onChange={(e) => onFormChange({...employeeForm, phone: e.target.value})}
        />
        
        <textarea
          placeholder="Napomene (opciono)"
          value={employeeForm.notes}
          onChange={(e) => onFormChange({...employeeForm, notes: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows={2}
        />
        
        <Button
          variant="success"
          onClick={onAddEmployee}
          disabled={!employeeForm.name.trim() || !employeeForm.position.trim()}
          className="w-full"
        >
          Dodaj zaposlenog
        </Button>
      </div>
    </Card>
  );
}