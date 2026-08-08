'use client';

import React, { useState } from 'react';
import { ReportData, EquipmentStatus } from '@/models/report';
import { Monitor, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step4Equipment({ data, onChange }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>('Em funcionamento');
  const [observation, setObservation] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      status,
      observation: observation.trim(),
    };
    const currentList = data?.topico4_equipamentos || [];
    onChange({ topico4_equipamentos: [...currentList, newItem] });
    setName('');
    setObservation('');
    setStatus('Em funcionamento');
  };

  const handleRemove = (id: string) => {
    const currentList = data?.topico4_equipamentos || [];
    onChange({
      topico4_equipamentos: currentList.filter(item => item.id !== id),
    });
  };

  const equipmentList = data?.topico4_equipamentos || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 4 - Equipamentos e Tecnologia
      </h2>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adicionar Equipamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nome do equipamento (ex: Computador CT-01)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={status}
            onChange={e => setStatus(e.target.value as EquipmentStatus)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Em funcionamento">Em funcionamento</option>
            <option value="Com defeito">Com defeito</option>
            <option value="Manutenção necessária">Manutenção necessária</option>
          </select>

          <input
            type="text"
            placeholder="Observação (opcional)"
            value={observation}
            onChange={e => setObservation(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar Equipamento
        </button>
      </div>

      <div className="space-y-3">
        {equipmentList.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
            Nenhum equipamento cadastrado até o momento.
          </p>
        ) : (
          equipmentList.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                    {item.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'Em funcionamento'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'Manutenção necessária'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.observation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {item.observation}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title="Remover equipamento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}