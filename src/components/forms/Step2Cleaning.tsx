'use client';

import React from 'react';
import { ReportData, CleaningStatus } from '@/models/report';
import { Sparkles } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

const cleaningItems = [
  { key: 'ambienteLimpo', label: 'Ambiente limpo' },
  { key: 'banheirosHigienizados', label: 'Banheiros higienizados' },
  { key: 'coletaLixoAdequada', label: 'Coleta de lixo adequada' },
  { key: 'organizacaoSalas', label: 'Organização das salas' },
  { key: 'produtosLimpezaDisponiveis', label: 'Produtos de limpeza disponíveis' },
] as const;

export function Step2Cleaning({ data, onChange }: Props) {
  const handleUpdate = (key: string, field: 'status' | 'observation', value: string) => {
    const updated = {
      ...data.topico2_limpeza,
      [key]: {
        ...data.topico2_limpeza[key as keyof typeof data.topico2_limpeza],
        [field]: value,
      },
    };
    onChange({ topico2_limpeza: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 2 - Avaliação de Limpeza
      </h2>

      <div className="space-y-4">
        {cleaningItems.map(({ key, label }) => {
          const current = data.topico2_limpeza[key as keyof typeof data.topico2_limpeza];
          return (
            <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                <select
                  value={current?.status || 'Sim'}
                  onChange={e => handleUpdate(key, 'status', e.target.value as CleaningStatus)}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Sim">Sim</option>
                  <option value="Parcial">Parcial</option>
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