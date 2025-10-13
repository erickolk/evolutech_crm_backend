import { supabase } from '../lib/supabaseClient.js';
import { 
  type EstoqueMovimentacao, 
  type CreateMovimentacaoRequest,
  type FiltroMovimentacao,
  type ListaMovimentacoesResponse,
  type RelatorioMovimentacoes,
  type HistoricoMovimentacoes,
  TipoMovimentacao,
  MotivoMovimentacao
} from './estoque.types.js';

export class EstoqueMovimentacaoRepository {
  
  // ===== CRUD BÁSICO =====
  
  async create(movimentacao: CreateMovimentacaoRequest): Promise<EstoqueMovimentacao> {
    // Usar apenas os campos que existem na tabela EstoqueMovimentacoes
    const movimentacaoFinal = {
      produto_id: movimentacao.produto_id,
      quantidade: movimentacao.quantidade
    };
    
    console.log('Tentando inserir movimentação final:', movimentacaoFinal);
    
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .insert(movimentacaoFinal)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar movimentação de estoque:', error);
      throw new Error('Não foi possível criar a movimentação de estoque.');
    }

    console.log('Movimentação criada com sucesso:', data);
    return data as EstoqueMovimentacao;
  }

  async findAll(): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações de estoque:', error);
      throw new Error('Não foi possível buscar as movimentações de estoque.');
    }

    return data as EstoqueMovimentacao[];
  }

  async findById(id: string): Promise<EstoqueMovimentacao | null> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar movimentação por ID:', error);
      throw new Error('Não foi possível buscar a movimentação.');
    }

    return (data ?? null) as EstoqueMovimentacao | null;
  }

  async update(id: string, movimentacao: Partial<EstoqueMovimentacao>): Promise<EstoqueMovimentacao> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .update(movimentacao)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar movimentação:', error);
      throw new Error('Não foi possível atualizar a movimentação.');
    }

    return data as EstoqueMovimentacao;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('EstoqueMovimentacoes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar movimentação:', error);
      throw new Error('Não foi possível deletar a movimentação.');
    }
  }

  // ===== MÉTODOS ESPECÍFICOS =====

  async findByProdutoId(produtoId: string): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
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

  async findWithFilters(filtros: FiltroMovimentacao): Promise<ListaMovimentacoesResponse> {
    let query = supabase
      .from('EstoqueMovimentacoes')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Aplicar filtros
    if (filtros.produto_id) {
      query = query.eq('produto_id', filtros.produto_id);
    }
    if (filtros.tipo_movimentacao) {
      query = query.eq('tipo_movimentacao', filtros.tipo_movimentacao);
    }
    if (filtros.motivo) {
      query = query.eq('motivo', filtros.motivo);
    }
    if (filtros.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id);
    }
    if (filtros.documento_referencia) {
      query = query.ilike('documento_referencia', `%${filtros.documento_referencia}%`);
    }
    if (filtros.data_inicio) {
      query = query.gte('created_at', filtros.data_inicio);
    }
    if (filtros.data_fim) {
      query = query.lte('created_at', filtros.data_fim);
    }
    if (filtros.valor_minimo) {
      query = query.gte('valor_total', filtros.valor_minimo);
    }
    if (filtros.valor_maximo) {
      query = query.lte('valor_total', filtros.valor_maximo);
    }

    // Paginação
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações com filtros:', error);
      throw new Error('Não foi possível buscar as movimentações.');
    }

    return {
      movimentacoes: data as EstoqueMovimentacao[],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async findByTipo(tipo: TipoMovimentacao): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .eq('tipo_movimentacao', tipo)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações por tipo:', error);
      throw new Error('Não foi possível buscar as movimentações por tipo.');
    }

    return data as EstoqueMovimentacao[];
  }

  async findByMotivo(motivo: MotivoMovimentacao | string): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .eq('motivo', motivo)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações por motivo:', error);
      throw new Error('Não foi possível buscar as movimentações por motivo.');
    }

    return data as EstoqueMovimentacao[];
  }

  async findByPeriodo(dataInicio: string, dataFim: string): Promise<EstoqueMovimentacao[]> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar movimentações por período:', error);
      throw new Error('Não foi possível buscar as movimentações do período.');
    }

    return data as EstoqueMovimentacao[];
  }

  async getUltimaMovimentacao(produtoId: string): Promise<EstoqueMovimentacao | null> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
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

  // ===== RELATÓRIOS E ANALYTICS =====

  async getRelatorioMovimentacoes(dataInicio: string, dataFim: string): Promise<RelatorioMovimentacoes> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao gerar relatório de movimentações:', error);
      throw new Error('Não foi possível gerar o relatório de movimentações.');
    }

    const movimentacoes = data as EstoqueMovimentacao[];
    
    const totalEntradas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.ENTRADA)
      .reduce((sum, m) => sum + m.quantidade, 0);

    const totalSaidas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.SAIDA)
      .reduce((sum, m) => sum + Math.abs(m.quantidade), 0);

    const valorTotalEntradas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.ENTRADA)
      .reduce((sum, m) => sum + m.valor_total, 0);

    const valorTotalSaidas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.SAIDA)
      .reduce((sum, m) => sum + Math.abs(m.valor_total), 0);

    return {
      data_inicio: dataInicio,
      data_fim: dataFim,
      total_movimentacoes: movimentacoes.length,
      total_entradas: totalEntradas,
      total_saidas: totalSaidas,
      valor_total_entradas: valorTotalEntradas,
      valor_total_saidas: valorTotalSaidas,
      saldo_quantidade: totalEntradas - totalSaidas,
      saldo_valor: valorTotalEntradas - valorTotalSaidas,
      movimentacoes
    };
  }

  async getHistoricoProduto(produtoId: string): Promise<HistoricoMovimentacoes> {
    const movimentacoes = await this.findByProdutoId(produtoId);
    
    if (movimentacoes.length === 0) {
      return {
        produto_id: produtoId,
        descricao: '',
        movimentacoes: [],
        saldo_inicial: 0,
        saldo_final: 0,
        total_entradas: 0,
        total_saidas: 0
      };
    }

    const totalEntradas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.ENTRADA)
      .reduce((sum, m) => sum + m.quantidade, 0);

    const totalSaidas = movimentacoes
      .filter(m => m.tipo_movimentacao === TipoMovimentacao.SAIDA)
      .reduce((sum, m) => sum + Math.abs(m.quantidade), 0);

    const saldoFinal = movimentacoes[0]?.quantidade_atual || 0;
    const saldoInicial = saldoFinal - totalEntradas + totalSaidas;

    return {
      produto_id: produtoId,
      descricao: '', // TODO: buscar da tabela de produtos
      movimentacoes,
      saldo_inicial: saldoInicial,
      saldo_final: saldoFinal,
      total_entradas: totalEntradas,
      total_saidas: totalSaidas
    };
  }

  async getMovimentacoesPorTipo(dataInicio: string, dataFim: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('tipo_movimentacao, quantidade')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar movimentações por tipo:', error);
      throw new Error('Não foi possível buscar as movimentações por tipo.');
    }

    const resultado: Record<string, number> = {};
    
    data.forEach(item => {
      const tipo = item.tipo_movimentacao;
      if (!resultado[tipo]) {
        resultado[tipo] = 0;
      }
      resultado[tipo] += Math.abs(item.quantidade);
    });

    return resultado;
  }

  async getMovimentacoesPorMotivo(dataInicio: string, dataFim: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('motivo, quantidade')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar movimentações por motivo:', error);
      throw new Error('Não foi possível buscar as movimentações por motivo.');
    }

    const resultado: Record<string, number> = {};
    
    data.forEach(item => {
      const motivo = item.motivo;
      if (!resultado[motivo]) {
        resultado[motivo] = 0;
      }
      resultado[motivo] += Math.abs(item.quantidade);
    });

    return resultado;
  }

  async getValorMovimentadoPorPeriodo(dataInicio: string, dataFim: string): Promise<number> {
    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('valor_total')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao calcular valor movimentado:', error);
      throw new Error('Não foi possível calcular o valor movimentado.');
    }

    return data.reduce((total, item) => total + Math.abs(item.valor_total), 0);
  }

  // ===== MÉTODOS DE LIMPEZA E MANUTENÇÃO =====

  async limparMovimentacoesAntigas(diasParaManter: number = 365): Promise<number> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasParaManter);

    const { data, error } = await supabase
      .from('EstoqueMovimentacoes')
      .update({ deleted_at: new Date().toISOString() })
      .lt('created_at', dataLimite.toISOString())
      .is('deleted_at', null)
      .select('id');

    if (error) {
      console.error('Erro ao limpar movimentações antigas:', error);
      throw new Error('Não foi possível limpar as movimentações antigas.');
    }

    return data.length;
  }

  async contarMovimentacoesPorProduto(produtoId: string): Promise<number> {
    const { count, error } = await supabase
      .from('EstoqueMovimentacoes')
      .select('*', { count: 'exact', head: true })
      .eq('produto_id', produtoId)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao contar movimentações do produto:', error);
      throw new Error('Não foi possível contar as movimentações do produto.');
    }

    return count || 0;
  }
}