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
  const [dataAcao, setDataAcao] = useState(() => new Date().toISOString().split('T')[0]);
  const [situacao, setSituacao] = useState('Em andamento');

  const handleAdd = () => {
    if (!providencia.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      providencia: providencia.trim(),
      data: dataAcao,
      situacao: situacao.trim(),
    };
    const currentList = data?.topico9_providencias || [];
    onChange({ topico9_providencias: [...currentList, newItem] });
    setProvidencia('');
    setSituacao('Em andamento');
  };

  const handleRemove = (id: string) => {
    const currentList = data?.topico9_providencias || [];
    onChange({
      topico9_providencias: currentList.filter(item => item.id !== id),
    });
  };

  const actionsList = data?.topico9_providencias || [];

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
          className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            value={dataAcao}
            onChange={e => setDataAcao(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Situação (ex: Resolvido / Em análise)"
            value={situacao}
            onChange={e => setSituacao(e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar Providência
        </button>
      </div>

      <div className="space-y-2">
        {actionsList.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
            Nenhuma providência cadastrada até o momento.
          </p>
        ) : (
          actionsList.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{item.providencia}</span>
                <p className="text-xs text-slate-500 mt-1">Data: {item.data} | Status: {item.situacao}</p>
              </div>
              <button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 p-1 hover:opacity-80">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}