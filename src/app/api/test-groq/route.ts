import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
      status: 'ERRO', 
      motivo: 'GROQ_API_KEY não foi encontrada no .env.local' 
    }, { status: 500 });
  }

  try {
    const groq = new Groq({ apiKey });

    // Consulta os modelos habilitados para a sua chave
    const modelsList = await groq.models.list();
    const disponiveis = modelsList.data.map((m: any) => m.id);

    return NextResponse.json({
      status: 'CONEXÃO REALIZADA COM SUCESSO!',
      mensagem: 'Copie um dos nomes da lista abaixo e coloque no seu controller:',
      modelosDisponiveis: disponiveis,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERRO AO LISTAR MODELOS',
      mensagemErro: error?.message || error,
    }, { status: 500 });
  }
}