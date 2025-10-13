import { ComunicacaoRepository } from './comunicacao.repository.js';
import type { 
  ComunicacaoHistorico, 
  CreateComunicacaoRequest, 
  UpdateComunicacaoRequest,
  ComunicacaoFilters,
  ComunicacaoResponse,
  ComunicacaoStats,
  AgenteIARequest,
  AgenteIAResponse,
  ClienteWhatsAppInfo,
  OSStatusInfo,
  ComunicacaoAggregate
} from './comunicacao.types.js';

export class ComunicacaoService {
  private comunicacaoRepository: ComunicacaoRepository;

  constructor() {
    this.comunicacaoRepository = new ComunicacaoRepository();
  }

  async criarComunicacao(comunicacaoData: CreateComunicacaoRequest): Promise<ComunicacaoHistorico> {
    try {
      // Validações básicas
      if (!comunicacaoData.conteudo?.trim()) {
        throw new Error('Conteúdo da comunicação é obrigatório');
      }

      if (!comunicacaoData.canal) {
        throw new Error('Canal de comunicação é obrigatório');
      }

      if (!comunicacaoData.tipo_interacao) {
        throw new Error('Tipo de interação é obrigatório');
      }

      // Validar se cliente_id ou ordem_servico_id foi fornecido
      if (!comunicacaoData.cliente_id && !comunicacaoData.ordem_servico_id) {
        throw new Error('Cliente ID ou Ordem de Serviço ID deve ser fornecido');
      }

      // Processar metadados se fornecidos
      if (comunicacaoData.metadados) {
        try {
          JSON.stringify(comunicacaoData.metadados);
        } catch (error) {
          throw new Error('Metadados devem ser um objeto JSON válido');
        }
      }

      return await this.comunicacaoRepository.create(comunicacaoData);
    } catch (error) {
      console.error('Erro no serviço ao criar comunicação:', error);
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<ComunicacaoHistorico | null> {
    try {
      if (!id?.trim()) {
        throw new Error('ID da comunicação é obrigatório');
      }

      return await this.comunicacaoRepository.findById(id);
    } catch (error) {
      console.error('Erro no serviço ao buscar comunicação por ID:', error);
      throw error;
    }
  }

  async listarComunicacoes(
    filters: ComunicacaoFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ComunicacaoResponse> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) {
        throw new Error('Página deve ser maior que 0');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('Limite deve estar entre 1 e 100');
      }

      // Validar datas se fornecidas
      if (filters.data_inicio && filters.data_fim) {
        const inicio = new Date(filters.data_inicio);
        const fim = new Date(filters.data_fim);
        
        if (inicio > fim) {
          throw new Error('Data de início deve ser anterior à data de fim');
        }
      }

      return await this.comunicacaoRepository.findAll(filters, page, limit);
    } catch (error) {
      console.error('Erro no serviço ao listar comunicações:', error);
      throw error;
    }
  }

  async atualizarComunicacao(id: string, updateData: UpdateComunicacaoRequest): Promise<ComunicacaoHistorico> {
    try {
      if (!id?.trim()) {
        throw new Error('ID da comunicação é obrigatório');
      }

      // Verificar se a comunicação existe
      const comunicacaoExistente = await this.comunicacaoRepository.findById(id);
      if (!comunicacaoExistente) {
        throw new Error('Comunicação não encontrada');
      }

      // Validar metadados se fornecidos
      if (updateData.metadados) {
        try {
          JSON.stringify(updateData.metadados);
        } catch (error) {
          throw new Error('Metadados devem ser um objeto JSON válido');
        }
      }

      return await this.comunicacaoRepository.update(id, updateData);
    } catch (error) {
      console.error('Erro no serviço ao atualizar comunicação:', error);
      throw error;
    }
  }

  async marcarComoLida(id: string): Promise<ComunicacaoHistorico> {
    try {
      if (!id?.trim()) {
        throw new Error('ID da comunicação é obrigatório');
      }

      return await this.comunicacaoRepository.markAsRead(id);
    } catch (error) {
      console.error('Erro no serviço ao marcar como lida:', error);
      throw error;
    }
  }

  async buscarPorCliente(clienteId: string, limit: number = 50): Promise<ComunicacaoHistorico[]> {
    try {
      if (!clienteId?.trim()) {
        throw new Error('ID do cliente é obrigatório');
      }

      if (limit < 1 || limit > 200) {
        throw new Error('Limite deve estar entre 1 e 200');
      }

      return await this.comunicacaoRepository.findByClienteId(clienteId, limit);
    } catch (error) {
      console.error('Erro no serviço ao buscar comunicações por cliente:', error);
      throw error;
    }
  }

  async buscarPorOS(osId: string): Promise<ComunicacaoHistorico[]> {
    try {
      if (!osId?.trim()) {
        throw new Error('ID da ordem de serviço é obrigatório');
      }

      return await this.comunicacaoRepository.findByOSId(osId);
    } catch (error) {
      console.error('Erro no serviço ao buscar comunicações por OS:', error);
      throw error;
    }
  }

  async buscarNaoLidas(): Promise<ComunicacaoHistorico[]> {
    try {
      return await this.comunicacaoRepository.findUnread();
    } catch (error) {
      console.error('Erro no serviço ao buscar comunicações não lidas:', error);
      throw error;
    }
  }

  async obterEstatisticas(): Promise<ComunicacaoStats> {
    try {
      return await this.comunicacaoRepository.getStats();
    } catch (error) {
      console.error('Erro no serviço ao obter estatísticas:', error);
      throw error;
    }
  }

  // Métodos específicos para IA
  async processarSolicitacaoIA(request: AgenteIARequest): Promise<AgenteIAResponse> {
    try {
      // Validar entrada
      if (!request.numero_whatsapp?.trim()) {
        throw new Error('Número do WhatsApp é obrigatório');
      }

      if (!request.mensagem?.trim()) {
        throw new Error('Mensagem é obrigatória');
      }

      // Buscar informações do cliente
      const clienteInfo = await this.comunicacaoRepository.findClienteByWhatsApp(request.numero_whatsapp);
      
      if (!clienteInfo) {
        return {
          sucesso: false,
          mensagem: 'Cliente não encontrado. Por favor, verifique se o número está correto ou entre em contato conosco.',
          dados_cliente: null,
          os_relacionadas: [],
          sugestoes_resposta: [
            'Verificar se o número está cadastrado no sistema',
            'Solicitar dados para cadastro do cliente',
            'Encaminhar para atendimento humano'
          ]
        };
      }

      // Buscar OS ativas do cliente
      const osAtivas = await this.comunicacaoRepository.getClienteOSAtivas(clienteInfo.cliente_id);

      // Analisar a mensagem e gerar resposta contextual
      const respostaIA = await this.analisarMensagemIA(request.mensagem, clienteInfo, osAtivas);

      // Registrar a interação
      await this.criarComunicacao({
        cliente_id: clienteInfo.cliente_id,
        canal: 'whatsapp',
        tipo_interacao: 'recebida',
        conteudo: request.mensagem,
        remetente: request.numero_whatsapp,
        agente_ia: true,
        metadados: {
          processamento_ia: true,
          timestamp_processamento: new Date().toISOString(),
          contexto_cliente: clienteInfo,
          os_ativas: osAtivas.length
        }
      });

      return {
        sucesso: true,
        mensagem: respostaIA.mensagem,
        dados_cliente: clienteInfo,
        os_relacionadas: osAtivas,
        sugestoes_resposta: respostaIA.sugestoes,
        requer_atendimento_humano: respostaIA.requerAtendimentoHumano
      };
    } catch (error) {
      console.error('Erro no serviço ao processar solicitação IA:', error);
      return {
        sucesso: false,
        mensagem: 'Ocorreu um erro interno. Por favor, tente novamente ou entre em contato conosco.',
        dados_cliente: null,
        os_relacionadas: [],
        sugestoes_resposta: ['Encaminhar para atendimento humano']
      };
    }
  }

  private async analisarMensagemIA(
    mensagem: string, 
    cliente: ClienteWhatsAppInfo, 
    osAtivas: OSStatusInfo[]
  ): Promise<{
    mensagem: string;
    sugestoes: string[];
    requerAtendimentoHumano: boolean;
  }> {
    const mensagemLower = mensagem.toLowerCase();
    
    // Palavras-chave para diferentes tipos de consulta
    const palavrasStatus = ['status', 'andamento', 'situação', 'como está', 'quando fica'];
    const palavrasOrcamento = ['orçamento', 'preço', 'valor', 'custo', 'quanto'];
    const palavrasUrgente = ['urgente', 'emergência', 'rápido', 'pressa'];
    const palavrasReclamacao = ['problema', 'reclamação', 'insatisfeito', 'ruim'];

    let mensagemResposta = `Olá ${cliente.nome}! `;
    let sugestoes: string[] = [];
    let requerAtendimentoHumano = false;

    // Verificar se há OS ativas
    if (osAtivas.length === 0) {
      mensagemResposta += 'Não encontrei ordens de serviço ativas em seu nome no momento. ';
      sugestoes.push('Verificar histórico de serviços');
      sugestoes.push('Criar nova ordem de serviço');
    } else if (osAtivas.length === 1) {
      const os = osAtivas[0];
      mensagemResposta += `Sobre seu ${os.dispositivo_tipo} ${os.dispositivo_marca} (OS ${os.numero}): `;
      
      if (palavrasStatus.some(palavra => mensagemLower.includes(palavra))) {
        mensagemResposta += `O status atual é "${os.status_atual}". `;
        if (os.data_prevista) {
          mensagemResposta += `Previsão de conclusão: ${new Date(os.data_prevista).toLocaleDateString('pt-BR')}. `;
        }
        if (os.tecnico_nome) {
          mensagemResposta += `Técnico responsável: ${os.tecnico_nome}. `;
        }
      }
      
      if (palavrasOrcamento.some(palavra => mensagemLower.includes(palavra))) {
        if (os.valor_orcamento) {
          mensagemResposta += `Valor do orçamento: R$ ${os.valor_orcamento}. `;
        } else {
          mensagemResposta += 'O orçamento ainda está sendo preparado. ';
          requerAtendimentoHumano = true;
        }
      }
    } else {
      mensagemResposta += `Você possui ${osAtivas.length} ordens de serviço ativas. `;
      sugestoes.push('Listar todas as OS ativas');
    }

    // Verificar urgência ou reclamação
    if (palavrasUrgente.some(palavra => mensagemLower.includes(palavra)) ||
        palavrasReclamacao.some(palavra => mensagemLower.includes(palavra))) {
      requerAtendimentoHumano = true;
      mensagemResposta += 'Vou encaminhar sua solicitação para nosso atendimento especializado. ';
    }

    // Adicionar sugestões padrão
    if (!requerAtendimentoHumano) {
      sugestoes.push('Consultar status detalhado');
      sugestoes.push('Falar com técnico responsável');
      sugestoes.push('Agendar retirada');
    }

    mensagemResposta += 'Em que mais posso ajudá-lo?';

    return {
      mensagem: mensagemResposta,
      sugestoes,
      requerAtendimentoHumano
    };
  }

  async buscarClientePorWhatsApp(numeroWhatsApp: string): Promise<ClienteWhatsAppInfo | null> {
    try {
      if (!numeroWhatsApp?.trim()) {
        throw new Error('Número do WhatsApp é obrigatório');
      }

      return await this.comunicacaoRepository.findClienteByWhatsApp(numeroWhatsApp);
    } catch (error) {
      console.error('Erro no serviço ao buscar cliente por WhatsApp:', error);
      throw error;
    }
  }

  async obterStatusOS(osId: string): Promise<OSStatusInfo | null> {
    try {
      if (!osId?.trim()) {
        throw new Error('ID da ordem de serviço é obrigatório');
      }

      return await this.comunicacaoRepository.getOSStatus(osId);
    } catch (error) {
      console.error('Erro no serviço ao obter status da OS:', error);
      throw error;
    }
  }

  async obterOSAtivasCliente(clienteId: string): Promise<OSStatusInfo[]> {
    try {
      if (!clienteId?.trim()) {
        throw new Error('ID do cliente é obrigatório');
      }

      return await this.comunicacaoRepository.getClienteOSAtivas(clienteId);
    } catch (error) {
      console.error('Erro no serviço ao obter OS ativas do cliente:', error);
      throw error;
    }
  }

  async obterAgregadoComunicacao(): Promise<ComunicacaoAggregate[]> {
    try {
      return await this.comunicacaoRepository.getComunicacaoAggregate();
    } catch (error) {
      console.error('Erro no serviço ao obter agregado de comunicação:', error);
      throw error;
    }
  }

  // Método para integração com WhatsApp
  async processarMensagemWhatsApp(
    numeroRemetente: string,
    conteudo: string,
    metadados?: any
  ): Promise<AgenteIAResponse> {
    try {
      const request: AgenteIARequest = {
        numero_whatsapp: numeroRemetente,
        mensagem: conteudo,
        metadados
      };

      return await this.processarSolicitacaoIA(request);
    } catch (error) {
      console.error('Erro no serviço ao processar mensagem WhatsApp:', error);
      throw error;
    }
  }
}