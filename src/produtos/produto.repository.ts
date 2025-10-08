import { supabase } from '../lib/supabaseClient.js';
import { type Produto, type UpdateEstoqueConfigRequest, type EstoqueAtual } from './produto.types.js';

export class ProdutoRepository {
  async create(produto: Omit<Produto, 'id' | 'created_at' | 'deleted_at'>): Promise<Produto> {
    const { data, error } = await supabase
      .from('Produtos')
      .insert(produto)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar Produto:', error);
      throw new Error('Não foi possível criar o novo produto.');
    }

    return data as Produto;
  }

  async findAll(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar Produtos:', error);
      throw new Error('Não foi possível buscar os produtos.');
    }

    return data as Produto[];
  }

  async findById(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar Produto por ID:', error);
      throw new Error('Não foi possível buscar o produto.');
    }

    return (data ?? null) as Produto | null;
  }

  async update(id: string, produto: Partial<Produto>): Promise<Produto> {
    const { data, error } = await supabase
      .from('Produtos')
      .update(produto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar Produto:', error);
      throw new Error('Não foi possível atualizar o produto.');
    }

    return data as Produto;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('Produtos')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar Produto:', error);
      throw new Error('Não foi possível deletar o produto.');
    }

    return { message: 'Produto desativado com sucesso.' };
  }

  // Métodos específicos para controle de estoque
  async updateEstoqueConfig(id: string, config: UpdateEstoqueConfigRequest): Promise<Produto> {
    const { data, error } = await supabase
      .from('Produtos')
      .update(config)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar configuração de estoque:', error);
      throw new Error('Não foi possível atualizar a configuração de estoque.');
    }

    return data as Produto;
  }

  async findProdutosAtivos(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('ativo', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar produtos ativos:', error);
      throw new Error('Não foi possível buscar os produtos ativos.');
    }

    return data as Produto[];
  }

  async findProdutosComEstoqueBaixo(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .lte('quantidade_atual', supabase.raw('quantidade_minima'))
      .eq('ativo', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw new Error('Não foi possível buscar os produtos com estoque baixo.');
    }

    return data as Produto[];
  }

  async findProdutosSemEstoque(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('quantidade_atual', 0)
      .eq('ativo', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar produtos sem estoque:', error);
      throw new Error('Não foi possível buscar os produtos sem estoque.');
    }

    return data as Produto[];
  }

  async getEstoqueAtual(): Promise<EstoqueAtual[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select(`
        id,
        descricao,
        codigo_interno,
        quantidade_atual,
        quantidade_minima,
        quantidade_maxima,
        localizacao_estoque,
        ativo,
        preco_custo
      `)
      .eq('ativo', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar estoque atual:', error);
      throw new Error('Não foi possível buscar o estoque atual.');
    }

    return data.map(produto => ({
      produto_id: produto.id,
      descricao: produto.descricao,
      codigo_interno: produto.codigo_interno,
      quantidade_atual: produto.quantidade_atual || 0,
      quantidade_minima: produto.quantidade_minima || 0,
      quantidade_maxima: produto.quantidade_maxima || 1000,
      localizacao_estoque: produto.localizacao_estoque,
      ativo: produto.ativo,
      estoque_baixo: (produto.quantidade_atual || 0) <= (produto.quantidade_minima || 0),
      valor_total_estoque: (produto.quantidade_atual || 0) * (produto.preco_custo || 0)
    })) as EstoqueAtual[];
  }

  async updateQuantidadeAtual(id: string, novaQuantidade: number): Promise<void> {
    const { error } = await supabase
      .from('Produtos')
      .update({ quantidade_atual: novaQuantidade })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar quantidade atual:', error);
      throw new Error('Não foi possível atualizar a quantidade atual do produto.');
    }
  }

  async findByCodigoBarras(codigoBarras: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('codigo_barras', codigoBarras)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar produto por código de barras:', error);
      throw new Error('Não foi possível buscar o produto pelo código de barras.');
    }

    return (data ?? null) as Produto | null;
  }
}