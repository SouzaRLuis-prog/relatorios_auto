export type EvaluationStatus = 'Adequado' | 'Regular' | 'Inadequado';
export type MaterialStatus = 'Suficiente' | 'Insuficiente' | 'Em Falta';
export type ConsumableStatus = MaterialStatus; // Alias para retrocompatibilidade
export type EquipmentStatus = 'Em funcionamento' | 'Com defeito' | 'Manutenção necessária';
export type PriorityLevel = 'Alta' | 'Média' | 'Baixa';
export type DemandSituation = 'Pendente' | 'Em andamento' | 'Concluído';

export interface FieldObserved<T = string> {
  status: T;
  observation?: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  status: MaterialStatus;
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
  periodo?: string;
  mesAno?: string;
  unidade?: 'Conselho Tutelar 1' | 'Conselho Tutelar 2' | 'Conselho Tutelar 3' | 'Conselho Tutelar 4' | string;
  dataVisita?: string;
  responsavelVisita?: string;
  observacoesGerais?: string;
  observacoes?: string;

  // Tópico 1 - Estrutura Física
  topico1_estrutura?: {
    pintura?: FieldObserved<EvaluationStatus>;
    telhado?: FieldObserved<EvaluationStatus>;
    piso?: FieldObserved<EvaluationStatus>;
    portasJanelas?: FieldObserved<EvaluationStatus>;
    iluminacao?: FieldObserved<EvaluationStatus>;
    instalacoesEletricas?: FieldObserved<EvaluationStatus>;
    instalacoesHidraulicas?: FieldObserved<EvaluationStatus>;
    banheiros?: FieldObserved<EvaluationStatus>;
    copaCozinha?: FieldObserved<EvaluationStatus>;
    acessibilidade?: FieldObserved<EvaluationStatus>;
  };

  // Tópico 2 - Limpeza e Conservação
  topico2_limpeza?: {
    limpezaGeral?: FieldObserved<EvaluationStatus>;
    conservacaoMobiliario?: FieldObserved<EvaluationStatus>;
    recolhimentoLixo?: FieldObserved<EvaluationStatus>;
    higienizacaoBanheiros?: FieldObserved<EvaluationStatus>;
  };

  // Tópico 3 - Materiais
  topico3_materiais?: ConsumableItem[];

  // Tópico 4 - Equipamentos
  topico4_equipamentos?: EquipmentItem[];

  // Tópico 5 - Recursos Humanos
  topico5_rh?: {
    conselheirosPresentes?: FieldObserved<string>;
    equipeAdministrativaCompleta?: FieldObserved<string>;
    cumprimentoHorario?: FieldObserved<string>;
    escalasAfixadas?: FieldObserved<string>;
    necessidadeSubstituicao?: FieldObserved<string>;
  };

  // Tópico 6 - Atendimento ao Público
  topico6_atendimento?: {
    atendimentoRegular?: FieldObserved<'Sim' | 'Não'>;
    salaReservada?: FieldObserved<'Sim' | 'Não'>;
    organizacaoAtendimento?: FieldObserved<'Sim' | 'Não'>;
    fluxoUsuario?: FieldObserved<'Sim' | 'Não'>;
  };

  // Tópico 7 - Segurança
  topico7_seguranca?: {
    extintores?: FieldObserved<EvaluationStatus>;
    fechadura?: FieldObserved<EvaluationStatus>;
    portoes?: FieldObserved<EvaluationStatus>;
    iluminacaoExterna?: FieldObserved<EvaluationStatus>;
    camera?: FieldObserved<EvaluationStatus>;
  };

  // Tópico 8 - Demandas Identificadas
  topico8_demandas?: DemandItem[];

  // Tópico 9 - Providências Tomadas
  topico9_providencias?: ActionItem[];

  // Tópico 10 - Fotos
  topico10_fotos?: string[];
}