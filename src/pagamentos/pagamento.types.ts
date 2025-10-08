// Enums para o sistema de pagamentos
export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
  ESTORNADO = 'ESTORNADO'
}

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BOLETO = 'BOLETO',
  CHEQUE = 'CHEQUE'
}

export enum TipoPagamento {
  ENTRADA = 'ENTRADA',
  PARCELA = 'PARCELA',
  PAGAMENTO_UNICO = 'PAGAMENTO_UNICO'
}

// Interface principal para pagamentos
export interface Pagamento {
  id?: string;
  os_id: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  forma_pagamento: FormaPagamento;
  numero_parcelas: number;
  status: StatusPagamento;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Interface para parcelas individuais
export interface PagamentoParcela {
  id?: string;
  pagamento_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status: StatusPagamento;
  forma_pagamento_parcela?: FormaPagamento | null;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Interface para criação de pagamento
export interface CreatePagamentoRequest {
  os_id: string;
  valor_total: number;
  forma_pagamento: FormaPagamento;
  numero_parcelas?: number;
  data_primeiro_vencimento?: string;
  observacoes?: string;
}

// Interface para atualização de pagamento
export interface UpdatePagamentoRequest {
  forma_pagamento?: FormaPagamento;
  observacoes?: string;
}

// Interface para registro de pagamento de parcela
export interface RegistrarPagamentoParcelaRequest {
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento_parcela?: FormaPagamento;
  observacoes?: string;
}

// Interface para estorno de pagamento
export interface EstornarPagamentoRequest {
  motivo: string;
  valor_estorno?: number; // Se não informado, estorna o valor total
  observacoes?: string;
}

// Interface para resposta da API - Pagamento
export interface PagamentoResponse {
  id: string;
  os_id: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  forma_pagamento: FormaPagamento;
  numero_parcelas: number;
  status: StatusPagamento;
  data_vencimento?: string;
  data_pagamento?: string;
  observacoes?: string;
  parcelas: PagamentoParcelaResponse[];
  created_at: string;
  updated_at: string;
}

// Interface para resposta da API - Parcela
export interface PagamentoParcelaResponse {
  id: string;
  pagamento_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusPagamento;
  forma_pagamento_parcela?: FormaPagamento;
  observacoes?: string;
  dias_atraso?: number;
  created_at: string;
  updated_at: string;
}

// Interface para filtros de consulta
export interface PagamentoFilters {
  os_id?: string;
  status?: StatusPagamento;
  forma_pagamento?: FormaPagamento;
  data_vencimento_inicio?: string;
  data_vencimento_fim?: string;
  data_pagamento_inicio?: string;
  data_pagamento_fim?: string;
  valor_min?: number;
  valor_max?: number;
  apenas_vencidos?: boolean;
  page?: number;
  limit?: number;
}

// Interface para resposta de listagem
export interface PagamentoListResponse {
  pagamentos: PagamentoResponse[];
  total: number;
  page: number;
  limit: number;
}

// Interface para estatísticas de pagamentos
export interface PagamentoStats {
  total_recebido: number;
  total_pendente: number;
  total_vencido: number;
  parcelas_vencidas: number;
  parcelas_hoje: number;
  parcelas_proximos_7_dias: number;
  receita_mensal: Record<string, number>; // YYYY-MM -> valor
  formas_pagamento_mais_usadas: Record<FormaPagamento, number>;
}

// Interface para relatório financeiro
export interface RelatorioFinanceiro {
  periodo_inicio: string;
  periodo_fim: string;
  total_faturado: number;
  total_recebido: number;
  total_pendente: number;
  total_vencido: number;
  pagamentos_por_forma: Record<FormaPagamento, {
    quantidade: number;
    valor_total: number;
  }>;
  evolucao_mensal: Array<{
    mes: string;
    faturado: number;
    recebido: number;
    pendente: number;
  }>;
}

// Interface para cobrança automática
export interface CobrancaAutomatica {
  id?: string;
  parcela_id: string;
  tipo_cobranca: 'EMAIL' | 'SMS' | 'WHATSAPP';
  dias_antes_vencimento: number;
  mensagem: string;
  enviado: boolean;
  data_envio?: string | null;
  created_at?: string;
}

// Interface para configuração de cobrança
export interface ConfiguracaoCobranca {
  dias_antes_vencimento: number[];
  tipos_cobranca: ('EMAIL' | 'SMS' | 'WHATSAPP')[];
  template_email?: string;
  template_sms?: string;
  template_whatsapp?: string;
  ativo: boolean;
}

// Configurações padrão do sistema
export const CONFIGURACAO_PAGAMENTO_PADRAO = {
  DIAS_COBRANCA: [7, 3, 1, 0], // 7 dias antes, 3 dias antes, 1 dia antes, no vencimento
  JUROS_ATRASO_DIARIO: 0.033, // 1% ao mês = 0.033% ao dia
  MULTA_ATRASO: 0.02, // 2%
  DESCONTO_PAGAMENTO_ANTECIPADO: 0.05 // 5%
} as const;

// Validações de pagamento
export interface PagamentoValidation {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

// Interface para histórico de pagamentos
export interface HistoricoPagamento {
  id?: string;
  pagamento_id: string;
  acao: 'CRIADO' | 'PAGO' | 'ESTORNADO' | 'CANCELADO' | 'ATUALIZADO';
  valor_anterior?: number;
  valor_novo?: number;
  usuario_id: string;
  observacoes?: string;
  data_acao: string;
  created_at?: string;
}