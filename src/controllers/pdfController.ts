import PDFDocument from 'pdfkit';
import { ReportData } from '@/models/report';
import { AIAnalysisResult } from '@/controllers/geminiController';

// Exportação obrigatória para ser reconhecida pelo route.ts
export async function buildPdfReport(
  data: ReportData,
  aiResults: AIAnalysisResult
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const startX = doc.page.margins.left;
      const FONT_FAMILY_REGULAR = 'Helvetica';
      const FONT_FAMILY_BOLD = 'Helvetica-Bold';
      const COLOR_TEXT_DARK = '#1E293B';
      const COLOR_TEXT_MUTED = '#64748B';
      const PHOTO_BREAK_PAGE_Y = 650;

      const drawSectionHeader = (title: string) => {
        doc.moveDown(0.8);
        doc
          .font(FONT_FAMILY_BOLD)
          .fontSize(11)
          .fillColor(COLOR_TEXT_DARK)
          .text(title, startX, doc.y);
        doc
          .moveTo(startX, doc.y + 2)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
          .strokeColor('#CBD5E1')
          .lineWidth(0.5)
          .stroke();
        doc.moveDown(0.5);
      };

      // --- CABEÇALHO E CONTEÚDO DO RELATÓRIO ---
      doc
        .font(FONT_FAMILY_BOLD)
        .fontSize(16)
        .fillColor(COLOR_TEXT_DARK)
        .text('RELATÓRIO DE VISITA TÉCNICA', { align: 'center' });
      doc.moveDown(1);

      // Exemplo de impressão dos dados da visita
      doc
        .font(FONT_FAMILY_REGULAR)
        .fontSize(9)
        .text(`Unidade: ${data.unidade || '-'}`)
        .text(`Data da Visita: ${data.dataVisita || '-'}`)
        .text(`Responsável: ${data.responsavelVisita || '-'}`);

      // --- TÓPICO 10: FOTOS ---
      drawSectionHeader('10. Registro Fotográfico');
      const rawFotos = data?.topico10_fotos || [];

      if (rawFotos.length === 0) {
        doc
          .font(FONT_FAMILY_REGULAR)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_MUTED)
          .text('Nenhum registro fotográfico anexado.', startX, doc.y);
        doc.moveDown(1);
      } else {
        rawFotos.forEach((item: any, index: number) => {
          const imgUrl = typeof item === 'string' ? item : item?.url;
          const caption = typeof item === 'string' ? '' : item?.caption;

          if (!imgUrl || typeof imgUrl !== 'string') return;

          try {
            if (doc.y > PHOTO_BREAK_PAGE_Y) doc.addPage();

            const cleanBase64 = imgUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const imgBuffer = Buffer.from(cleanBase64, 'base64');

            doc.image(imgBuffer, { fit: [420, 240], align: 'center' });
            doc.moveDown(0.5);

            if (caption && caption.trim().length > 0) {
              doc
                .font(FONT_FAMILY_BOLD)
                .fontSize(8.5)
                .fillColor(COLOR_TEXT_DARK)
                .text(`Foto ${index + 1}: `, startX, doc.y, { continued: true, align: 'center' })
                .font(FONT_FAMILY_REGULAR)
                .text(caption.trim(), { align: 'center' });
            }

            doc.moveDown(1.2);
          } catch {
            doc
              .font(FONT_FAMILY_REGULAR)
              .fillColor('#C00000')
              .text('[Erro ao carregar imagem]', startX, doc.y);
          }
        });
      }

      // --- TÓPICO 12: CONCLUSÃO / SÍNTESE ---
      if (aiResults?.topico12_conclusao) {
        drawSectionHeader('12. Conclusão e Parecer Técnico');
        doc
          .font(FONT_FAMILY_REGULAR)
          .fontSize(9)
          .fillColor(COLOR_TEXT_DARK)
          .text(aiResults.topico12_conclusao, { align: 'justify' });
      }

      // Finaliza o documento PDF
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}