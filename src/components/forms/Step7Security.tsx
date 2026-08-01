'use client';

import React from 'react';
import { ReportData, EvaluationStatus } from '@/models/report';
import { ShieldCheck } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

const securityItems = [
  { key: 'extintores', label: 'Extintores' },
  { key: 'fechadura', label: 'Fechadura' },
  { key: 'portoes', label: 'Portões' },
  { key: 'iluminacaoExterna', label: 'Iluminação externa' },
  { key: 'camera', label: 'Câmeras (Opcional)' },
] as const;

export function Step7Security({ data, onChange }: Props) {
  const handleUpdate = (key: string, field: 'status' | 'observation', value: string) => {
    const updated = {
      ...data.topico7_seguranca,
      [key]: {
        ...data.topico7_seguranca[key as keyof typeof data.topico7_seguranca],
        [field]: value,
      },
    };
    onChange({ topico7_seguranca: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 7 - Segurança
      </h2>

      <div className="space-y-4">
        {securityItems.map(({ key, label }) => {
          const current = data.topico7_seguranca[key as keyof typeof data.topico7_seguranca];
          return (
            <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                <select
                  value={current?.status || 'Adequado'}
                  onChange={e => handleUpdate(key, 'status', e.target.value as EvaluationStatus)}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Adequado">Adequado</option>
                  <option value="Inadequado">Inadequado</option>
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