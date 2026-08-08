import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ReportData } from '@/models/report';
import { AIAnalysisResult } from './geminiController';

const FONT_FAMILY_REGULAR = 'AppFont';
const FONT_FAMILY_BOLD = 'AppFont-Bold';

let regularFontBuffer: Buffer | null = null;
let boldFontBuffer: Buffer | null = null;

function loadFonts() {
  if (regularFontBuffer && boldFontBuffer) return;

  try {
    const regularPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
    const boldPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');

    regularFontBuffer = fs.readFileSync(regularPath);
    boldFontBuffer = fs.readFileSync(boldPath);
  } catch (error) {
    throw new Error('Certifique-se de colocar os arquivos Roboto-Regular.ttf e Roboto-Bold.ttf dentro da pasta public/fonts/');
  }
}

// Cores baseadas na Identidade Visual oficial da Prefeitura de Montes Claros / Secretaria de Desenvolvimento Social
const COLOR_PRIMARY = '#2E3084'; // Azul Índigo Institucional
const COLOR_SECONDARY = '#359CA3'; // Verde Água / Turquesa
const COLOR_TEXT_DARK = '#1F2937'; // Cinza Chumbo Escuro (mais suave que o preto puro)
const COLOR_TEXT_MUTED = '#6B7280'; // Cinza Médio
const COLOR_WHITE = '#FFFFFF';
const COLOR_BG_ZEBRA = '#F9FAFB'; // Fundo sutil para linhas alternadas
const COLOR_BG_SUMMARY = '#EEF2F6'; // Fundo para a média global
const COLOR_BORDER = '#E5E7EB'; // Bordas cinza claro
const COLOR_ERROR = '#DC2626';

const PAGE_MARGIN = 40;
const PAGE_SIZE = 'A4';
const MAX_Y_BEFORE_BREAK = 730; 
const PHOTO_BREAK_PAGE_Y = 540;

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
        bufferPages: true,
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

      const drawSectionHeader = (title: string) => {
        // CORREÇÃO: Removido o doc.addPage() incondicional e cego.
        // A página agora só quebra se o cursor estiver de fato muito próximo do fim da página.
        if (doc.y > 680) {
          doc.addPage();
        }

        if (doc.y < PAGE_MARGIN) {
          doc.y = PAGE_MARGIN;
        }

        doc
          .fillColor(COLOR_PRIMARY)
          .fontSize(11)
          .font(FONT_FAMILY_BOLD)
          .text(title.toUpperCase(), startX, doc.y, {
            width: pageWidth,
            align: ALIGN_LEFT,
          });

        const lineY = doc.y + 3;
        doc
          .strokeColor(COLOR_SECONDARY)
          .lineWidth(1.5)
          .moveTo(startX, lineY)
          .lineTo(startX + pageWidth, lineY)
          .stroke();

        doc.moveDown(0.8);
      };

      // --- LOGOTIPO APENAS NA PRIMEIRA PÁGINA ---
      try {
        const logoPath = path.join(process.cwd(), 'public', 'Logo Governo - Desenvolvimento S. -5.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX, doc.page.margins.top, { width: pageWidth, fit: [pageWidth, 40], align: ALIGN_CENTER });
          doc.y = doc.page.margins.top + 45;
        }
      } catch (e) {
        // Ignora caso a imagem não exista
      }

      // --- TÍTULO E CAPA / METADADOS ---
      doc
        .fillColor(COLOR_PRIMARY)
        .fontSize(14)
        .font(FONT_FAMILY_BOLD)
        .text('RELATÓRIO TÉCNICO DE INSPEÇÃO E ACOMPANHAMENTO', startX, doc.y, { align: ALIGN_CENTER, width: pageWidth });

      doc
        .fillColor(COLOR_SECONDARY)
        .fontSize(10)
        .font(FONT_FAMILY_BOLD)
        .text('SECRETARIA DE DESENVOLVIMENTO SOCIAL — MONTES CLAROS / MG', { align: ALIGN_CENTER, width: pageWidth });

      doc.moveDown(1);

      const infoBoxY = doc.y;
      doc.rect(startX, infoBoxY, pageWidth, 62).fill(COLOR_BG_ZEBRA);
      doc.rect(startX, infoBoxY, pageWidth, 62).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

      doc.fontSize(9).fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_REGULAR);
      let currentTextY = infoBoxY + 8;

      doc.font(FONT_FAMILY_BOLD).text('Unidade Avaliada:', startX + 10, currentTextY, { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(` ${(data?.unidade || 'N/A').toUpperCase()}`);

      currentTextY += 15;
      doc.font(FONT_FAMILY_BOLD).text('Data da Visita:', startX + 10, currentTextY, { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(` ${data?.dataVisita || 'N/A'}    |    `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).text('Período:', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(` ${data?.periodo || 'N/A'}    |    `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).text('Competência:', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(` ${data?.mesAno || 'N/A'}`);

      currentTextY += 15;
      doc.font(FONT_FAMILY_BOLD).text('Inspetor Responsável:', startX + 10, currentTextY, { continued: true });
      doc.font(FONT_FAMILY_REGULAR).text(` ${data?.responsavelVisita || 'N/A'}`);

      doc.y = infoBoxY + 75;

      const renderTopicoEmTabela = (num: number, titulo: string, itemData: any) => {
        const isArrayData = Array.isArray(itemData);
        const hasData = isArrayData ? itemData.length > 0 : (itemData && typeof itemData === 'object' && Object.keys(itemData).length > 0);
        
        drawSectionHeader(`${num}. ${titulo}`);

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
        doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
        doc.text('Item / Componente', startX + 6, currentY + 5, { width: colWidths[0] - 10, align: ALIGN_LEFT });
        doc.text('Status / Situação', startX + colWidths[0] + 6, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
        doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 6, currentY + 5, { width: colWidths[2] - 10, align: ALIGN_LEFT });

        currentY += 20;
        let index = 0;

        if (isArrayData) {
          itemData.forEach((item: any) => {
            if (!item) return;

            const col1Text = item.name || item.demanda || item.providencia || item.descricao || '—';
            const col2Text = item.status || item.prioridade || item.situacao || '—';
            const col3Text = item.observation || item.observacao || item.observação || item.obs || item.obsGerais || (item.setorResponsavel ? `Setor: ${item.setorResponsavel}` : '') || (item.data ? `Data: ${item.data}` : '') || '—';

            const rowHeight = Math.max(
              doc.heightOfString(col1Text, { width: colWidths[0] - 12 }),
              doc.heightOfString(col3Text, { width: colWidths[2] - 12 }),
              18
            ) + 6;

            if (currentY + rowHeight > MAX_Y_BEFORE_BREAK) {
              doc.addPage();
              currentY = doc.y;

              doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_PRIMARY);
              doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
              doc.text('Item / Componente', startX + 6, currentY + 5, { width: colWidths[0] - 10, align: ALIGN_LEFT });
              doc.text('Status / Situação', startX + colWidths[0] + 6, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
              doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 6, currentY + 5, { width: colWidths[2] - 10, align: ALIGN_LEFT });

              currentY += 20;
            }

            const bgShading = index % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;

            doc.rect(startX, currentY, pageWidth, rowHeight).fill(bgShading);
            doc.rect(startX, currentY, pageWidth, rowHeight).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
            doc.text(col1Text, startX + 6, currentY + 4, { width: colWidths[0] - 12, align: ALIGN_LEFT });

            doc.font(FONT_FAMILY_REGULAR);
            doc.text(col2Text, startX + colWidths[0] + 6, currentY + 4, { width: colWidths[1] - 12, align: ALIGN_LEFT });
            doc.text(col3Text, startX + colWidths[0] + colWidths[1] + 6, currentY + 4, { width: colWidths[2] - 12, align: ALIGN_LEFT });

            currentY += rowHeight;
            index++;
          });
        } else {
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
              const obsVal = valObj.observation ?? valObj.Observacao ?? valObj['observação'] ?? valObj['Observação'] ?? valObj.obs ?? valObj.Obs ?? valObj.detalhes ?? valObj.Detalhes ?? '—';

              statusTexto = typeof statusVal === 'boolean' ? (statusVal ? 'Sim' : 'Não') : String(statusVal);
              obsTexto = typeof obsVal === 'boolean' ? (obsVal ? 'Sim' : 'Não') : String(obsVal);
            } else {
              statusTexto = typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : String(valor);
            }

            const rowHeight = Math.max(
              doc.heightOfString(chaveFormatada, { width: colWidths[0] - 12 }),
              doc.heightOfString(obsTexto, { width: colWidths[2] - 12 }),
              18
            ) + 6;

            if (currentY + rowHeight > MAX_Y_BEFORE_BREAK) {
              doc.addPage();
              currentY = doc.y;

              doc.rect(startX, currentY, pageWidth, 20).fill(COLOR_PRIMARY);
              doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
              doc.text('Item / Componente', startX + 6, currentY + 5, { width: colWidths[0] - 10, align: ALIGN_LEFT });
              doc.text('Status / Situação', startX + colWidths[0] + 6, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
              doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 6, currentY + 5, { width: colWidths[2] - 10, align: ALIGN_LEFT });

              currentY += 20;
            }

            const bgShading = index % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;

            doc.rect(startX, currentY, pageWidth, rowHeight).fill(bgShading);
            doc.rect(startX, currentY, pageWidth, rowHeight).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
            doc.text(chaveFormatada, startX + 6, currentY + 4, { width: colWidths[0] - 12, align: ALIGN_LEFT });

            doc.font(FONT_FAMILY_REGULAR);
            doc.text(statusTexto, startX + colWidths[0] + 6, currentY + 4, { width: colWidths[1] - 12, align: ALIGN_LEFT });
            doc.text(obsTexto, startX + colWidths[0] + colWidths[1] + 6, currentY + 4, { width: colWidths[2] - 12, align: ALIGN_LEFT });

            currentY += rowHeight;
            index++;
          });
        }

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

      drawSectionHeader('10. Registro Fotográfico');
      const fotos = (data?.topico10_fotos || []).filter(
        (img) => typeof img === 'string' && img.trim().length > 0
      );

      if (fotos.length === 0) {
        doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_MUTED).text(TEXT_EMPTY_PHOTOS, startX, doc.y, { align: ALIGN_LEFT });
        doc.moveDown(1);
      } else {
        fotos.forEach((base64Img) => {
          try {
            if (doc.y > PHOTO_BREAK_PAGE_Y) {
              doc.addPage();
            }
            const cleanBase64 = base64Img.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const imgBuffer = Buffer.from(cleanBase64, 'base64');
            doc.image(imgBuffer, { fit: [pageWidth, 240], align: ALIGN_CENTER });
            doc.moveDown(1);
          } catch (e) {
            doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_ERROR).text('[Erro ao carregar imagem]', startX, doc.y, { align: ALIGN_LEFT });
          }
        });
      }

      drawSectionHeader('11. Consolidação dos Indicadores da Unidade');

      const colWidths11 = [pageWidth * 0.7, pageWidth * 0.3];
      let currentY11 = doc.y;

      doc.rect(startX, currentY11, pageWidth, 20).fill(COLOR_PRIMARY);
      doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
      doc.text('Área Avaliada', startX + 6, currentY11 + 5, { align: ALIGN_LEFT });
      doc.text('Desempenho', startX + colWidths11[0] + 6, currentY11 + 5, { align: ALIGN_CENTER, width: colWidths11[1] - 12 });

      currentY11 += 20;

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
        doc.rect(startX, currentY11, pageWidth, 18).fill(bg);
        doc.rect(startX, currentY11, pageWidth, 18).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

        doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
        doc.text(String(item), startX + 6, currentY11 + 4, { align: ALIGN_LEFT });
        doc.font(FONT_FAMILY_REGULAR);
        doc.text(`${nota} / 5`, startX + colWidths11[0] + 6, currentY11 + 4, { align: ALIGN_CENTER, width: colWidths11[1] - 12 });

        currentY11 += 18;
      });

      doc.rect(startX, currentY11, pageWidth, 20).fill(COLOR_BG_SUMMARY);
      doc.rect(startX, currentY11, pageWidth, 20).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();
      doc.fillColor(COLOR_PRIMARY).font(FONT_FAMILY_BOLD).fontSize(9);
      doc.text('Média Global da Unidade', startX + 6, currentY11 + 5, { align: ALIGN_LEFT });
      doc.text(`${mediaFinalNum.toFixed(1)} / 5.0`, startX + colWidths11[0] + 6, currentY11 + 5, { align: ALIGN_CENTER, width: colWidths11[1] - 12 });

      doc.y = currentY11 + 25;

      drawSectionHeader('12. Síntese Técnica e Conclusão');
      doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.topico12_conclusao || TEXT_EMPTY_CONCLUSION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth });

      doc.moveDown(0.8);
      doc.font(FONT_FAMILY_BOLD).fontSize(9.5).fillColor(COLOR_PRIMARY).text('Análise Comparativa e Evolução do Período', startX, doc.y, { align: ALIGN_LEFT });
      doc.moveDown(0.3);
      doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.avaliacaoEvolucao || TEXT_EMPTY_EVOLUTION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth });

      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        
        const footerY = doc.page.height - 35;
        
        doc.strokeColor(COLOR_BORDER).lineWidth(0.5).moveTo(startX, footerY).lineTo(startX + pageWidth, footerY).stroke();

        doc.fontSize(7.5).fillColor(COLOR_TEXT_MUTED).font(FONT_FAMILY_REGULAR);
        doc.text('Prefeitura de Montes Claros — Secretaria de Desenvolvimento Social', startX, footerY + 6, { align: ALIGN_LEFT, width: pageWidth * 0.7 });
        doc.text(`Página ${i + 1} de ${range.count}`, startX + pageWidth * 0.7, footerY + 6, { align: 'right', width: pageWidth * 0.3 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}