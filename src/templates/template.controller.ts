import { type Request, type Response } from 'express';
import { TemplateService } from './template.service.js';
import type { 
  CreateTemplateRequest, 
  UpdateTemplateRequest,
  TemplateFilters,
  ProcessTemplateRequest
} from './template.types.js';

export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  // Criar novo template
  async criarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateData: CreateTemplateRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
        return;
      }

      const template = await this.templateService.criarTemplate(templateData, userId);

      res.status(201).json({
        success: true,
        message: 'Template criado com sucesso',
        data: template
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Buscar template por ID
  async buscarTemplatePorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      const template = await this.templateService.buscarTemplatePorId(id);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar templates com filtros e paginação
  async listarTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { 
        categoria, 
        ativo, 
        search, 
        page = '1', 
        limit = '10' 
      } = req.query;

      const filters: TemplateFilters = {};
      
      if (categoria) filters.categoria = categoria as any;
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      if (search) filters.search = search as string;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de paginação inválidos'
        });
        return;
      }

      const result = await this.templateService.buscarTemplates(filters, pageNum, limitNum);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar template
  async atualizarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTemplateRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      const template = await this.templateService.atualizarTemplate(id, updateData);

      res.json({
        success: true,
        message: 'Template atualizado com sucesso',
        data: template
      });
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Deletar template
  async deletarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      await this.templateService.deletarTemplate(id);

      res.json({
        success: true,
        message: 'Template deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Buscar templates por categoria
  async buscarTemplatesPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.params;

      if (!categoria) {
        res.status(400).json({
          success: false,
          message: 'Categoria é obrigatória'
        });
        return;
      }

      const templates = await this.templateService.buscarTemplatesPorCategoria(categoria);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Erro ao buscar templates por categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Alternar status ativo/inativo do template
  async alternarStatusTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      const template = await this.templateService.alternarStatusTemplate(id);

      res.json({
        success: true,
        message: `Template ${template.ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: template
      });
    } catch (error) {
      console.error('Erro ao alterar status do template:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Processar template com variáveis
  async processarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const processRequest: ProcessTemplateRequest = req.body;

      if (!processRequest.template_id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      if (!processRequest.variaveis || !Array.isArray(processRequest.variaveis)) {
        res.status(400).json({
          success: false,
          message: 'Variáveis são obrigatórias e devem ser um array'
        });
        return;
      }

      const resultado = await this.templateService.processarTemplate(processRequest);

      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao processar template:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Processar template com variáveis do sistema
  async processarTemplateComSistema(req: Request, res: Response): Promise<void> {
    try {
      const { template_id, system_variables, custom_variables = [] } = req.body;

      if (!template_id) {
        res.status(400).json({
          success: false,
          message: 'ID do template é obrigatório'
        });
        return;
      }

      const resultado = await this.templateService.processarTemplateComVariaveisDoSistema(
        template_id,
        system_variables || {},
        custom_variables
      );

      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao processar template com sistema:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Visualizar template (preview sem salvar)
  async visualizarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { conteudo, variaveis } = req.body;

      if (!conteudo) {
        res.status(400).json({
          success: false,
          message: 'Conteúdo do template é obrigatório'
        });
        return;
      }

      // Criar um template temporário para processamento
      const templateTemp = {
        id: 'temp',
        nome: 'Preview',
        conteudo,
        variaveis: [],
        categoria: 'personalizado' as any,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'temp'
      };

      // Processar com as variáveis fornecidas
      let conteudoProcessado = conteudo;
      const variaveisUtilizadas: string[] = [];
      const variaveisFaltantes: string[] = [];

      if (variaveis && Array.isArray(variaveis)) {
        const variaveisMap = new Map<string, string>();
        variaveis.forEach((v: any) => {
          variaveisMap.set(v.nome, v.valor);
        });

        const regex = /\{\{([^}]+)\}\}/g;
        let match;

        while ((match = regex.exec(conteudo)) !== null) {
          const nomeVariavel = match[1].trim();
          
          if (variaveisMap.has(nomeVariavel)) {
            const valor = variaveisMap.get(nomeVariavel)!;
            conteudoProcessado = conteudoProcessado.replace(match[0], valor);
            variaveisUtilizadas.push(nomeVariavel);
          } else {
            variaveisFaltantes.push(nomeVariavel);
          }
        }
      }

      res.json({
        success: true,
        data: {
          conteudo_processado: conteudoProcessado,
          variaveis_utilizadas: [...new Set(variaveisUtilizadas)],
          variaveis_faltantes: [...new Set(variaveisFaltantes)]
        }
      });
    } catch (error) {
      console.error('Erro ao visualizar template:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}