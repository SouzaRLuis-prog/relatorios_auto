import { NextResponse } from 'next/server';
import { generateAIReportSection } from '@/controllers/geminiController';
import { ReportData } from '@/models/report';

export async function GET() {
  // Dados simulados mínimos para teste
  const mockData: Partial<ReportData> = {
    unidade: 'Conselho Tutelar 1',
    dataVisita: '2026-08-08',
    responsavelVisita: 'Inspetor de Teste',
    topico1_estrutura: {
      pintura: { status: 'Adequado', observation: 'Pintura nova em boas condições.' },
      telhado: { status: 'Inadequado', observation: 'Goteiras identificadas na sala principal.' }
    },
    topico2_limpeza: {
      ambienteLimpo: { status: 'Sim', observation: 'Ambiente higienizado.' }
    }
  };

  try {
    const aiResult = await generateAIReportSection(mockData as ReportData);
    return NextResponse.json({ success: true, aiResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}