'use client';

import React from 'react';
import { ReportData } from '@/models/report';
import { Building2, Calendar, Clock, User } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step0General({ data, onChange }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Informações Gerais da Visita
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unidade</label>
          <select
            value={data.unidade}
            onChange={e => onChange({ unidade: e.target.value as any })}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Conselho Tutelar 1">Conselho Tutelar 1</option>
            <option value="Conselho Tutelar 2">Conselho Tutelar 2</option>
            <option value="Conselho Tutelar 3">Conselho Tutelar 3</option>
            <option value="Conselho Tutelar 4">Conselho Tutelar 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Período</label>
          <input
            type="text"
            placeholder="Ex: Matutino / Vespertino"
            value={data.periodo}
            onChange={e => onChange({ periodo: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mês / Ano</label>
          <input
            type="text"
            placeholder="Ex: 08/2026"
            value={data.mesAno}
            onChange={e => onChange({ mesAno: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data da Visita</label>
          <input
            type="date"
            value={data.dataVisita}
            onChange={e => onChange({ dataVisita: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável pela Visita</label>
          <input
            type="text"
            placeholder="Nome do Fiscal / Auditor"
            value={data.responsavelVisita}
            onChange={e => onChange({ responsavelVisita: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}