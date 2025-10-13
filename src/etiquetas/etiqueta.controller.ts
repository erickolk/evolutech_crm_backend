import { type Request, type Response } from 'express';
import { EtiquetaService } from './etiqueta.service.js';
import type { 
  CreateEtiquetaRequest, 
  UpdateEtiquetaRequest, 
  EtiquetaFilters,
  AplicarEtiquetaRequest,
  RemoverEtiquetaRequest,
  ReorganizarEtiquetasRequest
} from './etiqueta.types.js';

export class EtiquetaController {
  private etiquetaService: EtiquetaService;

  constructor() {
    this.etiquetaService = new EtiquetaService();
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: EtiquetaFilters = {
        nome: req.query.nome as string,
        categoria: req.query.categoria as string,
        ativa: req.query.ativa ? req.query.ativa === 'true' : undefined,
        uso_automatico: req.query.uso_automatico ? req.query.uso_automatico === 'true' : undefined,
        cor: req.query.cor as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        orderBy: req.query.orderBy as string,
        orderDirection: req.query.orderDirection as 'asc' | 'desc'
      };

      const result = await this.etiquetaService.findAll(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total: result.total,
          totalPages: Math.ceil(result.total / (filters.limit || 50))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const etiqueta = await this.etiquetaService.findById(id);

      if (!etiqueta) {
        res.status(404).json({
          success: false,
          message: 'Etiqueta não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: etiqueta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async findByCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.params;
      const etiquetas = await this.etiquetaService.findByCategoria(categoria);

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEtiquetaRequest = req.body;
      const etiqueta = await this.etiquetaService.create(data);

      res.status(201).json({
        success: true,
        message: 'Etiqueta criada com sucesso',
        data: etiqueta
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateEtiquetaRequest = req.body;
      
      const etiqueta = await this.etiquetaService.update(id, data);

      res.json({
        success: true,
        message: 'Etiqueta atualizada com sucesso',
        data: etiqueta
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Etiqueta não encontrada') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.etiquetaService.delete(id);

      res.json({
        success: true,
        message: 'Etiqueta excluída com sucesso'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Etiqueta não encontrada') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }

  async reorganizar(req: Request, res: Response): Promise<void> {
    try {
      const data: ReorganizarEtiquetasRequest = req.body;
      await this.etiquetaService.reorganizar(data);

      res.json({
        success: true,
        message: 'Etiquetas reorganizadas com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Endpoints para aplicação de etiquetas em conversas
  async aplicarEtiquetaConversa(req: Request, res: Response): Promise<void> {
    try {
      const { conversaId } = req.params;
      const data: AplicarEtiquetaRequest = req.body;
      
      await this.etiquetaService.aplicarEtiquetaConversa(conversaId, data);

      res.json({
        success: true,
        message: 'Etiqueta aplicada à conversa com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async removerEtiquetaConversa(req: Request, res: Response): Promise<void> {
    try {
      const { conversaId } = req.params;
      const data: RemoverEtiquetaRequest = req.body;
      
      await this.etiquetaService.removerEtiquetaConversa(conversaId, data);

      res.json({
        success: true,
        message: 'Etiqueta removida da conversa com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async buscarEtiquetasConversa(req: Request, res: Response): Promise<void> {
    try {
      const { conversaId } = req.params;
      const etiquetas = await this.etiquetaService.buscarEtiquetasConversa(conversaId);

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Endpoints para aplicação de etiquetas em mensagens
  async aplicarEtiquetaMensagem(req: Request, res: Response): Promise<void> {
    try {
      const { mensagemId } = req.params;
      const data: AplicarEtiquetaRequest = req.body;
      
      await this.etiquetaService.aplicarEtiquetaMensagem(mensagemId, data);

      res.json({
        success: true,
        message: 'Etiqueta aplicada à mensagem com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async removerEtiquetaMensagem(req: Request, res: Response): Promise<void> {
    try {
      const { mensagemId } = req.params;
      const data: RemoverEtiquetaRequest = req.body;
      
      await this.etiquetaService.removerEtiquetaMensagem(mensagemId, data);

      res.json({
        success: true,
        message: 'Etiqueta removida da mensagem com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async buscarEtiquetasMensagem(req: Request, res: Response): Promise<void> {
    try {
      const { mensagemId } = req.params;
      const etiquetas = await this.etiquetaService.buscarEtiquetasMensagem(mensagemId);

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Endpoints para etiquetas automáticas
  async buscarEtiquetasAutomaticas(req: Request, res: Response): Promise<void> {
    try {
      const etiquetas = await this.etiquetaService.buscarEtiquetasAutomaticas();

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async aplicarEtiquetasAutomaticas(req: Request, res: Response): Promise<void> {
    try {
      const { conteudo, tipo } = req.body;

      if (!conteudo || !tipo) {
        res.status(400).json({
          success: false,
          message: 'Conteúdo e tipo são obrigatórios'
        });
        return;
      }

      if (!['conversa', 'mensagem'].includes(tipo)) {
        res.status(400).json({
          success: false,
          message: 'Tipo deve ser "conversa" ou "mensagem"'
        });
        return;
      }

      const matches = await this.etiquetaService.aplicarEtiquetasAutomaticas(conteudo, tipo);

      res.json({
        success: true,
        data: matches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.etiquetaService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}