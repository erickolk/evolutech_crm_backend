import { supabase } from '../lib/supabaseClient.js';
import { 
  type Pagamento,
  type PagamentoParcela,
  type CreatePagamentoRequest,
  type UpdatePagamentoRequest,
  type RegistrarPagamentoParcelaRequest,
  type EstornarPagamentoRequest,
  type PagamentoResponse,
  type PagamentoParcelaResponse,
  type PagamentoFilters,
  type PagamentoStats,
  type RelatorioFinanceiro,
  type CobrancaAutomatica,
  type HistoricoPagamento,
  StatusPagamento,
  FormaPagamento,
  TipoPagamento
} from './pagamento.types.js';

export class PagamentoRepository {
  /**
   * Cria um novo pagamento
   */
  async create(pagamento: CreatePagamentoRequest): Promise<Pagamento> {
    const { data, error } = await supabase
      .from('Pagamentos')
      .insert({
        ...pagamento,
        valor_pago: 0,
        valor_pendente: pagamento.valor_total,
        status: StatusPagamento.PENDENTE,
        numero_parcelas: pagamento.numero_parcelas || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new Error('Não foi possível criar o pagamento.');
    }

    return data;
  }

  /**
   * Cria parcelas para um pagamento
   */
  async createParcelas(pagamento_id: string, parcelas: Omit<PagamentoParcela, 'id' | 'pagamento_id' | 'created_at' | 'updated_at'>[]): Promise<PagamentoParcela[]> {
    const parcelasComId = parcelas.map(parcela => ({
      ...parcela,
      pagamento_id,
      status: StatusPagamento.PENDENTE
    }));

    const { data, error } = await supabase
      .from('PagamentoParcelas')
      .insert(parcelasComId)
      .select();

    if (error) {
      console.error('Erro ao criar parcelas:', error);
      throw new Error('Não foi possível criar as parcelas.');
    }

    return data || [];
  }

  /**
   * Busca pagamento por ID
   */
  async findById(id: string): Promise<PagamentoResponse | null> {
    const { data, error } = await supabase
      .from('Pagamentos')
      .select(`
        *,
        parcelas:PagamentoParcelas(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar pagamento por ID:', error);
      throw new Error('Não foi possível buscar o pagamento.');
    }

    if (!data) return null;

    // Calcular dias de atraso para parcelas
    const parcelas = data.parcelas?.map((parcela: any) => {
      let dias_atraso = 0;
      if (parcela.status === StatusPagamento.VENCIDO || 
          (parcela.status === StatusPagamento.PENDENTE && new Date(parcela.data_vencimento) < new Date())) {
        const hoje = new Date();
        const vencimento = new Date(parcela.data_vencimento);
        dias_atraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...parcela, dias_atraso };
    }) || [];

    return { ...data, parcelas };
  }

  /**
   * Busca pagamento por OS ID
   */
  async findByOSId(os_id: string): Promise<PagamentoResponse | null> {
    const { data, error } = await supabase
      .from('Pagamentos')
      .select(`
        *,
        parcelas:PagamentoParcelas(*)
      `)
      .eq('os_id', os_id)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar pagamento por OS:', error);
      throw new Error('Não foi possível buscar o pagamento.');
    }

    if (!data) return null;

    const parcelas = data.parcelas?.map((parcela: any) => {
      let dias_atraso = 0;
      if (parcela.status === StatusPagamento.VENCIDO || 
          (parcela.status === StatusPagamento.PENDENTE && new Date(parcela.data_vencimento) < new Date())) {
        const hoje = new Date();
        const vencimento = new Date(parcela.data_vencimento);
        dias_atraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...parcela, dias_atraso };
    }) || [];

    return { ...data, parcelas };
  }

  /**
   * Busca pagamentos com filtros
   */
  async findWithFilters(filters: PagamentoFilters): Promise<{
    pagamentos: PagamentoResponse[];
    total: number;
  }> {
    let query = supabase
      .from('Pagamentos')
      .select(`
        *,
        parcelas:PagamentoParcelas(*)
      `, { count: 'exact' })
      .is('deleted_at', null);

    // Aplicar filtros
    if (filters.os_id) {
      query = query.eq('os_id', filters.os_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.forma_pagamento) {
      query = query.eq('forma_pagamento', filters.forma_pagamento);
    }
    if (filters.data_vencimento_inicio) {
      query = query.gte('data_vencimento', filters.data_vencimento_inicio);
    }
    if (filters.data_vencimento_fim) {
      query = query.lte('data_vencimento', filters.data_vencimento_fim);
    }
    if (filters.data_pagamento_inicio) {
      query = query.gte('data_pagamento', filters.data_pagamento_inicio);
    }
    if (filters.data_pagamento_fim) {
      query = query.lte('data_pagamento', filters.data_pagamento_fim);
    }
    if (filters.valor_min) {
      query = query.gte('valor_total', filters.valor_min);
    }
    if (filters.valor_max) {
      query = query.lte('valor_total', filters.valor_max);
    }

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar pagamentos com filtros:', error);
      throw new Error('Não foi possível buscar os pagamentos.');
    }

    const pagamentos = data?.map(item => {
      const parcelas = item.parcelas?.map((parcela: any) => {
        let dias_atraso = 0;
        if (parcela.status === StatusPagamento.VENCIDO || 
            (parcela.status === StatusPagamento.PENDENTE && new Date(parcela.data_vencimento) < new Date())) {
          const hoje = new Date();
          const vencimento = new Date(parcela.data_vencimento);
          dias_atraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        }
        return { ...parcela, dias_atraso };
      }) || [];
      
      return { ...item, parcelas };
    }) || [];

    return {
      pagamentos,
      total: count || 0
    };
  }

  /**
   * Atualiza um pagamento
   */
  async update(id: string, updates: UpdatePagamentoRequest): Promise<Pagamento> {
    const { data, error } = await supabase
      .from('Pagamentos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw new Error('Não foi possível atualizar o pagamento.');
    }

    return data;
  }

  /**
   * Registra pagamento de uma parcela
   */
  async registrarPagamentoParcela(
    parcela_id: string, 
    pagamento: RegistrarPagamentoParcelaRequest
  ): Promise<PagamentoParcela> {
    const { data, error } = await supabase
      .from('PagamentoParcelas')
      .update({
        data_pagamento: pagamento.data_pagamento,
        forma_pagamento_parcela: pagamento.forma_pagamento_parcela,
        observacoes: pagamento.observacoes,
        status: StatusPagamento.PAGO,
        updated_at: new Date().toISOString()
      })
      .eq('id', parcela_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar pagamento da parcela:', error);
      throw new Error('Não foi possível registrar o pagamento da parcela.');
    }

    return data;
  }

  /**
   * Busca parcelas vencidas
   */
  async findParcelasVencidas(): Promise<PagamentoParcelaResponse[]> {
    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('PagamentoParcelas')
      .select(`
        *,
        pagamento:pagamento_id (
          os_id
        )
      `)
      .eq('status', StatusPagamento.PENDENTE)
      .lt('data_vencimento', hoje);

    if (error) {
      console.error('Erro ao buscar parcelas vencidas:', error);
      throw new Error('Não foi possível buscar as parcelas vencidas.');
    }

    return data?.map(parcela => {
      const hoje = new Date();
      const vencimento = new Date(parcela.data_vencimento);
      const dias_atraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
      
      return { ...parcela, dias_atraso };
    }) || [];
  }

  /**
   * Busca parcelas que vencem hoje
   */
  async findParcelasVencemHoje(): Promise<PagamentoParcelaResponse[]> {
    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('PagamentoParcelas')
      .select(`
        *,
        pagamento:pagamento_id (
          os_id
        )
      `)
      .eq('status', StatusPagamento.PENDENTE)
      .eq('data_vencimento', hoje);

    if (error) {
      console.error('Erro ao buscar parcelas que vencem hoje:', error);
      throw new Error('Não foi possível buscar as parcelas que vencem hoje.');
    }

    return data?.map(parcela => ({ ...parcela, dias_atraso: 0 })) || [];
  }

  /**
   * Busca parcelas que vencem nos próximos N dias
   */
  async findParcelasVencemProximosDias(dias: number): Promise<PagamentoParcelaResponse[]> {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    const { data, error } = await supabase
      .from('PagamentoParcelas')
      .select(`
        *,
        pagamento:pagamento_id (
          os_id
        )
      `)
      .eq('status', StatusPagamento.PENDENTE)
      .gte('data_vencimento', hoje.toISOString().split('T')[0])
      .lte('data_vencimento', dataLimite.toISOString().split('T')[0]);

    if (error) {
      console.error('Erro ao buscar parcelas dos próximos dias:', error);
      throw new Error('Não foi possível buscar as parcelas dos próximos dias.');
    }

    return data?.map(parcela => ({ ...parcela, dias_atraso: 0 })) || [];
  }

  /**
   * Atualiza status de parcelas vencidas
   */
  async updateParcelasVencidas(): Promise<number> {
    const hoje = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('PagamentoParcelas')
      .update({ 
        status: StatusPagamento.VENCIDO,
        updated_at: new Date().toISOString()
      })
      .eq('status', StatusPagamento.PENDENTE)
      .lt('data_vencimento', hoje);

    if (error) {
      console.error('Erro ao atualizar parcelas vencidas:', error);
      throw new Error('Não foi possível atualizar as parcelas vencidas.');
    }

    return count || 0;
  }

  /**
   * Estatísticas de pagamentos
   */
  async getStats(): Promise<PagamentoStats> {
    // Total recebido
    const { data: recebidoData } = await supabase
      .from('Pagamentos')
      .select('valor_pago')
      .is('deleted_at', null);

    // Total pendente
    const { data: pendenteData } = await supabase
      .from('Pagamentos')
      .select('valor_pendente')
      .is('deleted_at', null);

    // Parcelas vencidas
    const parcelasVencidas = await this.findParcelasVencidas();
    const parcelasHoje = await this.findParcelasVencemHoje();
    const parcelas7Dias = await this.findParcelasVencemProximosDias(7);

    // Total vencido
    const total_vencido = parcelasVencidas.reduce((sum, parcela) => sum + parcela.valor_parcela, 0);

    // Receita mensal (últimos 12 meses)
    const receita_mensal: Record<string, number> = {};
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      receita_mensal[mesAno] = 0;
    }

    const { data: receitaData } = await supabase
      .from('PagamentoParcelas')
      .select('valor_parcela, data_pagamento')
      .eq('status', StatusPagamento.PAGO)
      .gte('data_pagamento', new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1).toISOString());

    receitaData?.forEach(parcela => {
      if (parcela.data_pagamento) {
        const data = new Date(parcela.data_pagamento);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (receita_mensal[mesAno] !== undefined) {
          receita_mensal[mesAno] += parcela.valor_parcela;
        }
      }
    });

    // Formas de pagamento mais usadas
    const { data: formasData } = await supabase
      .from('Pagamentos')
      .select('forma_pagamento')
      .is('deleted_at', null);

    const formas_pagamento_mais_usadas: Record<FormaPagamento, number> = {} as Record<FormaPagamento, number>;
    Object.values(FormaPagamento).forEach(forma => {
      formas_pagamento_mais_usadas[forma] = 0;
    });

    formasData?.forEach(item => {
      formas_pagamento_mais_usadas[item.forma_pagamento as FormaPagamento]++;
    });

    return {
      total_recebido: recebidoData?.reduce((sum, p) => sum + (p.valor_pago || 0), 0) || 0,
      total_pendente: pendenteData?.reduce((sum, p) => sum + (p.valor_pendente || 0), 0) || 0,
      total_vencido,
      parcelas_vencidas: parcelasVencidas.length,
      parcelas_hoje: parcelasHoje.length,
      parcelas_proximos_7_dias: parcelas7Dias.length,
      receita_mensal,
      formas_pagamento_mais_usadas
    };
  }

  /**
   * Gera relatório financeiro
   */
  async getRelatorioFinanceiro(data_inicio: string, data_fim: string): Promise<RelatorioFinanceiro> {
    // Pagamentos no período
    const { data: pagamentosData } = await supabase
      .from('Pagamentos')
      .select('*')
      .gte('created_at', data_inicio)
      .lte('created_at', data_fim)
      .is('deleted_at', null);

    // Parcelas pagas no período
    const { data: parcelasPagasData } = await supabase
      .from('PagamentoParcelas')
      .select('*, pagamento:pagamento_id(forma_pagamento)')
      .eq('status', StatusPagamento.PAGO)
      .gte('data_pagamento', data_inicio)
      .lte('data_pagamento', data_fim);

    const total_faturado = pagamentosData?.reduce((sum, p) => sum + p.valor_total, 0) || 0;
    const total_recebido = parcelasPagasData?.reduce((sum, p) => sum + p.valor_parcela, 0) || 0;
    const total_pendente = pagamentosData?.reduce((sum, p) => sum + p.valor_pendente, 0) || 0;

    // Parcelas vencidas no período
    const parcelasVencidas = await this.findParcelasVencidas();
    const total_vencido = parcelasVencidas
      .filter(p => p.data_vencimento >= data_inicio && p.data_vencimento <= data_fim)
      .reduce((sum, p) => sum + p.valor_parcela, 0);

    // Pagamentos por forma
    const pagamentos_por_forma: Record<FormaPagamento, { quantidade: number; valor_total: number }> = {} as any;
    Object.values(FormaPagamento).forEach(forma => {
      pagamentos_por_forma[forma] = { quantidade: 0, valor_total: 0 };
    });

    parcelasPagasData?.forEach(parcela => {
      const forma = parcela.pagamento?.forma_pagamento as FormaPagamento;
      if (forma) {
        pagamentos_por_forma[forma].quantidade++;
        pagamentos_por_forma[forma].valor_total += parcela.valor_parcela;
      }
    });

    // Evolução mensal
    const evolucao_mensal: Array<{
      mes: string;
      faturado: number;
      recebido: number;
      pendente: number;
    }> = [];

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    
    for (let d = new Date(inicio); d <= fim; d.setMonth(d.getMonth() + 1)) {
      const mesAno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const primeiroDia = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

      const faturadoMes = pagamentosData?.filter(p => 
        p.created_at >= primeiroDia && p.created_at <= ultimoDia
      ).reduce((sum, p) => sum + p.valor_total, 0) || 0;

      const recebidoMes = parcelasPagasData?.filter(p => 
        p.data_pagamento && p.data_pagamento >= primeiroDia && p.data_pagamento <= ultimoDia
      ).reduce((sum, p) => sum + p.valor_parcela, 0) || 0;

      const pendenteMes = pagamentosData?.filter(p => 
        p.created_at >= primeiroDia && p.created_at <= ultimoDia
      ).reduce((sum, p) => sum + p.valor_pendente, 0) || 0;

      evolucao_mensal.push({
        mes: mesAno,
        faturado: faturadoMes,
        recebido: recebidoMes,
        pendente: pendenteMes
      });
    }

    return {
      periodo_inicio: data_inicio,
      periodo_fim: data_fim,
      total_faturado,
      total_recebido,
      total_pendente,
      total_vencido,
      pagamentos_por_forma,
      evolucao_mensal
    };
  }

  /**
   * Soft delete de um pagamento
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Pagamentos')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar pagamento:', error);
      throw new Error('Não foi possível deletar o pagamento.');
    }
  }

  /**
   * Cria histórico de pagamento
   */
  async createHistorico(historico: Omit<HistoricoPagamento, 'id' | 'created_at'>): Promise<HistoricoPagamento> {
    const { data, error } = await supabase
      .from('HistoricoPagamentos')
      .insert({
        ...historico,
        data_acao: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar histórico de pagamento:', error);
      throw new Error('Não foi possível criar o histórico de pagamento.');
    }

    return data;
  }
}