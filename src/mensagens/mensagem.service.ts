import { MensagemRepository } from './mensagem.repository.js';
import { ConversaRepository } from '../conversas/conversa.repository.js';
import type { 
  Mensagem, 
  CreateMensagemRequest, 
  UpdateMensagemRequest, 
  MensagemFilters,
  MensagemResponse,
  MensagemListResponse,
  MensagemStats,
  EnviarMensagemRequest,
  MarcarComoLidaRequest
} from './mensagem.types.js';

export class MensagemService {
  private repository = new MensagemRepository();
  private conversaRepository = new ConversaRepository();

  async findAll(filters: MensagemFilters = {}): Promise<MensagemListResponse> {
    try {
      const { data, total } = await this.repository.findAll(filters);
      
      // Buscar informações da conversa se filtrado por conversa_id
      let conversa_info = null;
      if (filters.conversa_id) {
        const conversa = await this.conversaRepository.findById(filters.conversa_id);
        if (conversa) {
          conversa_info = {
            id: conversa.id,
            cliente_nome: conversa.cliente?.nome || 'Cliente não encontrado',
            agente_nome: conversa.agente?.nome,
            status: conversa.status
          };
        }
      }

      return {
        mensagens: data,
        total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        conversa_info: conversa_info || {
          id: '',
          cliente_nome: '',
          status: ''
        }
      };
    } catch (error: any) {
      throw new Error(`Erro ao listar mensagens: ${error.message}`);
    }
  }

  async findById(id: string): Promise<MensagemResponse> {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    try {
      const mensagem = await this.repository.findById(id);
      
      if (!mensagem) {
        throw new Error('Mensagem não encontrada');
      }

      return mensagem;
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagem: ${error.message}`);
    }
  }

  async findByConversaId(conversaId: string, limit?: number): Promise<MensagemResponse[]> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      return await this.repository.findByConversaId(conversaId, limit);
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagens da conversa: ${error.message}`);
    }
  }

  async enviarMensagem(data: EnviarMensagemRequest): Promise<Mensagem> {
    // Validações
    if (!data.conversa_id) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!data.conteudo || data.conteudo.trim() === '') {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    if (!data.remetente_nome) {
      throw new Error('Nome do remetente é obrigatório');
    }

    try {
      // Verificar se a conversa existe
      const conversa = await this.conversaRepository.findById(data.conversa_id);
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }

      // Determinar tipo de remetente
      let remetente_tipo: 'cliente' | 'agente' | 'sistema' = 'sistema';
      if (data.remetente_id) {
        // Se tem ID do remetente, é um agente
        remetente_tipo = 'agente';
      } else if (conversa.cliente && data.remetente_nome === conversa.cliente.nome) {
        // Se o nome coincide com o cliente, é o cliente
        remetente_tipo = 'cliente';
      }

      const mensagemData: CreateMensagemRequest = {
        conversa_id: data.conversa_id,
        remetente_tipo,
        remetente_id: data.remetente_id,
        remetente_nome: data.remetente_nome,
        conteudo: data.conteudo.trim(),
        tipo_conteudo: data.tipo_conteudo || 'texto',
        metadata: data.metadata,
        resposta_de: data.resposta_de
      };

      const mensagem = await this.repository.create(mensagemData);

      // Atualizar última atividade da conversa
      await this.conversaRepository.updateUltimaAtividade(
        data.conversa_id, 
        data.conteudo.substring(0, 100)
      );

      // Se a conversa estava fechada e é uma mensagem do cliente, reabrir
      if (conversa.status === 'fechada' && remetente_tipo === 'cliente') {
        await this.conversaRepository.update(data.conversa_id, { status: 'aberta' });
      }

      return mensagem;
    } catch (error: any) {
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }
  }

  async create(data: CreateMensagemRequest): Promise<Mensagem> {
    // Validações
    if (!data.conversa_id) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!data.conteudo || data.conteudo.trim() === '') {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    if (!data.remetente_nome) {
      throw new Error('Nome do remetente é obrigatório');
    }

    const tiposRemetenteValidos = ['cliente', 'agente', 'sistema'];
    if (!tiposRemetenteValidos.includes(data.remetente_tipo)) {
      throw new Error('Tipo de remetente inválido');
    }

    const tiposConteudoValidos = ['texto', 'imagem', 'documento', 'audio', 'video', 'localizacao'];
    if (data.tipo_conteudo && !tiposConteudoValidos.includes(data.tipo_conteudo)) {
      throw new Error('Tipo de conteúdo inválido');
    }

    try {
      // Verificar se a conversa existe
      const conversa = await this.conversaRepository.findById(data.conversa_id);
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }

      const mensagem = await this.repository.create(data);

      // Atualizar última atividade da conversa
      await this.conversaRepository.updateUltimaAtividade(
        data.conversa_id, 
        data.conteudo.substring(0, 100)
      );

      return mensagem;
    } catch (error: any) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }
  }

  async update(id: string, data: UpdateMensagemRequest): Promise<Mensagem> {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    // Validações
    if (data.status_leitura) {
      const statusValidos = ['enviada', 'entregue', 'lida'];
      if (!statusValidos.includes(data.status_leitura)) {
        throw new Error('Status de leitura inválido');
      }
    }

    try {
      // Verificar se a mensagem existe
      const mensagemExistente = await this.repository.findById(id);
      if (!mensagemExistente) {
        throw new Error('Mensagem não encontrada');
      }

      return await this.repository.update(id, data);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar mensagem: ${error.message}`);
    }
  }

  async marcarComoLida(id: string, data?: MarcarComoLidaRequest): Promise<Mensagem> {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    try {
      // Verificar se a mensagem existe
      const mensagemExistente = await this.repository.findById(id);
      if (!mensagemExistente) {
        throw new Error('Mensagem não encontrada');
      }

      // Verificar se já não está lida
      if (mensagemExistente.status_leitura === 'lida') {
        throw new Error('Mensagem já está marcada como lida');
      }

      return await this.repository.marcarComoLida(id);
    } catch (error: any) {
      throw new Error(`Erro ao marcar mensagem como lida: ${error.message}`);
    }
  }

  async marcarTodasComoLidas(conversaId: string): Promise<void> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      // Verificar se a conversa existe
      const conversa = await this.conversaRepository.findById(conversaId);
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }

      await this.repository.marcarTodasComoLidas(conversaId);
    } catch (error: any) {
      throw new Error(`Erro ao marcar todas as mensagens como lidas: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    try {
      // Verificar se a mensagem existe
      const mensagemExistente = await this.repository.findById(id);
      if (!mensagemExistente) {
        throw new Error('Mensagem não encontrada');
      }

      await this.repository.delete(id);
    } catch (error: any) {
      throw new Error(`Erro ao excluir mensagem: ${error.message}`);
    }
  }

  async buscarNaoLidas(conversaId?: string): Promise<MensagemResponse[]> {
    try {
      return await this.repository.findNaoLidas(conversaId);
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagens não lidas: ${error.message}`);
    }
  }

  async countNaoLidas(conversaId?: string): Promise<number> {
    try {
      return await this.repository.countNaoLidas(conversaId);
    } catch (error: any) {
      throw new Error(`Erro ao contar mensagens não lidas: ${error.message}`);
    }
  }

  async getUltimaMensagem(conversaId: string): Promise<Mensagem | null> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      return await this.repository.getUltimaMensagem(conversaId);
    } catch (error: any) {
      throw new Error(`Erro ao buscar última mensagem: ${error.message}`);
    }
  }

  async getStats(): Promise<MensagemStats> {
    try {
      return await this.repository.getStats();
    } catch (error: any) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }

  async buscarPorConteudo(termo: string, conversaId?: string): Promise<MensagemResponse[]> {
    if (!termo || termo.trim() === '') {
      throw new Error('Termo de busca é obrigatório');
    }

    try {
      const filters: MensagemFilters = {
        busca_conteudo: termo.trim(),
        conversa_id: conversaId,
        orderBy: 'created_at',
        orderDirection: 'desc'
      };

      const { data } = await this.repository.findAll(filters);
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagens por conteúdo: ${error.message}`);
    }
  }

  async buscarPorTipo(tipo: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao', conversaId?: string): Promise<MensagemResponse[]> {
    try {
      const filters: MensagemFilters = {
        tipo_conteudo: tipo,
        conversa_id: conversaId,
        orderBy: 'created_at',
        orderDirection: 'desc'
      };

      const { data } = await this.repository.findAll(filters);
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagens por tipo: ${error.message}`);
    }
  }

  async findByWhatsAppMessageId(whatsappMessageId: string): Promise<MensagemResponse | null> {
    if (!whatsappMessageId) {
      throw new Error('ID da mensagem WhatsApp é obrigatório');
    }

    try {
      const { data } = await this.repository.findAll({
        whatsapp_message_id: whatsappMessageId,
        limit: 1
      });

      return data.length > 0 ? data[0] : null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar mensagem por ID WhatsApp: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<void> {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    if (!status) {
      throw new Error('Status é obrigatório');
    }

    try {
      const mensagem = await this.repository.findById(id);
      if (!mensagem) {
        throw new Error('Mensagem não encontrada');
      }

      await this.repository.update(id, {
        metadados: {
          ...mensagem.metadados,
          whatsapp_status: status
        }
      });
    } catch (error: any) {
      throw new Error(`Erro ao atualizar status da mensagem: ${error.message}`);
    }
  }
}