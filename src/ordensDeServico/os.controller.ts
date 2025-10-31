import { type Request, type Response } from 'express';
import { OsService } from './os.service.js';
import { OSStatusHistoricoService } from './osStatusHistorico.service.js';
import { StatusOS } from './os.types.js';

export class OsController {
  // O Controller tem uma instância do Service para poder delegar a lógica de negócio.
  private service = new OsService();
  private statusHistoricoService = new OSStatusHistoricoService();

  /**
   * Lida com a requisição HTTP para buscar todas as Ordens de Serviço.
   */
  async findAll(req: Request, res: Response) {
    try {
      const filters = req.query;
      const ordensDeServico = await this.service.findAll(filters);
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      // Em um caso real, poderíamos ter um middleware de erro mais sofisticado
      res.status(500).json({ message: error.message });
    }
  }
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      const os = await this.service.findById(id);
      if (!os) {
        return res.status(404).json({ message: 'Ordem de Serviço não encontrada.' });
      }
      res.status(200).json(os);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      console.log('🔍 Controller - Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      // Extrair usuario_id do token JWT ou usar um valor padrão
      const usuario_id = (req as any).user?.id || 'sistema';
      console.log('👤 Controller - Usuario ID:', usuario_id);
      
      const novaOs = await this.service.create(req.body, usuario_id);
      console.log('✅ Controller - OS criada:', novaOs.id);
      
      res.status(201).json(novaOs);
    } catch (error: any) {
      console.error('❌ Controller - Erro ao criar OS:', error.message);
      console.error('📋 Controller - Stack trace:', error.stack);
      res.status(400).json({ message: error.message });
    }
  }
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      const osAtualizada = await this.service.update(id, req.body);
      res.status(200).json(osAtualizada);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      // Captura o usuario_id do usuário autenticado, de um header opcional
      // ou do body (útil para ambientes de teste sem login)
      const usuario_id = (req as any).user?.id
        || (req.headers['x-usuario-id'] as string | undefined)
        || (req.body?.usuario_id as string | undefined);

      await this.service.softDelete(id, usuario_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ===== ENDPOINTS DE WORKFLOW E STATUS =====

  /**
   * Altera o status de uma OS com validação de transição
   */
  async alterarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { novoStatus, motivo, usuario_id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      if (!novoStatus) {
        return res.status(400).json({ message: 'O novo status é obrigatório.' });
      }

      const osAtualizada = await this.service.alterarStatus(id, novoStatus, motivo, usuario_id);
      res.status(200).json(osAtualizada);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Atribui um técnico a uma OS
   */
  async atribuirTecnico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tecnico_id, usuario_id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      if (!tecnico_id) {
        return res.status(400).json({ message: 'O ID do técnico é obrigatório.' });
      }

      const osAtualizada = await this.service.atribuirTecnico(id, tecnico_id, usuario_id);
      res.status(200).json(osAtualizada);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Busca OS por status
   */
  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;

      if (!status || !Object.values(StatusOS).includes(status as StatusOS)) {
        return res.status(400).json({ message: 'Status inválido.' });
      }

      const ordensDeServico = await this.service.findByStatus(status as StatusOS);
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca OS por técnico
   */
  async findByTecnico(req: Request, res: Response) {
    try {
      const { tecnico_id } = req.params;

      if (!tecnico_id) {
        return res.status(400).json({ message: 'O ID do técnico é obrigatório.' });
      }

      const ordensDeServico = await this.service.findByTecnico(tecnico_id);
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca OS por cliente
   */
  async findByCliente(req: Request, res: Response) {
    try {
      const { cliente_id } = req.params;

      if (!cliente_id) {
        return res.status(400).json({ message: 'O ID do cliente é obrigatório.' });
      }

      const ordensDeServico = await this.service.findByCliente(cliente_id);
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca OS vencidas
   */
  async findVencidas(req: Request, res: Response) {
    try {
      const ordensDeServico = await this.service.findVencidas();
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca OS que vencem hoje
   */
  async findVencemHoje(req: Request, res: Response) {
    try {
      const ordensDeServico = await this.service.findVencemHoje();
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém estatísticas das OS
   */
  async getEstatisticas(req: Request, res: Response) {
    try {
      const estatisticas = await this.service.getEstatisticas();
      res.status(200).json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca OS que precisam de notificação
   */
  async findParaNotificacao(req: Request, res: Response) {
    try {
      const ordensDeServico = await this.service.findParaNotificacao();
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém histórico de status de uma OS
   */
  async getHistoricoStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      const historico = await this.service.getHistoricoStatus(id);
      res.status(200).json(historico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém timeline completa de uma OS
   */
  async getTimeline(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      const timeline = await this.service.getTimeline(id);
      res.status(200).json(timeline);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém próximos status possíveis para uma OS
   */
  async getProximosStatusPossiveis(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      const proximosStatus = await this.service.getProximosStatusPossiveis(id);
      res.status(200).json(proximosStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Valida se uma transição de status é possível
   */
  async validarTransicaoStatus(req: Request, res: Response) {
    try {
      const { statusAtual, novoStatus } = req.body;

      if (!statusAtual || !novoStatus) {
        return res.status(400).json({ message: 'Status atual e novo status são obrigatórios.' });
      }

      const validacao = await this.service.validarTransicaoStatus(statusAtual, novoStatus);
      res.status(200).json(validacao);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ===== ENDPOINTS DE HISTÓRICO DE STATUS =====

  /**
   * Obtém estatísticas de mudanças de status
   */
  async getEstatisticasStatus(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      const estatisticas = await this.statusHistoricoService.getEstatisticasStatus(
        dataInicio as string,
        dataFim as string
      );
      res.status(200).json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém relatório de produtividade dos técnicos
   */
  async getRelatorioProdutividade(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      const relatorio = await this.statusHistoricoService.getRelatorioProdutividade(
        dataInicio as string,
        dataFim as string
      );
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Identifica gargalos no workflow
   */
  async getGargalosWorkflow(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      const gargalos = await this.statusHistoricoService.getGargalosWorkflow(
        dataInicio as string,
        dataFim as string
      );
      res.status(200).json(gargalos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém notificações de OS paradas
   */
  async getNotificacoesOSParadas(req: Request, res: Response) {
    try {
      const { horasLimite } = req.query;
      
      const notificacoes = await this.statusHistoricoService.getNotificacoesOSParadas(
        horasLimite ? parseInt(horasLimite as string) : undefined
      );
      res.status(200).json(notificacoes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Exporta histórico de status
   */
  async exportarHistorico(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim, formato } = req.query;
      
      const exportacao = await this.statusHistoricoService.exportarHistorico(
        dataInicio as string,
        dataFim as string,
        formato as 'json' | 'csv'
      );
      
      if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=historico_status.csv');
      } else {
        res.setHeader('Content-Type', 'application/json');
      }
      
      res.status(200).send(exportacao);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}