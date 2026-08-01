'use client';

import React, { useState } from 'react';
import { ReportData } from '@/models/report';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step9Actions({ data, onChange }: Props) {
  const [providencia, setProvidencia] = useState('');
  const [dataAcao, setDataAcao] = useState(new Date().toISOString().split('T')[0]);
  const [situacao, setSituacao] = useState('Em andamento');

  const handleAdd = () => {
    if (!providencia.trim()) return;
    const newItem = { id: crypto.randomUUID(), providencia, data: dataAcao, situacao };
    onChange({ topico9_providencias: [...data.topico9_providencias, newItem] });
    setProvidencia('');
  };

  const handleRemove = (id: string) => {
    onChange({ topico9_providencias: data.topico9_providencias.filter(item => item.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 9 - Providências Tomadas pela Diretoria
      </h2>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
        <input
          type="text"
          placeholder="Descrição da Providência"
          value={providencia}
          onChange={e => setProvidencia(e.target.value)}
          className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            value={dataAcao}
            onChange={e => setDataAcao(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          />
          <input
            type="text"
            placeholder="Situação (ex: Resolvido / Em análise)"
            value={situacao}
            onChange={e => setSituacao(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Adicionar Providência
        </button>
      </div>

      <div className="space-y-2">
        {data.topico9_providencias.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{item.providencia}</span>
              <p className="text-xs text-slate-500 mt-1">Data: {item.data} | Status: {item.situacao}</p>
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