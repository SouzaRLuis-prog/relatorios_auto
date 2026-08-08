'use client';

import React from 'react';
import { ReportData, EvaluationStatus } from '@/models/report';
import { ShieldCheck } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step7Security({ data, onChange }: Props) {
  const topico7 = data?.topico7_seguranca || {};

  const handleFieldChange = (
    field: keyof typeof topico7,
    key: 'status' | 'observation',
    value: string
  ) => {
    onChange({
      topico7_seguranca: {
        ...topico7,
        [field]: {
          status: 'Adequado',
          observation: '',
          ...topico7[field],
          [key]: value,
        },
      },
    });
  };

  const fields: { key: keyof typeof topico7; label: string }[] = [
    { key: 'extintores', label: 'Extintores de Incêndio (Validade/Acesso)' },
    { key: 'fechadura', label: 'Fechaduras e Trincos das Portas' },
    { key: 'portoes', label: 'Portões de Acesso e Muros' },
    { key: 'iluminacaoExterna', label: 'Iluminação Externa da Unidade' },
    { key: 'camera', label: 'Câmeras de Segurança / Alarmes' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 7 - Segurança
      </h2>

      <div className="space-y-4">
        {fields.map(({ key, label }) => {
          const item = topico7[key] || { status: 'Adequado', observation: '' };

          return (
            <div
              key={key}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </span>

                <select
                  value={item.status}
                  onChange={(e) => handleFieldChange(key, 'status', e.target.value as EvaluationStatus)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Adequado">Adequado</option>
                  <option value="Regular">Regular</option>
                  <option value="Inadequado">Inadequado</option>
                </select>
              </div>

              <input
                type="text"
                value={item.observation || ''}
                onChange={(e) => handleFieldChange(key, 'observation', e.target.value)}
                placeholder="Observações adicionais..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}