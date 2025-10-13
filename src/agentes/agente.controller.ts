import { type Request, type Response } from 'express';
import { AgenteService } from './agente.service.js';
import type { 
  AgenteFilters, 
  CreateAgenteRequest, 
  UpdateAgenteRequest,
  UpdateStatusRequest,
  AtribuicaoAutomaticaRequest
} from './agente.types.js';

export class AgenteController {
  private service = new AgenteService();

  // GET /api/agentes
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: AgenteFilters = {
        nome: req.query.nome as string,
        email: req.query.email as string,
        status: req.query.status as 'online' | 'offline' | 'ocupado' | 'ausente',
        departamento: req.query.departamento as string,
        cargo: req.query.cargo as string,
        especialidade: req.query.especialidade as string,
        ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
        disponivel_para_conversa: req.query.disponivel_para_conversa === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        orderBy: (req.query.orderBy as string) || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AgenteFilters];
        if (value === undefined || value === null || value === '') {
          delete filters[key as keyof AgenteFilters];
        }
      });

      const result = await this.service.findAll(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao listar agentes', 
        details: error.message 
      });
    }
  };

  // GET /api/agentes/:id
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const agente = await this.service.findById(id);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else {
        res.status(400).json({ 
          error: 'Erro ao buscar agente', 
          details: error.message 
        });
      }
    }
  };

  // GET /api/agentes/email/:email
  findByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const agente = await this.service.findByEmail(email);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else {
        res.status(400).json({ 
          error: 'Erro ao buscar agente por email', 
          details: error.message 
        });
      }
    }
  };

  // POST /api/agentes
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateAgenteRequest = req.body;
      const agente = await this.service.create(data);
      res.status(201).json(agente);
    } catch (error: any) {
      if (error.message.includes('obrigatório') || 
          error.message.includes('inválido') || 
          error.message.includes('já existe')) {
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

  // PATCH /api/agentes/:id
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateAgenteRequest = req.body;
      const agente = await this.service.update(id, data);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else if (error.message.includes('inválido') || 
                 error.message.includes('obrigatório') ||
                 error.message.includes('já existe')) {
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

  // PATCH /api/agentes/:id/status
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const statusData: UpdateStatusRequest = req.body;
      const agente = await this.service.updateStatus(id, statusData);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else if (error.message.includes('inválido') || 
                 error.message.includes('inativo')) {
        res.status(400).json({ 
          error: 'Operação inválida', 
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

  // PATCH /api/agentes/:id/online
  setOnline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const agente = await this.service.setOnline(id);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
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

  // PATCH /api/agentes/:id/offline
  setOffline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const agente = await this.service.setOffline(id);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
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

  // PATCH /api/agentes/:id/ocupado
  setOcupado = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const agente = await this.service.setOcupado(id);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
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

  // PATCH /api/agentes/:id/ausente
  setAusente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { mensagem_ausencia } = req.body;
      const agente = await this.service.setAusente(id, mensagem_ausencia);
      res.json(agente);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
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

  // DELETE /api/agentes/:id
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else if (error.message.includes('conversas ativas')) {
        res.status(400).json({ 
          error: 'Operação não permitida', 
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

  // GET /api/agentes/disponiveis
  buscarDisponiveis = async (req: Request, res: Response): Promise<void> => {
    try {
      const especialidade = req.query.especialidade as string;
      const departamento = req.query.departamento as string;
      
      const agentes = await this.service.buscarDisponiveis(especialidade, departamento);
      res.json({
        agentes,
        total: agentes.length
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar agentes disponíveis', 
        details: error.message 
      });
    }
  };

  // POST /api/agentes/atribuicao-automatica
  atribuicaoAutomatica = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: AtribuicaoAutomaticaRequest = req.body;
      const resultado = await this.service.atribuicaoAutomatica(request);
      res.json(resultado);
    } catch (error: any) {
      if (error.message.includes('obrigatório')) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.message 
        });
      } else if (error.message.includes('Nenhum agente disponível')) {
        res.status(404).json({ 
          error: 'Nenhum agente disponível', 
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

  // PATCH /api/agentes/:id/liberar-conversa
  liberarConversa = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.liberarConversa(id);
      res.json({ 
        success: true, 
        message: 'Conversa liberada com sucesso' 
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao liberar conversa', 
        details: error.message 
      });
    }
  };

  // PATCH /api/agentes/:id/atividade
  registrarAtividade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.registrarAtividade(id);
      res.json({ 
        success: true, 
        message: 'Atividade registrada com sucesso' 
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao registrar atividade', 
        details: error.message 
      });
    }
  };

  // GET /api/agentes/stats
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

  // GET /api/agentes/:id/performance
  getPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dataInicio = req.query.data_inicio as string;
      const dataFim = req.query.data_fim as string;

      if (!dataInicio || !dataFim) {
        res.status(400).json({ 
          error: 'Parâmetros data_inicio e data_fim são obrigatórios' 
        });
        return;
      }

      const performance = await this.service.getPerformance(id, dataInicio, dataFim);
      res.json(performance);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ 
          error: 'Agente não encontrado', 
          details: error.message 
        });
      } else if (error.message.includes('obrigatório') || 
                 error.message.includes('inválidas') ||
                 error.message.includes('anterior')) {
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

  // GET /api/agentes/departamento/:departamento
  buscarPorDepartamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departamento } = req.params;
      const agentes = await this.service.buscarPorDepartamento(departamento);
      res.json({
        agentes,
        total: agentes.length,
        departamento
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar agentes por departamento', 
        details: error.message 
      });
    }
  };

  // GET /api/agentes/especialidade/:especialidade
  buscarPorEspecialidade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { especialidade } = req.params;
      const agentes = await this.service.buscarPorEspecialidade(especialidade);
      res.json({
        agentes,
        total: agentes.length,
        especialidade
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao buscar agentes por especialidade', 
        details: error.message 
      });
    }
  };
}