'use client';

import React from 'react';
import { ReportData } from '@/models/report';
import { UserCheck } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

const serviceItems = [
  { key: 'atendimentoRegular', label: 'Atendimento Regular' },
  { key: 'salaReservada', label: 'Sala Reservada para o Atendimento' },
  { key: 'organizacaoAtendimento', label: 'Organização do atendimento' },
  { key: 'fluxoUsuario', label: 'Fluxo de Usuários' },
] as const;

export function Step6CustomerService({ data, onChange }: Props) {
  const handleUpdate = (key: string, field: 'status' | 'observation', value: string) => {
    const updated = {
      ...data.topico6_atendimento,
      [key]: {
        ...data.topico6_atendimento[key as keyof typeof data.topico6_atendimento],
        [field]: value,
      },
    };
    onChange({ topico6_atendimento: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 6 - Atendimento ao Público
      </h2>

      <div className="space-y-4">
        {serviceItems.map(({ key, label }) => {
          const current = data.topico6_atendimento[key as keyof typeof data.topico6_atendimento];
          return (
            <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                <select
                  value={current?.status || 'Sim'}
                  onChange={e => handleUpdate(key, 'status', e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Observação (opcional)"
                value={current?.observation || ''}
                onChange={e => handleUpdate(key, 'observation', e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}