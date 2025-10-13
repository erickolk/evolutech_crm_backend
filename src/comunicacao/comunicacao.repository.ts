import { supabase } from '../lib/supabaseClient.js';
import type { 
  ComunicacaoHistorico, 
  CreateComunicacaoRequest, 
  UpdateComunicacaoRequest,
  ComunicacaoFilters,
  ComunicacaoResponse,
  ComunicacaoStats,
  ClienteWhatsAppInfo,
  OSStatusInfo,
  ComunicacaoAggregate
} from './comunicacao.types.js';

export class ComunicacaoRepository {
  private readonly tableName = 'comunicacao_historico';

  async create(comunicacaoData: CreateComunicacaoRequest): Promise<ComunicacaoHistorico> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...comunicacaoData,
          agente_ia: comunicacaoData.agente_ia ?? false,
          status_leitura: comunicacaoData.status_leitura ?? 'nao_lido'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar comunicação:', error);
        throw new Error(`Erro ao criar comunicação: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao criar comunicação:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ComunicacaoHistorico | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erro ao buscar comunicação por ID:', error);
        throw new Error(`Erro ao buscar comunicação: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao buscar comunicação por ID:', error);
      throw error;
    }
  }

  async findAll(
    filters: ComunicacaoFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ComunicacaoResponse> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }

      if (filters.ordem_servico_id) {
        query = query.eq('ordem_servico_id', filters.ordem_servico_id);
      }

      if (filters.canal) {
        query = query.eq('canal', filters.canal);
      }

      if (filters.tipo_interacao) {
        query = query.eq('tipo_interacao', filters.tipo_interacao);
      }

      if (filters.agente_ia !== undefined) {
        query = query.eq('agente_ia', filters.agente_ia);
      }

      if (filters.status_leitura) {
        query = query.eq('status_leitura', filters.status_leitura);
      }

      if (filters.data_inicio) {
        query = query.gte('created_at', filters.data_inicio);
      }

      if (filters.data_fim) {
        query = query.lte('created_at', filters.data_fim);
      }

      if (filters.search) {
        query = query.or(`conteudo.ilike.%${filters.search}%,remetente.ilike.%${filters.search}%,destinatario.ilike.%${filters.search}%`);
      }

      // Aplicar paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar comunicações:', error);
        throw new Error(`Erro ao buscar comunicações: ${error.message}`);
      }

      return {
        comunicacoes: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Erro no repositório ao buscar comunicações:', error);
      throw error;
    }
  }

  async update(id: string, updateData: UpdateComunicacaoRequest): Promise<ComunicacaoHistorico> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar comunicação:', error);
        throw new Error(`Erro ao atualizar comunicação: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao atualizar comunicação:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<ComunicacaoHistorico> {
    try {
      return await this.update(id, { status_leitura: 'lido' });
    } catch (error) {
      console.error('Erro no repositório ao marcar como lida:', error);
      throw error;
    }
  }

  async findByClienteId(clienteId: string, limit: number = 50): Promise<ComunicacaoHistorico[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar comunicações por cliente:', error);
        throw new Error(`Erro ao buscar comunicações por cliente: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no repositório ao buscar comunicações por cliente:', error);
      throw error;
    }
  }

  async findByOSId(osId: string): Promise<ComunicacaoHistorico[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('ordem_servico_id', osId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar comunicações por OS:', error);
        throw new Error(`Erro ao buscar comunicações por OS: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no repositório ao buscar comunicações por OS:', error);
      throw error;
    }
  }

  async findUnread(): Promise<ComunicacaoHistorico[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status_leitura', 'nao_lido')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar comunicações não lidas:', error);
        throw new Error(`Erro ao buscar comunicações não lidas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no repositório ao buscar comunicações não lidas:', error);
      throw error;
    }
  }

  async getStats(): Promise<ComunicacaoStats> {
    try {
      // Buscar estatísticas gerais
      const { data: totalData, error: totalError } = await supabase
        .from(this.tableName)
        .select('canal, status_leitura, agente_ia, created_at');

      if (totalError) {
        throw new Error(`Erro ao buscar estatísticas: ${totalError.message}`);
      }

      const comunicacoes = totalData || [];
      const agora = new Date();
      const ultimas24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

      // Calcular estatísticas
      const stats: ComunicacaoStats = {
        total_comunicacoes: comunicacoes.length,
        por_canal: {
          whatsapp: 0,
          telefone: 0,
          presencial: 0,
          email: 0,
          sistema: 0
        },
        por_status: {
          nao_lido: 0,
          lido: 0,
          respondido: 0
        },
        nao_lidas: 0,
        processadas_ia: 0,
        ultimas_24h: 0
      };

      comunicacoes.forEach(comunicacao => {
        // Contar por canal
        stats.por_canal[comunicacao.canal as keyof typeof stats.por_canal]++;

        // Contar por status
        stats.por_status[comunicacao.status_leitura as keyof typeof stats.por_status]++;

        // Contar não lidas
        if (comunicacao.status_leitura === 'nao_lido') {
          stats.nao_lidas++;
        }

        // Contar processadas por IA
        if (comunicacao.agente_ia) {
          stats.processadas_ia++;
        }

        // Contar últimas 24h
        if (new Date(comunicacao.created_at) >= ultimas24h) {
          stats.ultimas_24h++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro no repositório ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Métodos específicos para IA
  async findClienteByWhatsApp(numeroWhatsApp: string): Promise<ClienteWhatsAppInfo | null> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          id,
          nome,
          telefone,
          email,
          ordensDeServico!inner(id, status)
        `)
        .eq('telefone', numeroWhatsApp)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar cliente por WhatsApp: ${error.message}`);
      }

      // Buscar última interação
      const { data: ultimaInteracao } = await supabase
        .from(this.tableName)
        .select('created_at')
        .eq('cliente_id', data.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        cliente_id: data.id,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        os_ativas: data.ordensDeServico?.filter((os: any) => os.status !== 'finalizada').length || 0,
        ultima_interacao: ultimaInteracao?.created_at
      };
    } catch (error) {
      console.error('Erro no repositório ao buscar cliente por WhatsApp:', error);
      throw error;
    }
  }

  async getOSStatus(osId: string): Promise<OSStatusInfo | null> {
    try {
      const { data, error } = await supabase
        .from('ordensDeServico')
        .select(`
          id,
          numero,
          status,
          data_prevista,
          observacoes_cliente,
          valor_orcamento,
          clientes!inner(nome),
          dispositivos!inner(tipo, marca),
          usuarios(nome)
        `)
        .eq('id', osId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar status da OS: ${error.message}`);
      }

      return {
        id: data.id,
        numero: data.numero,
        cliente_nome: data.clientes.nome,
        dispositivo_tipo: data.dispositivos.tipo,
        dispositivo_marca: data.dispositivos.marca,
        status_atual: data.status,
        tecnico_nome: data.usuarios?.nome,
        data_prevista: data.data_prevista,
        observacoes_cliente: data.observacoes_cliente,
        valor_orcamento: data.valor_orcamento
      };
    } catch (error) {
      console.error('Erro no repositório ao buscar status da OS:', error);
      throw error;
    }
  }

  async getClienteOSAtivas(clienteId: string): Promise<OSStatusInfo[]> {
    try {
      const { data, error } = await supabase
        .from('ordensDeServico')
        .select(`
          id,
          numero,
          status,
          data_prevista,
          observacoes_cliente,
          valor_orcamento,
          clientes!inner(nome),
          dispositivos!inner(tipo, marca),
          usuarios(nome)
        `)
        .eq('cliente_id', clienteId)
        .neq('status', 'finalizada')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar OS ativas do cliente: ${error.message}`);
      }

      return (data || []).map(os => ({
        id: os.id,
        numero: os.numero,
        cliente_nome: os.clientes.nome,
        dispositivo_tipo: os.dispositivos.tipo,
        dispositivo_marca: os.dispositivos.marca,
        status_atual: os.status,
        tecnico_nome: os.usuarios?.nome,
        data_prevista: os.data_prevista,
        observacoes_cliente: os.observacoes_cliente,
        valor_orcamento: os.valor_orcamento
      }));
    } catch (error) {
      console.error('Erro no repositório ao buscar OS ativas do cliente:', error);
      throw error;
    }
  }

  async getComunicacaoAggregate(): Promise<ComunicacaoAggregate[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_comunicacao_aggregate');

      if (error) {
        throw new Error(`Erro ao buscar agregado de comunicações: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no repositório ao buscar agregado de comunicações:', error);
      // Fallback para implementação manual se a função RPC não existir
      return [];
    }
  }
}