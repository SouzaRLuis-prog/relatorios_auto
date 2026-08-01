interface UploadPayload {
  fileName: string;
  fileBase64: string;
  dataVisita: string;
  unidade: string;
  responsavel: string;
}

export async function uploadToGoogleDriveAndSheet(payload: UploadPayload): Promise<void> {
  // Chama a API interna do Next.js criada no passo anterior
  const response = await fetch('/api/upload-drive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Erro ao enviar dados para o Google Drive.');
  }
}