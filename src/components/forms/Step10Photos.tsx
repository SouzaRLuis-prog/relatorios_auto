'use client';

import React from 'react';
import { ReportData } from '@/models/report';
import { Camera, Upload, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

export function Step10Photos({ data, onChange }: Props) {
  const photos = data?.topico10_fotos || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newPhotoPromises = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Falha ao processar a imagem.'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotoPromises)
      .then(newPhotos => {
        onChange({ topico10_fotos: [...photos, ...newPhotos] });
      })
      .catch(err => {
        console.error('Erro ao carregar fotos:', err);
      });
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange({ topico10_fotos: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 10 - Registros Fotográficos
      </h2>

      <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
        <Upload className="w-8 h-8 text-slate-400" />
        <div className="text-center">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Clique ou arraste imagens aqui
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PNG, JPG ou WEBP (múltiplos arquivos permitidos)
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
            Nenhuma foto anexada até o momento.
          </p>
        ) : (
          photos.map((photo, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-900">
              <img
                src={photo}
                alt={`Registro ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                title="Remover foto"
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