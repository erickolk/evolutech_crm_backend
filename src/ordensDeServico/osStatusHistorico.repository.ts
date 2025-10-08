import { supabase } from '../lib/supabaseClient.js';
import { StatusOS } from './os.types.js';
import { 
  type OSStatusHistorico,
  type CreateOSStatusHistoricoRequest,
  type OSStatusHistoricoResponse,
  type OSStatusHistoricoFilters,
  type StatusChangeStats,
  type OSTimeline
} from './osStatusHistorico.types.js';

export class OSStatusHistoricoRepository {
  /**
   * Cria um novo registro de histórico de status
   */
  async create(historico: CreateOSStatusHistoricoRequest): Promise<OSStatusHistorico> {
    const { data, error } = await supabase
      .from('OSStatusHistorico')
      .insert({
        ...historico,
        data_mudanca: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar histórico de status:', error);
      throw new Error('Não foi possível criar o histórico de status.');
    }

    return data;
  }

  /**
   * Busca histórico por ID da OS
   */
  async findByOSId(os_id: string): Promise<OSStatusHistoricoResponse[]> {
    const { data, error } = await supabase
      .from('OSStatusHistorico')
      .select(`
        *,
        usuarios:usuario_id (
          nome
        )
      `)
      .eq('os_id', os_id)
      .order('data_mudanca', { ascending: true });

    if (error) {
      console.error('Erro ao buscar histórico por OS:', error);
      throw new Error('Não foi possível buscar o histórico da OS.');
    }

    return data?.map(item => ({
      ...item,
      usuario_nome: item.usuarios?.nome
    })) || [];
  }

  /**
   * Busca histórico com filtros
   */
  async findWithFilters(filters: OSStatusHistoricoFilters): Promise<{
    historicos: OSStatusHistoricoResponse[];
    total: number;
  }> {
    let query = supabase
      .from('OSStatusHistorico')
      .select(`
        *,
        usuarios:usuario_id (
          nome
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.os_id) {
      query = query.eq('os_id', filters.os_id);
    }
    if (filters.status_anterior) {
      query = query.eq('status_anterior', filters.status_anterior);
    }
    if (filters.status_novo) {
      query = query.eq('status_novo', filters.status_novo);
    }
    if (filters.usuario_id) {
      query = query.eq('usuario_id', filters.usuario_id);
    }
    if (filters.data_inicio) {
      query = query.gte('data_mudanca', filters.data_inicio);
    }
    if (filters.data_fim) {
      query = query.lte('data_mudanca', filters.data_fim);
    }

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('data_mudanca', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar histórico com filtros:', error);
      throw new Error('Não foi possível buscar o histórico.');
    }

    const historicos = data?.map(item => ({
      ...item,
      usuario_nome: item.usuarios?.nome
    })) || [];

    return {
      historicos,
      total: count || 0
    };
  }

  /**
   * Busca último status de uma OS
   */
  async findLastStatus(os_id: string): Promise<OSStatusHistorico | null> {
    const { data, error } = await supabase
      .from('OSStatusHistorico')
      .select('*')
      .eq('os_id', os_id)
      .order('data_mudanca', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar último status:', error);
      throw new Error('Não foi possível buscar o último status.');
    }

    return data || null;
  }

  /**
   * Gera timeline completa de uma OS
   */
  async getOSTimeline(os_id: string): Promise<OSTimeline | null> {
    const historicos = await this.findByOSId(os_id);
    
    if (historicos.length === 0) {
      return null;
    }

    const primeiro = historicos[0];
    const ultimo = historicos[historicos.length - 1];
    
    const data_inicio = new Date(primeiro.data_mudanca);
    const data_ultima_mudanca = new Date(ultimo.data_mudanca);
    const tempo_total_processo = (data_ultima_mudanca.getTime() - data_inicio.getTime()) / (1000 * 60 * 60); // horas

    return {
      os_id,
      historicos,
      tempo_total_processo: Math.round(tempo_total_processo * 100) / 100,
      status_atual: ultimo.status_novo,
      data_inicio: primeiro.data_mudanca,
      data_ultima_mudanca: ultimo.data_mudanca
    };
  }

  /**
   * Estatísticas de mudanças de status
   */
  async getStatusChangeStats(periodo_dias: number = 30): Promise<StatusChangeStats> {
    const data_inicio = new Date();
    data_inicio.setDate(data_inicio.getDate() - periodo_dias);

    // Total de mudanças no período
    const { count: total_mudancas } = await supabase
      .from('OSStatusHistorico')
      .select('*', { count: 'exact', head: true })
      .gte('data_mudanca', data_inicio.toISOString());

    // Mudanças por status
    const { data: statusData } = await supabase
      .from('OSStatusHistorico')
      .select('status_novo')
      .gte('data_mudanca', data_inicio.toISOString());

    // Mudanças por usuário
    const { data: usuarioData } = await supabase
      .from('OSStatusHistorico')
      .select(`
        usuario_id,
        usuarios:usuario_id (
          nome
        )
      `)
      .gte('data_mudanca', data_inicio.toISOString());

    // Tempo médio por status (simplificado)
    const { data: tempoData } = await supabase
      .from('OSStatusHistorico')
      .select('os_id, status_novo, data_mudanca')
      .gte('data_mudanca', data_inicio.toISOString())
      .order('os_id, data_mudanca');

    // Mudanças recentes (últimas 10)
    const { data: recentesData } = await supabase
      .from('OSStatusHistorico')
      .select(`
        *,
        usuarios:usuario_id (
          nome
        )
      `)
      .order('data_mudanca', { ascending: false })
      .limit(10);

    // Processar dados
    const mudancas_por_status = {} as Record<StatusOS, number>;
    const mudancas_por_usuario = {} as Record<string, number>;
    const tempo_medio_por_status = {} as Record<StatusOS, number>;

    // Inicializar contadores
    Object.values(StatusOS).forEach(status => {
      mudancas_por_status[status] = 0;
      tempo_medio_por_status[status] = 0;
    });

    // Contar mudanças por status
    statusData?.forEach(item => {
      mudancas_por_status[item.status_novo as StatusOS]++;
    });

    // Contar mudanças por usuário
    usuarioData?.forEach(item => {
      const nome = item.usuarios?.nome || 'Usuário não identificado';
      mudancas_por_usuario[nome] = (mudancas_por_usuario[nome] || 0) + 1;
    });

    // Calcular tempo médio por status (simplificado - tempo entre mudanças)
    if (tempoData) {
      const temposPorStatus = {} as Record<StatusOS, number[]>;
      Object.values(StatusOS).forEach(status => {
        temposPorStatus[status] = [];
      });

      let osAnterior = '';
      let dataAnterior = '';
      
      tempoData.forEach(item => {
        if (item.os_id === osAnterior && dataAnterior) {
          const tempo = (new Date(item.data_mudanca).getTime() - new Date(dataAnterior).getTime()) / (1000 * 60 * 60); // horas
          temposPorStatus[item.status_novo as StatusOS].push(tempo);
        }
        osAnterior = item.os_id;
        dataAnterior = item.data_mudanca;
      });

      // Calcular médias
      Object.entries(temposPorStatus).forEach(([status, tempos]) => {
        if (tempos.length > 0) {
          tempo_medio_por_status[status as StatusOS] = 
            Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 100) / 100;
        }
      });
    }

    const mudancas_recentes = recentesData?.map(item => ({
      ...item,
      usuario_nome: item.usuarios?.nome
    })) || [];

    return {
      total_mudancas: total_mudancas || 0,
      mudancas_por_status,
      mudancas_por_usuario,
      tempo_medio_por_status,
      mudancas_recentes
    };
  }

  /**
   * Busca OS que mudaram para status específico em período
   */
  async findByStatusChange(
    status_novo: StatusOS, 
    data_inicio?: string, 
    data_fim?: string
  ): Promise<OSStatusHistoricoResponse[]> {
    let query = supabase
      .from('OSStatusHistorico')
      .select(`
        *,
        usuarios:usuario_id (
          nome
        )
      `)
      .eq('status_novo', status_novo);

    if (data_inicio) {
      query = query.gte('data_mudanca', data_inicio);
    }
    if (data_fim) {
      query = query.lte('data_mudanca', data_fim);
    }

    query = query.order('data_mudanca', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar por mudança de status:', error);
      throw new Error('Não foi possível buscar as mudanças de status.');
    }

    return data?.map(item => ({
      ...item,
      usuario_nome: item.usuarios?.nome
    })) || [];
  }

  /**
   * Busca histórico de um usuário específico
   */
  async findByUsuario(usuario_id: string, limit: number = 50): Promise<OSStatusHistoricoResponse[]> {
    const { data, error } = await supabase
      .from('OSStatusHistorico')
      .select(`
        *,
        usuarios:usuario_id (
          nome
        )
      `)
      .eq('usuario_id', usuario_id)
      .order('data_mudanca', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico por usuário:', error);
      throw new Error('Não foi possível buscar o histórico do usuário.');
    }

    return data?.map(item => ({
      ...item,
      usuario_nome: item.usuarios?.nome
    })) || [];
  }

  /**
   * Remove histórico antigo (limpeza de dados)
   */
  async cleanOldHistory(dias_manter: number = 365): Promise<number> {
    const data_limite = new Date();
    data_limite.setDate(data_limite.getDate() - dias_manter);

    const { count, error } = await supabase
      .from('OSStatusHistorico')
      .delete({ count: 'exact' })
      .lt('data_mudanca', data_limite.toISOString());

    if (error) {
      console.error('Erro ao limpar histórico antigo:', error);
      throw new Error('Não foi possível limpar o histórico antigo.');
    }

    return count || 0;
  }
}