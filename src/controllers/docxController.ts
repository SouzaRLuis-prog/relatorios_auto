import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  Packer,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { ReportData } from '@/models/report';
import { AIAnalysisResult } from './geminiController';

export async function buildDocxReport(data: ReportData, aiData: AIAnalysisResult): Promise<Buffer> {
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

  const createSectionHeader = (title: string) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: "Nenhum registro apontado para este item nesta visita.",
          italics: true, // Correto (plural)
          color: "595959",
        }),
      ],
      spacing: { before: 280, after: 120 },
      border: {
        bottom: {
          color: "1F4E78",
          space: 4,
          style: BorderStyle.SINGLE,
          size: 8,
        },
      },
    });
  };

  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
    left: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
    right: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
  };

  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 150,
    right: 150,
  };

  const renderTopicoEmTabela = (num: number, titulo: string, itemData: any) => {
    const sectionElements: any[] = [
      createSectionHeader(`${num}. ${titulo}`),
    ];

    if (!itemData || typeof itemData !== 'object' || Object.keys(itemData).length === 0) {
      sectionElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Nenhum registro apontado para este item nesta visita.",
              italic: true,
              color: "595959",
            }),
          ],
          spacing: { after: 150 },
        })
      );
      return sectionElements;
    }

    const rows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Item / Componente", bold: true, color: "FFFFFF" })] })],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: "1F4E78" },
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Status / Situação", bold: true, color: "FFFFFF" })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: "1F4E78" },
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Observações / Detalhes", bold: true, color: "FFFFFF" })] })],
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: "1F4E78" },
            margins: cellMargins,
          }),
        ],
      }),
    ];

    let index = 0;

    Object.entries(itemData).forEach(([chave, valor]) => {
      if (valor === undefined || valor === null || valor === '') return;

      const chaveFormatada = chave
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      const bgShading = index % 2 === 0 ? "F9F9F9" : "FFFFFF";
      index++;

      if (typeof valor === 'object' && !Array.isArray(valor)) {
        const valObj = valor as Record<string, any>;

        const statusVal = valObj.status ?? valObj.Status ?? valObj.situacao ?? valObj.Situacao ?? '—';
        const obsVal = valObj.observacao ?? valObj.Observacao ?? valObj.detalhes ?? valObj.Detalhes ?? '—';

        const statusTexto = typeof statusVal === 'boolean' ? (statusVal ? 'Sim' : 'Não') : String(statusVal);
        const obsTexto = typeof obsVal === 'boolean' ? (obsVal ? 'Sim' : 'Não') : String(obsVal);

        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: chaveFormatada, bold: true })] })],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
              new TableCell({
                children: [new Paragraph({ text: statusTexto })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
              new TableCell({
                children: [new Paragraph({ text: obsTexto })],
                width: { size: 45, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
            ],
          })
        );
      } else {
        const valorTexto = typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : String(valor);

        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: chaveFormatada, bold: true })] })],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
              new TableCell({
                children: [new Paragraph({ text: valorTexto })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
              new TableCell({
                children: [new Paragraph({ text: "—" })],
                width: { size: 45, type: WidthType.PERCENTAGE },
                shading: { fill: bgShading },
                margins: cellMargins,
              }),
            ],
          })
        );
      }
    });

    const tabelaTopico = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: rows,
    });

    sectionElements.push(tabelaTopico);
    sectionElements.push(new Paragraph({ text: "", spacing: { after: 150 } }));

    return sectionElements;
  };

  const fotosParagraphs = (data?.topico10_fotos || [])
    .filter((base64Img) => typeof base64Img === 'string' && base64Img.trim().length > 0)
    .map((base64Img) => {
      try {
        const cleanBase64 = base64Img.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const imgBuffer = Buffer.from(cleanBase64, 'base64');

        return new Paragraph({
          children: [
            new ImageRun({
              data: imgBuffer,
              transformation: { width: 450, height: 280 },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
        });
      } catch (err) {
        return new Paragraph({
          children: [
            new TextRun({ text: "[Erro ao carregar esta imagem]", italic: true, color: "C00000" }),
          ],
          spacing: { after: 100 },
        });
      }
    });

  const criarTabelaAvaliacao = () => {
    const criarLinhaTabela = (item: string, nota: number, bgShading = "FFFFFF") => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item, bold: true })] })],
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading: { fill: bgShading },
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: `${nota} / 5`, alignment: AlignmentType.CENTER })],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: bgShading },
            margins: cellMargins,
          }),
        ],
      });
    };

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Área Avaliada", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "1F4E78" },
              margins: cellMargins,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Desempenho", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
              shading: { fill: "1F4E78" },
              margins: cellMargins,
            }),
          ],
        }),
        criarLinhaTabela("Estrutura Física", notas.estrutura, "F9F9F9"),
        criarLinhaTabela("Limpeza e Conservação", notas.limpeza, "FFFFFF"),
        criarLinhaTabela("Materiais e Insumos", notas.materiais, "F9F9F9"),
        criarLinhaTabela("Equipamentos e Informática", notas.equipamentos, "FFFFFF"),
        criarLinhaTabela("Recursos Humanos", notas.rh, "F9F9F9"),
        criarLinhaTabela("Atendimento ao Público", notas.atendimento, "FFFFFF"),
        criarLinhaTabela("Segurança e Proteção", notas.seguranca, "F9F9F9"),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Média Global da Unidade", bold: true, color: "1F4E78" })] })],
              shading: { fill: "EAEAEA" },
              margins: cellMargins,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${mediaFinalNum.toFixed(1)} / 5.0`, bold: true, color: "1F4E78" })], alignment: AlignmentType.CENTER })],
              shading: { fill: "EAEAEA" },
              margins: cellMargins,
            }),
          ],
        }),
      ],
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "RELATÓRIO TÉCNICO DE INSPEÇÃO E ACOMPANHAMENTO",
                bold: true,
                size: 26,
                color: "1F4E78",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Unidade Avaliada: ", bold: true }),
              new TextRun(`${(data?.unidade || 'N/A').toUpperCase()}\n`),
              new TextRun({ text: "Data da Visita: ", bold: true }),
              new TextRun(`${data?.dataVisita || 'N/A'}  |  `),
              new TextRun({ text: "Período: ", bold: true }),
              new TextRun(`${data?.periodo || 'N/A'}  |  `),
              new TextRun({ text: "Competência: ", bold: true }),
              new TextRun(`${data?.mesAno || 'N/A'}\n`),
              new TextRun({ text: "Inspetor Técnico Responsável: ", bold: true }),
              new TextRun(`${data?.responsavelVisita || 'N/A'}`),
            ],
            spacing: { after: 250 },
          }),

          ...renderTopicoEmTabela(1, "Estrutura Física", (data as any)?.topico1_estrutura),
          ...renderTopicoEmTabela(2, "Limpeza e Conservação", (data as any)?.topico2_limpeza),
          ...renderTopicoEmTabela(3, "Materiais e Insumos", (data as any)?.topico3_materiais),
          ...renderTopicoEmTabela(4, "Equipamentos e Informática", (data as any)?.topico4_equipamentos),
          ...renderTopicoEmTabela(5, "Recursos Humanos", (data as any)?.topico5_rh),
          ...renderTopicoEmTabela(6, "Atendimento ao Público", (data as any)?.topico6_atendimento),
          ...renderTopicoEmTabela(7, "Segurança e Proteção", (data as any)?.topico7_seguranca),
          ...renderTopicoEmTabela(8, "Levantamento de Demandas", (data as any)?.topico8_demandas),
          ...renderTopicoEmTabela(9, "Plano de Providências e Recomendações", (data as any)?.topico9_providencias),

          createSectionHeader("10. Registro Fotográfico"),
          ...(fotosParagraphs.length > 0
            ? fotosParagraphs
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Nenhum registro fotográfico anexado nesta inspeção.",
                      italic: true,
                      color: "595959",
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),

          createSectionHeader("11. Consolidação dos Indicadores da Unidade"),
          new Paragraph({
            text: "Quadro de avaliação consolidada referente às áreas vistoriadas:",
            spacing: { after: 120 },
          }),
          criarTabelaAvaliacao(),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          createSectionHeader("12. Síntese Técnica e Conclusão"),
          new Paragraph({
            text: aiData?.topico12_conclusao || "Sem parecer registrado para este ciclo.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Análise Comparativa e Evolução do Período",
                bold: true,
                size: 20,
                color: "262626",
              }),
            ],
            spacing: { before: 120, after: 80 },
          }),
          new Paragraph({
            text: aiData?.avaliacaoEvolucao || "Histórico em acompanhamento constante.",
            spacing: { after: 300 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}