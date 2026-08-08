import { NextRequest, NextResponse } from 'next/server';
import { generateAIReportSection, AIAnalysisResult } from '@/controllers/geminiController';
import { buildPdfReport } from '@/controllers/pdfController';
import { ReportData } from '@/models/report';

export async function POST(req: NextRequest) {
  try {
    const formData: ReportData = await req.json();

    let aiResults: AIAnalysisResult;
    let usedFallback = false;

    // 1. Tenta processar via Gemini AI
    try {
      aiResults = await generateAIReportSection(formData);
    } catch (geminiError: unknown) {
      const message = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.warn('⚠️ Gemini API falhou ou está indisponível. Usando modo de contingência/fallback:', message);
      usedFallback = true;
      
      // Gera uma síntese estruturada padrão usando os próprios dados inseridos pelo fiscal
      aiResults = createFallbackAIResults(formData);
    }

    // 2. Gera o arquivo PDF em memória (com dados da IA ou dados brutos do Fallback)
    const pdfBuffer = await buildPdfReport(formData, aiResults);
    const base64File = pdfBuffer.toString('base64');

    // Sanitização simples do nome do arquivo para evitar caracteres inválidos
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
      usedFallback, // Informa ao frontend se o documento foi gerado em modo de contingência
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

/**
 * Função de Contingência (Fallback): 
 * Garante que a estrutura esperada pelo 'buildPdfReport' seja preenchida mesmo sem IA.
 */
function createFallbackAIResults(data: ReportData): AIAnalysisResult {
  return {
    topico12_conclusao: `Relatório de visita técnica realizado na unidade ${data.unidade || ''} em ${data.dataVisita || ''} pelo(a) responsável ${data.responsavelVisita || ''}. (Síntese gerada em modo offline/sem IA).`,
    avaliacaoEvolucao: "Informações registradas conforme checklist preenchido em campo.",
    topico11_notas: {
      estrutura: 3,
      limpeza: 3,
      materiais: 3,
      equipamentos: 3,
      rh: 3,
      atendimento: 3,
      seguranca: 3,
      mediaFinal: 3.0,
    },
  };
}