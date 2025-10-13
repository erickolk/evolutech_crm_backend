import { type Request, type Response } from 'express';
import { ConversaService } from './conversa.service.js';
import type { 
  CreateConversaRequest, 
  UpdateConversaRequest, 
  ConversaFilters,
  AtribuirAgenteRequest,
  FecharConversaRequest
} from './conversa.types.js';

export class ConversaController {
  private service = new ConversaService();

  async findAll(req: Request, res: Response) {
    try {
      const filters: ConversaFilters = {
        cliente_id: req.query.cliente_id as string,
        agente_id: req.query.agente_id as string,
        status: req.query.status as any,
        canal: req.query.canal as any,
        prioridade: req.query.prioridade as any,
        etiqueta_id: req.query.etiqueta_id as string,
        apenas_nao_lidas: req.query.apenas_nao_lidas === 'true',
        apenas_sem_agente: req.query.apenas_sem_agente === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        orderBy: req.query.orderBy as any,
        orderDirection: req.query.orderDirection as any
      };

      // Filtros de data
      if (req.query.data_inicio) {
        filters.data_inicio = new Date(req.query.data_inicio as string);
      }
      if (req.query.data_fim) {
        filters.data_fim = new Date(req.query.data_fim as string);
      }

      const result = await this.service.findAll(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const conversa = await this.service.findById(id);
      res.status(200).json({
        success: true,
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async findByClienteId(req: Request, res: Response) {
    try {
      const { clienteId } = req.params;
      const conversas = await this.service.findByClienteId(clienteId);
      res.status(200).json({
        success: true,
        data: conversas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async findByAgenteId(req: Request, res: Response) {
    try {
      const { agenteId } = req.params;
      const conversas = await this.service.findByAgenteId(agenteId);
      res.status(200).json({
        success: true,
        data: conversas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: CreateConversaRequest = req.body;
      const conversa = await this.service.create(data);
      res.status(201).json({
        success: true,
        message: 'Conversa criada com sucesso',
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateConversaRequest = req.body;
      const conversa = await this.service.update(id, data);
      res.status(200).json({
        success: true,
        message: 'Conversa atualizada com sucesso',
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async atribuirAgente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: AtribuirAgenteRequest = req.body;
      const conversa = await this.service.atribuirAgente(id, data);
      res.status(200).json({
        success: true,
        message: 'Agente atribuído com sucesso',
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else if (error.message.includes('obrigatório') || error.message.includes('fechada')) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async fechar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: FecharConversaRequest = req.body;
      
      // Pegar o ID do usuário do token (quando autenticação estiver implementada)
      // Por enquanto, usar um valor padrão ou do body
      const fechadoPor = req.body.fechado_por || 'sistema';
      
      const conversa = await this.service.fechar(id, fechadoPor, data);
      res.status(200).json({
        success: true,
        message: 'Conversa fechada com sucesso',
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else if (error.message.includes('obrigatório') || error.message.includes('fechada')) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async reabrir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const conversa = await this.service.reabrir(id);
      res.status(200).json({
        success: true,
        message: 'Conversa reaberta com sucesso',
        data: conversa
      });
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else if (error.message.includes('fechadas')) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarAbertas(req: Request, res: Response) {
    try {
      const conversas = await this.service.buscarConversasAbertas();
      res.status(200).json({
        success: true,
        data: conversas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarSemAgente(req: Request, res: Response) {
    try {
      const conversas = await this.service.buscarConversasSemAgente();
      res.status(200).json({
        success: true,
        data: conversas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorPrioridade(req: Request, res: Response) {
    try {
      const { prioridade } = req.params;
      
      const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
      if (!prioridadesValidas.includes(prioridade)) {
        return res.status(400).json({
          success: false,
          message: 'Prioridade inválida. Use: baixa, media, alta ou urgente'
        });
      }

      const conversas = await this.service.buscarConversasPorPrioridade(prioridade as any);
      res.status(200).json({
        success: true,
        data: conversas
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}