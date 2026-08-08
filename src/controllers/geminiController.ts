import { Groq } from 'groq-sdk';
import { ReportData } from '@/models/report';

// Inicializa o cliente da Groq com a chave do ambiente[cite: 2]
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export interface AIAnalysisResult {
  topico11_notas: {
    estrutura: number;
    limpeza: number;
    materiais: number;
    equipamentos: number;
    rh: number;
    atendimento: number;
    seguranca: number;
    mediaFinal: number;
  };
  topico12_conclusao: string;
  avaliacaoEvolucao: string;
}

export async function generateAIReportSection(data: ReportData): Promise<AIAnalysisResult> {
  try {
    const resumoDados = {
      unidade: data?.unidade,
      dataVisita: data?.dataVisita,
      responsavelVisita: data?.responsavelVisita,
      topico1_estrutura: data?.topico1_estrutura,
      topico2_limpeza: data?.topico2_limpeza,
      topico3_materiais: data?.topico3_materiais,
      topico4_equipamentos: data?.topico4_equipamentos,
      topico5_rh: data?.topico5_rh,
      topico6_atendimento: data?.topico6_atendimento,
      topico7_seguranca: data?.topico7_seguranca,
      observacoesGerais: data?.observacoesGerais || data?.observacoes,
    };

    const prompt = `
Você é um auditor institucional sênior. Analise os dados resumidos da visita técnica abaixo:

${JSON.stringify(resumoDados, null, 2)}

REGRAS DE RESPOSTA (Retorne APENAS um JSON válido, sem blocos de markdown ou crases):
1. **topico11_notas**: Atribua uma nota de 1 a 5 (números inteiros ou decimais) para cada um dos 7 tópicos (estrutura, limpeza, materiais, equipamentos, rh, atendimento, seguranca). Calcule a "mediaFinal" como a média aritmética simples dessas 7 notas.
2. **topico12_conclusao**: Conclusão formal dos dados da visita. Restrição: Máximo de 7 linhas.
3. **avaliacaoEvolucao**: Análise de evolução da unidade. Restrição: Máximo de 5 linhas.

Formato exato do JSON esperado:
{
  "topico11_notas": {
    "estrutura": 4,
    "limpeza": 5,
    "materiais": 3,
    "equipamentos": 4,
    "rh": 5,
    "atendimento": 4,
    "seguranca": 3,
    "mediaFinal": 4.0
  },
  "topico12_conclusao": "Sua conclusão aqui...",
  "avaliacaoEvolucao": "Sua avaliação aqui..."
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Você é um assistente especialista em retornar estritamente JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Tratamento robusto para extrair apenas o JSON caso o modelo retorne marcações extras
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    const notas = parsed?.topico11_notas || {};
    const soma = (notas.estrutura || 3) + (notas.limpeza || 3) + (notas.materiais || 3) + 
                 (notas.equipamentos || 3) + (notas.rh || 3) + (notas.atendimento || 3) + 
                 (notas.seguranca || 3);
    
    const mediaCalculada = Number((soma / 7).toFixed(1));

    return {
      topico11_notas: {
        estrutura: notas.estrutura ?? 3,
        limpeza: notas.limpeza ?? 3,
        materiais: notas.materiais ?? 3,
        equipamentos: notas.equipamentos ?? 3,
        rh: notas.rh ?? 3,
        atendimento: notas.atendimento ?? 3,
        seguranca: notas.seguranca ?? 3,
        mediaFinal: notas.mediaFinal ?? mediaCalculada,
      },
      topico12_conclusao: parsed.topico12_conclusao || "Conclusão registrada com base nos dados coletados em campo.",
      avaliacaoEvolucao: parsed.avaliacaoEvolucao || "Avaliação de evolução realizada sem observações críticas adicionais.",
    };
  } catch (error: unknown) {
    console.error("ERRO DETALHADO DA GROQ:", error instanceof Error ? error.message : error);
    console.warn("Falha ao processar com IA, aplicando respostas do fallback de segurança.");
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
      mediaFinal: 3.0,
    },
    topico12_conclusao: `Relatório de visita técnica realizado na unidade ${data?.unidade || ''} em ${data?.dataVisita || ''} pelo responsável ${data?.responsavelVisita || ''}. (Relatório gerado em modo de contingência).`,
    avaliacaoEvolucao: "Manter acompanhamento periódico conforme diretrizes operacionais estabelecidas.",
  };
}