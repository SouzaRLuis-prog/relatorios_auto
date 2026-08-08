'use client';

import React from 'react';
import { ReportData, ConsumableItem, MaterialStatus } from '@/models/report';
import { PackagePlus, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step3Consumables({ data, onChange }: Props) {
  const materiais = data?.topico3_materiais || [];

  const handleAddItem = () => {
    const newItem: ConsumableItem = {
      id: crypto.randomUUID(),
      name: '',
      status: 'Suficiente',
      observation: '',
    };
    onChange({ topico3_materiais: [...materiais, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ topico3_materiais: materiais.filter(item => item.id !== id) });
  };

  const handleItemChange = (id: string, field: keyof ConsumableItem, value: string) => {
    const updated = materiais.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ topico3_materiais: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Tópico 3 - Materiais de Consumo
        </h2>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <PackagePlus className="w-4 h-4" /> Adicionar Material
        </button>
      </div>

      {materiais.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          Nenhum material cadastrado. Clique no botão acima para adicionar.
        </p>
      ) : (
        <div className="space-y-4">
          {materiais.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 relative group"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nome do Material / Insumo
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    placeholder="Ex: Papel A4, Caneta Azul..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Situação / Estoque
                  </label>
                  <select
                    value={item.status}
                    onChange={(e) => handleItemChange(item.id, 'status', e.target.value as MaterialStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Suficiente">Suficiente</option>
                    <option value="Insuficiente">Insuficiente</option>
                    <option value="Em Falta">Em Falta</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={item.observation || ''}
                  onChange={(e) => handleItemChange(item.id, 'observation', e.target.value)}
                  placeholder="Observação pontual (opcional)..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Remover item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}