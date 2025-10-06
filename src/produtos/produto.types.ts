export interface Produto {
  id?: string;
  created_at?: string;

  descricao: string;
  codigo_interno?: string | null;

  preco_custo: number;
  preco_venda: number;

  quantidade_atual?: number;

  deleted_at?: string | null;
}