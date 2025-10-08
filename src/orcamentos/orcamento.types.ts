export interface Orcamento {
  id?: string; // Gerado pelo banco, opcional na criação
  created_at?: string; // Gerado pelo banco, opcional na criação
  updated_at?: string; // Gerado pelo banco, opcional na criação
  deleted_at?: string | null; // Soft delete

  // Relacionamentos
  ordem_servico_id: string;

  // Dados do Orçamento
  versao: number;
  status: 'pendente' | 'aprovado_parcial' | 'aprovado_total' | 'rejeitado';
  
  // Descontos
  desconto_percentual?: number | null;
  desconto_justificativa?: string | null;
  
  // Valores Calculados
  valor_total_pecas: number;
  valor_total_servicos: number;
  valor_total_geral: number;
  
  // Observações
  observacoes?: string | null;
}

export interface CreateOrcamentoRequest {
  ordem_servico_id: string;
  desconto_percentual?: number;
  desconto_justificativa?: string;
  observacoes?: string;
}

export interface UpdateOrcamentoRequest {
  desconto_percentual?: number;
  desconto_justificativa?: string;
  observacoes?: string;
}

export interface OrcamentoWithItens extends Orcamento {
  itens?: OrcamentoItem[];
}

export interface OrcamentoItem {
  id?: string; // Gerado pelo banco, opcional na criação
  created_at?: string; // Gerado pelo banco, opcional na criação
  updated_at?: string; // Gerado pelo banco, opcional na criação
  deleted_at?: string | null; // Soft delete

  // Relacionamentos
  orcamento_id: string;
  produto_id?: string | null;

  // Dados do Item
  tipo_item: 'peca' | 'servico';
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado' | 'cliente_traz_peca';
  garantia_dias: number;
  
  // Observações
  observacoes?: string | null;
}

export interface CreateOrcamentoItemRequest {
  produto_id?: string;
  tipo_item: 'peca' | 'servico';
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  garantia_dias?: number;
  observacoes?: string;
}

export interface UpdateOrcamentoItemRequest {
  produto_id?: string;
  tipo_item?: 'peca' | 'servico';
  descricao?: string;
  quantidade?: number;
  valor_unitario?: number;
  garantia_dias?: number;
  observacoes?: string;
}

export interface ApprovalRequest {
  status_aprovacao: 'aprovado' | 'rejeitado' | 'cliente_traz_peca';
}

export interface OrcamentoCalculations {
  valor_total_pecas: number;
  valor_total_servicos: number;
  valor_total_geral: number;
  status_orcamento: 'pendente' | 'aprovado_parcial' | 'aprovado_total' | 'rejeitado';
}