export interface Produto {
  id?: string;
  created_at?: string;

  descricao: string;
  codigo_interno?: string | null;

  preco_custo: number;
  preco_venda: number;

  quantidade_atual?: number;
  
  // Novos campos para controle de estoque
  quantidade_minima?: number;
  quantidade_maxima?: number;
  localizacao_estoque?: string | null;
  codigo_barras?: string | null;
  ativo?: boolean;

  deleted_at?: string | null;
}

// Interface para atualização de configurações de estoque
export interface UpdateEstoqueConfigRequest {
  quantidade_minima?: number;
  quantidade_maxima?: number;
  localizacao_estoque?: string | null;
  codigo_barras?: string | null;
  ativo?: boolean;
}

// Interface para resposta de estoque atual
export interface EstoqueAtual {
  produto_id: string;
  descricao: string;
  codigo_interno?: string | null;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  localizacao_estoque?: string | null;
  ativo: boolean;
  estoque_baixo: boolean;
  valor_total_estoque: number;
}