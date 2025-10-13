import { supabase } from '../lib/supabaseClient.js';
import { 
  type OrdemDeServico, 
  type CreateOrdemDeServicoRequest,
  type UpdateOrdemDeServicoRequest,
  type OrdemDeServicoFilters,
  type OrdemDeServicoResponse,
  StatusOS,
  TipoOS,
  Prioridade,
  FormaPagamento
} from './os.types.js';

export class OsRepository {
  /**
   * Busca todas as Ordens de Serviço ativas no banco de dados.
   */
  async findAll(): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .is('deleted_at', null); // Aplicando nosso padrão de soft delete desde o início!

    if (error) {
      // É uma boa prática logar o erro no servidor para depuração
      console.error('Erro ao buscar Ordens de Serviço:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return data;
  }
  async findById(id: string): Promise<OrdemDeServico | null> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Erro ao buscar OS por ID:', error);
      throw new Error('Não foi possível buscar a Ordem de Serviço.');
    }

    return data;
  }

  async create(os: Omit<OrdemDeServico, 'id' | 'created_at'>): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .insert(os)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      throw new Error('Não foi possível criar a Ordem de Serviço.');
    }

    return data;
  }

  async update(id: string, os: Partial<OrdemDeServico>): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .update(os)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar OS:', error);
      throw new Error('Não foi possível atualizar a Ordem de Serviço.');
    }

    return data;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('OrdensDeServico')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar OS:', error);
      throw new Error('Não foi possível deletar a Ordem de Serviço.');
    }

    return { message: 'Ordem de Serviço desativada com sucesso.' };
  }
  // Futuramente, outros métodos como findById, create, update, softDelete, etc. virão aqui.

  /**
   * Busca OS com filtros avançados e paginação
   */
  async findWithFilters(filters: OrdemDeServicoFilters): Promise<{
    ordens: OrdemDeServico[];
    total: number;
  }> {
    let query = supabase
      .from('OrdensDeServico')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.tipo_os) {
      query = query.eq('tipo_os', filters.tipo_os);
    }
    if (filters.prioridade) {
      query = query.eq('prioridade', filters.prioridade);
    }
    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }
    if (filters.tecnico_responsavel_id) {
      query = query.eq('tecnico_responsavel_id', filters.tecnico_responsavel_id);
    }
    if (filters.data_inicio) {
      query = query.gte('created_at', filters.data_inicio);
    }
    if (filters.data_fim) {
      query = query.lte('created_at', filters.data_fim);
    }

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar OS com filtros:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return {
      ordens: data || [],
      total: count || 0
    };
  }

  /**
   * Atualiza apenas o status de uma OS
   */
  async updateStatus(id: string, status: StatusOS): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status da OS:', error);
      throw new Error('Não foi possível atualizar o status da Ordem de Serviço.');
    }

    return data;
  }

  /**
   * Atribui um técnico a uma OS
   */
  async atribuirTecnico(id: string, tecnico_id: string): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .update({ 
        tecnico_responsavel_id: tecnico_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atribuir técnico à OS:', error);
      throw new Error('Não foi possível atribuir o técnico à Ordem de Serviço.');
    }

    return data;
  }

  /**
   * Busca OS por status
   */
  async findByStatus(status: StatusOS): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .eq('status', status)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar OS por status:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return data || [];
  }

  /**
   * Busca OS por técnico responsável
   */
  async findByTecnico(tecnico_id: string): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .eq('tecnico_responsavel_id', tecnico_id)
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar OS por técnico:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return data || [];
  }

  /**
   * Busca OS por cliente
   */
  async findByCliente(cliente_id: string): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .eq('cliente_id', cliente_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar OS por cliente:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return data || [];
  }

  /**
   * Busca OS vencidas (data prevista de entrega passou)
   */
  async findVencidas(): Promise<OrdemDeServico[]> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .lt('prazo_entrega', hoje)
      .not('status', 'in', '(ENTREGUE,CANCELADO)')
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar OS vencidas:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço vencidas.');
    }

    return data || [];
  }

  /**
   * Busca OS que vencem hoje
   */
  async findVencemHoje(): Promise<OrdemDeServico[]> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .eq('prazo_entrega', hoje)
      .not('status', 'in', '(ENTREGUE,CANCELADO)')
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar OS que vencem hoje:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço que vencem hoje.');
    }

    return data || [];
  }

  /**
   * Estatísticas gerais das OS
   */
  async getEstatisticas(): Promise<{
    total_os: number;
    por_status: Record<StatusOS, number>;
    por_tipo: Record<TipoOS, number>;
    por_prioridade: Record<Prioridade, number>;
    vencidas: number;
    vencem_hoje: number;
    media_tempo_conclusao: number; // em dias
  }> {
    // Total de OS ativas
    const { count: total_os } = await supabase
      .from('OrdensDeServico')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // OS por status
    const { data: statusData } = await supabase
      .from('OrdensDeServico')
      .select('status')
      .is('deleted_at', null);

    // OS por tipo
    const { data: tipoData } = await supabase
      .from('OrdensDeServico')
      .select('tipo_os')
      .is('deleted_at', null);

    // OS por prioridade
    const { data: prioridadeData } = await supabase
      .from('OrdensDeServico')
      .select('prioridade')
      .is('deleted_at', null);

    // OS vencidas
    const osVencidas = await this.findVencidas();
    const osVencemHoje = await this.findVencemHoje();

    // Calcular estatísticas
    const por_status = {} as Record<StatusOS, number>;
    const por_tipo = {} as Record<TipoOS, number>;
    const por_prioridade = {} as Record<Prioridade, number>;

    // Inicializar contadores
    Object.values(StatusOS).forEach(status => por_status[status] = 0);
    Object.values(TipoOS).forEach(tipo => por_tipo[tipo] = 0);
    Object.values(Prioridade).forEach(prioridade => por_prioridade[prioridade] = 0);

    // Contar por status
    statusData?.forEach(item => {
      por_status[item.status as StatusOS]++;
    });

    // Contar por tipo
    tipoData?.forEach(item => {
      por_tipo[item.tipo_os as TipoOS]++;
    });

    // Contar por prioridade
    prioridadeData?.forEach(item => {
      por_prioridade[item.prioridade as Prioridade]++;
    });

    // Calcular média de tempo de conclusão (simplificado)
    const { data: osEntregues } = await supabase
      .from('OrdensDeServico')
      .select('created_at, data_entrega_real')
      .eq('status', StatusOS.ENTREGUE)
      .not('data_entrega_real', 'is', null)
      .is('deleted_at', null);

    let media_tempo_conclusao = 0;
    if (osEntregues && osEntregues.length > 0) {
      const tempos = osEntregues.map(os => {
        const inicio = new Date(os.created_at);
        const fim = new Date(os.data_entrega_real);
        return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // dias
      });
      media_tempo_conclusao = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    }

    return {
      total_os: total_os || 0,
      por_status,
      por_tipo,
      por_prioridade,
      vencidas: osVencidas.length,
      vencem_hoje: osVencemHoje.length,
      media_tempo_conclusao: Math.round(media_tempo_conclusao * 100) / 100
    };
  }

  /**
   * Busca OS que precisam de notificação ao cliente
   */
  async findParaNotificacao(): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .in('status', ['AGUARDANDO_APROVACAO', 'PRONTO_RETIRADA'])
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar OS para notificação:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço para notificação.');
    }

    return data || [];
  }
}