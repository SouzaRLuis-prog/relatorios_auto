'use client';

import React, { useState } from 'react';
import { ReportData } from '@/models/report';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { ProgressBar } from '@/components/ui/ProgressBar';

// Imports padronizados dos passos
import { Step0General } from './forms/Step0General';
import { Step1PhysicalStructure } from './forms/Step1PhysicalStructure';
import { Step2Cleaning } from './forms/Step2Cleaning';
import { Step3Consumables } from './forms/Step3Consumables';
import { Step4Equipment } from './forms/Step4Equipment';
import { Step5HumanResources } from './forms/Step5HumanResources';
import { Step6CustomerService } from './forms/Step6CustomerService';
import { Step7Security } from './forms/Step7Security';
import { Step8Demands } from './forms/Step8Demands';
import { Step9Actions } from './forms/Step9Actions';
import { Step10Photos } from './forms/Step10Photos';

import { uploadToGoogleDriveAndSheet } from '@/controllers/appsScriptService';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const initialFormData: ReportData = {
  periodo: '',
  mesAno: '',
  unidade: 'Conselho Tutelar 1',
  dataVisita: new Date().toISOString().split('T')[0],
  responsavelVisita: '',
  topico1_estrutura: {
    pintura: { status: 'Adequado' },
    telhado: { status: 'Adequado' },
    piso: { status: 'Adequado' },
    portasJanelas: { status: 'Adequado' },
    iluminacao: { status: 'Adequado' },
    instalacoesEletricas: { status: 'Adequado' },
    instalacoesHidraulicas: { status: 'Adequado' },
    banheiros: { status: 'Adequado' },
    copaCozinha: { status: 'Adequado' },
    acessibilidade: { status: 'Adequado' },
  },
  topico2_limpeza: {
    ambienteLimpo: { status: 'Sim' },
    banheirosHigienizados: { status: 'Sim' },
    coletaLixoAdequada: { status: 'Sim' },
    organizacaoSalas: { status: 'Sim' },
    produtosLimpezaDisponiveis: { status: 'Sim' },
  },
  topico3_materiais: [],
  topico4_equipamentos: [],
  topico5_rh: {
    conselheirosPresentes: { status: 'Ativo', observation: '' },
    equipeAdministrativaCompleta: { status: 'Ativo', observation: '' },
    cumprimentoHorario: { status: 'Ativo', observation: '' },
    escalasAfixadas: { status: 'Ativo', observation: '' },
    necessidadeSubstituicao: { status: 'Nenhuma', observation: '' },
  },
  topico6_atendimento: {
    atendimentoRegular: { status: 'Sim' },
    salaReservada: { status: 'Sim' },
    organizacaoAtendimento: { status: 'Sim' },
    fluxoUsuario: { status: 'Sim' },
  },
  topico7_seguranca: {
    extintores: { status: 'Adequado' },
    fechadura: { status: 'Adequado' },
    portoes: { status: 'Adequado' },
    iluminacaoExterna: { status: 'Adequado' },
  },
  topico8_demandas: [],
  topico9_providencias: [],
  topico10_fotos: [],
};

const STEP_TITLES = [
  'Informações Gerais',
  'Estrutura Física',
  'Limpeza e Higiene',
  'Materiais de Consumo',
  'Equipamentos',
  'Recursos Humanos',
  'Atendimento ao Público',
  'Segurança',
  'Demandas Identificadas',
  'Providências da Diretoria',
  'Registro Fotográfico',
];

export function ReportFormWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ReportData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const updateFormData = (fields: Partial<ReportData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < STEP_TITLES.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatusMessage('Sintetizando tópicos com Inteligência Artificial e gerando .PDF...');

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      setStatusMessage('Iniciando download do relatório em formato PDF ...');
      const byteCharacters = atob(result.base64File);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      a.click();

      setStatusMessage('Enviando para o Google Drive e registrando na planilha...');
      await uploadToGoogleDriveAndSheet({
        fileName: result.fileName,
        fileBase64: result.base64File,
        dataVisita: result.dataVisita,
        unidade: result.unidade,
        responsavel: result.responsavel,
      });

      setStatusMessage('Relatório finalizado com sucesso!');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Erro durante o processamento: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
      <header className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Visitas aos Conselhos Tutelares 
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Montes Claros - MG
          </p>
        </div>
        <DarkModeToggle />
      </header>

      <ProgressBar currentStep={currentStep} totalSteps={STEP_TITLES.length} stepTitle={STEP_TITLES[currentStep]} />

      {/* Renderização dinâmica com animação Fade-In */}
      <div key={currentStep} className="min-h-[380px] py-2">
        {currentStep === 0 && <Step0General data={formData} onChange={updateFormData} />}
        {currentStep === 1 && <Step1PhysicalStructure data={formData} onChange={updateFormData} />}
        {currentStep === 2 && <Step2Cleaning data={formData} onChange={updateFormData} />}
        {currentStep === 3 && <Step3Consumables data={formData} onChange={updateFormData} />}
        {currentStep === 4 && <Step4Equipment data={formData} onChange={updateFormData} />}
        {currentStep === 5 && <Step5HumanResources data={formData} onChange={updateFormData} />}
        {currentStep === 6 && <Step6CustomerService data={formData} onChange={updateFormData} />}
        {currentStep === 7 && <Step7Security data={formData} onChange={updateFormData} />}
        {currentStep === 8 && <Step8Demands data={formData} onChange={updateFormData} />}
        {currentStep === 9 && <Step9Actions data={formData} onChange={updateFormData} />}
        {currentStep === 10 && <Step10Photos photos={formData.topico10_fotos || []} onChange={updateFormData} />}      </div>

      {statusMessage && (
        <div className="my-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
          {statusMessage}
        </div>
      )}

      <footer className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {currentStep < STEP_TITLES.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Salvar & Gerar PDF
              </>
            )}
          </button>
        )}
      </footer>
    </div>
  );
}