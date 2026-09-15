import { NextRequest, NextResponse } from 'next/server';
import { generateAIReportSection } from '@/controllers/geminiController';
import { buildPdfReport } from '@/controllers/pdfController';
import { ReportData } from '@/models/report';

export async function POST(req: NextRequest) {
  try {
    const formData: ReportData = await req.json();

    // 1. Gera as análises via Groq (retorna os dados reais da IA ou fallback seguro internamente)
    const aiResults = await generateAIReportSection(formData);

    // 2. Verifica se usou o texto de contingência para sinalizar o frontend
    const usedFallback = aiResults.topico12_conclusao.includes('modo de contingência');

    // 3. Gera o arquivo PDF em memória
    const pdfBuffer = await buildPdfReport(formData, aiResults);
    const base64File = pdfBuffer.toString('base64');

    const safeUnidade = (formData.unidade || 'Unidade').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeData = (formData.dataVisita || new Date().toISOString().split('T')[0]);
    const fileName = `Relatorio_${safeUnidade}_${safeData}.pdf`;

    return NextResponse.json({
      success: true,
      fileName,
      base64File,
      dataVisita: formData.dataVisita,
      unidade: formData.unidade,
      responsavel: formData.responsavelVisita,
      usedFallback,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno ao processar relatório.';
    console.error('❌ Erro crítico na geração do relatório:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}