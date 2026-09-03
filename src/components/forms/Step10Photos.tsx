'use client';

import React from 'react';
import { ReportData, PhotoItem } from '@/models/report';
import { Camera, Upload, Trash2 } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: Partial<ReportData>) => void;
}

function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function Step10Photos({ data, onChange }: Props) {
  // Garante compatibilidade caso haja strings antigas salvas em relatórios anteriores
  const rawPhotos = data?.topico10_fotos || [];
  const photos: PhotoItem[] = rawPhotos.map((item: any) => {
    if (typeof item === 'string') {
      return { id: crypto.randomUUID(), url: item, caption: '' };
    }
    return item;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    try {
      const newBase64s = await Promise.all(
        fileArray.map((file) => compressImage(file))
      );

      const newPhotoObjects: PhotoItem[] = newBase64s.map((url) => ({
        id: crypto.randomUUID(),
        url,
        caption: '',
      }));

      onChange({ topico10_fotos: [...photos, ...newPhotoObjects] });
    } catch (err) {
      console.error('Erro ao processar fotos:', err);
      alert('Erro ao processar as imagens.');
    } finally {
      e.target.value = '';
    }
  };

  const handleCaptionChange = (id?: string, caption?: string) => {
    if (!id) return;
    const updated = photos.map((item) =>
      item.id === id ? { ...item, caption: caption || '' } : item
    );
    onChange({ topico10_fotos: updated });
  };

  const handleRemove = (id?: string) => {
    if (!id) return;
    const updated = photos.filter((item) => item.id !== id);
    onChange({ topico10_fotos: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 10 - Registros Fotográficos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Galeria */}
        <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Upload className="w-6 h-6 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Galeria / Arquivos
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Escolher imagens salvas (PNG, JPG, WEBP)
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Câmera */}
        <div className="p-6 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors relative">
          <Camera className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Tirar Foto Agora
          </span>
          <p className="text-xs text-blue-500 dark:text-blue-400 text-center">
            Abre a câmera do dispositivo
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Lista e Preview de Fotos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {photos.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
            Nenhuma foto anexada até o momento.
          </p>
        ) : (
          photos.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 relative group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                <img
                  src={item.url}
                  alt={`Registro ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Legenda / Descrição da Foto #{index + 1}
                </label>
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                  placeholder="Ex: Infiltração identificada na sala de atendimento..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}