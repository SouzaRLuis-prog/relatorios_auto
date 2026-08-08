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
  } catch {
    throw new Error('Certifique-se de colocar os arquivos Roboto-Regular.ttf e Roboto-Bold.ttf dentro da pasta public/fonts/');
  }
}

// --- ESQUEMA DE CORES EXTRAÍDO DA LOGOMARCA INSTITUCIONAL ---
const COLOR_PRIMARY = '#2B308B';    // Azul Índigo Escuro (Texto Prefeitura / Sec. Desenvolvimento Social)
const COLOR_SECONDARY = '#30A3B1';  // Verde Água / Teal (Montes Claros e Ondas do Logo)
const COLOR_ACCENT = '#FBB03B';     // Amarelo Sol (Acento visual)
const COLOR_TEXT_DARK = '#2D3748';   // Grafite Escuro para leitura confortável
const COLOR_TEXT_MUTED = '#718096';  // Cinza Neutro para dados vazios ou secundários
const COLOR_WHITE = '#FFFFFF';
const COLOR_BG_LIGHT = '#F7FAFC';   // Fundo suave para o Card do Cabeçalho
const COLOR_BG_ZEBRA = '#F1F5F9';   // Alternância de linhas das tabelas
const COLOR_BORDER = '#E2E8F0';     // Borda sutil para tabelas e cards

const PAGE_MARGIN = 40;
const PAGE_SIZE = 'A4';
const MAX_Y_BEFORE_BREAK = 720;
const PHOTO_BREAK_PAGE_Y = 560;

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

      let isFirstSection = true;

      // Desenha o cabeçalho das seções com linha decorativa
      const drawSectionHeader = (title: string) => {
        if (isFirstSection) {
          isFirstSection = false;
        } else {
          doc.addPage();
        }

        doc
          .fillColor(COLOR_PRIMARY)
          .fontSize(11)
          .font(FONT_FAMILY_BOLD)
          .text(title.toUpperCase(), startX, doc.y, {
            width: pageWidth,
            align: ALIGN_LEFT,
          });

        const lineY = doc.y + 4;
        doc
          .strokeColor(COLOR_SECONDARY)
          .lineWidth(1.5)
          .moveTo(startX, lineY)
          .lineTo(startX + pageWidth, lineY)
          .stroke();

        doc.moveDown(0.8);
      };

      // --- LOGOTIPO NO CABEÇALHO DA PÁGINA INICIAL ---
      const logoPath = path.join(process.cwd(), 'public', 'Logo Governo - Desenvolvimento S. -5.png');
      
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, startX, doc.y, {
          fit: [pageWidth, 48],
          align: ALIGN_CENTER,
        });
        doc.y += 55;
      } else {
        doc.moveDown(1);
      }

      // Linha de acento no topo
      doc
        .strokeColor(COLOR_ACCENT)
        .lineWidth(2)
        .moveTo(startX, doc.y)
        .lineTo(startX + pageWidth, doc.y)
        .stroke();

      doc.moveDown(1.2);

      // --- TÍTULO PRINCIPAL DO RELATÓRIO ---
      doc
        .fillColor(COLOR_PRIMARY)
        .fontSize(14)
        .font(FONT_FAMILY_BOLD)
        .text('RELATÓRIO TÉCNICO DE INSPEÇÃO E ACOMPANHAMENTO', { align: ALIGN_CENTER })
        .fontSize(10)
        .fillColor(COLOR_SECONDARY)
        .text('MONTES CLAROS - MG', { align: ALIGN_CENTER });

      doc.moveDown(1.2);

      // --- CARTÃO DE METADADOS / DADOS DA VISITA ---
      const infoBoxY = doc.y;
      const infoBoxHeight = 68;

      doc
        .roundedRect(startX, infoBoxY, pageWidth, infoBoxHeight, 4)
        .fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);

      const innerX = startX + 12;
      let currentInfoY = infoBoxY + 10;

      doc.fontSize(8.5);

      // Linha 1: Unidade Avaliada
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_PRIMARY).text('Unidade Avaliada: ', innerX, currentInfoY, { continued: true });
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_TEXT_DARK).text((data?.unidade || 'N/A').toUpperCase());

      currentInfoY += 16;

      // Linha 2: Data, Período e Competência
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_PRIMARY).text('Data da Visita: ', innerX, currentInfoY, { continued: true });
      doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_TEXT_DARK).text(`${data?.dataVisita || 'N/A'}    |    `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_PRIMARY).text('Período: ', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_TEXT_DARK).text(`${data?.periodo || 'N/A'}    |    `, { continued: true });
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_PRIMARY).text('Competência: ', { continued: true });
      doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_TEXT_DARK).text(`${data?.mesAno || 'N/A'}`);

      currentInfoY += 16;

      // Linha 3: Inspetor Responsável
      doc.font(FONT_FAMILY_BOLD).fillColor(COLOR_PRIMARY).text('Inspetor Técnico Responsável: ', innerX, currentInfoY, { continued: true });
      doc.font(FONT_FAMILY_REGULAR).fillColor(COLOR_TEXT_DARK).text(`${data?.responsavelVisita || 'N/A'}`);

      doc.y = infoBoxY + infoBoxHeight + 15;

      // --- RENDERIZAÇÃO DE TABELAS DOS TÓPICOS ---
      const renderTopicoEmTabela = (num: number, titulo: string, itemData: unknown) => {
        const isArrayData = Array.isArray(itemData);
        const hasData = isArrayData ? itemData.length > 0 : (itemData && typeof itemData === 'object' && Object.keys(itemData).length > 0);
        
        drawSectionHeader(`${num}. ${titulo}`);

        if (!hasData) {
          doc
            .font(FONT_FAMILY_REGULAR)
            .fontSize(8.5)
            .fillColor(COLOR_TEXT_MUTED)
            .text(TEXT_EMPTY_ITEM, startX, doc.y, { align: ALIGN_LEFT });
          doc.moveDown(0.5);
          return;
        }

        const colWidths = [pageWidth * 0.30, pageWidth * 0.22, pageWidth * 0.48];
        let currentY = doc.y;

        const drawTableHeader = (y: number) => {
          doc.rect(startX, y, pageWidth, 22).fill(COLOR_PRIMARY);
          doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
          doc.text('Item / Componente', startX + 8, y + 6, { width: colWidths[0] - 12, align: ALIGN_LEFT });
          doc.text('Status / Situação', startX + colWidths[0] + 5, y + 6, { width: colWidths[1] - 10, align: ALIGN_LEFT });
          doc.text('Observações / Detalhes', startX + colWidths[0] + colWidths[1] + 5, y + 6, { width: colWidths[2] - 10, align: ALIGN_LEFT });
        };

        drawTableHeader(currentY);
        currentY += 22;
        let index = 0;

        if (isArrayData) {
          itemData.forEach((item: Record<string, unknown>) => {
            if (!item) return;

            const col1Text = String(item.name || item.demanda || item.providencia || item.descricao || '—');
            const col2Text = String(item.status || item.prioridade || item.situacao || '—');
            const col3Text = String(
              item.observation || item.observacao || item.observação || item.obs || item.obsGerais ||
              (item.setorResponsavel ? `Setor: ${item.setorResponsavel}` : '') ||
              (item.data ? `Data: ${item.data}` : '') || '—'
            );

            const rowHeight = Math.max(
              doc.heightOfString(col1Text, { width: colWidths[0] - 12 }),
              doc.heightOfString(col3Text, { width: colWidths[2] - 12 }),
              16
            ) + 8;

            if (currentY + rowHeight > MAX_Y_BEFORE_BREAK) {
              doc.addPage();
              currentY = doc.page.margins.top;
              drawTableHeader(currentY);
              currentY += 22;
            }

            const bgShading = index % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;

            doc.rect(startX, currentY, pageWidth, rowHeight).fill(bgShading);
            doc.rect(startX, currentY, pageWidth, rowHeight).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
            doc.text(col1Text, startX + 8, currentY + 5, { width: colWidths[0] - 12, align: ALIGN_LEFT });

            doc.font(FONT_FAMILY_REGULAR);
            doc.text(col2Text, startX + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
            doc.text(col3Text, startX + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 12, align: ALIGN_LEFT });

            currentY += rowHeight;
            index++;
          });
        } else if (itemData && typeof itemData === 'object') {
          Object.entries(itemData as Record<string, unknown>).forEach(([chave, valor]) => {
            if (valor === undefined || valor === null || valor === '') return;

            const chaveFormatada = chave
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            let statusTexto = '—';
            let obsTexto = '—';

            if (typeof valor === 'object' && !Array.isArray(valor)) {
              const valObj = valor as Record<string, unknown>;
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
              16
            ) + 8;

            if (currentY + rowHeight > MAX_Y_BEFORE_BREAK) {
              doc.addPage();
              currentY = doc.page.margins.top;
              drawTableHeader(currentY);
              currentY += 22;
            }

            const bgShading = index % 2 === 0 ? COLOR_BG_ZEBRA : COLOR_WHITE;

            doc.rect(startX, currentY, pageWidth, rowHeight).fill(bgShading);
            doc.rect(startX, currentY, pageWidth, rowHeight).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
            doc.text(chaveFormatada, startX + 8, currentY + 5, { width: colWidths[0] - 12, align: ALIGN_LEFT });

            doc.font(FONT_FAMILY_REGULAR);
            doc.text(statusTexto, startX + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10, align: ALIGN_LEFT });
            doc.text(obsTexto, startX + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 12, align: ALIGN_LEFT });

            currentY += rowHeight;
            index++;
          });
        }

        doc.y = currentY + 10;
      };

      renderTopicoEmTabela(1, 'Estrutura Física', data?.topico1_estrutura);
      renderTopicoEmTabela(2, 'Limpeza e Conservação', data?.topico2_limpeza);
      renderTopicoEmTabela(3, 'Materiais e Insumos', data?.topico3_materiais);
      renderTopicoEmTabela(4, 'Equipamentos e Informática', data?.topico4_equipamentos);
      renderTopicoEmTabela(5, 'Recursos Humanos', data?.topico5_rh);
      renderTopicoEmTabela(6, 'Atendimento ao Público', data?.topico6_atendimento);
      renderTopicoEmTabela(7, 'Segurança e Proteção', data?.topico7_seguranca);
      renderTopicoEmTabela(8, 'Levantamento de Demandas', data?.topico8_demandas);
      renderTopicoEmTabela(9, 'Plano de Providências e Recomendações', data?.topico9_providencias);

      // --- TÓPICO 10: FOTOS ---
      drawSectionHeader('10. Registro Fotográfico');
      const fotos = (data?.topico10_fotos || []).filter(
        (img) => typeof img === 'string' && img.trim().length > 0
      );

      if (fotos.length === 0) {
        doc.font(FONT_FAMILY_REGULAR).fontSize(8.5).fillColor(COLOR_TEXT_MUTED).text(TEXT_EMPTY_PHOTOS, startX, doc.y, { align: ALIGN_LEFT });
        doc.moveDown(1);
      } else {
        fotos.forEach((base64Img) => {
          try {
            if (doc.y > PHOTO_BREAK_PAGE_Y) doc.addPage();
            const cleanBase64 = base64Img.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const imgBuffer = Buffer.from(cleanBase64, 'base64');
            doc.image(imgBuffer, { fit: [420, 260], align: ALIGN_CENTER });
            doc.moveDown(1.2);
          } catch {
            doc.font(FONT_FAMILY_REGULAR).fillColor('#C00000').text('[Erro ao carregar imagem]', startX, doc.y, { align: ALIGN_LEFT });
          }
        });
      }

      // --- TÓPICO 11: INDICADORES ---
      drawSectionHeader('11. Consolidação dos Indicadores da Unidade');

      const colWidths11 = [pageWidth * 0.70, pageWidth * 0.30];
      let currentY11 = doc.y;

      doc.rect(startX, currentY11, pageWidth, 22).fill(COLOR_PRIMARY);
      doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(8.5);
      doc.text('Área Avaliada', startX + 10, currentY11 + 6, { align: ALIGN_LEFT });
      doc.text('Desempenho', startX + colWidths11[0] + 5, currentY11 + 6, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

      currentY11 += 22;

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
        doc.rect(startX, currentY11, pageWidth, 20).fill(bg);
        doc.rect(startX, currentY11, pageWidth, 20).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

        doc.fillColor(COLOR_TEXT_DARK).font(FONT_FAMILY_BOLD).fontSize(8);
        doc.text(String(item), startX + 10, currentY11 + 5, { align: ALIGN_LEFT });
        doc.font(FONT_FAMILY_REGULAR);
        doc.text(`${nota} / 5`, startX + colWidths11[0] + 5, currentY11 + 5, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

        currentY11 += 20;
      });

      // Linha de Destaque da Média Global
      doc.rect(startX, currentY11, pageWidth, 22).fill(COLOR_SECONDARY);
      doc.rect(startX, currentY11, pageWidth, 22).strokeColor(COLOR_SECONDARY).lineWidth(0.5).stroke();
      doc.fillColor(COLOR_WHITE).font(FONT_FAMILY_BOLD).fontSize(9);
      doc.text('Média Global da Unidade', startX + 10, currentY11 + 6, { align: ALIGN_LEFT });
      doc.text(`${mediaFinalNum.toFixed(1)} / 5.0`, startX + colWidths11[0] + 5, currentY11 + 6, { align: ALIGN_CENTER, width: colWidths11[1] - 10 });

      doc.y = currentY11 + 25;

      // --- TÓPICO 12: CONCLUSÃO E SÍNTESE ---
      drawSectionHeader('12. Síntese Técnica e Conclusão');
      doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.topico12_conclusao || TEXT_EMPTY_CONCLUSION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth, lineGap: 3 });

      doc.moveDown(1.2);
      doc.font(FONT_FAMILY_BOLD).fontSize(9.5).fillColor(COLOR_PRIMARY).text('Análise Comparativa e Evolução do Período', startX, doc.y, { align: ALIGN_LEFT });
      doc.moveDown(0.4);
      doc.font(FONT_FAMILY_REGULAR).fontSize(9).fillColor(COLOR_TEXT_DARK);
      doc.text(aiData?.avaliacaoEvolucao || TEXT_EMPTY_EVOLUTION, startX, doc.y, { align: ALIGN_JUSTIFY, width: pageWidth, lineGap: 3 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}