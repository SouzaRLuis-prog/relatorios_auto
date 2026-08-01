'use client';

import React from 'react';

interface Props {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle }: Props) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
        <span>Passo {currentStep + 1} de {totalSteps}: <strong className="text-blue-600 dark:text-blue-400">{stepTitle}</strong></span>
        <span>{percentage}%</span>
      </div>
      
      {/* Track do Progresso */}
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}