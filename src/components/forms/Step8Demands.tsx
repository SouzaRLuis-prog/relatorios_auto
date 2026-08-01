'use client';

import React, { useState } from 'react';
import { ReportData, PriorityLevel, DemandSituation } from '@/models/report';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step8Demands({ data, onChange }: Props) {
  const [demanda, setDemanda] = useState('');
  const [prioridade, setPrioridade] = useState<PriorityLevel>('Média');
  const [setorResponsavel, setSetorResponsavel] = useState('');
  const [situacao, setSituacao] = useState<DemandSituation>('Pendente');

  const handleAdd = () => {
    if (!demanda.trim()) return;
    const newItem = { id: crypto.randomUUID(), demanda, prioridade, setorResponsavel, situacao };
    onChange({ topico8_demandas: [...data.topico8_demandas, newItem] });
    setDemanda('');
    setSetorResponsavel('');
  };

  const handleRemove = (id: string) => {
    onChange({ topico8_demandas: data.topico8_demandas.filter(item => item.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 8 - Demandas Identificadas
      </h2>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
        <input
          type="text"
          placeholder="Descrição da Demanda"
          value={demanda}
          onChange={e => setDemanda(e.target.value)}
          className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={prioridade}
            onChange={e => setPrioridade(e.target.value as PriorityLevel)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          <input
            type="text"
            placeholder="Setor Responsável"
            value={setorResponsavel}
            onChange={e => setSetorResponsavel(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          />

          <select
            value={situacao}
            onChange={e => setSituacao(e.target.value as DemandSituation)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Adicionar Demanda
        </button>
      </div>

      <div className="space-y-2">
        {data.topico8_demandas.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{item.demanda}</span>
              <p className="text-xs text-slate-500 mt-1">Setor: {item.setorResponsavel || 'N/A'} | Prioridade: {item.prioridade} | Status: {item.situacao}</p>
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