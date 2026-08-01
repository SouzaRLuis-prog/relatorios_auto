'use client';

import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export function Step10Photos({ photos, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange([...photos, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tópico 10 - Registro Fotográfico
      </h2>

      {/* Inputs ocultos para Câmera ou Galeria */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100/50 transition-all"
        >
          <Camera className="w-5 h-5" /> Tirar Foto / Galeria
        </button>
      </div>

      {/* Grid de Imagens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video">
            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}