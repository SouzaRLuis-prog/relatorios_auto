interface UploadPayload {
    fileName: string;
    fileBase64: string;
    dataVisita: string;
    unidade: string;
    responsavel: string;
  }
  
  export async function uploadToGoogleDriveAndSheet(payload: UploadPayload): Promise<void> {
    const webAppUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
    if (!webAppUrl) {
      console.warn('NEXT_PUBLIC_APPS_SCRIPT_URL não está configurada.');
      return;
    }
  
    const response = await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors', // Evita restrições CORS padrão do Google Apps Script Web Apps
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    return;
  }