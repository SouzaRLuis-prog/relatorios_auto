import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ReportData } from '@/models/report';
import { AIAnalysisResult } from './geminiController';

const FONT_FAMILY_REGULAR = 'AppFont';
const FONT_FAMILY_BOLD = 'AppFont-Bold';

// Cache dos buffers para ler do disco apenas na primeira vez que a aplicação rodar
let regularFontBuffer: Buffer | null = null;
let boldFontBuffer: Buffer | null = null;

function loadFonts() {
  if (regularFontBuffer && boldFontBuffer) return;

  try {
    // Lê os arquivos direto da pasta public/fonts do projeto
    const regularPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
    const boldPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');

    regularFontBuffer = fs.readFileSync(regularPath);
    boldFontBuffer = fs.readFileSync(boldPath);
  } catch (error) {
    throw new Error('Certifique-se de colocar os arquivos Roboto-Regular.ttf e Roboto-Bold.ttf dentro da pasta public/fonts/');
  }
}

const COLOR_PRIMARY = '#1F4E78';
const COLOR_TEXT_DARK = '#000000';
const COLOR_TEXT_MUTED = '#595959';
const COLOR_TEXT_HEADER = '#262626';
const COLOR_WHITE = '#FFFFFF';
const COLOR_BG_ZEBRA = '#F9F9F9';
const COLOR_BG_SUMMARY = '#EAEAEA';
const COLOR_BORDER = '#E0E0E0';
const COLOR_BORDER_SUMMARY = '#D3D3D3';
const COLOR_ERROR = '#C00000';

const PAGE_MARGIN = 40;
const PAGE_SIZE = 'A4';
const MAX_Y_BEFORE_BREAK = 700;
const PHOTO_BREAK_PAGE_Y = 550;

const ALIGN_LEFT = 'left' as const;
const ALIGN_CENTER = 'center' as const;
const ALIGN_JUSTIFY = 'justify' as const;

const TEXT_EMPTY_ITEM = 'Nenhum registro apontado para este item nesta visita.';
const TEXT_EMPTY_PHOTOS = 'Nenhum registro fotográfico anexado nesta inspeção.';
const TEXT_EMPTY_CONCLUSION = 'Sem parecer registrado para este ciclo.';
const TEXT_EMPTY_EVOLUTION = 'Histórico em acompanhamento constante.';

export async function buildPdfReport(data: ReportData, aiData: AIAnalysisResult): Promise<Buffer> {
  loadFonts();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: PAGE_MARGIN,
        size: PAGE_SIZE,
      });

      doc.registerFont(FONT_FAMILY_REGULAR, regularFontBuffer!);
      doc.registerFont(FONT_FAMILY_BOLD, boldFontBuffer!);
      doc.font(FONT_FAMILY_REGULAR);

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const notas = aiData?.topico11_notas || {
        estrutura: 3,
        limpeza: 3,
        materiais: 3,
        equipamentos: 3,
        rh: 3,
        atendimento: 3,
        seguranca: 3,
        mediaFinal: 3.0,
      };

      const mediaFinalNum = typeof notas.mediaFinal === 'number' ? notas.mediaFinal : 3.0;
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = doc.page.margins.left;

      const drawSectionHeader = (title: string, neededHeight = 60) => {
        if (doc.y + neededHeight > MAX_Y_BEFORE_BREAK) {
          doc.addPage();
        } else {
          doc.moveDown(0.8);
        }

        doc
          .fillColor(COLOR_PRIMARY)
          .fontSize(12)
          .font(FONT_FAMILY_BOLD)
          .text(title.toUpperCase(), startX, doc.y, {
            width: pageWidth,
            align: ALIGN_LEFT,
          });

        const lineY = doc.y + 3;
        doc
          .strokeColor(COLOR_PRIMARY)
          .lineWidth(1)
          .moveTo(startX, lineY)
          .lineTo(startX + pageWidth, lineY)
          .stroke();

        doc.moveDown(0.6);
      };

      doc
        .fillColor(COLOR_PRIMARY)
        .fontSize(16)
        .font(FONT_FAMILY_BOLD)
        .text('RELATÓRIO TÉCNICO DE INSPEÇÃO E ACOMPANHAMENTO - MONTES CLAROS - MG', { align: ALIGN_CENTER });

      doc.moveDown(1);

      doc.fontSize(10).fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_REGULAR);
      doc.font(FONT_FAMILY_BOLD).text('Unidade Avaliada: ', { continued: true, align: ALIGN_LEFT });
      doc.font(FONT_FAMILY_REGULAR).text((data?.unidade || 'N/A').toUpperCase());

      doc.font(FONT_FAMILY_BOLD).text('Data da Visita: ', { continued: true, align: ALIGN_LEFT });
      doc.font(FONT_FAMILY_REGULAR).text(`${data?.dataVisita || 'N/A'}  |  `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).text('Período: ', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(`${data?.periodo || 'N/A'}  |  `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).text('Competência: ', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(`${data?.mesAno || 'N/A'}`);

      doc.font(FONT_FAMILY_BOLD).text('Inspetor Técnico Responsável: ', { continued: true, align: ALIGN_LEFT });
      doc.font(FONT_FAMILY_REGULAR).text(`${data?.responsavelVisita || 'N/A'}`);

      doc.moveDown(1);

      const renderTopicoEmTabela = (num: number, titulo: string, itemData: any) => {
        const hasData = itemData && typeof itemData === 'object' && Object.keys(itemData).length > 0;
        
        drawSectionHeader(`${num}. ${titulo}`, hasData ? 80 : 40);

        if (!hasData) {
          doc
            .font(FONT_FAMILY_REGULAR)
            .fontSize(9)
            .fillColor(COLOR_TEXT_MUTED)
            .text(TEXT_EMPTY_ITEM, startX, doc.y, { align: ALIGN_LEFT });
          doc.moveDown(0.5);
          return;
        }

        const colWidths = [pageWidth * 0.30, pageWidth * 0.25, pageWidth * 0.45];
        let currentY = doc.y;

        doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_PRIMARY);
        doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(9);
        doc.text('Item / Componente', startX + 5, currentY + 5, { width: colWidths[0] - 10, align: ALIGN_LEFT });
        doc.text('Status / Situação', startX + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
        doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 10, align: ALIGN_LEFT });

        currentY += 20;
        let index = 0;

        Object.entries(itemData).forEach(([chave, valor]) => {
          if (valor === undefined || valor === null || valor === '') return;

          const chaveFormatada = chave
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

          let statusTexto = '—';
          let obsTexto = '—';

          if (typeof valor === 'object' && !Array.isArray(valor)) {
            const valObj = valor as Record<string, any>;
            const statusVal = valObj.status ?? valObj.Status ?? valObj.situacao ?? valObj.Situacao ?? '—';
            const obsVal = valObj.observacao ?? valObj.Observacao ?? valObj.detalhes ?? valObj.Detalhes ?? '—';

            statusTexto = typeof statusVal === 'boolean' ? (statusVal ? 'Sim' : 'Não') : String(statusVal);
            obsTexto = typeof obsVal === 'boolean' ? (obsVal ? 'Sim' : 'Não') : String(obsVal);
          } else {
            statusTexto = typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : String(valor);
          }

          const rowHeight = Math.max(
            doc.heightOfString(chaveFormatada, { width: colWidths[0] - 10 }),
            doc.heightOfString(obsTexto, { width: colWidths[2] - 10 }),
            18
          ) + 6;

          if (currentY + rowHeight > MAX_Y_BEFORE_BREAK) {
            doc.addPage();
            currentY = doc.page.margins.top;

            doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_PRIMARY);
            doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(9);
            doc.text('Item / Componente', startX + 5, currentY + 5, { width: colWidths[0] - 10, align: ALIGN_LEFT });
            doc.text('Status / Situação', startX + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
            doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 10, align: ALIGN_LEFT });

            currentY += 20;
          }

          const bgShading = index % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;

          doc.rect(startX, currentY, pageWidth, rowHeight).fill(bgShading);
          doc.rect(startX, currentY, pageWidth, rowHeight).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

          doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8.5);
          doc.text(chaveFormatada, startX + 5, currentY + 4, { width: colWidths[0] - 10, align: ALIGN_LEFT });

          doc.font(FONT_FAMILY_REGULAR);
          doc.text(statusTexto, startX + colWidths[0] + 5, currentY + 4, { width: colWidths[1] - 10, align: ALIGN_LEFT });
          doc.text(obsTexto, startX + colWidths[0] + colWidths[1] + 5, currentY + 4, { width: colWidths[2] - 10, align: ALIGN_LEFT });

          currentY += rowHeight;
          index++;
        });

        doc.y = currentY + 10;
      };

      renderTopicoEmTabela(1, 'Estrutura Física', (data as any)?.topico1_estrutura);
      renderTopicoEmTabela(2, 'Limpeza e Conservação', (data as any)?.topico2_limpeza);
      renderTopicoEmTabela(3, 'Materiais e Insumos', (data as any)?.topico3_materiais);
      renderTopicoEmTabela(4, 'Equipamentos e Informática', (data as any)?.topico4_equipamentos);
      renderTopicoEmTabela(5, 'Recursos Humanos', (data as any)?.topico5_rh);
      renderTopicoEmTabela(6, 'Atendimento ao Público', (data as any)?.topico6_atendimento);
      renderTopicoEmTabela(7, 'Segurança e Proteção', (data as any)?.topico7_seguranca);
      renderTopicoEmTabela(8, 'Levantamento de Demandas', (data as any)?.topico8_demandas);
      renderTopicoEmTabela(9, 'Plano de Providências e Recomendações', (data as any)?.topico9_providencias);

      drawSectionHeader('10. Registro Fotográfico', 40);
      const fotos = (data?.topico10_fotos || []).filter(
        (img) => typeof img === 'string' && img.trim().length > 0
      );

      if (fotos.length === 0) {
        doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_MUTED).text(TEXT_EMPTY_PHOTOS, startX, doc.y, { align: ALIGN_LEFT });
        doc.moveDown(1);
      } else {
        fotos.forEach((base64Img) => {
          try {
            if (doc.y > PHOTO_BREAK_PAGE_Y) doc.addPage();
            const cleanBase64 = base64Img.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const imgBuffer = Buffer.from(cleanBase64, 'base64');
            doc.image(imgBuffer, { fit: [400, 250], align: ALIGN_CENTER });
            doc.moveDown(1);
          } catch (e) {
            doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_ERROR).text('[Erro ao carregar imagem]', startX, doc.y, { align: ALIGN_LEFT });
          }
        });
      }

      drawSectionHeader('11. Consolidação dos Indicadores da Unidade', 180);

      const colWidths11 = [pageWidth * 0.7, pageWidth * 0.3];
      let currentY = doc.y;

      doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_PRIMARY);
      doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(9);
      doc.text('Área Avaliada', startX + 5, currentY + 5, { align: ALIGN_LEFT });
      doc.text('Desempenho', startX + colWidths11[0] + 5, currentY + 5, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

      currentY += 20;

      const listaNotas = [
        ['Estrutura Física', notas.estrutura],
        ['Limpeza e Conservação', notas.limpeza],
        ['Materiais e Insumos', notas.materiais],
        ['Equipamentos e Informática', notas.equipamentos],
        ['Recursos Humanos', notas.rh],
        ['Atendimento ao Público', notas.atendimento],
        ['Segurança e Proteção', notas.seguranca],
      ];

      listaNotas.forEach(([item, nota], idx) => {
        const bg = idx % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;
        doc.rect(startX, currentY, pageWidth, 18).fill(bg);
        doc.rect(startX, currentY, pageWidth, 18).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

        doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8.5);
        doc.text(String(item), startX + 5, currentY + 4, { align: ALIGN_LEFT });
        doc.font(FONT_FAMILY_REGULAR);
        doc.text(`${nota} / 5`, startX + colWidths11[0] + 5, currentY + 4, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

        currentY += 18;
      });

      doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_BG_SUMMARY);
      doc.rect(startX, currentY, pageWidth, 20).strokeColor(COLOR_BORDER_SUMMARY).lineWidth(0.5).stroke();
      doc.fillColor(COLOR_PRIMARY).font(FONT_FAMILY_BOLD).fontSize(9);
      doc.text('Média Global da Unidade', startX + 5, currentY + 5, { align: ALIGN_LEFT });
      doc.text(`${mediaFinalNum.toFixed(1)} / 5.0`, startX + colWidths11[0] + 5, currentY + 5, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

      doc.y = currentY + 30;

      drawSectionHeader('12. Síntese Técnica e Conclusão', 80);
      doc.font(FONT_FAMILY_REGULAR).fontSize(9.5).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.topico12_conclusao || TEXT_EMPTY_CONCLUSION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth });

      doc.moveDown(1);
      doc.font(FONT_FAMILY_BOLD).fontSize(10).fillColor(COLOR_TEXT_HEADER).text('Análise Comparativa e Evolução do Período', startX, doc.y, { align: ALIGN_LEFT });
      doc.moveDown(0.3);
      doc.font(FONT_FAMILY_REGULAR).fontSize(9.5).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.avaliacaoEvolucao || TEXT_EMPTY_EVOLUTION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}