import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReportData } from '@/models/report';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIAnalysisResult {
  topico11_notas: {
    estrutura: number;
    limpeza: number;
    materiais: number;
    equipamentos: number;
    rh: number;
    atendimento: number;
    seguranca: number;
    demandas: number;
    providencias: number;
    mediaFinal: number;
  };
  topico12_conclusao: string;
  avaliacaoEvolucao: string;
}

export async function generateAIReportSection(data: ReportData): Promise<AIAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
Você é um auditor institucional sênior. Analise os seguintes dados coletados em uma visita técnica à unidade "${data?.unidade || ''}" na data ${data?.dataVisita || ''} pelo responsável "${data?.responsavelVisita || ''}".

DADOS DA VISITA:
${JSON.stringify(data, null, 2)}

REGRAS DE RESPOSTA (Obrigatório retornar APENAS um JSON válido no formato especificado abaixo):

1. **topico11_notas**: Atribua uma nota de 1 a 5 (números inteiros ou decimais) para cada um dos 9 tópicos operacionais com base nos dados preenchidos. Calcule a "mediaFinal" como a média aritmética simples dessas 9 notas.
2. **topico12_conclusao**: Escreva uma conclusão formal a respeito dos dados obtidos na visita.
   - Restrição RÍGIDA: No MÁXIMO 7 linhas de texto.
   - Estilo: Linguagem formal e objetiva.
3. **avaliacaoEvolucao**: Escreva uma análise/solução de avaliação de evolução da unidade.
   - Restrição RÍGIDA: No MÁXIMO 5 linhas de texto.
   - Estilo: Linguagem formal e propositiva.

Formato do JSON esperado (sem markdown extra de bloco de código):
{
  "topico11_notas": {
    "estrutura": 4,
    "limpeza": 5,
    "materiais": 3,
    "equipamentos": 4,
    "rh": 5,
    "atendimento": 4,
    "seguranca": 3,
    "demandas": 3,
    "providencias": 4,
    "mediaFinal": 3.9
  },
  "topico12_conclusao": "Sua conclusão de até 7 linhas aqui...",
  "avaliacaoEvolucao": "Sua avaliação de evolução de até 5 linhas aqui..."
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Garante que mediaFinal é calculada mesmo se a IA esquecer de enviar
    const notas = parsed?.topico11_notas || {};
    const soma = (notas.estrutura || 3) + (notas.limpeza || 3) + (notas.materiais || 3) + 
                 (notas.equipamentos || 3) + (notas.rh || 3) + (notas.atendimento || 3) + 
                 (notas.seguranca || 3) + (notas.demandas || 3) + (notas.providencias || 3);
    
    const mediaCalculada = Number((soma / 9).toFixed(1));

    return {
      topico11_notas: {
        estrutura: notas.estrutura ?? 3,
        limpeza: notas.limpeza ?? 3,
        materiais: notas.materiais ?? 3,
        equipamentos: notas.equipamentos ?? 3,
        rh: notas.rh ?? 3,
        atendimento: notas.atendimento ?? 3,
        seguranca: notas.seguranca ?? 3,
        demandas: notas.demandas ?? 3,
        providencias: notas.providencias ?? 3,
        mediaFinal: notas.mediaFinal ?? mediaCalculada,
      },
      topico12_conclusao: parsed.topico12_conclusao || "Conclusão registrada com base nos dados coletados em campo.",
      avaliacaoEvolucao: parsed.avaliacaoEvolucao || "Avaliação de evolução realizada sem observações críticas adicionais.",
    };
  } catch (error) {
    console.warn("Falha ao processar com IA, aplicando respostas do fallback de segurança.", error);
    return getFallbackAIResult(data);
  }
}

function getFallbackAIResult(data: ReportData): AIAnalysisResult {
  return {
    topico11_notas: {
      estrutura: 3,
      limpeza: 3,
      materiais: 3,
      equipamentos: 3,
      rh: 3,
      atendimento: 3,
      seguranca: 3,
      demandas: 3,
      providencias: 3,
      mediaFinal: 3.0,
    },
    topico12_conclusao: `Relatório de visita técnica realizado na unidade ${data?.unidade || ''} em ${data?.dataVisita || ''} pelo responsável ${data?.responsavelVisita || ''}. (Relatório gerado em modo de contingência).`,
    avaliacaoEvolucao: "Manter acompanhamento periódico conforme diretrizes operacionais estabelecidas.",
  };
}