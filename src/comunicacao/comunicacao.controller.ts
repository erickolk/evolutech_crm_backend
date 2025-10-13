import type { Request, Response } from 'express';
import { ComunicacaoService } from './comunicacao.service.js';
import type { 
  CreateComunicacaoRequest, 
  UpdateComunicacaoRequest,
  ComunicacaoFilters,
  AgenteIARequest
} from './comunicacao.types.js';

export class ComunicacaoController {
  private comunicacaoService: ComunicacaoService;

  constructor() {
    this.comunicacaoService = new ComunicacaoService();
  }

  // Criar nova comunicação
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const comunicacaoData: CreateComunicacaoRequest = req.body;
      const comunicacao = await this.comunicacaoService.criarComunicacao(comunicacaoData);
      
      res.status(201).json({
        sucesso: true,
        dados: comunicacao,
        mensagem: 'Comunicação criada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro no controller ao criar comunicação:', error);
      res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar comunicação por ID
  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comunicacao = await this.comunicacaoService.buscarPorId(id);
      
      if (!comunicacao) {
        res.status(404).json({
          sucesso: false,
          erro: 'Comunicação não encontrada'
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: comunicacao
      });
    } catch (error: any) {
      console.error('Erro no controller ao buscar comunicação por ID:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Listar comunicações com filtros e paginação
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const {
        cliente_id,
        ordem_servico_id,
        canal,
        tipo_interacao,
        agente_ia,
        status_leitura,
        data_inicio,
        data_fim,
        search,
        page = '1',
        limit = '20'
      } = req.query;

      const filters: ComunicacaoFilters = {};
      
      if (cliente_id) filters.cliente_id = cliente_id as string;
      if (ordem_servico_id) filters.ordem_servico_id = ordem_servico_id as string;
      if (canal) filters.canal = canal as any;
      if (tipo_interacao) filters.tipo_interacao = tipo_interacao as any;
      if (agente_ia !== undefined) filters.agente_ia = agente_ia === 'true';
      if (status_leitura) filters.status_leitura = status_leitura as any;
      if (data_inicio) filters.data_inicio = data_inicio as string;
      if (data_fim) filters.data_fim = data_fim as string;
      if (search) filters.search = search as string;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const resultado = await this.comunicacaoService.listarComunicacoes(filters, pageNum, limitNum);
      
      res.json({
        sucesso: true,
        dados: resultado
      });
    } catch (error: any) {
      console.error('Erro no controller ao listar comunicações:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Atualizar comunicação
  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateComunicacaoRequest = req.body;
      
      const comunicacao = await this.comunicacaoService.atualizarComunicacao(id, updateData);
      
      res.json({
        sucesso: true,
        dados: comunicacao,
        mensagem: 'Comunicação atualizada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro no controller ao atualizar comunicação:', error);
      res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Marcar como lida
  async marcarComoLida(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comunicacao = await this.comunicacaoService.marcarComoLida(id);
      
      res.json({
        sucesso: true,
        dados: comunicacao,
        mensagem: 'Comunicação marcada como lida'
      });
    } catch (error: any) {
      console.error('Erro no controller ao marcar como lida:', error);
      res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar por cliente
  async buscarPorCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId } = req.params;
      const { limit = '50' } = req.query;
      
      const limitNum = parseInt(limit as string, 10);
      const comunicacoes = await this.comunicacaoService.buscarPorCliente(clienteId, limitNum);
      
      res.json({
        sucesso: true,
        dados: comunicacoes
      });
    } catch (error: any) {
      console.error('Erro no controller ao buscar por cliente:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar por OS
  async buscarPorOS(req: Request, res: Response): Promise<void> {
    try {
      const { osId } = req.params;
      const comunicacoes = await this.comunicacaoService.buscarPorOS(osId);
      
      res.json({
        sucesso: true,
        dados: comunicacoes
      });
    } catch (error: any) {
      console.error('Erro no controller ao buscar por OS:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar não lidas
  async buscarNaoLidas(req: Request, res: Response): Promise<void> {
    try {
      const comunicacoes = await this.comunicacaoService.buscarNaoLidas();
      
      res.json({
        sucesso: true,
        dados: comunicacoes
      });
    } catch (error: any) {
      console.error('Erro no controller ao buscar não lidas:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas
  async obterEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.comunicacaoService.obterEstatisticas();
      
      res.json({
        sucesso: true,
        dados: stats
      });
    } catch (error: any) {
      console.error('Erro no controller ao obter estatísticas:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Processar solicitação IA
  async processarIA(req: Request, res: Response): Promise<void> {
    try {
      const request: AgenteIARequest = req.body;
      const resposta = await this.comunicacaoService.processarSolicitacaoIA(request);
      
      res.json({
        sucesso: true,
        dados: resposta
      });
    } catch (error: any) {
      console.error('Erro no controller ao processar IA:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cliente por WhatsApp
  async buscarClientePorWhatsApp(req: Request, res: Response): Promise<void> {
    try {
      const { numero } = req.params;
      const cliente = await this.comunicacaoService.buscarClientePorWhatsApp(numero);
      
      if (!cliente) {
        res.status(404).json({
          sucesso: false,
          erro: 'Cliente não encontrado'
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: cliente
      });
    } catch (error: any) {
      console.error('Erro no controller ao buscar cliente por WhatsApp:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Obter status da OS
  async obterStatusOS(req: Request, res: Response): Promise<void> {
    try {
      const { osId } = req.params;
      const status = await this.comunicacaoService.obterStatusOS(osId);
      
      if (!status) {
        res.status(404).json({
          sucesso: false,
          erro: 'Ordem de serviço não encontrada'
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: status
      });
    } catch (error: any) {
      console.error('Erro no controller ao obter status da OS:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Obter OS ativas do cliente
  async obterOSAtivasCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId } = req.params;
      const osAtivas = await this.comunicacaoService.obterOSAtivasCliente(clienteId);
      
      res.json({
        sucesso: true,
        dados: osAtivas
      });
    } catch (error: any) {
      console.error('Erro no controller ao obter OS ativas do cliente:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Obter agregado de comunicação
  async obterAgregado(req: Request, res: Response): Promise<void> {
    try {
      const agregado = await this.comunicacaoService.obterAgregadoComunicacao();
      
      res.json({
        sucesso: true,
        dados: agregado
      });
    } catch (error: any) {
      console.error('Erro no controller ao obter agregado:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Processar mensagem WhatsApp (webhook)
  async processarMensagemWhatsApp(req: Request, res: Response): Promise<void> {
    try {
      const { numero_remetente, conteudo, metadados } = req.body;
      
      if (!numero_remetente || !conteudo) {
        res.status(400).json({
          sucesso: false,
          erro: 'Número do remetente e conteúdo são obrigatórios'
        });
        return;
      }

      const resposta = await this.comunicacaoService.processarMensagemWhatsApp(
        numero_remetente,
        conteudo,
        metadados
      );
      
      res.json({
        sucesso: true,
        dados: resposta
      });
    } catch (error: any) {
      console.error('Erro no controller ao processar mensagem WhatsApp:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Marcar múltiplas como lidas
  async marcarMultiplasComoLidas(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: 'Lista de IDs é obrigatória'
        });
        return;
      }

      const resultados = await Promise.allSettled(
        ids.map(id => this.comunicacaoService.marcarComoLida(id))
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;

      res.json({
        sucesso: true,
        dados: {
          total_processados: ids.length,
          sucessos,
          erros
        },
        mensagem: `${sucessos} comunicações marcadas como lidas`
      });
    } catch (error: any) {
      console.error('Erro no controller ao marcar múltiplas como lidas:', error);
      res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno do servidor'
      });
    }
  }
}