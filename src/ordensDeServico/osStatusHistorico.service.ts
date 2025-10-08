import { OSStatusHistoricoRepository } from './osStatusHistorico.repository.js';
import { OsRepository } from './os.repository.js';
import { 
  type OSStatusHistorico,
  type CreateOSStatusHistoricoRequest,
  type OSStatusHistoricoResponse,
  type OSStatusHistoricoFilters,
  type OSStatusHistoricoListResponse,
  type StatusChangeStats,
  type OSTimeline,
  type TransitionValidation,
  type StatusNotification,
  MOTIVOS_PADRAO
} from './osStatusHistorico.types.js';
import { StatusOS } from './os.types.js';

export class OSStatusHistoricoService {
  private repository = new OSStatusHistoricoRepository();
  private osRepository = new OsRepository();

  /**
   * Cria um novo registro de histórico de status
   */
  async create(historico: CreateOSStatusHistoricoRequest): Promise<OSStatusHistorico> {
    // Validar se a OS existe
    const os = await this.osRepository.findById(historico.os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // Validar se o status novo é diferente do anterior (se fornecido)
    if (historico.status_anterior && historico.status_anterior === historico.status_novo) {
      throw new Error('O status anterior não pode ser igual ao novo status.');
    }

    // Usar motivo padrão se não fornecido
    const historicoParaCriar = {
      ...historico,
      motivo: historico.motivo || MOTIVOS_PADRAO[historico.status_novo] || 'Status alterado'
    };

    return this.repository.create(historicoParaCriar);
  }

  /**
   * Busca histórico por ID
   */
  async findById(id: string): Promise<OSStatusHistoricoResponse | null> {
    return this.repository.findById(id);
  }

  /**
   * Busca histórico de uma OS específica
   */
  async findByOSId(os_id: string): Promise<OSStatusHistorico[]> {
    // Validar se a OS existe
    const os = await this.osRepository.findById(os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    return this.repository.findByOSId(os_id);
  }

  /**
   * Busca histórico com filtros
   */
  async findWithFilters(filters: OSStatusHistoricoFilters): Promise<OSStatusHistoricoListResponse> {
    return this.repository.findWithFilters(filters);
  }

  /**
   * Busca último status de uma OS
   */
  async findLastStatus(os_id: string): Promise<OSStatusHistorico | null> {
    // Validar se a OS existe
    const os = await this.osRepository.findById(os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    return this.repository.findLastStatus(os_id);
  }

  /**
   * Obtém timeline completa de uma OS
   */
  async getOSTimeline(os_id: string): Promise<OSTimeline> {
    // Validar se a OS existe
    const os = await this.osRepository.findById(os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    return this.repository.getOSTimeline(os_id);
  }

  /**
   * Obtém estatísticas de mudanças de status
   */
  async getStatusChangeStats(
    data_inicio?: string,
    data_fim?: string,
    status?: StatusOS
  ): Promise<StatusChangeStats> {
    return this.repository.getStatusChangeStats(data_inicio, data_fim, status);
  }

  /**
   * Busca OS que mudaram para um status específico em um período
   */
  async findOSByStatusChange(
    status: StatusOS,
    data_inicio: string,
    data_fim: string
  ): Promise<OSStatusHistorico[]> {
    return this.repository.findOSByStatusChange(status, data_inicio, data_fim);
  }

  /**
   * Busca histórico por usuário
   */
  async findByUsuario(
    usuario_id: string,
    data_inicio?: string,
    data_fim?: string
  ): Promise<OSStatusHistorico[]> {
    return this.repository.findByUsuario(usuario_id, data_inicio, data_fim);
  }

  /**
   * Obtém relatório de produtividade por usuário
   */
  async getRelatorioProducaoUsuario(
    usuario_id: string,
    data_inicio: string,
    data_fim: string
  ): Promise<{
    usuario_id: string;
    total_alteracoes: number;
    os_concluidas: number;
    os_canceladas: number;
    tempo_medio_conclusao: number; // em dias
    status_mais_alterados: Record<StatusOS, number>;
  }> {
    const historico = await this.repository.findByUsuario(usuario_id, data_inicio, data_fim);

    // Contar alterações por status
    const status_mais_alterados: Record<StatusOS, number> = {} as Record<StatusOS, number>;
    Object.values(StatusOS).forEach(status => {
      status_mais_alterados[status] = 0;
    });

    let os_concluidas = 0;
    let os_canceladas = 0;
    const tempos_conclusao: number[] = [];

    // Agrupar por OS para calcular tempo de conclusão
    const osPorId: Record<string, OSStatusHistorico[]> = {};
    
    historico.forEach(item => {
      if (!osPorId[item.os_id]) {
        osPorId[item.os_id] = [];
      }
      osPorId[item.os_id].push(item);

      // Contar alterações por status
      status_mais_alterados[item.status_novo]++;

      // Contar conclusões e cancelamentos
      if (item.status_novo === StatusOS.CONCLUIDA) {
        os_concluidas++;
      } else if (item.status_novo === StatusOS.CANCELADA) {
        os_canceladas++;
      }
    });

    // Calcular tempo médio de conclusão
    Object.values(osPorId).forEach(osHistorico => {
      const inicio = osHistorico.find(h => h.status_anterior === null);
      const conclusao = osHistorico.find(h => 
        h.status_novo === StatusOS.CONCLUIDA || h.status_novo === StatusOS.ENTREGUE
      );

      if (inicio && conclusao) {
        const tempoInicio = new Date(inicio.created_at);
        const tempoConclusao = new Date(conclusao.created_at);
        const diasConclusao = Math.ceil(
          (tempoConclusao.getTime() - tempoInicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        tempos_conclusao.push(diasConclusao);
      }
    });

    const tempo_medio_conclusao = tempos_conclusao.length > 0
      ? tempos_conclusao.reduce((sum, tempo) => sum + tempo, 0) / tempos_conclusao.length
      : 0;

    return {
      usuario_id,
      total_alteracoes: historico.length,
      os_concluidas,
      os_canceladas,
      tempo_medio_conclusao: Math.round(tempo_medio_conclusao * 100) / 100,
      status_mais_alterados
    };
  }

  /**
   * Obtém relatório de gargalos no workflow
   */
  async getRelatorioGargalos(
    data_inicio: string,
    data_fim: string
  ): Promise<{
    status_com_maior_tempo: Array<{
      status: StatusOS;
      tempo_medio_dias: number;
      quantidade_os: number;
    }>;
    transicoes_mais_demoradas: Array<{
      status_origem: StatusOS;
      status_destino: StatusOS;
      tempo_medio_dias: number;
      quantidade: number;
    }>;
  }> {
    const historico = await this.repository.findWithFilters({
      data_inicio,
      data_fim,
      page: 1,
      limit: 10000 // Buscar todos para análise
    });

    // Agrupar por OS
    const osPorId: Record<string, OSStatusHistorico[]> = {};
    historico.historicos.forEach(item => {
      if (!osPorId[item.os_id]) {
        osPorId[item.os_id] = [];
      }
      osPorId[item.os_id].push(item);
    });

    // Calcular tempo em cada status
    const temposPorStatus: Record<StatusOS, number[]> = {} as Record<StatusOS, number[]>;
    const transicoesTempos: Record<string, number[]> = {};

    Object.values(StatusOS).forEach(status => {
      temposPorStatus[status] = [];
    });

    Object.values(osPorId).forEach(osHistorico => {
      // Ordenar por data
      osHistorico.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (let i = 0; i < osHistorico.length - 1; i++) {
        const atual = osHistorico[i];
        const proximo = osHistorico[i + 1];

        // Calcular tempo no status atual
        const tempoInicio = new Date(atual.created_at);
        const tempoFim = new Date(proximo.created_at);
        const diasNoStatus = Math.ceil((tempoFim.getTime() - tempoInicio.getTime()) / (1000 * 60 * 60 * 24));

        temposPorStatus[atual.status_novo].push(diasNoStatus);

        // Calcular tempo de transição
        const chaveTransicao = `${atual.status_novo}->${proximo.status_novo}`;
        if (!transicoesTempos[chaveTransicao]) {
          transicoesTempos[chaveTransicao] = [];
        }
        transicoesTempos[chaveTransicao].push(diasNoStatus);
      }
    });

    // Calcular médias para status
    const status_com_maior_tempo = Object.entries(temposPorStatus)
      .filter(([_, tempos]) => tempos.length > 0)
      .map(([status, tempos]) => ({
        status: status as StatusOS,
        tempo_medio_dias: Math.round((tempos.reduce((sum, t) => sum + t, 0) / tempos.length) * 100) / 100,
        quantidade_os: tempos.length
      }))
      .sort((a, b) => b.tempo_medio_dias - a.tempo_medio_dias);

    // Calcular médias para transições
    const transicoes_mais_demoradas = Object.entries(transicoesTempos)
      .filter(([_, tempos]) => tempos.length > 0)
      .map(([transicao, tempos]) => {
        const [origem, destino] = transicao.split('->');
        return {
          status_origem: origem as StatusOS,
          status_destino: destino as StatusOS,
          tempo_medio_dias: Math.round((tempos.reduce((sum, t) => sum + t, 0) / tempos.length) * 100) / 100,
          quantidade: tempos.length
        };
      })
      .sort((a, b) => b.tempo_medio_dias - a.tempo_medio_dias);

    return {
      status_com_maior_tempo,
      transicoes_mais_demoradas
    };
  }

  /**
   * Obtém notificações de status que precisam de atenção
   */
  async getNotificacoesStatus(): Promise<StatusNotification[]> {
    const notificacoes: StatusNotification[] = [];

    // OS paradas há muito tempo em um status
    const osParadas = await this.repository.findOSParadasMuitoTempo();
    osParadas.forEach(os => {
      notificacoes.push({
        tipo: 'os_parada',
        os_id: os.os_id,
        status_atual: os.status_novo,
        dias_no_status: os.dias_no_status || 0,
        mensagem: `OS ${os.os_id} está há ${os.dias_no_status} dias no status "${os.status_novo}"`,
        prioridade: os.dias_no_status && os.dias_no_status > 7 ? 'alta' : 'media'
      });
    });

    // OS sem movimentação recente
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const osSemMovimentacao = await this.repository.findWithFilters({
      data_fim: seteDiasAtras.toISOString().split('T')[0],
      page: 1,
      limit: 100
    });

    // Buscar OS que não tiveram alteração nos últimos 7 dias
    const osIds = [...new Set(osSemMovimentacao.historicos.map(h => h.os_id))];
    
    for (const os_id of osIds) {
      const ultimoStatus = await this.repository.findLastStatus(os_id);
      if (ultimoStatus && 
          ultimoStatus.status_novo !== StatusOS.CONCLUIDA && 
          ultimoStatus.status_novo !== StatusOS.ENTREGUE && 
          ultimoStatus.status_novo !== StatusOS.CANCELADA) {
        
        const diasSemMovimentacao = Math.ceil(
          (hoje.getTime() - new Date(ultimoStatus.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasSemMovimentacao >= 7) {
          notificacoes.push({
            tipo: 'sem_movimentacao',
            os_id,
            status_atual: ultimoStatus.status_novo,
            dias_no_status: diasSemMovimentacao,
            mensagem: `OS ${os_id} sem movimentação há ${diasSemMovimentacao} dias`,
            prioridade: diasSemMovimentacao > 14 ? 'alta' : 'media'
          });
        }
      }
    }

    return notificacoes.sort((a, b) => {
      // Ordenar por prioridade (alta primeiro) e depois por dias
      if (a.prioridade !== b.prioridade) {
        return a.prioridade === 'alta' ? -1 : 1;
      }
      return (b.dias_no_status || 0) - (a.dias_no_status || 0);
    });
  }

  /**
   * Limpa histórico antigo (manter apenas dos últimos N meses)
   */
  async limparHistoricoAntigo(meses: number = 12): Promise<number> {
    if (meses < 1) {
      throw new Error('Número de meses deve ser maior que 0.');
    }

    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - meses);

    return this.repository.cleanOldHistory(dataLimite.toISOString().split('T')[0]);
  }

  /**
   * Exporta histórico para relatório
   */
  async exportarHistorico(
    filters: OSStatusHistoricoFilters
  ): Promise<{
    historicos: OSStatusHistoricoResponse[];
    resumo: {
      total_registros: number;
      periodo: { inicio: string; fim: string };
      status_mais_alterados: Record<StatusOS, number>;
      usuarios_mais_ativos: Array<{ usuario_id: string; total_alteracoes: number }>;
    };
  }> {
    const resultado = await this.repository.findWithFilters({
      ...filters,
      limit: 10000 // Buscar todos para exportação
    });

    // Calcular resumo
    const status_mais_alterados: Record<StatusOS, number> = {} as Record<StatusOS, number>;
    const usuarios_alteracoes: Record<string, number> = {};

    Object.values(StatusOS).forEach(status => {
      status_mais_alterados[status] = 0;
    });

    resultado.historicos.forEach(item => {
      status_mais_alterados[item.status_novo]++;
      
      if (!usuarios_alteracoes[item.usuario_id]) {
        usuarios_alteracoes[item.usuario_id] = 0;
      }
      usuarios_alteracoes[item.usuario_id]++;
    });

    const usuarios_mais_ativos = Object.entries(usuarios_alteracoes)
      .map(([usuario_id, total_alteracoes]) => ({ usuario_id, total_alteracoes }))
      .sort((a, b) => b.total_alteracoes - a.total_alteracoes)
      .slice(0, 10); // Top 10

    return {
      historicos: resultado.historicos,
      resumo: {
        total_registros: resultado.total,
        periodo: {
          inicio: filters.data_inicio || 'N/A',
          fim: filters.data_fim || 'N/A'
        },
        status_mais_alterados,
        usuarios_mais_ativos
      }
    };
  }
}