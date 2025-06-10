import React from 'react';
import { Plus } from 'lucide-react';
import { Card, Select, Button } from '@/components/ui';
import { Employee, ScheduleFormData } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface EmployeeSelectorProps {
  employees: Employee[];
  activeTab: string;
  availableShifts: string[];
  scheduleForm: ScheduleFormData;
  onFormChange: (form: ScheduleFormData) => void;
  onAddEmployee: () => void;
}

export function EmployeeSelector({ 
  employees, 
  activeTab, 
  availableShifts, 
  scheduleForm, 
  onFormChange, 
  onAddEmployee 
}: EmployeeSelectorProps) {
  const departmentEmployees = employees.filter(emp => emp.department === activeTab);

  return (
    <Card title="Dodaj u raspored" icon={<Plus className="w-5 h-5" />}>
      <div className="space-y-3">
        <Select
          value={scheduleForm.employee}
          onChange={(e) => onFormChange({ ...scheduleForm, employee: e.target.value })}
          options={[
            { value: '', label: 'Izaberi zaposlenog' },
            ...departmentEmployees.map(emp => ({
              value: emp.name,
              label: `${emp.name} - ${emp.position}`
            }))
          ]}
        />
        
        <Select
          value={scheduleForm.day}
          onChange={(e) => onFormChange({ ...scheduleForm, day: e.target.value })}
          options={[
            { value: '', label: 'Izaberi dan' },
            ...DAYS_OF_WEEK.map(day => ({ value: day, label: day }))
          ]}
        />
        
        <Select
          value={scheduleForm.shift}
          onChange={(e) => onFormChange({ ...scheduleForm, shift: e.target.value })}
          options={[
            { value: '', label: 'Izaberi smenu' },
            ...availableShifts.map(shift => ({ value: shift, label: shift }))
          ]}
        />
        
        <Button
          variant="success"
          onClick={onAddEmployee}
          disabled={!scheduleForm.employee || !scheduleForm.day || !scheduleForm.shift}
          className="w-full"
        >
          Dodaj u raspored
        </Button>
      </div>
    </Card>
  );
}