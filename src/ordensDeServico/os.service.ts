import { OsRepository } from './os.repository.js';
import { OSStatusHistoricoRepository } from './osStatusHistorico.repository.js';
import { PagamentoRepository } from '../pagamentos/pagamento.repository.js';
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
import { 
  type OSStatusHistorico,
  type CreateOSStatusHistoricoRequest,
  type TransitionValidation,
  MOTIVOS_PADRAO
} from './osStatusHistorico.types.js';
import { 
  type CreatePagamentoRequest,
  StatusPagamento,
  TipoPagamento
} from '../pagamentos/pagamento.types.js';

export class OsService {
  private repository = new OsRepository();
  private statusHistoricoRepository = new OSStatusHistoricoRepository();
  private pagamentoRepository = new PagamentoRepository();

  // Definição das transições válidas de status
  private readonly TRANSICOES_VALIDAS: Record<StatusOS, StatusOS[]> = {
    [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.EM_ANALISE, StatusOS.CANCELADA],
    [StatusOS.EM_ANALISE]: [StatusOS.AGUARDANDO_PECAS, StatusOS.EM_ANDAMENTO, StatusOS.CANCELADA],
    [StatusOS.AGUARDANDO_PECAS]: [StatusOS.EM_ANDAMENTO, StatusOS.PAUSADA, StatusOS.CANCELADA],
    [StatusOS.EM_ANDAMENTO]: [StatusOS.AGUARDANDO_TESTE, StatusOS.PAUSADA, StatusOS.CANCELADA],
    [StatusOS.PAUSADA]: [StatusOS.EM_ANDAMENTO, StatusOS.CANCELADA],
    [StatusOS.AGUARDANDO_TESTE]: [StatusOS.CONCLUIDA, StatusOS.EM_ANDAMENTO, StatusOS.CANCELADA],
    [StatusOS.CONCLUIDA]: [StatusOS.ENTREGUE],
    [StatusOS.ENTREGUE]: [], // Status final
    [StatusOS.CANCELADA]: [] // Status final
  };

  /**
   * Busca todas as Ordens de Serviço com filtros opcionais
   */
  async findAll(filters?: OrdemDeServicoFilters) {
    if (filters) {
      return this.repository.findWithFilters(filters);
    }
    return this.repository.findAll();
  }

  /**
   * Busca OS por ID
   */
  async findById(id: string): Promise<OrdemDeServicoResponse | null> {
    return this.repository.findById(id);
  }

  /**
   * Cria uma nova OS
   */
  async create(osData: CreateOrdemDeServicoRequest, usuario_id: string): Promise<OrdemDeServico> {
    console.log('🔍 Service - Dados recebidos:', JSON.stringify(osData, null, 2));
    console.log('👤 Service - Usuario ID:', usuario_id);
    
    // Validar campos obrigatórios
    if (!osData.cliente_id) {
      throw new Error('Cliente ID é obrigatório');
    }
    
    if (!osData.dispositivo_id) {
      throw new Error('Dispositivo ID é obrigatório');
    }

    try {
      // Mapear campos do frontend para a estrutura real da tabela
      const novaOS: Omit<OrdemDeServico, 'id' | 'created_at'> = {
        cliente_id: osData.cliente_id,
        dispositivo_id: osData.dispositivo_id,
        status_fluxo: 'Recebido', // Campo real da tabela
        relato_cliente: osData.relato_cliente || (osData as any).descricao_problema || '',
        diagnostico_tecnico: (osData as any).diagnostico || null,
        valor_orcamento: null,
        prazo_entrega: osData.data_prevista_entrega || (osData as any).data_prevista || null,
        garantia_servico: (osData as any).garantia_servico || null,
        data_ultima_manutencao: null,
        esta_na_garantia_cliente: null,
        diagnostico_anterior_cliente: null,
        tecnico_responsavel_id: (osData as any).tecnico_responsavel || null,
        prioridade: osData.prioridade || 'Normal',
        numero_aos: null,
        acessorios_inclusos: osData.acessorios_inclusos || (osData as any).acessorios || null,
        deleted_at: null,
        tipo_os: osData.tipo_os || (osData as any).tipo || null
      };

      console.log('📋 Service - Objeto OS preparado:', JSON.stringify(novaOS, null, 2));

      // Criar a OS no banco
      const osCreated = await this.repository.create(novaOS);
      console.log('✅ Service - OS criada no banco:', osCreated.id);

      // Criar histórico de status (se o serviço existir)
      try {
        await this.statusHistoricoRepository.create({
          os_id: osCreated.id,
          status_anterior: null,
          status_novo: 'Recebido',
          usuario_id,
          motivo: 'OS criada',
          observacoes: 'Ordem de serviço criada no sistema'
        });
        console.log('📝 Service - Histórico de status criado');
      } catch (historyError) {
        console.warn('⚠️ Service - Erro ao criar histórico (não crítico):', historyError);
      }

      return osCreated;
    } catch (error: any) {
      console.error('❌ Service - Erro detalhado:', error);
      throw new Error('Não foi possível criar a Ordem de Serviço.');
    }
  }

  /**
   * Atualiza uma OS
   */
  async update(id: string, osData: UpdateOrdemDeServicoRequest, usuario_id: string): Promise<OrdemDeServico> {
    // Buscar OS atual
    const osAtual = await this.repository.findById(id);
    if (!osAtual) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // Validações de negócio
    if (osData.cliente_id || osData.dispositivo_id) {
      throw new Error('Não é permitido alterar o cliente ou o dispositivo de uma OS.');
    }

    // Se está tentando alterar o status, usar método específico
    if (osData.status_fluxo && osData.status_fluxo !== osAtual.status_fluxo) {
      return this.alterarStatus(id, osData.status_fluxo, usuario_id, osData.observacoes || 'Status alterado');
    }

    return this.repository.update(id, osData);
  }

  /**
   * Altera o status de uma OS com validação de transição
   */
  async alterarStatus(
    os_id: string, 
    novo_status: StatusOS, 
    usuario_id: string, 
    motivo?: string,
    observacoes?: string
  ): Promise<OrdemDeServico> {
    // Buscar OS atual
    const osAtual = await this.repository.findById(os_id);
    if (!osAtual) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // Validar transição
    const transicaoValida = this.validarTransicao(osAtual.status_fluxo, novo_status);
    if (!transicaoValida.valida) {
      throw new Error(transicaoValida.motivo || 'Transição de status inválida.');
    }

    // Atualizar status
    const osAtualizada = await this.repository.updateStatus(os_id, novo_status);

    // Registrar no histórico
    await this.statusHistoricoRepository.create({
      os_id,
      status_anterior: osAtual.status_fluxo,
      status_novo: novo_status,
      usuario_id,
      motivo: motivo || MOTIVOS_PADRAO[novo_status] || 'Status alterado',
      observacoes
    });

    // Ações automáticas baseadas no novo status
    await this.executarAcoesAutomaticas(os_id, novo_status, usuario_id);

    return osAtualizada;
  }

  /**
   * Valida se uma transição de status é permitida
   */
  private validarTransicao(status_atual: StatusOS, novo_status: StatusOS): TransitionValidation {
    if (status_atual === novo_status) {
      return {
        valida: false,
        motivo: 'O status atual já é o mesmo que está sendo definido.'
      };
    }

    const transicoesPermitidas = this.TRANSICOES_VALIDAS[status_atual];
    if (!transicoesPermitidas.includes(novo_status)) {
      return {
        valida: false,
        motivo: `Não é possível alterar de "${status_atual}" para "${novo_status}".`
      };
    }

    return { valida: true };
  }

  /**
   * Executa ações automáticas baseadas no novo status
   */
  private async executarAcoesAutomaticas(os_id: string, novo_status: StatusOS, usuario_id: string): Promise<void> {
    switch (novo_status) {
      case StatusOS.CONCLUIDA:
        // Criar pagamento se não existir
        await this.criarPagamentoSeNecessario(os_id, usuario_id);
        break;
      
      case StatusOS.ENTREGUE:
        // Marcar pagamento como recebido se for à vista
        await this.processarPagamentoEntrega(os_id);
        break;
    }
  }

  /**
   * Cria pagamento para OS concluída se não existir
   */
  private async criarPagamentoSeNecessario(os_id: string, usuario_id: string): Promise<void> {
    // Verificar se já existe pagamento
    const pagamentoExistente = await this.pagamentoRepository.findByOSId(os_id);
    if (pagamentoExistente) {
      return;
    }

    // Buscar OS para obter valor do orçamento
    const os = await this.repository.findById(os_id);
    if (!os || !os.orcamento_detalhado) {
      return;
    }

    // Criar pagamento baseado no orçamento
    const pagamento: CreatePagamentoRequest = {
      os_id,
      valor_total: os.orcamento_detalhado,
      forma_pagamento: FormaPagamento.DINHEIRO, // Padrão, pode ser alterado depois
      tipo_pagamento: TipoPagamento.SERVICO,
      data_vencimento: new Date().toISOString().split('T')[0], // Vence hoje
      numero_parcelas: 1,
      observacoes: 'Pagamento criado automaticamente ao concluir OS'
    };

    await this.pagamentoRepository.create(pagamento);
  }

  /**
   * Processa pagamento na entrega (para pagamentos à vista)
   */
  private async processarPagamentoEntrega(os_id: string): Promise<void> {
    const pagamento = await this.pagamentoRepository.findByOSId(os_id);
    if (!pagamento || pagamento.status !== StatusPagamento.PENDENTE) {
      return;
    }

    // Se for pagamento à vista (1 parcela), marcar como pago
    if (pagamento.numero_parcelas === 1 && pagamento.parcelas.length > 0) {
      const parcela = pagamento.parcelas[0];
      if (parcela.status === StatusPagamento.PENDENTE) {
        await this.pagamentoRepository.registrarPagamentoParcela(parcela.id, {
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento_parcela: pagamento.forma_pagamento,
          observacoes: 'Pagamento registrado automaticamente na entrega'
        });
      }
    }
  }

  /**
   * Atribui técnico a uma OS
   */
  async atribuirTecnico(os_id: string, tecnico_id: string, usuario_id: string): Promise<OrdemDeServico> {
    const osAtualizada = await this.repository.atribuirTecnico(os_id, tecnico_id);

    // Registrar no histórico
    await this.statusHistoricoRepository.create({
      os_id,
      status_anterior: osAtualizada.status_fluxo,
      status_novo: osAtualizada.status_fluxo,
      usuario_id,
      motivo: 'Técnico atribuído',
      observacoes: `Técnico ${tecnico_id} atribuído à OS`
    });

    return osAtualizada;
  }

  /**
   * Busca OS por status
   */
  async findByStatus(status: StatusOS): Promise<OrdemDeServico[]> {
    return this.repository.findByStatus(status);
  }

  /**
   * Busca OS por técnico
   */
  async findByTecnico(tecnico_id: string): Promise<OrdemDeServico[]> {
    return this.repository.findByTecnico(tecnico_id);
  }

  /**
   * Busca OS por cliente
   */
  async findByCliente(cliente_id: string): Promise<OrdemDeServico[]> {
    return this.repository.findByCliente(cliente_id);
  }

  /**
   * Busca OS vencidas
   */
  async findVencidas(): Promise<OrdemDeServico[]> {
    return this.repository.findVencidas();
  }

  /**
   * Busca OS que vencem hoje
   */
  async findVencemHoje(): Promise<OrdemDeServico[]> {
    return this.repository.findVencemHoje();
  }

  /**
   * Obtém estatísticas das OS
   */
  async getEstatisticas() {
    return this.repository.getEstatisticas();
  }

  /**
   * Busca OS para notificação
   */
  async findParaNotificacao(): Promise<OrdemDeServico[]> {
    return this.repository.findParaNotificacao();
  }

  /**
   * Obtém histórico de status de uma OS
   */
  async getHistoricoStatus(os_id: string): Promise<OSStatusHistorico[]> {
    return this.statusHistoricoRepository.findByOSId(os_id);
  }

  /**
   * Obtém timeline completa de uma OS
   */
  async getTimeline(os_id: string) {
    return this.statusHistoricoRepository.getOSTimeline(os_id);
  }

  /**
   * Soft delete de uma OS
   */
  async softDelete(id: string, usuario_id?: string): Promise<void> {
    // Buscar OS atual
    const osAtual = await this.repository.findById(id);
    if (!osAtual) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // Validar se pode ser deletada
    if (osAtual.status_fluxo === StatusOS.EM_ANDAMENTO) {
      throw new Error('Não é possível deletar uma OS em andamento.');
    }

    // Registrar no histórico antes de deletar, se usuario_id informado
    if (usuario_id) {
      try {
        await this.statusHistoricoRepository.create({
          os_id: id,
          status_anterior: osAtual.status_fluxo,
          status_novo: osAtual.status_fluxo,
          usuario_id,
          motivo: 'OS deletada',
          observacoes: 'Ordem de serviço removida do sistema'
        });
      } catch (error) {
        // Em ambiente de testes, não bloquear a exclusão por falha no histórico.
        // Caso queira exigir histórico sempre, configure AUDIT_REQUIRE_USER=true no .env
        if (process.env.AUDIT_REQUIRE_USER === 'true') {
          throw new Error('Não foi possível criar o histórico de status.');
        }
        console.error('Erro ao criar histórico de status (soft delete):', error);
      }
    }

    return this.repository.softDelete(id);
  }

  /**
   * Obtém próximos status possíveis para uma OS
   */
  async getProximosStatusPossiveis(os_id: string): Promise<StatusOS[]> {
    const os = await this.repository.findById(os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    return this.TRANSICOES_VALIDAS[os.status_fluxo] || [];
  }

  /**
   * Valida se uma transição é possível (método público)
   */
  validarTransicaoStatus(status_atual: StatusOS, novo_status: StatusOS): TransitionValidation {
    return this.validarTransicao(status_atual, novo_status);
  }
}