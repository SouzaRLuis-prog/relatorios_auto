import { Groq } from 'groq-sdk';
import { ReportData } from '@/models/report';

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
  const apiKey = process.env.GROQ_API_KEY;

  // Validação explícita da chave no momento da chamada da função
  if (!apiKey || apiKey.trim() === '') {
    console.error("❌ ERRO CRÍTICO: A variável de ambiente GROQ_API_KEY não foi encontrada ou está vazia no servidor!");
    return getFallbackAIResult(data);
  }

  // Instancia o cliente Groq dinamicamente com a chave atualizada do ambiente
  const groq = new Groq({ apiKey });

  try {
    const resumoDados = {
      unidade: data?.unidade || 'Não informada',
      dataVisita: data?.dataVisita || 'Não informada',
      responsavelVisita: data?.responsavelVisita || 'Não informado',
      topico1_estrutura: data?.topico1_estrutura || null,
      topico2_limpeza: data?.topico2_limpeza || null,
      topico3_materiais: data?.topico3_materiais || null,
      topico4_equipamentos: data?.topico4_equipamentos || null,
      topico5_rh: data?.topico5_rh || null,
      topico6_atendimento: data?.topico6_atendimento || null,
      topico7_seguranca: data?.topico7_seguranca || null,
      observacoesGerais: data?.observacoesGerais || (data as any)?.observacoes || null,
    };

    const prompt = `
Você é um auditor institucional sênior. Analise os dados resumidos da visita técnica abaixo e retorne uma avaliação técnica estruturada em JSON:

${JSON.stringify(resumoDados, null, 2)}

REGRAS DE RESPOSTA (Retorne APENAS o JSON puro):
1. topico11_notas: Atribua uma nota de 1 a 5 (números inteiros ou decimais) para cada um dos 7 tópicos (estrutura, limpeza, materiais, equipamentos, rh, atendimento, seguranca). Calcule a "mediaFinal" como a média aritmética simples dessas 7 notas.
2. topico12_conclusao: Conclusão formal dos dados da visita (máximo de 7 linhas).
3. avaliacaoEvolucao: Análise de evolução da unidade (máximo de 5 linhas).

Formato JSON esperado:
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
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: "Você é um assistente especialista em auditoria e responde estritamente em JSON válido." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      // Força a Groq a retornar apenas JSON
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(responseText);

    const notas = parsed?.topico11_notas || {};
    const soma = (Number(notas.estrutura) || 3) + 
                 (Number(notas.limpeza) || 3) + 
                 (Number(notas.materiais) || 3) + 
                 (Number(notas.equipamentos) || 3) + 
                 (Number(notas.rh) || 3) + 
                 (Number(notas.atendimento) || 3) + 
                 (Number(notas.seguranca) || 3);
    
    const mediaCalculada = Number((soma / 7).toFixed(1));

    return {
      topico11_notas: {
        estrutura: Number(notas.estrutura) || 3,
        limpeza: Number(notas.limpeza) || 3,
        materiais: Number(notas.materiais) || 3,
        equipamentos: Number(notas.equipamentos) || 3,
        rh: Number(notas.rh) || 3,
        atendimento: Number(notas.atendimento) || 3,
        seguranca: Number(notas.seguranca) || 3,
        mediaFinal: Number(notas.mediaFinal) || mediaCalculada,
      },
      topico12_conclusao: parsed.topico12_conclusao || "Conclusão registrada com base nos dados coletados em campo.",
      avaliacaoEvolucao: parsed.avaliacaoEvolucao || "Avaliação de evolução realizada sem observações críticas adicionais.",
    };
  } catch (error: any) {
    console.error("❌ ERRO REAL DA GROQ:", error?.response?.data || error?.message || error);
    console.warn("⚠️ Aplicando respostas do fallback de segurança.");
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