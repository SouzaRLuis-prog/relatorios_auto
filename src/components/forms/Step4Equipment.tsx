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
    const newItem = { id: crypto.randomUUID(), name, status, observation };
    onChange({ topico4_equipamentos: [...data.topico4_equipamentos, newItem] });
    setName('');
    setObservation('');
    setStatus('Em funcionamento');
  };

  const handleRemove = (id: string) => {
    onChange({ topico4_equipamentos: data.topico4_equipamentos.filter(item => item.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 4 - Equipamentos
      </h2>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nome do Equipamento (ex: Ar Condicionado)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as EquipmentStatus)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="Em funcionamento">Em funcionamento</option>
            <option value="Necessita manutenção">Necessita manutenção</option>
            <option value="Inoperante">Inoperante</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Observação (opcional)"
          value={observation}
          onChange={e => setObservation(e.target.value)}
          className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Adicionar Equipamento
        </button>
      </div>

      <div className="space-y-2">
        {data.topico4_equipamentos.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{item.status}</span>
              {item.observation && <p className="text-xs text-slate-500 mt-1">{item.observation}</p>}
            </div>
            <button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 p-1 hover:opacity-80">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}