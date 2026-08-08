'use client';

import React from 'react';
import { ReportData, EvaluationStatus } from '@/models/report';
import { Wrench } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

const items = [
  { key: 'pintura', label: 'Pintura' },
  { key: 'telhado', label: 'Telhado' },
  { key: 'piso', label: 'Piso' },
  { key: 'portasJanelas', label: 'Portas e Janelas' },
  { key: 'iluminacao', label: 'Iluminação' },
  { key: 'instalacoesEletricas', label: 'Instalações Elétricas' },
  { key: 'instalacoesHidraulicas', label: 'Instalações Hidráulicas' },
  { key: 'banheiros', label: 'Banheiros' },
  { key: 'copaCozinha', label: 'Copa / Cozinha' },
  { key: 'acessibilidade', label: 'Acessibilidade' },
] as const;

export function Step1PhysicalStructure({ data, onChange }: Props) {
  const handleUpdate = (key: string, field: 'status' | 'observation', value: string) => {
    const currentEstrutura = data?.topico1_estrutura || {};
    const currentItem = currentEstrutura[key as keyof typeof currentEstrutura] || {};

    const updatedTopic = {
      ...currentEstrutura,
      [key]: {
        ...currentItem,
        [field]: value,
      },
    };
    onChange({ topico1_estrutura: updatedTopic });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 1 - Avaliação de Estrutura Física
      </h2>

      <div className="space-y-4">
        {items.map(({ key, label }) => {
          const current = data?.topico1_estrutura?.[key as keyof typeof data.topico1_estrutura];
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
                  <option value="Regular">Regular</option>
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