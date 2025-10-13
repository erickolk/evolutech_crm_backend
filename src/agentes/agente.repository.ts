import { supabase } from '../lib/supabaseClient.js';
import type { 
  Agente, 
  CreateAgenteRequest, 
  UpdateAgenteRequest, 
  AgenteFilters,
  AgenteResponse,
  AgenteStats,
  UpdateStatusRequest,
  AgentePerformance
} from './agente.types.js';

export class AgenteRepository {
  private readonly tableName = 'agentes';

  async findAll(filters: AgenteFilters = {}): Promise<{ data: AgenteResponse[]; total: number }> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_abertas:conversas!agente_id(count).eq(status,aberta),
        conversas_pendentes:conversas!agente_id(count).eq(status,pendente)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }

    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.departamento) {
      query = query.eq('departamento', filters.departamento);
    }

    if (filters.cargo) {
      query = query.eq('cargo', filters.cargo);
    }

    if (filters.especialidade) {
      query = query.contains('especialidades', [filters.especialidade]);
    }

    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    if (filters.disponivel_para_conversa) {
      query = query
        .eq('status', 'online')
        .eq('ativo', true)
        .lt('conversas_ativas', supabase.raw('max_conversas_simultaneas'));
    }

    // Ordenação
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar agentes: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0
    };
  }

  async findById(id: string): Promise<AgenteResponse | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_abertas:conversas!agente_id(count).eq(status,aberta),
        conversas_pendentes:conversas!agente_id(count).eq(status,pendente)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar agente: ${error.message}`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<Agente | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar agente por email: ${error.message}`);
    }

    return data;
  }

  async findDisponiveis(especialidade?: string, departamento?: string): Promise<AgenteResponse[]> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_abertas:conversas!agente_id(count).eq(status,aberta),
        conversas_pendentes:conversas!agente_id(count).eq(status,pendente)
      `)
      .eq('status', 'online')
      .eq('ativo', true)
      .lt('conversas_ativas', supabase.raw('max_conversas_simultaneas'));

    if (especialidade) {
      query = query.contains('especialidades', [especialidade]);
    }

    if (departamento) {
      query = query.eq('departamento', departamento);
    }

    // Ordenar por menor número de conversas ativas
    query = query.order('conversas_ativas', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar agentes disponíveis: ${error.message}`);
    }

    return data || [];
  }

  async create(data: CreateAgenteRequest): Promise<Agente> {
    const agenteData = {
      ...data,
      status: 'offline' as const,
      conversas_ativas: 0,
      max_conversas_simultaneas: data.max_conversas_simultaneas || 5,
      ativo: true,
      estatisticas: {
        total_conversas: 0,
        conversas_resolvidas: 0,
        tempo_medio_resposta: 0,
        avaliacao_media: 0,
        total_avaliacoes: 0
      }
    };

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(agenteData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar agente: ${error.message}`);
    }

    return result;
  }

  async update(id: string, data: UpdateAgenteRequest): Promise<Agente> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar agente: ${error.message}`);
    }

    return result;
  }

  async updateStatus(id: string, statusData: UpdateStatusRequest): Promise<Agente> {
    const updateData: any = {
      status: statusData.status,
      ultima_atividade: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Se está ficando offline, zerar conversas ativas
    if (statusData.status === 'offline') {
      updateData.conversas_ativas = 0;
    }

    // Atualizar mensagem de ausência se fornecida
    if (statusData.mensagem_ausencia !== undefined) {
      updateData.configuracoes = supabase.raw(`
        COALESCE(configuracoes, '{}'::jsonb) || 
        '{"mensagem_ausencia": "${statusData.mensagem_ausencia}"}'::jsonb
      `);
    }

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status do agente: ${error.message}`);
    }

    return result;
  }

  async incrementarConversasAtivas(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        conversas_ativas: supabase.raw('conversas_ativas + 1'),
        ultima_atividade: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao incrementar conversas ativas: ${error.message}`);
    }
  }

  async decrementarConversasAtivas(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        conversas_ativas: supabase.raw('GREATEST(conversas_ativas - 1, 0)'),
        ultima_atividade: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao decrementar conversas ativas: ${error.message}`);
    }
  }

  async updateUltimaAtividade(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        ultima_atividade: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar última atividade: ${error.message}`);
    }
  }

  async updateEstatisticas(id: string, estatisticas: Partial<Agente['estatisticas']>): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        estatisticas: supabase.raw(`
          COALESCE(estatisticas, '{}'::jsonb) || 
          '${JSON.stringify(estatisticas)}'::jsonb
        `),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar estatísticas do agente: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    // Soft delete - marcar como inativo
    const { error } = await supabase
      .from(this.tableName)
      .update({
        ativo: false,
        status: 'offline',
        conversas_ativas: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir agente: ${error.message}`);
    }
  }

  async getStats(): Promise<AgenteStats> {
    // Buscar estatísticas gerais
    const { data: statsData, error: statsError } = await supabase
      .from(this.tableName)
      .select('status, conversas_ativas, estatisticas')
      .eq('ativo', true);

    if (statsError) {
      throw new Error(`Erro ao buscar estatísticas: ${statsError.message}`);
    }

    const stats = {
      total_agentes: statsData.length,
      agentes_online: 0,
      agentes_offline: 0,
      agentes_ocupados: 0,
      agentes_ausentes: 0,
      agentes_disponiveis: 0,
      conversas_ativas_total: 0,
      tempo_medio_resposta_geral: 0,
      avaliacao_media_geral: 0
    };

    let totalTempoResposta = 0;
    let totalAvaliacoes = 0;
    let somaAvaliacoes = 0;
    let countTempoResposta = 0;

    statsData.forEach(agente => {
      // Contar por status
      switch (agente.status) {
        case 'online':
          stats.agentes_online++;
          if (agente.conversas_ativas < 5) { // Assumindo max 5 conversas
            stats.agentes_disponiveis++;
          }
          break;
        case 'offline':
          stats.agentes_offline++;
          break;
        case 'ocupado':
          stats.agentes_ocupados++;
          break;
        case 'ausente':
          stats.agentes_ausentes++;
          break;
      }

      // Somar conversas ativas
      stats.conversas_ativas_total += agente.conversas_ativas || 0;

      // Calcular médias
      if (agente.estatisticas) {
        if (agente.estatisticas.tempo_medio_resposta) {
          totalTempoResposta += agente.estatisticas.tempo_medio_resposta;
          countTempoResposta++;
        }
        if (agente.estatisticas.avaliacao_media && agente.estatisticas.total_avaliacoes) {
          somaAvaliacoes += agente.estatisticas.avaliacao_media * agente.estatisticas.total_avaliacoes;
          totalAvaliacoes += agente.estatisticas.total_avaliacoes;
        }
      }
    });

    // Calcular médias finais
    stats.tempo_medio_resposta_geral = countTempoResposta > 0 ? 
      Math.round(totalTempoResposta / countTempoResposta) : 0;
    
    stats.avaliacao_media_geral = totalAvaliacoes > 0 ? 
      Math.round((somaAvaliacoes / totalAvaliacoes) * 100) / 100 : 0;

    return stats;
  }

  async getPerformance(agenteId: string, dataInicio: string, dataFim: string): Promise<AgentePerformance | null> {
    // Buscar dados do agente
    const agente = await this.findById(agenteId);
    if (!agente) {
      return null;
    }

    // Buscar conversas no período
    const { data: conversas, error: conversasError } = await supabase
      .from('conversas')
      .select('*')
      .eq('agente_id', agenteId)
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim);

    if (conversasError) {
      throw new Error(`Erro ao buscar conversas para performance: ${conversasError.message}`);
    }

    // Calcular métricas
    const conversasAtendidas = conversas?.length || 0;
    const conversasResolvidas = conversas?.filter(c => c.status === 'fechada').length || 0;
    const taxaResolucao = conversasAtendidas > 0 ? 
      Math.round((conversasResolvidas / conversasAtendidas) * 100) : 0;

    return {
      agente_id: agenteId,
      agente_nome: agente.nome,
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      metricas: {
        conversas_atendidas: conversasAtendidas,
        conversas_resolvidas: conversasResolvidas,
        taxa_resolucao: taxaResolucao,
        tempo_medio_resposta: agente.estatisticas?.tempo_medio_resposta || 0,
        tempo_medio_resolucao: 0, // Calcular baseado nas conversas
        avaliacao_media: agente.estatisticas?.avaliacao_media || 0,
        total_avaliacoes: agente.estatisticas?.total_avaliacoes || 0,
        mensagens_enviadas: 0, // Calcular baseado nas mensagens
        horas_online: 0 // Calcular baseado nos logs de atividade
      }
    };
  }
}