import { supabase } from '../lib/supabaseClient.js';
import type { 
  Mensagem, 
  CreateMensagemRequest, 
  UpdateMensagemRequest, 
  MensagemFilters,
  MensagemResponse 
} from './mensagem.types.js';

export class MensagemRepository {
  private readonly tableName = 'Mensagens';

  async findAll(filters: MensagemFilters = {}): Promise<{ data: MensagemResponse[]; total: number }> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversa:Conversas!conversa_id (
          id,
          cliente:Clientes!cliente_id (
            nome
          ),
          agente:Usuarios!agente_id (
            nome
          ),
          status
        ),
        resposta_de_mensagem:Mensagens!resposta_de (
          id,
          conteudo,
          remetente_nome
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.conversa_id) {
      query = query.eq('conversa_id', filters.conversa_id);
    }

    if (filters.remetente_tipo) {
      query = query.eq('remetente_tipo', filters.remetente_tipo);
    }

    if (filters.remetente_id) {
      query = query.eq('remetente_id', filters.remetente_id);
    }

    if (filters.tipo_conteudo) {
      query = query.eq('tipo_conteudo', filters.tipo_conteudo);
    }

    if (filters.status_leitura) {
      query = query.eq('status_leitura', filters.status_leitura);
    }

    if (filters.apenas_nao_lidas) {
      query = query.neq('status_leitura', 'lida');
    }

    if (filters.data_inicio) {
      query = query.gte('created_at', filters.data_inicio.toISOString());
    }

    if (filters.data_fim) {
      query = query.lte('created_at', filters.data_fim.toISOString());
    }

    if (filters.busca_conteudo) {
      query = query.ilike('conteudo', `%${filters.busca_conteudo}%`);
    }

    // Ordenação
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'asc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0
    };
  }

  async findById(id: string): Promise<MensagemResponse | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        conversa:Conversas!conversa_id (
          id,
          cliente:Clientes!cliente_id (
            nome
          ),
          agente:Usuarios!agente_id (
            nome
          ),
          status
        ),
        resposta_de_mensagem:Mensagens!resposta_de (
          id,
          conteudo,
          remetente_nome
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar mensagem: ${error.message}`);
    }

    return data;
  }

  async findByConversaId(conversaId: string, limit?: number): Promise<MensagemResponse[]> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversa:Conversas!conversa_id (
          id,
          cliente:Clientes!cliente_id (
            nome
          ),
          agente:Usuarios!agente_id (
            nome
          ),
          status
        ),
        resposta_de_mensagem:Mensagens!resposta_de (
          id,
          conteudo,
          remetente_nome
        )
      `)
      .eq('conversa_id', conversaId)
      .order('created_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar mensagens da conversa: ${error.message}`);
    }

    return data || [];
  }

  async findNaoLidas(conversaId?: string): Promise<MensagemResponse[]> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversa:Conversas!conversa_id (
          id,
          cliente:Clientes!cliente_id (
            nome
          ),
          agente:Usuarios!agente_id (
            nome
          ),
          status
        )
      `)
      .neq('status_leitura', 'lida')
      .order('created_at', { ascending: false });

    if (conversaId) {
      query = query.eq('conversa_id', conversaId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar mensagens não lidas: ${error.message}`);
    }

    return data || [];
  }

  async create(mensagem: CreateMensagemRequest): Promise<Mensagem> {
    const novaMensagem = {
      ...mensagem,
      tipo_conteudo: mensagem.tipo_conteudo || 'texto',
      status_leitura: 'enviada',
      respondida: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(novaMensagem)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }

    return data;
  }

  async update(id: string, updates: UpdateMensagemRequest): Promise<Mensagem> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Se está marcando como lida, adicionar timestamp
    if (updates.status_leitura === 'lida') {
      updateData.lida_em = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar mensagem: ${error.message}`);
    }

    return data;
  }

  async marcarComoLida(id: string): Promise<Mensagem> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        status_leitura: 'lida',
        lida_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao marcar mensagem como lida: ${error.message}`);
    }

    return data;
  }

  async marcarTodasComoLidas(conversaId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        status_leitura: 'lida',
        lida_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('conversa_id', conversaId)
      .neq('status_leitura', 'lida');

    if (error) {
      throw new Error(`Erro ao marcar todas as mensagens como lidas: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir mensagem: ${error.message}`);
    }
  }

  async countNaoLidas(conversaId?: string): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .neq('status_leitura', 'lida');

    if (conversaId) {
      query = query.eq('conversa_id', conversaId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erro ao contar mensagens não lidas: ${error.message}`);
    }

    return count || 0;
  }

  async getUltimaMensagem(conversaId: string): Promise<Mensagem | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('conversa_id', conversaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar última mensagem: ${error.message}`);
    }

    return data;
  }

  async getStats(): Promise<any> {
    // Buscar estatísticas básicas
    const { data: mensagens, error } = await supabase
      .from(this.tableName)
      .select('remetente_tipo, tipo_conteudo, status_leitura, created_at, remetente_id, remetente_nome');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const total_mensagens = mensagens?.length || 0;

    // Mensagens de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const mensagens_hoje = mensagens?.filter(m => 
      new Date(m.created_at) >= hoje
    ).length || 0;

    // Mensagens não lidas
    const mensagens_nao_lidas = mensagens?.filter(m => 
      m.status_leitura !== 'lida'
    ).length || 0;

    // Mensagens por tipo
    const mensagens_por_tipo = mensagens?.reduce((acc, m) => {
      acc[m.tipo_conteudo] = (acc[m.tipo_conteudo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Agentes mais ativos (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const mensagensRecentes = mensagens?.filter(m => 
      m.remetente_tipo === 'agente' && 
      new Date(m.created_at) >= seteDiasAtras
    ) || [];

    const agentesAtividade = mensagensRecentes.reduce((acc, m) => {
      if (m.remetente_id) {
        const key = `${m.remetente_id}|${m.remetente_nome}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const agentes_mais_ativos = Object.entries(agentesAtividade)
      .map(([key, count]) => {
        const [agente_id, agente_nome] = key.split('|');
        return {
          agente_id,
          agente_nome,
          total_mensagens: count
        };
      })
      .sort((a, b) => b.total_mensagens - a.total_mensagens)
      .slice(0, 5);

    return {
      total_mensagens,
      mensagens_hoje,
      mensagens_nao_lidas,
      tempo_resposta_medio: 0, // Calcular baseado em conversas
      mensagens_por_tipo,
      mensagens_por_canal: {}, // Buscar das conversas
      agentes_mais_ativos
    };
  }
}