import { type Request, type Response } from 'express';
import { MensagemService } from './mensagem.service.js';
import type { 
  MensagemFilters, 
  CreateMensagemRequest, 
  UpdateMensagemRequest,
  EnviarMensagemRequest,
  MarcarComoLidaRequest
} from './mensagem.types.js';

export class MensagemController {
  private service = new MensagemService();

  // GET /api/mensagens
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: MensagemFilters = {
        conversa_id: req.query.conversa_id as string,
        remetente_tipo: req.query.remetente_tipo as 'cliente' | 'agente' | 'sistema',
        remetente_id: req.query.remetente_id as string,
        tipo_conteudo: req.query.tipo_conteudo as 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao',
        status_leitura: req.query.status_leitura as 'enviada' | 'entregue' | 'lida',
        busca_conteudo: req.query.busca_conteudo as string,
        data_inicio: req.query.data_inicio as string,
        data_fim: req.query.data_fim as string,
        apenas_nao_lidas: req.query.apenas_nao_lidas === 'true',
        incluir_respostas: req.query.incluir_respostas !== 'false',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        orderBy: (req.query.orderBy as string) || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof MensagemFilters];
        if (value === undefined || value === null || value === '') {
          delete filters[key as keyof MensagemFilters];
        }
      });

      const result = await this.service.findAll(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao listar mensagens', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/:id
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const mensagem = await this.service.findById(id);
      res.json(mensagem);
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Mensagem não encontrada', 
          details: error.message 
        });
      } else {
        res.status(400).json({ 
          error: 'Erro ao buscar mensagem', 
          details: error.message 
        });
      }
    }
  };

  // GET /api/mensagens/conversa/:conversaId
  findByConversaId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversaId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const mensagens = await this.service.findByConversaId(conversaId, limit);
      res.json({
        mensagens,
        total: mensagens.length,
        conversa_id: conversaId
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar mensagens da conversa', 
        details: error.message 
      });
    }
  };

  // POST /api/mensagens
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateMensagemRequest = req.body;
      const mensagem = await this.service.create(data);
      res.status(201).json(mensagem);
    } catch (error: any) {
      if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.message 
        });
      } else if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Conversa não encontrada', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // POST /api/mensagens/enviar
  enviarMensagem = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: EnviarMensagemRequest = req.body;
      const mensagem = await this.service.enviarMensagem(data);
      res.status(201).json(mensagem);
    } catch (error: any) {
      if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.message 
        });
      } else if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Conversa não encontrada', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // PATCH /api/mensagens/:id
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateMensagemRequest = req.body;
      const mensagem = await this.service.update(id, data);
      res.json(mensagem);
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Mensagem não encontrada', 
          details: error.message 
        });
      } else if (error.message.includes('inválido')) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // PATCH /api/mensagens/:id/lida
  marcarComoLida = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: MarcarComoLidaRequest = req.body;
      const mensagem = await this.service.marcarComoLida(id, data);
      res.json(mensagem);
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Mensagem não encontrada', 
          details: error.message 
        });
      } else if (error.message.includes('já está marcada')) {
        res.status(400).json({ 
          error: 'Mensagem já lida', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // PATCH /api/mensagens/conversa/:conversaId/marcar-todas-lidas
  marcarTodasComoLidas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversaId } = req.params;
      await this.service.marcarTodasComoLidas(conversaId);
      res.json({ 
        success: true, 
        message: 'Todas as mensagens foram marcadas como lidas' 
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Conversa não encontrada', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // DELETE /api/mensagens/:id
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          error: 'Mensagem não encontrada', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        });
      }
    }
  };

  // GET /api/mensagens/nao-lidas
  buscarNaoLidas = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversaId = req.query.conversa_id as string;
      const mensagens = await this.service.buscarNaoLidas(conversaId);
      res.json({
        mensagens,
        total: mensagens.length
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar mensagens não lidas', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/nao-lidas/count
  countNaoLidas = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversaId = req.query.conversa_id as string;
      const count = await this.service.countNaoLidas(conversaId);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao contar mensagens não lidas', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/conversa/:conversaId/ultima
  getUltimaMensagem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversaId } = req.params;
      const mensagem = await this.service.getUltimaMensagem(conversaId);
      
      if (!mensagem) {
        res.status(404).json({ 
          error: 'Nenhuma mensagem encontrada para esta conversa' 
        });
        return;
      }

      res.json(mensagem);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar última mensagem', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/stats
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar estatísticas', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/buscar
  buscarPorConteudo = async (req: Request, res: Response): Promise<void> => {
    try {
      const termo = req.query.termo as string;
      const conversaId = req.query.conversa_id as string;
      
      if (!termo) {
        res.status(400).json({ 
          error: 'Parâmetro "termo" é obrigatório' 
        });
        return;
      }

      const mensagens = await this.service.buscarPorConteudo(termo, conversaId);
      res.json({
        mensagens,
        total: mensagens.length,
        termo_busca: termo
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar mensagens', 
        details: error.message 
      });
    }
  };

  // GET /api/mensagens/tipo/:tipo
  buscarPorTipo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipo } = req.params;
      const conversaId = req.query.conversa_id as string;
      
      const tiposValidos = ['texto', 'imagem', 'documento', 'audio', 'video', 'localizacao'];
      if (!tiposValidos.includes(tipo)) {
        res.status(400).json({ 
          error: 'Tipo de conteúdo inválido',
          tipos_validos: tiposValidos
        });
        return;
      }

      const mensagens = await this.service.buscarPorTipo(
        tipo as 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao', 
        conversaId
      );
      
      res.json({
        mensagens,
        total: mensagens.length,
        tipo_conteudo: tipo
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar mensagens por tipo', 
        details: error.message 
      });
    }
  };
}