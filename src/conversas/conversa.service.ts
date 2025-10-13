import { ConversaRepository } from './conversa.repository.js';
import type { 
  Conversa, 
  CreateConversaRequest, 
  UpdateConversaRequest, 
  ConversaFilters,
  ConversaResponse,
  ConversaListResponse,
  ConversaStats,
  AtribuirAgenteRequest,
  FecharConversaRequest
} from './conversa.types.js';

export class ConversaService {
  private repository = new ConversaRepository();

  async findAll(filters: ConversaFilters = {}): Promise<ConversaListResponse> {
    try {
      const { data, total } = await this.repository.findAll(filters);
      
      return {
        conversas: data,
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        filtros_aplicados: filters
      };
    } catch (error: any) {
      throw new Error(`Erro ao listar conversas: ${error.message}`);
    }
  }

  async findById(id: string): Promise<ConversaResponse> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      const conversa = await this.repository.findById(id);
      
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }

      return conversa;
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversa: ${error.message}`);
    }
  }

  async findByClienteId(clienteId: string): Promise<ConversaResponse[]> {
    if (!clienteId) {
      throw new Error('ID do cliente é obrigatório');
    }

    try {
      return await this.repository.findByClienteId(clienteId);
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversas do cliente: ${error.message}`);
    }
  }

  async findByAgenteId(agenteId: string): Promise<ConversaResponse[]> {
    if (!agenteId) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      return await this.repository.findByAgenteId(agenteId);
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversas do agente: ${error.message}`);
    }
  }

  async create(data: CreateConversaRequest): Promise<Conversa> {
    // Validações
    if (!data.cliente_id) {
      throw new Error('ID do cliente é obrigatório');
    }

    if (!data.canal) {
      throw new Error('Canal de comunicação é obrigatório');
    }

    const canaisValidos = ['whatsapp', 'telefone', 'presencial', 'email', 'sistema'];
    if (!canaisValidos.includes(data.canal)) {
      throw new Error('Canal de comunicação inválido');
    }

    const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
    if (data.prioridade && !prioridadesValidas.includes(data.prioridade)) {
      throw new Error('Prioridade inválida');
    }

    try {
      return await this.repository.create(data);
    } catch (error: any) {
      throw new Error(`Erro ao criar conversa: ${error.message}`);
    }
  }

  async update(id: string, data: UpdateConversaRequest): Promise<Conversa> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    // Validações
    if (data.status) {
      const statusValidos = ['aberta', 'em_andamento', 'fechada', 'aguardando_cliente', 'aguardando_agente'];
      if (!statusValidos.includes(data.status)) {
        throw new Error('Status inválido');
      }
    }

    if (data.prioridade) {
      const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
      if (!prioridadesValidas.includes(data.prioridade)) {
        throw new Error('Prioridade inválida');
      }
    }

    if (data.satisfacao_cliente !== undefined) {
      if (data.satisfacao_cliente < 1 || data.satisfacao_cliente > 5) {
        throw new Error('Satisfação do cliente deve ser entre 1 e 5');
      }
    }

    try {
      // Verificar se a conversa existe
      const conversaExistente = await this.repository.findById(id);
      if (!conversaExistente) {
        throw new Error('Conversa não encontrada');
      }

      return await this.repository.update(id, data);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar conversa: ${error.message}`);
    }
  }

  async atribuirAgente(id: string, data: AtribuirAgenteRequest): Promise<Conversa> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!data.agente_id) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      // Verificar se a conversa existe
      const conversaExistente = await this.repository.findById(id);
      if (!conversaExistente) {
        throw new Error('Conversa não encontrada');
      }

      // Verificar se a conversa não está fechada
      if (conversaExistente.status === 'fechada') {
        throw new Error('Não é possível atribuir agente a uma conversa fechada');
      }

      return await this.repository.atribuirAgente(id, data.agente_id);
    } catch (error: any) {
      throw new Error(`Erro ao atribuir agente: ${error.message}`);
    }
  }

  async fechar(id: string, fechadoPor: string, data?: FecharConversaRequest): Promise<Conversa> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!fechadoPor) {
      throw new Error('ID do usuário que está fechando é obrigatório');
    }

    // Validar satisfação se fornecida
    if (data?.satisfacao_cliente !== undefined) {
      if (data.satisfacao_cliente < 1 || data.satisfacao_cliente > 5) {
        throw new Error('Satisfação do cliente deve ser entre 1 e 5');
      }
    }

    try {
      // Verificar se a conversa existe
      const conversaExistente = await this.repository.findById(id);
      if (!conversaExistente) {
        throw new Error('Conversa não encontrada');
      }

      // Verificar se a conversa já não está fechada
      if (conversaExistente.status === 'fechada') {
        throw new Error('Conversa já está fechada');
      }

      // Atualizar satisfação se fornecida
      if (data?.satisfacao_cliente) {
        await this.repository.update(id, { satisfacao_cliente: data.satisfacao_cliente });
      }

      const observacoes = data?.observacoes || data?.motivo;
      return await this.repository.fechar(id, fechadoPor, observacoes);
    } catch (error: any) {
      throw new Error(`Erro ao fechar conversa: ${error.message}`);
    }
  }

  async reabrir(id: string): Promise<Conversa> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      // Verificar se a conversa existe
      const conversaExistente = await this.repository.findById(id);
      if (!conversaExistente) {
        throw new Error('Conversa não encontrada');
      }

      // Verificar se a conversa está fechada
      if (conversaExistente.status !== 'fechada') {
        throw new Error('Apenas conversas fechadas podem ser reabertas');
      }

      return await this.repository.update(id, {
        status: 'aberta',
        fechada_em: undefined,
        fechada_por: undefined
      });
    } catch (error: any) {
      throw new Error(`Erro ao reabrir conversa: ${error.message}`);
    }
  }

  async updateUltimaAtividade(id: string, ultimaMensagem?: string): Promise<void> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      await this.repository.updateUltimaAtividade(id, ultimaMensagem);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar última atividade: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      // Verificar se a conversa existe
      const conversaExistente = await this.repository.findById(id);
      if (!conversaExistente) {
        throw new Error('Conversa não encontrada');
      }

      await this.repository.delete(id);
    } catch (error: any) {
      throw new Error(`Erro ao excluir conversa: ${error.message}`);
    }
  }

  async getStats(): Promise<ConversaStats> {
    try {
      return await this.repository.getStats();
    } catch (error: any) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }

  async buscarConversasAbertas(): Promise<ConversaResponse[]> {
    try {
      const { data } = await this.repository.findAll({
        status: 'aberta',
        orderBy: 'created_at',
        orderDirection: 'asc'
      });
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversas abertas: ${error.message}`);
    }
  }

  async buscarConversasSemAgente(): Promise<ConversaResponse[]> {
    try {
      const { data } = await this.repository.findAll({
        apenas_sem_agente: true,
        orderBy: 'created_at',
        orderDirection: 'asc'
      });
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversas sem agente: ${error.message}`);
    }
  }

  async buscarConversasPorPrioridade(prioridade: 'baixa' | 'media' | 'alta' | 'urgente'): Promise<ConversaResponse[]> {
    try {
      const { data } = await this.repository.findAll({
        prioridade,
        orderBy: 'created_at',
        orderDirection: 'asc'
      });
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversas por prioridade: ${error.message}`);
    }
  }

  async findByWhatsAppNumber(whatsappNumero: string): Promise<ConversaResponse | null> {
    if (!whatsappNumero) {
      throw new Error('Número do WhatsApp é obrigatório');
    }

    try {
      const { data } = await this.repository.findAll({
        whatsapp_numero: whatsappNumero,
        status: 'aberta',
        limit: 1
      });

      return data.length > 0 ? data[0] : null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar conversa por número WhatsApp: ${error.message}`);
    }
  }
}