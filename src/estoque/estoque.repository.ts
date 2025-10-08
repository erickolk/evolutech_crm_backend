import { supabase } from '../lib/supabaseClient.js';
import { 
  type EstoqueMovimentacao, 
  type CreateMovimentacaoRequest, 
  type RelatorioMovimentacoes,
  type SaldoAtual,
  type HistoricoMovimentacoes,
  type TipoMovimentacao
} from './estoque.types.js';

export class EstoqueRepository {
  
  // CRUD básico de movimentações
  async create(movimentacao: Omit<EstoqueMovimentacao, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<EstoqueMovimentacao> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .insert(movimentacao)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar movimentação de estoque:', error);
      throw new Error('Não foi possível registrar a movimentação de estoque.');
    }

    return data as EstoqueMovimentacao;
  }

  async findAll(): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select(`
        *,
        produtos:produto_id (
          descricao,
          codigo_interno
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw new Error('Não foi possível buscar as movimentações.');
    }

    return data as EstoqueMovimentacao[];
  }

  async findById(id: string): Promise<EstoqueMovimentacao | null> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select(`
        *,
        produtos:produto_id (
          descricao,
          codigo_interno
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar movimentação por ID:', error);
      throw new Error('Não foi possível buscar a movimentação.');
    }

    return (data ?? null) as EstoqueMovimentacao | null;
  }

  async findByProdutoId(produtoId: string): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select('*')
      .eq('produto_id', produtoId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações por produto:', error);
      throw new Error('Não foi possível buscar as movimentações do produto.');
    }

    return data as EstoqueMovimentacao[];
  }

  // Cálculos de estoque
  async calcularSaldoAtual(produtoId: string): Promise<number> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select('quantidade')
      .eq('produto_id', produtoId)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao calcular saldo atual:', error);
      throw new Error('Não foi possível calcular o saldo atual.');
    }

    const saldo = data.reduce((total, mov) => total + mov.quantidade, 0);
    return saldo;
  }

  async getUltimaMovimentacao(produtoId: string): Promise<EstoqueMovimentacao | null> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select('*')
      .eq('produto_id', produtoId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar última movimentação:', error);
      throw new Error('Não foi possível buscar a última movimentação.');
    }

    return (data ?? null) as EstoqueMovimentacao | null;
  }

  // Relatórios e consultas específicas
  async findMovimentacoesPorPeriodo(filtros: RelatorioMovimentacoes): Promise<EstoqueMovimentacao[]> {
    let query = supabase
      .from('estoque_movimentacoes')
      .select(`
        *,
        produtos:produto_id (
          descricao,
          codigo_interno
        )
      `)
      .is('deleted_at', null);

    if (filtros.produto_id) {
      query = query.eq('produto_id', filtros.produto_id);
    }

    if (filtros.tipo_movimentacao) {
      query = query.eq('tipo_movimentacao', filtros.tipo_movimentacao);
    }

    if (filtros.data_inicio) {
      query = query.gte('created_at', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query = query.lte('created_at', filtros.data_fim);
    }

    if (filtros.documento_referencia) {
      query = query.eq('documento_referencia', filtros.documento_referencia);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações por período:', error);
      throw new Error('Não foi possível buscar as movimentações do período.');
    }

    return data as EstoqueMovimentacao[];
  }

  async getHistoricoPorProduto(produtoId: string): Promise<HistoricoMovimentacoes> {
    // Buscar produto
    const { data: produto, error: produtoError } = await supabase
      .from('Produtos')
      .select('descricao')
      .eq('id', produtoId)
      .single();

    if (produtoError) {
      throw new Error('Produto não encontrado.');
    }

    // Buscar movimentações
    const movimentacoes = await this.findByProdutoId(produtoId);

    // Calcular totais
    const totalEntradas = movimentacoes
      .filter(mov => mov.quantidade > 0)
      .reduce((total, mov) => total + mov.quantidade, 0);

    const totalSaidas = Math.abs(movimentacoes
      .filter(mov => mov.quantidade < 0)
      .reduce((total, mov) => total + mov.quantidade, 0));

    const saldoFinal = await this.calcularSaldoAtual(produtoId);
    const saldoInicial = saldoFinal - totalEntradas + totalSaidas;

    return {
      produto_id: produtoId,
      descricao: produto.descricao,
      movimentacoes,
      saldo_inicial: saldoInicial,
      saldo_final: saldoFinal,
      total_entradas: totalEntradas,
      total_saidas: totalSaidas
    };
  }

  async getTotaisPorTipo(produtoId?: string): Promise<Record<TipoMovimentacao, number>> {
    let query = supabase
      .from('estoque_movimentacoes')
      .select('tipo_movimentacao, quantidade')
      .is('deleted_at', null);

    if (produtoId) {
      query = query.eq('produto_id', produtoId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar totais por tipo:', error);
      throw new Error('Não foi possível buscar os totais por tipo.');
    }

    const totais: Record<TipoMovimentacao, number> = {
      entrada: 0,
      saida: 0,
      ajuste: 0,
      transferencia: 0
    };

    data.forEach(mov => {
      totais[mov.tipo_movimentacao] += Math.abs(mov.quantidade);
    });

    return totais;
  }

  // Validações e verificações
  async verificarEstoqueDisponivel(produtoId: string, quantidadeNecessaria: number): Promise<boolean> {
    const saldoAtual = await this.calcularSaldoAtual(produtoId);
    return saldoAtual >= quantidadeNecessaria;
  }

  async getMovimentacoesPorDocumento(documentoReferencia: string): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('estoque_movimentacoes')
      .select(`
        *,
        produtos:produto_id (
          descricao,
          codigo_interno
        )
      `)
      .eq('documento_referencia', documentoReferencia)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações por documento:', error);
      throw new Error('Não foi possível buscar as movimentações do documento.');
    }

    return data as EstoqueMovimentacao[];
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('estoque_movimentacoes')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar movimentação:', error);
      throw new Error('Não foi possível deletar a movimentação.');
    }
  }
}