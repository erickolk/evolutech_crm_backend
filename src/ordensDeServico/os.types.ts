// Usamos 'enum' para criar um tipo seguro para um conjunto de valores constantes.
// Isso evita erros de digitação e deixa o código mais legível.
export enum StatusOS {
  RECEBIDO = 'recebido',
  EM_DIAGNOSTICO = 'em_diagnostico',
  AGUARDANDO_PECAS = 'aguardando_pecas',
  AGUARDANDO_APROVACAO = 'aguardando_aprovacao',
  EM_REPARO = 'em_reparo',
  TESTANDO = 'testando',
  PRONTO_RETIRADA = 'pronto_retirada',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
  GARANTIA = 'garantia'
}

export enum TipoOS {
  NORMAL = 'normal',
  RETORNO = 'retorno',
  PREVENTIVA = 'preventiva',
  GARANTIA = 'garantia'
}

export enum Prioridade {
  BAIXA = 'baixa',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente'
}

export enum FormaPagamento {
  DINHEIRO = 'dinheiro',
  PIX = 'pix',
  CARTAO_DEBITO = 'cartao_debito',
  CARTAO_CREDITO = 'cartao_credito',
  PARCELADO = 'parcelado'
}

// A interface principal para a Ordem de Serviço (baseada na estrutura real da tabela)
export interface OrdemDeServico {
  id?: string;
  created_at?: string;

  // Chaves estrangeiras que ligam a OS a outras tabelas
  cliente_id: string;
  dispositivo_id: string;
  tecnico_responsavel_id?: string | null;

  // Campos da estrutura real da tabela
  status_fluxo?: string | null; // Campo real da tabela
  relato_cliente?: string | null;
  diagnostico_tecnico?: string | null;
  valor_orcamento?: number | null;
  prazo_entrega?: string | null;
  garantia_servico?: number | null;
  data_ultima_manutencao?: string | null;
  esta_na_garantia_cliente?: boolean | null;
  diagnostico_anterior_cliente?: string | null;
  prioridade?: string | null;
  numero_aos?: string | null;
  acessorios_inclusos?: string | null;
  deleted_at?: string | null;
  tipo_os?: string | null;
}

// Interface para criação de OS (flexível para aceitar diferentes formatos do frontend)
export interface CreateOrdemDeServicoRequest {
  cliente_id: string;
  dispositivo_id: string;
  tipo_os?: string;
  prioridade?: string;
  relato_cliente?: string;
  acessorios_inclusos?: string;
  data_prevista_entrega?: string;
  observacoes_cliente?: string;
}

// Interface para atualização de OS
export interface UpdateOrdemDeServicoRequest {
  tecnico_responsavel_id?: string;
  diagnostico_tecnico?: string;
  data_prevista_entrega?: string;
  data_entrega_real?: string;
  valor_total_aprovado?: number;
  forma_pagamento?: FormaPagamento;
  parcelas?: number;
  desconto_aplicado?: number;
  desconto_justificativa?: string;
  observacoes_internas?: string;
  observacoes_cliente?: string;
  orcamento_detalhado?: any;
  numero_aos?: string;
}

// Interface para mudança de status
export interface ChangeStatusRequest {
  novo_status: StatusOS;
  motivo: string;
  observacoes?: string;
}

// Interface para atribuição de técnico
export interface AtribuirTecnicoRequest {
  tecnico_responsavel_id: string;
  motivo?: string;
}

// Interface para resposta da API
export interface OrdemDeServicoResponse {
  id: string;
  cliente_id: string;
  dispositivo_id: string;
  tecnico_responsavel_id?: string;
  status: StatusOS;
  tipo_os: TipoOS;
  prioridade: Prioridade;
  relato_cliente?: string;
  diagnostico_tecnico?: string;
  acessorios_inclusos?: string;
  data_prevista_entrega?: string;
  data_entrega_real?: string;
  valor_total_aprovado?: number;
  forma_pagamento?: FormaPagamento;
  parcelas?: number;
  desconto_aplicado?: number;
  desconto_justificativa?: string;
  observacoes_internas?: string;
  observacoes_cliente?: string;
  orcamento_detalhado?: any;
  numero_aos?: string;
  created_at: string;
  updated_at: string;
}

// Interface para listagem com filtros
export interface OrdemDeServicoFilters {
  status?: StatusOS;
  tipo_os?: TipoOS;
  prioridade?: Prioridade;
  cliente_id?: string;
  tecnico_responsavel_id?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

// Interface para resposta de listagem
export interface OrdemDeServicoListResponse {
  ordens: OrdemDeServicoResponse[];
  total: number;
  page: number;
  limit: number;
}

// Transições permitidas de status
export const TRANSICOES_PERMITIDAS: Record<StatusOS, StatusOS[]> = {
  [StatusOS.RECEBIDO]: [StatusOS.EM_DIAGNOSTICO, StatusOS.CANCELADO],
  [StatusOS.EM_DIAGNOSTICO]: [StatusOS.AGUARDANDO_PECAS, StatusOS.AGUARDANDO_APROVACAO, StatusOS.EM_REPARO, StatusOS.CANCELADO],
  [StatusOS.AGUARDANDO_PECAS]: [StatusOS.EM_REPARO, StatusOS.CANCELADO],
  [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.EM_REPARO, StatusOS.CANCELADO, StatusOS.EM_DIAGNOSTICO],
  [StatusOS.EM_REPARO]: [StatusOS.TESTANDO, StatusOS.AGUARDANDO_PECAS, StatusOS.CANCELADO],
  [StatusOS.TESTANDO]: [StatusOS.PRONTO_RETIRADA, StatusOS.EM_REPARO],
  [StatusOS.PRONTO_RETIRADA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [StatusOS.GARANTIA],
  [StatusOS.CANCELADO]: [],
  [StatusOS.GARANTIA]: [StatusOS.EM_DIAGNOSTICO, StatusOS.EM_REPARO]
};

// Status que notificam o cliente
export const STATUS_NOTIFICAVEIS = [
  StatusOS.AGUARDANDO_APROVACAO,
  StatusOS.PRONTO_RETIRADA,
  StatusOS.ENTREGUE
];