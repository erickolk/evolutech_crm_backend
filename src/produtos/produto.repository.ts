import { supabase } from '../lib/supabaseClient.js';
import { type Produto, type UpdateEstoqueConfigRequest, type EstoqueAtual } from './produto.types.js';
import { 
  type ProdutoEstoqueBaixo, 
  type ProdutoSemEstoque, 
  type SaldoAtual,
  type FiltroProdutos,
  type ListaProdutosResponse,
  type ConfiguracaoEstoque,
  type EstoqueDisponivel
} from '../estoque/estoque.types.js';

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
    console.log(`Attempting to update product with id: ${id}`, produto);
    const { data, error } = await supabase
      .from('Produtos')
      .update(produto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Detailed error updating product:', error);
      throw new Error(`Erro do Supabase: ${JSON.stringify(error)}`);
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

  async findProdutosComEstoqueBaixo(): Promise<ProdutoEstoqueBaixo[]> {
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

    return data.map(produto => ({
      produto_id: produto.id,
      descricao: produto.descricao,
      codigo_interno: produto.codigo_interno,
      quantidade_atual: produto.quantidade_atual || 0,
      quantidade_minima: produto.quantidade_minima || 0,
      diferenca: (produto.quantidade_minima || 0) - (produto.quantidade_atual || 0),
      localizacao_estoque: produto.localizacao_estoque
    })) as ProdutoEstoqueBaixo[];
  }

  async findProdutosSemEstoque(): Promise<ProdutoSemEstoque[]> {
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

    return data.map(produto => ({
      produto_id: produto.id,
      descricao: produto.descricao,
      codigo_interno: produto.codigo_interno,
      quantidade_atual: 0,
      localizacao_estoque: produto.localizacao_estoque,
      ultima_saida: null // TODO: buscar da tabela de movimentações
    })) as ProdutoSemEstoque[];
  }

  async getEstoqueAtual(): Promise<SaldoAtual[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select(`
        id,
        descricao,
        codigo_interno,
        quantidade_atual,
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
      valor_unitario_medio: produto.preco_custo || 0,
      valor_total: (produto.quantidade_atual || 0) * (produto.preco_custo || 0),
      ultima_movimentacao: null // TODO: buscar da tabela de movimentações
    })) as SaldoAtual[];
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

  // ===== MÉTODOS ESTENDIDOS PARA CONTROLE DE ESTOQUE =====

  async findWithFilters(filtros: FiltroProdutos): Promise<ListaProdutosResponse> {
    let query = supabase
      .from('Produtos')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Aplicar filtros
    if (filtros.descricao) {
      query = query.ilike('descricao', `%${filtros.descricao}%`);
    }
    if (filtros.codigo_interno) {
      query = query.ilike('codigo_interno', `%${filtros.codigo_interno}%`);
    }
    if (filtros.codigo_barras) {
      query = query.eq('codigo_barras', filtros.codigo_barras);
    }
    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }
    if (filtros.com_estoque) {
      query = query.gt('quantidade_atual', 0);
    }
    if (filtros.sem_estoque) {
      query = query.eq('quantidade_atual', 0);
    }
    if (filtros.estoque_baixo) {
      query = query.lte('quantidade_atual', supabase.raw('quantidade_minima'));
    }

    // Paginação
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar produtos com filtros:', error);
      throw new Error('Não foi possível buscar os produtos.');
    }

    const produtos = data.map(produto => ({
      produto_id: produto.id,
      descricao: produto.descricao,
      codigo_interno: produto.codigo_interno,
      quantidade_atual: produto.quantidade_atual || 0,
      valor_unitario_medio: produto.preco_custo || 0,
      valor_total: (produto.quantidade_atual || 0) * (produto.preco_custo || 0),
      ultima_movimentacao: null
    })) as SaldoAtual[];

    return {
      produtos,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async verificarEstoqueDisponivel(produtoId: string, quantidadeDesejada: number): Promise<EstoqueDisponivel> {
    const produto = await this.findById(produtoId);
    
    if (!produto) {
      return {
        produto_id: produtoId,
        quantidade_disponivel: 0,
        quantidade_reservada: 0,
        pode_reservar: false,
        motivo_bloqueio: 'Produto não encontrado'
      };
    }

    if (!produto.ativo) {
      return {
        produto_id: produtoId,
        quantidade_disponivel: produto.quantidade_atual || 0,
        quantidade_reservada: 0,
        pode_reservar: false,
        motivo_bloqueio: 'Produto inativo'
      };
    }

    const quantidadeAtual = produto.quantidade_atual || 0;
    const quantidadeReservada = 0; // TODO: implementar sistema de reservas

    return {
      produto_id: produtoId,
      quantidade_disponivel: quantidadeAtual - quantidadeReservada,
      quantidade_reservada: quantidadeReservada,
      pode_reservar: (quantidadeAtual - quantidadeReservada) >= quantidadeDesejada,
      motivo_bloqueio: (quantidadeAtual - quantidadeReservada) < quantidadeDesejada ? 'Estoque insuficiente' : undefined
    };
  }

  async updateConfiguracaoEstoque(produtoId: string, config: ConfiguracaoEstoque): Promise<void> {
    const { error } = await supabase
      .from('Produtos')
      .update({
        quantidade_minima: config.quantidade_minima,
        quantidade_maxima: config.quantidade_maxima,
        localizacao_estoque: config.localizacao_estoque
      })
      .eq('id', produtoId);

    if (error) {
      console.error('Erro ao atualizar configuração de estoque:', error);
      throw new Error('Não foi possível atualizar a configuração de estoque.');
    }
  }

  async findProdutosParaReposicao(): Promise<ProdutoEstoqueBaixo[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .lt('quantidade_atual', supabase.raw('quantidade_minima'))
      .eq('ativo', true)
      .is('deleted_at', null)
      .order('quantidade_atual', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos para reposição:', error);
      throw new Error('Não foi possível buscar os produtos para reposição.');
    }

    return data.map(produto => ({
      produto_id: produto.id,
      descricao: produto.descricao,
      codigo_interno: produto.codigo_interno,
      quantidade_atual: produto.quantidade_atual || 0,
      quantidade_minima: produto.quantidade_minima || 0,
      diferenca: (produto.quantidade_minima || 0) - (produto.quantidade_atual || 0),
      localizacao_estoque: produto.localizacao_estoque
    })) as ProdutoEstoqueBaixo[];
  }

  async getValorTotalEstoque(): Promise<number> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('quantidade_atual, preco_custo')
      .eq('ativo', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao calcular valor total do estoque:', error);
      throw new Error('Não foi possível calcular o valor total do estoque.');
    }

    return data.reduce((total, produto) => {
      const quantidade = produto.quantidade_atual || 0;
      const preco = produto.preco_custo || 0;
      return total + (quantidade * preco);
    }, 0);
  }

  async findByCodigoInterno(codigoInterno: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('codigo_interno', codigoInterno)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar produto por código interno:', error);
      throw new Error('Não foi possível buscar o produto pelo código interno.');
    }

    return (data ?? null) as Produto | null;
  }
}