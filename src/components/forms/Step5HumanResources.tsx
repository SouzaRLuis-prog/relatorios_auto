'use client';

import React from 'react';
import { ReportData } from '@/models/report';
import { Users } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

const rhFields = [
  { key: 'conselheirosPresentes', label: 'Conselheiros presentes' },
  { key: 'equipeAdministrativaCompleta', label: 'Equipe administrativa completa' },
  { key: 'cumprimentoHorario', label: 'Cumprimento do horário' },
  { key: 'escalasAfixadas', label: 'Escalas afixadas' },
  { key: 'necessidadeSubstituicao', label: 'Necessidade de substituição' },
] as const;

export function Step5HumanResources({ data, onChange }: Props) {
  const handleUpdate = (key: string, field: 'status' | 'observation', value: string) => {
    const currentRh = data?.topico5_rh || {};
    const currentItem = currentRh[key as keyof typeof currentRh] || {};

    const updated = {
      ...currentRh,
      [key]: {
        ...currentItem,
        [field]: value,
      },
    };
    onChange({ topico5_rh: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 5 - Recursos Humanos
      </h2>

      <div className="space-y-4">
        {rhFields.map(({ key, label }) => {
          const current = data?.topico5_rh?.[key as keyof typeof data.topico5_rh];
          return (
            <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{label}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Situação"
                  value={current?.status || ''}
                  onChange={e => handleUpdate(key, 'status', e.target.value)}
                  className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Observação (opcional)"
                  value={current?.observation || ''}
                  onChange={e => handleUpdate(key, 'observation', e.target.value)}
                  className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}