export type EvaluationStatus = 'Adequado' | 'Regular' | 'Inadequado';
export type CleaningStatus = 'Sim' | 'Parcial' | 'Não';
export type ConsumableStatus = 'Suficiente' | 'Baixo Estoque' | 'Em falta';
export type EquipmentStatus = 'Em funcionamento' | 'Necessita manutenção' | 'Inoperante';
export type PriorityLevel = 'Alta' | 'Média' | 'Baixa';
export type DemandSituation = 'Pendente' | 'Em andamento' | 'Concluído';

export interface FieldObserved<T = string> {
  status: T;
  observation?: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  status: ConsumableStatus;
  observation?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  status: EquipmentStatus;
  observation?: string;
}

export interface DemandItem {
  id: string;
  demanda: string;
  prioridade: PriorityLevel;
  setorResponsavel: string;
  situacao: DemandSituation;
}

export interface ActionItem {
  id: string;
  providencia: string;
  data: string;
  situacao: string;
}

export interface ReportData {
  // Dados Gerais
  periodo: string;
  mesAno: string;
  unidade: 'Unidade Centro' | 'Unidade Norte' | 'Unidade Sul' | 'Unidade Leste';
  dataVisita: string;
  responsavelVisita: string;

  // Tópico 1 - Estrutura Física
  topico1_estrutura: {
    pintura: FieldObserved<EvaluationStatus>;
    telhado: FieldObserved<EvaluationStatus>;
    piso: FieldObserved<EvaluationStatus>;
    portasJanelas: FieldObserved<EvaluationStatus>;
    iluminacao: FieldObserved<EvaluationStatus>;
    instalacoesEletricas: FieldObserved<EvaluationStatus>;
    instalacoesHidraulicas: FieldObserved<EvaluationStatus>;
    banheiros: FieldObserved<EvaluationStatus>;
    copaCozinha: FieldObserved<EvaluationStatus>;
    acessibilidade: FieldObserved<EvaluationStatus>;
  };

  // Tópico 2 - Limpeza
  topico2_limpeza: {
    ambienteLimpo: FieldObserved<CleaningStatus>;
    banheirosHigienizados: FieldObserved<CleaningStatus>;
    coletaLixoAdequada: FieldObserved<CleaningStatus>;
    organizacaoSalas: FieldObserved<CleaningStatus>;
    produtosLimpezaDisponiveis: FieldObserved<CleaningStatus>;
  };

  // Tópico 3 - Materiais
  topico3_materiais: ConsumableItem[];

  // Tópico 4 - Equipamentos
  topico4_equipamentos: EquipmentItem[];

  // Tópico 5 - Recursos Humanos
  topico5_rh: {
    conselheirosPresentes: FieldObserved<string>;
    equipeAdministrativaCompleta: FieldObserved<string>;
    cumprimentoHorario: FieldObserved<string>;
    escalasAfixadas: FieldObserved<string>;
    necessidadeSubstituicao: FieldObserved<string>;
  };

  // Tópico 6 - Atendimento ao Público
  topico6_atendimento: {
    atendimentoRegular: FieldObserved<'Sim' | 'Não'>;
    salaReservada: FieldObserved<'Sim' | 'Não'>;
    organizacaoAtendimento: FieldObserved<'Sim' | 'Não'>;
    fluxoUsuario: FieldObserved<'Sim' | 'Não'>;
  };

  // Tópico 7 - Segurança
  topico7_seguranca: {
    extintores: FieldObserved<EvaluationStatus>;
    fechadura: FieldObserved<EvaluationStatus>;
    portoes: FieldObserved<EvaluationStatus>;
    iluminacaoExterna: FieldObserved<EvaluationStatus>;
    camera?: FieldObserved<EvaluationStatus>;
  };

  // Tópico 8 - Demandas Identificadas
  topico8_demandas: DemandItem[];

  // Tópico 9 - Providências Tomadas
  topico9_providencias: ActionItem[];

  // Tópico 10 - Fotos
  topico10_fotos: string[];
}