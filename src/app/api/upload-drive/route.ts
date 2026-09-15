import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const webAppUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_URL;

    if (!webAppUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A variável de ambiente (NEXT_PUBLIC_APPS_SCRIPT_URL ou APPS_SCRIPT_URL) não está configurada.' 
        },
        { status: 500 }
      );
    }

    // Requisição para o Google Apps Script
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow', // OBRIGATÓRIO: Permite que o Next.js siga os redirecionamentos HTTP do Google
    });

    const responseText = await response.text();

    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('O Google Apps Script retornou uma resposta em HTML (primeiros 300 caracteres):', responseText.substring(0, 300));
      
      return NextResponse.json(
        {
          success: false,
          error: 'O Google Apps Script retornou HTML em vez de JSON. Verifique se: 1) A URL termina com "/exec" (e não "/dev"), 2) Quem tem acesso está configurado como "Qualquer pessoa", e 3) As permissões foram autorizadas manualmente no painel do Apps Script.',
        },
        { status: 500 }
      );
    }

    if (result.status !== 'success') {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || 'Erro interno no processamento do Google Apps Script.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      fileUrl: result.fileUrl,
      fileId: result.fileId 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    console.error('Erro na API /api/upload-drive:', message);
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}