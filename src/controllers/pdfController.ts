import PDFDocument from 'pdfkit';
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

      const startX = doc.page.margins.left;
      const FONT_FAMILY_REGULAR = 'Helvetica';
      const FONT_FAMILY_BOLD = 'Helvetica-Bold';
      const COLOR_TEXT_DARK = '#1E293B';
      const COLOR_TEXT_MUTED = '#64748B';

      const drawSectionHeader = (title: string) => {
        if (doc.y > 720) doc.addPage();
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

      const drawEmptyMessage = (msg = 'Nada a reportar.') => {
        if (doc.y > 750) doc.addPage();
        doc
          .font(FONT_FAMILY_REGULAR)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_MUTED)
          .text(msg, startX, doc.y);
        doc.moveDown(0.5);
      };

      const drawField = (label: string, field?: { status: string; observation?: string } | string) => {
        if (!field) return;
        if (doc.y > 750) doc.addPage();

        let statusStr = '';
        let obsStr = '';

        if (typeof field === 'string') {
          statusStr = field;
        } else {
          statusStr = field.status || '-';
          obsStr = field.observation ? ` (${field.observation})` : '';
        }

        doc
          .font(FONT_FAMILY_BOLD)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_DARK)
          .text(`${label}: `, startX, doc.y, { continued: true })
          .font(FONT_FAMILY_REGULAR)
          .fillColor(COLOR_TEXT_DARK)
          .text(`${statusStr}${obsStr}`);
      };

      // --- CABEÇALHO DO RELATÓRIO ---
      doc
        .font(FONT_FAMILY_BOLD)
        .fontSize(16)
        .fillColor(COLOR_TEXT_DARK)
        .text('RELATÓRIO DE VISITA TÉCNICA', { align: 'center' });
      doc.moveDown(1);

      // --- DADOS GERAIS ---
      doc
        .font(FONT_FAMILY_REGULAR)
        .fontSize(9)
        .fillColor(COLOR_TEXT_DARK)
        .text(`Unidade: ${data.unidade || '-'}`)
        .text(`Data da Visita: ${data.dataVisita || '-'}`)
        .text(`Responsável pela Visita: ${data.responsavelVisita || '-'}`);

      if (data.periodo) doc.text(`Período: ${data.periodo}`);
      if (data.mesAno) doc.text(`Mês/Ano: ${data.mesAno}`);
      doc.moveDown(0.5);

      // --- TÓPICO 1: ESTRUTURA FÍSICA ---
      drawSectionHeader('1. Estrutura Física');
      if (data.topico1_estrutura) {
        const est = data.topico1_estrutura;
        drawField('Pintura', est.pintura);
        drawField('Telhado / Cobertura', est.telhado);
        drawField('Piso / Revestimento', est.piso);
        drawField('Portas e Janelas', est.portasJanelas);
        drawField('Iluminação Interna', est.iluminacao);
        drawField('Instalações Elétricas', est.instalacoesEletricas);
        drawField('Instalações Hidráulicas', est.instalacoesHidraulicas);
        drawField('Banheiros / Sanitários', est.banheiros);
        drawField('Copa / Cozinha', est.copaCozinha);
        drawField('Acessibilidade', est.acessibilidade);
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 2: LIMPEZA E CONSERVAÇÃO ---
      drawSectionHeader('2. Limpeza e Conservação');
      if (data.topico2_limpeza) {
        const limp = data.topico2_limpeza;
        drawField('Limpeza Geral', limp.limpezaGeral);
        drawField('Conservação do Mobiliário', limp.conservacaoMobiliario);
        drawField('Recolhimento de Lixo', limp.recolhimentoLixo);
        drawField('Higienização dos Banheiros', limp.higienizacaoBanheiros);
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 3: MATERIAIS ---
      drawSectionHeader('3. Materiais e Consumíveis');
      if (data.topico3_materiais && data.topico3_materiais.length > 0) {
        data.topico3_materiais.forEach((item) => {
          if (doc.y > 750) doc.addPage();
          doc
            .font(FONT_FAMILY_BOLD)
            .fontSize(8.5)
            .text(`• ${item.name}: `, startX, doc.y, { continued: true })
            .font(FONT_FAMILY_REGULAR)
            .text(`${item.status}${item.observation ? ` - Obs: ${item.observation}` : ''}`);
        });
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 4: EQUIPAMENTOS ---
      drawSectionHeader('4. Equipamentos e Tecnologia');
      if (data.topico4_equipamentos && data.topico4_equipamentos.length > 0) {
        data.topico4_equipamentos.forEach((item) => {
          if (doc.y > 750) doc.addPage();
          doc
            .font(FONT_FAMILY_BOLD)
            .fontSize(8.5)
            .text(`• ${item.name}: `, startX, doc.y, { continued: true })
            .font(FONT_FAMILY_REGULAR)
            .text(`${item.status}${item.observation ? ` - Obs: ${item.observation}` : ''}`);
        });
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 5: RECURSOS HUMANOS ---
      drawSectionHeader('5. Recursos Humanos');
      if (data.topico5_rh) {
        const rh = data.topico5_rh;
        drawField('Conselheiros Presentes', rh.conselheirosPresentes);
        drawField('Equipe Administrativa Completa', rh.equipeAdministrativaCompleta);
        drawField('Cumprimento de Horário', rh.cumprimentoHorario);
        drawField('Escalas Afixadas', rh.escalasAfixadas);
        drawField('Necessidade de Substituição', rh.necessidadeSubstituicao);
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 6: ATENDIMENTO AO PÚBLICO ---
      drawSectionHeader('6. Atendimento ao Público');
      if (data.topico6_atendimento) {
        const at = data.topico6_atendimento;
        drawField('Atendimento Regular', at.atendimentoRegular);
        drawField('Sala Reservada', at.salaReservada);
        drawField('Organização do Atendimento', at.organizacaoAtendimento);
        drawField('Fluxo de Usuários', at.fluxoUsuario);
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 7: SEGURANÇA ---
      drawSectionHeader('7. Segurança');
      if (data.topico7_seguranca) {
        const seg = data.topico7_seguranca;
        drawField('Extintores de Incêndio', seg.extintores);
        drawField('Fechaduras e Trancas', seg.fechadura);
        drawField('Portões de Acesso', seg.portoes);
        drawField('Iluminação Externa', seg.iluminacaoExterna);
        drawField('Câmeras / Monitoramento', seg.camera);
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 8: DEMANDAS IDENTIFICADAS ---
      drawSectionHeader('8. Demandas Identificadas');
      if (data.topico8_demandas && data.topico8_demandas.length > 0) {
        data.topico8_demandas.forEach((item, index) => {
          if (doc.y > 740) doc.addPage();
          doc
            .font(FONT_FAMILY_BOLD)
            .fontSize(8.5)
            .text(`${index + 1}. Demanda: `, startX, doc.y, { continued: true })
            .font(FONT_FAMILY_REGULAR)
            .text(`${item.demanda} | Prioridade: ${item.prioridade} | Setor: ${item.setorResponsavel} | Situação: ${item.situacao}`);
        });
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 9: PROVIDÊNCIAS TOMADAS ---
      drawSectionHeader('9. Providências Tomadas');
      if (data.topico9_providencias && data.topico9_providencias.length > 0) {
        data.topico9_providencias.forEach((item, index) => {
          if (doc.y > 740) doc.addPage();
          doc
            .font(FONT_FAMILY_BOLD)
            .fontSize(8.5)
            .text(`${index + 1}. Providência: `, startX, doc.y, { continued: true })
            .font(FONT_FAMILY_REGULAR)
            .text(`${item.providencia} | Data: ${item.data} | Situação: ${item.situacao}`);
        });
      } else {
        drawEmptyMessage();
      }

      // --- OBSERVAÇÕES GERAIS ---
      drawSectionHeader('Observações Gerais do Fiscal');
      if (data.observacoesGerais || data.observacoes) {
        doc
          .font(FONT_FAMILY_REGULAR)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_DARK)
          .text(data.observacoesGerais || data.observacoes || '', { align: 'justify' });
      } else {
        drawEmptyMessage();
      }

      // --- TÓPICO 10: FOTOS ---
      drawSectionHeader('10. Registro Fotográfico');
      const rawFotos = data?.topico10_fotos || [];

      if (rawFotos.length === 0) {
        drawEmptyMessage();
      } else {
        rawFotos.forEach((item: any, index: number) => {
          const imgUrl = typeof item === 'string' ? item : item?.url;
          const caption = typeof item === 'string' ? '' : item?.caption;

          if (!imgUrl || typeof imgUrl !== 'string') return;

          try {
            if (doc.y > 550) doc.addPage();

            const cleanBase64 = imgUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
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

      // --- TÓPICO 11: AVALIAÇÃO / NOTAS (AI) ---
      if (aiResults?.topico11_notas) {
        drawSectionHeader('11. Avaliação e Pontuação Geral');
        const notas = aiResults.topico11_notas;
        doc
          .font(FONT_FAMILY_REGULAR)
          .fontSize(8.5)
          .fillColor(COLOR_TEXT_DARK)
          .text(`• Estrutura Física: ${notas.estrutura} / 5`)
          .text(`• Limpeza e Conservação: ${notas.limpeza} / 5`)
          .text(`• Materiais: ${notas.materiais} / 5`)
          .text(`• Equipamentos: ${notas.equipamentos} / 5`)
          .text(`• Recursos Humanos: ${notas.rh} / 5`)
          .text(`• Atendimento: ${notas.atendimento} / 5`)
          .text(`• Segurança: ${notas.seguranca} / 5`);

        doc.moveDown(0.5);
        doc
          .font(FONT_FAMILY_BOLD)
          .fontSize(9.5)
          .text(`Média Final da Unidade: ${notas.mediaFinal} / 5`);
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

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}