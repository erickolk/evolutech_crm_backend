// ===== ENUMS =====

export enum TipoMovimentacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  TRANSFERENCIA = 'transferencia'
}

export enum MotivoMovimentacao {
  // Entradas
  COMPRA_FORNECEDOR = 'compra_fornecedor',
  DEVOLUCAO_CLIENTE = 'devolucao_cliente',
  AJUSTE_POSITIVO = 'ajuste_positivo',
  TRANSFERENCIA_RECEBIDA = 'transferencia_recebida',
  
  // Saídas
  VENDA_OS = 'venda_os',
  PERDA_AVARIA = 'perda_avaria',
  AJUSTE_NEGATIVO = 'ajuste_negativo',
  TRANSFERENCIA_ENVIADA = 'transferencia_enviada',
  
  // Ajustes
  CORRECAO_INVENTARIO = 'correcao_inventario',
  ACERTO_DIVERGENCIA = 'acerto_divergencia',
  
  // Outros
  OUTROS = 'outros'
}

// ===== INTERFACES PRINCIPAIS =====

// Interface principal para movimentação de estoque
export interface EstoqueMovimentacao {
  id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  produto_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number; // positivo para entrada, negativo para saída
  quantidade_anterior: number; // estoque antes da movimentação
  quantidade_atual: number; // estoque após a movimentação
  valor_unitario: number;
  valor_total: number; // quantidade × valor_unitario
  motivo: MotivoMovimentacao | string;
  documento_referencia?: string | null; // NF, OS, etc.
  usuario_id?: string | null; // quem fez a movimentação
  observacoes?: string | null;
}

// Interface para criar nova movimentação
export interface CreateMovimentacaoRequest {
  produto_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  valor_unitario: number;
  motivo: MotivoMovimentacao | string;
  documento_referencia?: string | null;
  observacoes?: string | null;
  usuario_id?: string;
}

// Interface para ajuste de estoque
export interface AjusteEstoqueRequest {
  produto_id: string;
  quantidade_nova: number;
  motivo: string;
  observacoes?: string | null;
  usuario_id?: string;
}

// Interface para resposta de movimentação
export interface MovimentacaoResponse {
  id: string;
  produto_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  valor_unitario: number;
  valor_total: number;
  motivo: MotivoMovimentacao | string;
  documento_referencia?: string | null;
  usuario_id?: string | null;
  observacoes?: string | null;
  created_at: string;
}

// ===== INTERFACES DE FILTROS E LISTAS =====

// Interface para filtros de movimentação
export interface FiltroMovimentacao {
  produto_id?: string;
  tipo_movimentacao?: TipoMovimentacao;
  motivo?: MotivoMovimentacao | string;
  data_inicio?: string;
  data_fim?: string;
  usuario_id?: string;
  documento_referencia?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  page?: number;
  limit?: number;
}

// Interface para resposta de lista de movimentações
export interface ListaMovimentacoesResponse {
  movimentacoes: EstoqueMovimentacao[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ===== INTERFACES DE RELATÓRIOS =====

// Interface para relatório de movimentações
export interface RelatorioMovimentacoes {
  produto_id?: string;
  tipo_movimentacao?: TipoMovimentacao;
  data_inicio?: string;
  data_fim?: string;
  documento_referencia?: string;
}

// Interface para resposta de saldo atual
export interface SaldoAtual {
  produto_id: string;
  descricao: string;
  codigo_interno?: string | null;
  quantidade_atual: number;
  valor_unitario_medio: number;
  valor_total: number;
  ultima_movimentacao?: string;
}

// Interface para relatório consolidado de estoque
export interface RelatorioEstoque {
  total_produtos: number;
  produtos_com_estoque: number;
  produtos_sem_estoque: number;
  produtos_estoque_baixo: number;
  valor_total_estoque: number;
  produtos: SaldoAtual[];
}

// Interface para histórico de movimentações por produto
export interface HistoricoMovimentacoes {
  produto_id: string;
  descricao: string;
  movimentacoes: EstoqueMovimentacao[];
  saldo_inicial: number;
  saldo_final: number;
  total_entradas: number;
  total_saidas: number;
}

// ===== INTERFACES OPERACIONAIS =====

// Interface para transferência entre locais
export interface TransferenciaEstoque {
  produto_id: string;
  quantidade: number;
  local_origem: string;
  local_destino: string;
  motivo: string;
  observacoes?: string;
  usuario_id?: string;
}

// Interface para reserva de estoque
export interface ReservaEstoque {
  id?: string;
  produto_id: string;
  quantidade_reservada: number;
  documento_referencia: string; // OS, Orçamento, etc.
  data_reserva: string;
  data_expiracao?: string;
  usuario_id?: string;
  ativo: boolean;
}

// Interface para auditoria de estoque
export interface AuditoriaEstoque {
  id?: string;
  produto_id: string;
  quantidade_sistema: number;
  quantidade_fisica: number;
  diferenca: number;
  data_auditoria: string;
  usuario_id?: string;
  observacoes?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

// ===== INTERFACES DE INTEGRAÇÃO =====

// Interface para integração com orçamentos
export interface BaixaEstoqueOrcamento {
  orcamento_id: string;
  itens: Array<{
    produto_id: string;
    quantidade: number;
    valor_unitario: number;
  }>;
  usuario_id?: string;
  observacoes?: string;
}