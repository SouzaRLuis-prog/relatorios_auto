import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ReportData } from '@/models/report';
import { AIAnalysisResult } from '@/controllers/geminiController';

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

      const startX = doc.page.margins.left; // 40
      const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right; // 515.28

      const FONT_REGULAR = 'Helvetica';
      const FONT_BOLD = 'Helvetica-Bold';

      // --- PALETA DE CORES EXTRAÍDA DA LOGOMARCA ---
      const COLOR_PRIMARY_BLUE = '#383E96'; // Azul escuro Governo / Secretaria
      const COLOR_PRIMARY_TEAL = '#35A7B4'; // Verde Água / Teal de Montes Claros
      const COLOR_ACCENT_GOLD  = '#F7C924'; // Amarelo/Ouro do Sol
      const COLOR_TEXT_DARK    = '#1E293B'; // Texto escuro principal
      const COLOR_TEXT_MUTED   = '#64748B'; // Texto secundário
      const COLOR_BG_LIGHT     = '#F8FAFC'; // Fundo suave para linhas zebradas
      const COLOR_BORDER       = '#E2E8F0'; // Borda discreta de tabela

      // --- FUNÇÃO DE VERIFICAÇÃO DE PÁGINA ---
      const checkPageBreak = (neededHeight: number) => {
        if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }
      };

      // --- DESENHAR TÍTULOS DE SEÇÃO ---
      const drawSectionHeader = (title: string) => {
        checkPageBreak(35);
        doc.moveDown(0.6);

        const currentY = doc.y;

        // Marcador visual vertical (Azul Institucional)
        doc.rect(startX, currentY, 4, 15).fill(COLOR_PRIMARY_BLUE);

        // Texto do Título
        doc
          .font(FONT_BOLD)
          .fontSize(10.5)
          .fillColor(COLOR_PRIMARY_BLUE)
          .text(title, startX + 10, currentY + 1.5);

        doc.moveDown(0.4);
      };

      // --- GERADOR UNIVERSAL DE TABELAS ESTRUTURADAS ---
      const drawTable = (headers: string[], rows: string[][], colWidths: number[]) => {
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);

        // Renderizador do Cabeçalho da Tabela
        const renderHeader = () => {
          checkPageBreak(25);
          const y = doc.y;

          // Fundo do cabeçalho em Verde Água (Teal)
          doc.rect(startX, y, tableWidth, 18).fill(COLOR_PRIMARY_TEAL);

          let currentX = startX;
          headers.forEach((header, i) => {
            doc
              .font(FONT_BOLD)
              .fontSize(8)
              .fillColor('#FFFFFF')
              .text(header.toUpperCase(), currentX + 6, y + 5, {
                width: colWidths[i] - 12,
                align: 'left',
              });
            currentX += colWidths[i];
          });
          doc.y = y + 18;
        };

        if (headers.length > 0) {
          renderHeader();
        }

        if (rows.length === 0) {
          checkPageBreak(20);
          const y = doc.y;
          doc.rect(startX, y, tableWidth, 20).fill('#FFFFFF');
          doc
            .font(FONT_REGULAR)
            .fontSize(8)
            .fillColor(COLOR_TEXT_MUTED)
            .text('Nenhum registro informado nesta seção.', startX + 8, y + 6);
          doc.y = y + 20;
          doc.moveDown(0.5);
          return;
        }

        // Renderizador de Linhas da Tabela
        rows.forEach((row, rowIndex) => {
          // Calcula a altura necessária da linha baseada no texto mais longo
          let maxRowHeight = 18;
          row.forEach((cell, i) => {
            doc.fontSize(8);
            const cellHeight = doc.heightOfString(cell || '-', {
              width: colWidths[i] - 12,
            }) + 8;
            if (cellHeight > maxRowHeight) maxRowHeight = cellHeight;
          });

          // Se a linha não couber na página atual, quebra página e redesenha o cabeçalho
          if (doc.y + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            if (headers.length > 0) renderHeader();
          }

          const y = doc.y;
          const bgColor = rowIndex % 2 === 0 ? '#FFFFFF' : COLOR_BG_LIGHT;

          // Fundo zebrado
          doc.rect(startX, y, tableWidth, maxRowHeight).fill(bgColor);

          // Borda inferior da linha
          doc
            .moveTo(startX, y + maxRowHeight)
            .lineTo(startX + tableWidth, y + maxRowHeight)
            .strokeColor(COLOR_BORDER)
            .lineWidth(0.5)
            .stroke();

          // Texto de cada célula
          let currentX = startX;
          row.forEach((cell, i) => {
            doc
              .font(i === 0 ? FONT_BOLD : FONT_REGULAR)
              .fontSize(8)
              .fillColor(COLOR_TEXT_DARK)
              .text(cell || '-', currentX + 6, y + 5, {
                width: colWidths[i] - 12,
                align: 'left',
              });
            currentX += colWidths[i];
          });

          doc.y = y + maxRowHeight;
        });

        doc.moveDown(0.5);
      };

      // Helper para converter objetos { status, observation } em array de linha
      const parseFieldRow = (label: string, field?: any): string[] => {
        if (!field) return [label, '-', '-'];
        if (typeof field === 'string') return [label, field, '-'];
        return [label, field.status || '-', field.observation || '-'];
      };

      // --- 1. CABEÇALHO COM LOGOMARCA CENTRALIZADA ---
      const absoluteLogoPath = 'C:\\Users\\LuisR\\Desktop\\Projetos\\relatorio\\gerador-relatorios\\public\\Logo Governo - Desenvolvimento S. -5.png';
      const relativeLogoPath = path.join(process.cwd(), 'public', 'Logo Governo - Desenvolvimento S. -5.png');

      const logoToUse = fs.existsSync(absoluteLogoPath)
        ? absoluteLogoPath
        : fs.existsSync(relativeLogoPath)
        ? relativeLogoPath
        : null;

      if (logoToUse) {
        try {
          const logoWidth = contentWidth; // 515.28px (exatamente a mesma largura das tabelas)
          const logoMaxHeight = 70;       // Altura limite para manter a proporção sem poluir a folha

          // Desenha a imagem ocupando a largura total das tabelas a partir do margin esquerdo (startX)
          doc.image(logoToUse, startX, doc.y, {
            fit: [logoWidth, logoMaxHeight],
            align: 'center',
            valign: 'center',
          });

          // Avança a posição Y considerando a altura limite + espaçamento
          doc.y += logoMaxHeight + 12;
        } catch (e) {
          console.error('Erro ao inserir logomarca no PDF:', e);
        }
      }

      // TÍTULO PRINCIPAL
      doc
        .font(FONT_BOLD)
        .fontSize(14)
        .fillColor(COLOR_PRIMARY_BLUE)
        .text('RELATÓRIO DE VISITA TÉCNICA', { align: 'center' });
      doc.moveDown(0.8);

      // --- CARD DE DADOS GERAIS DA VISITA ---
      checkPageBreak(50);
      const generalInfoY = doc.y;
      doc
        .rect(startX, generalInfoY, contentWidth, 42)
        .fillAndStroke('#F1F5F9', COLOR_PRIMARY_TEAL);

      doc
        .font(FONT_BOLD)
        .fontSize(8.5)
        .fillColor(COLOR_PRIMARY_BLUE)
        .text(`Unidade: `, startX + 10, generalInfoY + 8, { continued: true })
        .font(FONT_REGULAR)
        .fillColor(COLOR_TEXT_DARK)
        .text(data.unidade || '-')
        .font(FONT_BOLD)
        .fillColor(COLOR_PRIMARY_BLUE)
        .text(`Data da Visita: `, startX + 300, generalInfoY + 8, { continued: true })
        .font(FONT_REGULAR)
        .fillColor(COLOR_TEXT_DARK)
        .text(data.dataVisita || '-');

      doc
        .font(FONT_BOLD)
        .fillColor(COLOR_PRIMARY_BLUE)
        .text(`Responsável: `, startX + 10, generalInfoY + 24, { continued: true })
        .font(FONT_REGULAR)
        .fillColor(COLOR_TEXT_DARK)
        .text(data.responsavelVisita || '-')
        .font(FONT_BOLD)
        .fillColor(COLOR_PRIMARY_BLUE)
        .text(`Período / Mês: `, startX + 300, generalInfoY + 24, { continued: true })
        .font(FONT_REGULAR)
        .fillColor(COLOR_TEXT_DARK)
        .text(`${data.periodo || ''} ${data.mesAno || ''}`.trim() || '-');

      doc.y = generalInfoY + 48;

      // Larguras padrão para tabelas de 3 colunas (Total: 515pt)
      const colWidths3 = [170, 110, 235];
      const headers3 = ['Item / Indicador', 'Situação / Status', 'Observações / Detalhes'];

      // --- TÓPICO 1: ESTRUTURA FÍSICA ---
      drawSectionHeader('1. Estrutura Física');
      const est = data.topico1_estrutura;
      const rows1 = est ? [
        parseFieldRow('Pintura', est.pintura),
        parseFieldRow('Telhado / Cobertura', est.telhado),
        parseFieldRow('Piso / Revestimento', est.piso),
        parseFieldRow('Portas e Janelas', est.portasJanelas),
        parseFieldRow('Iluminação Interna', est.iluminacao),
        parseFieldRow('Instalações Elétricas', est.instalacoesEletricas),
        parseFieldRow('Instalações Hidráulicas', est.instalacoesHidraulicas),
        parseFieldRow('Banheiros / Sanitários', est.banheiros),
        parseFieldRow('Copa / Cozinha', est.copaCozinha),
        parseFieldRow('Acessibilidade', est.acessibilidade),
      ] : [];
      drawTable(headers3, rows1, colWidths3);

      // --- TÓPICO 2: LIMPEZA E CONSERVAÇÃO ---
      drawSectionHeader('2. Limpeza e Conservação');
      const limp = data.topico2_limpeza;
      const rows2 = limp ? [
        parseFieldRow('Limpeza Geral', limp.limpezaGeral),
        parseFieldRow('Conservação do Mobiliário', limp.conservacaoMobiliario),
        parseFieldRow('Recolhimento de Lixo', limp.recolhimentoLixo),
        parseFieldRow('Higienização dos Banheiros', limp.higienizacaoBanheiros),
      ] : [];
      drawTable(headers3, rows2, colWidths3);

      // --- TÓPICO 3: MATERIAIS ---
      drawSectionHeader('3. Materiais e Consumíveis');
      const rows3 = (data.topico3_materiais || []).map(item => [
        item.name || '-',
        item.status || '-',
        item.observation || '-'
      ]);
      drawTable(['Material / Consumível', 'Situação / Quantidade', 'Observações'], rows3, colWidths3);

      // --- TÓPICO 4: EQUIPAMENTOS ---
      drawSectionHeader('4. Equipamentos e Tecnologia');
      const rows4 = (data.topico4_equipamentos || []).map(item => [
        item.name || '-',
        item.status || '-',
        item.observation || '-'
      ]);
      drawTable(['Equipamento / Recurso', 'Situação', 'Observações'], rows4, colWidths3);

      // --- TÓPICO 5: RECURSOS HUMANOS ---
      drawSectionHeader('5. Recursos Humanos');
      const rh = data.topico5_rh;
      const rows5 = rh ? [
        parseFieldRow('Conselheiros Presentes', rh.conselheirosPresentes),
        parseFieldRow('Equipe Administrativa Completa', rh.equipeAdministrativaCompleta),
        parseFieldRow('Cumprimento de Horário', rh.cumprimentoHorario),
        parseFieldRow('Escalas Afixadas', rh.escalasAfixadas),
        parseFieldRow('Necessidade de Substituição', rh.necessidadeSubstituicao),
      ] : [];
      drawTable(headers3, rows5, colWidths3);

      // --- TÓPICO 6: ATENDIMENTO AO PÚBLICO ---
      drawSectionHeader('6. Atendimento ao Público');
      const at = data.topico6_atendimento;
      const rows6 = at ? [
        parseFieldRow('Atendimento Regular', at.atendimentoRegular),
        parseFieldRow('Sala Reservada', at.salaReservada),
        parseFieldRow('Organização do Atendimento', at.organizacaoAtendimento),
        parseFieldRow('Fluxo de Usuários', at.fluxoUsuario),
      ] : [];
      drawTable(headers3, rows6, colWidths3);

      // --- TÓPICO 7: SEGURANÇA ---
      drawSectionHeader('7. Segurança');
      const seg = data.topico7_seguranca;
      const rows7 = seg ? [
        parseFieldRow('Extintores de Incêndio', seg.extintores),
        parseFieldRow('Fechaduras e Trancas', seg.fechadura),
        parseFieldRow('Portões de Acesso', seg.portoes),
        parseFieldRow('Iluminação Externa', seg.iluminacaoExterna),
        parseFieldRow('Câmeras / Monitoramento', seg.camera),
      ] : [];
      drawTable(headers3, rows7, colWidths3);

      // --- TÓPICO 8: DEMANDAS IDENTIFICADAS ---
      drawSectionHeader('8. Demandas Identificadas');
      const rows8 = (data.topico8_demandas || []).map(item => [
        item.demanda || '-',
        item.prioridade || '-',
        item.setorResponsavel || '-',
        item.situacao || '-'
      ]);
      drawTable(['Demanda Identificada', 'Prioridade', 'Setor Responsável', 'Situação'], rows8, [170, 85, 130, 130]);

      // --- TÓPICO 9: PROVIDÊNCIAS TOMADAS ---
      drawSectionHeader('9. Providências Tomadas');
      const rows9 = (data.topico9_providencias || []).map(item => [
        item.providencia || '-',
        item.data || '-',
        item.situacao || '-'
      ]);
      drawTable(['Providência / Ação Adotada', 'Data', 'Situação / Status'], rows9, [260, 105, 150]);

      // --- TÓPICO 10: REGISTRO FOTOGRÁFICO ---
      drawSectionHeader('10. Registro Fotográfico');
      const rawFotos = data?.topico10_fotos || [];

      // Filtra fotos válidas para manter o índice da grade correto
      const validFotos = rawFotos.filter((item: any) => {
        const url = typeof item === 'string' ? item : item?.url;
        return url && typeof url === 'string';
      });

      if (validFotos.length === 0) {
        drawTable([], [], colWidths3);
      } else {
        // Dimensões do Grid (2 Fotos por Linha)
        const cardWidth = 250;      // Largura de cada foto (250px * 2 + 15px gap = 515px)
        const cardHeight = 160;     // Altura do card com foto e legenda
        const gap = 15;             // Distância horizontal entre as duas fotos
        const rowSpacing = 12;      // Distância vertical entre as linhas de fotos
        let rowStartY = doc.y;

        validFotos.forEach((item: any, index: number) => {
          const imgUrl = typeof item === 'string' ? item : item?.url;
          const caption = typeof item === 'string' ? '' : item?.caption;

          const col = index % 2; // 0 = Coluna da Esquerda | 1 = Coluna da Direita

          // Se for a primeira foto da linha, verifica se a linha inteira cabe na página
          if (col === 0) {
            checkPageBreak(cardHeight + rowSpacing);
            rowStartY = doc.y;
          }

          // Calcula a posição X exata da foto atual
          const cardX = startX + col * (cardWidth + gap);

          try {
            const cleanBase64 = imgUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
            const imgBuffer = Buffer.from(cleanBase64, 'base64');

            // Moldura da Foto
            doc
              .rect(cardX, rowStartY, cardWidth, cardHeight)
              .fillAndStroke('#FFFFFF', COLOR_BORDER);

            // Imagem proporcional e centralizada
            doc.image(imgBuffer, cardX + 5, rowStartY + 5, {
              fit: [cardWidth - 10, 120],
              align: 'center',
              valign: 'center',
            });

            // Legenda abaixo da foto
            if (caption && caption.trim().length > 0) {
              doc
                .font(FONT_BOLD)
                .fontSize(7.5)
                .fillColor(COLOR_PRIMARY_BLUE)
                .text(`Foto ${index + 1}: ${caption.trim()}`, cardX + 5, rowStartY + 130, {
                  width: cardWidth - 10,
                  align: 'center',
                  height: 25,
                });
            }
          } catch {
            // Caso ocorra erro ao carregar o buffer da imagem
            doc
              .rect(cardX, rowStartY, cardWidth, cardHeight)
              .fillAndStroke('#FFF5F5', '#FEB2B2');
            doc
              .font(FONT_REGULAR)
              .fontSize(8)
              .fillColor('#C00000')
              .text('[Erro ao carregar imagem]', cardX + 5, rowStartY + 70, {
                width: cardWidth - 10,
                align: 'center',
              });
          }

          // Quando preencher a 2ª coluna (ou for a última foto), avança a posição Y para a próxima linha
          if (col === 1 || index === validFotos.length - 1) {
            doc.y = rowStartY + cardHeight + rowSpacing;
          }
        });
      }

      // --- TÓPICO 11: AVALIAÇÃO / NOTAS (AI) ---
      drawSectionHeader('11. Avaliação e Pontuação Geral');
      if (aiResults?.topico11_notas) {
        const notas = aiResults.topico11_notas;

        const getDesempenho = (nota: number) => {
          if (nota >= 4.5) return 'Excelente';
          if (nota >= 3.5) return 'Bom / Adequado';
          if (nota >= 2.5) return 'Regular / Atencioso';
          return 'Inadequado / Crítico';
        };

        const rows11 = [
          ['Estrutura Física', `${notas.estrutura} / 5`, getDesempenho(notas.estrutura)],
          ['Limpeza e Conservação', `${notas.limpeza} / 5`, getDesempenho(notas.limpeza)],
          ['Materiais e Consumíveis', `${notas.materiais} / 5`, getDesempenho(notas.materiais)],
          ['Equipamentos e Tecnologia', `${notas.equipamentos} / 5`, getDesempenho(notas.equipamentos)],
          ['Recursos Humanos', `${notas.rh} / 5`, getDesempenho(notas.rh)],
          ['Atendimento ao Público', `${notas.atendimento} / 5`, getDesempenho(notas.atendimento)],
          ['Segurança', `${notas.seguranca} / 5`, getDesempenho(notas.seguranca)],
        ];

        drawTable(['Dimensão Avaliada', 'Pontuação', 'Classificação de Desempenho'], rows11, [200, 100, 215]);

        // Card da Média Final Em Destaque (Destaque em Ouro/Azul)
        checkPageBreak(35);
        const mediaY = doc.y;
        doc.rect(startX, mediaY, contentWidth, 26).fill(COLOR_PRIMARY_BLUE);
        doc.rect(startX, mediaY, 6, 26).fill(COLOR_ACCENT_GOLD); // Faixa de ouro na esquerda

        doc
          .font(FONT_BOLD)
          .fontSize(10)
          .fillColor('#FFFFFF')
          .text(`MÉDIA FINAL DA UNIDADE: ${notas.mediaFinal} / 5.0`, startX + 16, mediaY + 8);

        doc.y = mediaY + 34;
      } else {
        drawTable([], [], colWidths3);
      }

      // --- TÓPICO 12: CONCLUSÃO E PARECER TÉCNICO ---
      drawSectionHeader('12. Conclusão e Parecer Técnico');
      if (aiResults?.topico12_conclusao) {
        const textConclusao = aiResults.topico12_conclusao;
        const padding = 10;
        const textWidth = contentWidth - (padding * 2);

        doc.fontSize(8.5);
        const textHeight = doc.heightOfString(textConclusao, {
          width: textWidth,
        }) + (padding * 2);

        checkPageBreak(textHeight + 10);
        const cardY = doc.y;

        // Caixa de texto com borda lateral em Verde Água (Teal)
        doc.rect(startX, cardY, contentWidth, textHeight).fill('#F0F7F9');
        doc.rect(startX, cardY, 4, textHeight).fill(COLOR_PRIMARY_TEAL);

        doc
          .font(FONT_REGULAR)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_DARK)
          .text(textConclusao, startX + padding + 4, cardY + padding, {
            width: textWidth,
            align: 'justify',
          });

        doc.y = cardY + textHeight + 10;
      } else {
        drawTable([], [], colWidths3);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}