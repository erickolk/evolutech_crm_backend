import { supabase } from '../lib/supabaseClient.js';
import type { 
  Conversa, 
  CreateConversaRequest, 
  UpdateConversaRequest, 
  ConversaFilters,
  ConversaResponse 
} from './conversa.types.js';

export class ConversaRepository {
  private readonly tableName = 'conversas';

  async findAll(filters: ConversaFilters = {}): Promise<{ data: ConversaResponse[]; total: number }> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        cliente:Clientes!cliente_id (
          id,
          nome,
          whatsapp_id,
          email
        ),
        agente:agentes!agente_id (
          id,
          nome,
          email
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters.agente_id) {
      query = query.eq('agente_id', filters.agente_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.canal) {
      query = query.eq('canal', filters.canal);
    }

    if (filters.prioridade) {
      query = query.eq('prioridade', filters.prioridade);
    }

    if (filters.data_inicio) {
      query = query.gte('created_at', filters.data_inicio.toISOString());
    }

    if (filters.data_fim) {
      query = query.lte('created_at', filters.data_fim.toISOString());
    }

    if (filters.apenas_sem_agente) {
      query = query.is('agente_id', null);
    }

    // Ordenação
    const orderBy = filters.orderBy || 'ultima_atividade';
    const orderDirection = filters.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar conversas: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0
    };
  }

  async findById(id: string): Promise<ConversaResponse | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        cliente:Clientes!cliente_id (
          id,
          nome,
          whatsapp_id,
          email
        ),
        agente:agentes!agente_id (
          id,
          nome,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar conversa: ${error.message}`);
    }

    return data;
  }

  async findByClienteId(clienteId: string): Promise<ConversaResponse[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        cliente:Clientes!cliente_id (
          id,
          nome,
          whatsapp_id,
          email
        ),
        agente:Usuarios!agente_id (
          id,
          nome,
          email
        )
      `)
      .eq('cliente_id', clienteId)
      .order('ultima_atividade', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conversas do cliente: ${error.message}`);
    }

    return data || [];
  }

  async findByAgenteId(agenteId: string): Promise<ConversaResponse[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        cliente:Clientes!cliente_id (
          id,
          nome,
          whatsapp_id,
          email
        ),
        agente:Usuarios!agente_id (
          id,
          nome,
          email
        )
      `)
      .eq('agente_id', agenteId)
      .order('ultima_atividade', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conversas do agente: ${error.message}`);
    }

    return data || [];
  }

  async create(conversa: CreateConversaRequest): Promise<Conversa> {
    const novaConversa = {
      ...conversa,
      status: 'aberta',
      prioridade: conversa.prioridade || 'media',
      ultima_atividade: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(novaConversa)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conversa: ${error.message}`);
    }

    return data;
  }

  async update(id: string, updates: UpdateConversaRequest): Promise<Conversa> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar conversa: ${error.message}`);
    }

    return data;
  }

  async updateUltimaAtividade(id: string, ultimaMensagem?: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        ultima_atividade: new Date().toISOString(),
        ultima_mensagem: ultimaMensagem,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar última atividade: ${error.message}`);
    }
  }

  async atribuirAgente(id: string, agenteId: string): Promise<Conversa> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        agente_id: agenteId,
        status: 'em_andamento',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atribuir agente: ${error.message}`);
    }

    return data;
  }

  async fechar(id: string, fechadoPor: string, observacoes?: string): Promise<Conversa> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        status: 'fechada',
        fechada_em: new Date().toISOString(),
        fechada_por: fechadoPor,
        observacoes: observacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao fechar conversa: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir conversa: ${error.message}`);
    }
  }

  async getStats(): Promise<any> {
    // Buscar estatísticas básicas
    const { data: stats, error } = await supabase
      .from(this.tableName)
      .select('status, canal, prioridade, satisfacao_cliente, tempo_resposta_medio');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    // Processar estatísticas
    const total_conversas = stats?.length || 0;
    const conversas_abertas = stats?.filter(c => c.status === 'aberta').length || 0;
    const conversas_em_andamento = stats?.filter(c => c.status === 'em_andamento').length || 0;
    const conversas_aguardando = stats?.filter(c => c.status === 'aguardando_cliente' || c.status === 'aguardando_agente').length || 0;

    // Conversas fechadas hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const { count: conversas_fechadas_hoje } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'fechada')
      .gte('fechada_em', hoje.toISOString());

    // Calcular médias
    const tempos_resposta = stats?.filter(c => c.tempo_resposta_medio).map(c => c.tempo_resposta_medio) || [];
    const tempo_resposta_medio = tempos_resposta.length > 0 
      ? tempos_resposta.reduce((a, b) => a + b, 0) / tempos_resposta.length 
      : 0;

    const satisfacoes = stats?.filter(c => c.satisfacao_cliente).map(c => c.satisfacao_cliente) || [];
    const satisfacao_media = satisfacoes.length > 0 
      ? satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length 
      : 0;

    // Agrupar por canal e prioridade
    const conversas_por_canal = stats?.reduce((acc, c) => {
      acc[c.canal] = (acc[c.canal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const conversas_por_prioridade = stats?.reduce((acc, c) => {
      acc[c.prioridade] = (acc[c.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total_conversas,
      conversas_abertas,
      conversas_em_andamento,
      conversas_aguardando,
      conversas_fechadas_hoje: conversas_fechadas_hoje || 0,
      tempo_resposta_medio,
      satisfacao_media,
      conversas_por_canal,
      conversas_por_prioridade
    };
  }
}