import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const webAppUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

    if (!webAppUrl) {
      return NextResponse.json(
        { success: false, error: 'A variável NEXT_PUBLIC_APPS_SCRIPT_URL não está configurada no .env.local.' },
        { status: 500 }
      );
    }

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`O Apps Script retornou uma resposta inválida (não-JSON): ${responseText.substring(0, 100)}`);
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Erro interno no processamento do Google Apps Script.');
    }

    return NextResponse.json({ success: true, fileUrl: result.fileUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    console.error('Erro na API /api/upload-drive:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}