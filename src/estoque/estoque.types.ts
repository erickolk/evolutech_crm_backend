// Tipos de movimentação de estoque
export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'transferencia';

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
  motivo: string;
  documento_referencia?: string | null; // NF, OS, etc.
  usuario_id?: string | null; // quem fez a movimentação (futuro)
  observacoes?: string | null;
}

// Interface para criar nova movimentação
export interface CreateMovimentacaoRequest {
  produto_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  valor_unitario: number;
  motivo: string;
  documento_referencia?: string | null;
  observacoes?: string | null;
}

// Interface para ajuste de estoque
export interface AjusteEstoqueRequest {
  produto_id: string;
  quantidade_nova: number;
  motivo: string;
  observacoes?: string | null;
}

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

// Interface para produtos com estoque baixo
export interface ProdutoEstoqueBaixo {
  produto_id: string;
  descricao: string;
  codigo_interno?: string | null;
  quantidade_atual: number;
  quantidade_minima: number;
  diferenca: number;
  localizacao_estoque?: string | null;
}

// Interface para produtos sem estoque
export interface ProdutoSemEstoque {
  produto_id: string;
  descricao: string;
  codigo_interno?: string | null;
  quantidade_atual: number;
  localizacao_estoque?: string | null;
  ultima_saida?: string;
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

// Interface para validação de estoque disponível
export interface EstoqueDisponivel {
  produto_id: string;
  quantidade_disponivel: number;
  quantidade_reservada: number;
  pode_reservar: boolean;
  motivo_bloqueio?: string;
}