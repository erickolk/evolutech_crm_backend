import { AgenteRepository } from './agente.repository.js';
import type { 
  Agente, 
  CreateAgenteRequest, 
  UpdateAgenteRequest, 
  AgenteFilters,
  AgenteResponse,
  AgenteListResponse,
  AgenteStats,
  UpdateStatusRequest,
  AtribuicaoAutomaticaRequest,
  AtribuicaoAutomaticaResponse,
  AgentePerformance
} from './agente.types.js';

export class AgenteService {
  private repository = new AgenteRepository();

  async findAll(filters: AgenteFilters = {}): Promise<AgenteListResponse> {
    try {
      const { data, total } = await this.repository.findAll(filters);
      
      return {
        agentes: data,
        total,
        page: filters.page || 1,
        limit: filters.limit || 20
      };
    } catch (error: any) {
      throw new Error(`Erro ao listar agentes: ${error.message}`);
    }
  }

  async findById(id: string): Promise<AgenteResponse> {
    if (!id) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      const agente = await this.repository.findById(id);
      
      if (!agente) {
        throw new Error('Agente não encontrado');
      }

      return agente;
    } catch (error: any) {
      throw new Error(`Erro ao buscar agente: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Agente> {
    if (!email) {
      throw new Error('Email é obrigatório');
    }

    try {
      const agente = await this.repository.findByEmail(email);
      
      if (!agente) {
        throw new Error('Agente não encontrado');
      }

      return agente;
    } catch (error: any) {
      throw new Error(`Erro ao buscar agente por email: ${error.message}`);
    }
  }

  async create(data: CreateAgenteRequest): Promise<Agente> {
    // Validações
    if (!data.nome || data.nome.trim() === '') {
      throw new Error('Nome é obrigatório');
    }

    if (!data.email || data.email.trim() === '') {
      throw new Error('Email é obrigatório');
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.max_conversas_simultaneas && data.max_conversas_simultaneas < 1) {
      throw new Error('Número máximo de conversas simultâneas deve ser maior que 0');
    }

    if (data.max_conversas_simultaneas && data.max_conversas_simultaneas > 20) {
      throw new Error('Número máximo de conversas simultâneas não pode ser maior que 20');
    }

    try {
      // Verificar se já existe agente com este email
      const agenteExistente = await this.repository.findByEmail(data.email);
      if (agenteExistente) {
        throw new Error('Já existe um agente com este email');
      }

      return await this.repository.create(data);
    } catch (error: any) {
      throw new Error(`Erro ao criar agente: ${error.message}`);
    }
  }

  async update(id: string, data: UpdateAgenteRequest): Promise<Agente> {
    if (!id) {
      throw new Error('ID do agente é obrigatório');
    }

    // Validações
    if (data.nome !== undefined && data.nome.trim() === '') {
      throw new Error('Nome não pode estar vazio');
    }

    if (data.email !== undefined) {
      if (data.email.trim() === '') {
        throw new Error('Email não pode estar vazio');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Email inválido');
      }
    }

    if (data.max_conversas_simultaneas !== undefined) {
      if (data.max_conversas_simultaneas < 1) {
        throw new Error('Número máximo de conversas simultâneas deve ser maior que 0');
      }
      if (data.max_conversas_simultaneas > 20) {
        throw new Error('Número máximo de conversas simultâneas não pode ser maior que 20');
      }
    }

    try {
      // Verificar se o agente existe
      const agenteExistente = await this.repository.findById(id);
      if (!agenteExistente) {
        throw new Error('Agente não encontrado');
      }

      // Se está alterando email, verificar se não existe outro agente com o mesmo email
      if (data.email && data.email !== agenteExistente.email) {
        const agenteComEmail = await this.repository.findByEmail(data.email);
        if (agenteComEmail && agenteComEmail.id !== id) {
          throw new Error('Já existe um agente com este email');
        }
      }

      return await this.repository.update(id, data);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar agente: ${error.message}`);
    }
  }

  async updateStatus(id: string, statusData: UpdateStatusRequest): Promise<Agente> {
    if (!id) {
      throw new Error('ID do agente é obrigatório');
    }

    const statusValidos = ['online', 'offline', 'ocupado', 'ausente'];
    if (!statusValidos.includes(statusData.status)) {
      throw new Error('Status inválido');
    }

    try {
      // Verificar se o agente existe
      const agenteExistente = await this.repository.findById(id);
      if (!agenteExistente) {
        throw new Error('Agente não encontrado');
      }

      if (!agenteExistente.ativo) {
        throw new Error('Não é possível alterar status de agente inativo');
      }

      return await this.repository.updateStatus(id, statusData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar status do agente: ${error.message}`);
    }
  }

  async setOnline(id: string): Promise<Agente> {
    return await this.updateStatus(id, { status: 'online' });
  }

  async setOffline(id: string): Promise<Agente> {
    return await this.updateStatus(id, { status: 'offline' });
  }

  async setOcupado(id: string): Promise<Agente> {
    return await this.updateStatus(id, { status: 'ocupado' });
  }

  async setAusente(id: string, mensagemAusencia?: string): Promise<Agente> {
    return await this.updateStatus(id, { 
      status: 'ausente', 
      mensagem_ausencia: mensagemAusencia 
    });
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      // Verificar se o agente existe
      const agenteExistente = await this.repository.findById(id);
      if (!agenteExistente) {
        throw new Error('Agente não encontrado');
      }

      // Verificar se tem conversas ativas
      if (agenteExistente.conversas_ativas && agenteExistente.conversas_ativas > 0) {
        throw new Error('Não é possível excluir agente com conversas ativas');
      }

      await this.repository.delete(id);
    } catch (error: any) {
      throw new Error(`Erro ao excluir agente: ${error.message}`);
    }
  }

  async buscarDisponiveis(especialidade?: string, departamento?: string): Promise<AgenteResponse[]> {
    try {
      return await this.repository.findDisponiveis(especialidade, departamento);
    } catch (error: any) {
      throw new Error(`Erro ao buscar agentes disponíveis: ${error.message}`);
    }
  }

  async atribuicaoAutomatica(request: AtribuicaoAutomaticaRequest): Promise<AtribuicaoAutomaticaResponse> {
    if (!request.conversa_id) {
      throw new Error('ID da conversa é obrigatório');
    }

    try {
      // Buscar agentes disponíveis com base nos critérios
      const agentesDisponiveis = await this.repository.findDisponiveis(
        request.especialidade_requerida,
        request.departamento_preferido
      );

      if (agentesDisponiveis.length === 0) {
        throw new Error('Nenhum agente disponível no momento');
      }

      // Algoritmo de atribuição:
      // 1. Priorizar por especialidade
      // 2. Priorizar por departamento
      // 3. Priorizar por menor número de conversas ativas
      // 4. Priorizar por melhor avaliação

      let agenteEscolhido = agentesDisponiveis[0];
      let motivoAtribuicao = 'Agente com menor carga de trabalho';

      // Se tem especialidade requerida, priorizar
      if (request.especialidade_requerida) {
        const agenteComEspecialidade = agentesDisponiveis.find(a => 
          a.especialidades?.includes(request.especialidade_requerida!)
        );
        if (agenteComEspecialidade) {
          agenteEscolhido = agenteComEspecialidade;
          motivoAtribuicao = `Especialista em ${request.especialidade_requerida}`;
        }
      }

      // Se tem departamento preferido, priorizar
      if (request.departamento_preferido) {
        const agenteDoDepartamento = agentesDisponiveis.find(a => 
          a.departamento === request.departamento_preferido
        );
        if (agenteDoDepartamento) {
          agenteEscolhido = agenteDoDepartamento;
          motivoAtribuicao = `Agente do departamento ${request.departamento_preferido}`;
        }
      }

      // Incrementar conversas ativas do agente escolhido
      await this.repository.incrementarConversasAtivas(agenteEscolhido.id);

      // Calcular tempo estimado de resposta baseado no histórico
      const tempoEstimado = agenteEscolhido.estatisticas?.tempo_medio_resposta || 300; // 5 minutos padrão

      return {
        agente_id: agenteEscolhido.id,
        agente_nome: agenteEscolhido.nome,
        motivo_atribuicao: motivoAtribuicao,
        tempo_estimado_resposta: tempoEstimado
      };
    } catch (error: any) {
      throw new Error(`Erro na atribuição automática: ${error.message}`);
    }
  }

  async liberarConversa(agenteId: string): Promise<void> {
    if (!agenteId) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      await this.repository.decrementarConversasAtivas(agenteId);
    } catch (error: any) {
      throw new Error(`Erro ao liberar conversa do agente: ${error.message}`);
    }
  }

  async registrarAtividade(agenteId: string): Promise<void> {
    if (!agenteId) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      await this.repository.updateUltimaAtividade(agenteId);
    } catch (error: any) {
      throw new Error(`Erro ao registrar atividade do agente: ${error.message}`);
    }
  }

  async atualizarEstatisticas(agenteId: string, estatisticas: Partial<Agente['estatisticas']>): Promise<void> {
    if (!agenteId) {
      throw new Error('ID do agente é obrigatório');
    }

    try {
      await this.repository.updateEstatisticas(agenteId, estatisticas);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar estatísticas do agente: ${error.message}`);
    }
  }

  async getStats(): Promise<AgenteStats> {
    try {
      return await this.repository.getStats();
    } catch (error: any) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }

  async getPerformance(agenteId: string, dataInicio: string, dataFim: string): Promise<AgentePerformance> {
    if (!agenteId) {
      throw new Error('ID do agente é obrigatório');
    }

    if (!dataInicio || !dataFim) {
      throw new Error('Período é obrigatório');
    }

    // Validar datas
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new Error('Datas inválidas');
    }

    if (inicio >= fim) {
      throw new Error('Data de início deve ser anterior à data de fim');
    }

    try {
      const performance = await this.repository.getPerformance(agenteId, dataInicio, dataFim);
      
      if (!performance) {
        throw new Error('Agente não encontrado');
      }

      return performance;
    } catch (error: any) {
      throw new Error(`Erro ao buscar performance do agente: ${error.message}`);
    }
  }

  async buscarPorDepartamento(departamento: string): Promise<AgenteResponse[]> {
    if (!departamento) {
      throw new Error('Departamento é obrigatório');
    }

    try {
      const filters: AgenteFilters = {
        departamento,
        ativo: true,
        orderBy: 'nome',
        orderDirection: 'asc'
      };

      const { data } = await this.repository.findAll(filters);
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar agentes por departamento: ${error.message}`);
    }
  }

  async buscarPorEspecialidade(especialidade: string): Promise<AgenteResponse[]> {
    if (!especialidade) {
      throw new Error('Especialidade é obrigatória');
    }

    try {
      const filters: AgenteFilters = {
        especialidade,
        ativo: true,
        orderBy: 'nome',
        orderDirection: 'asc'
      };

      const { data } = await this.repository.findAll(filters);
      return data;
    } catch (error: any) {
      throw new Error(`Erro ao buscar agentes por especialidade: ${error.message}`);
    }
  }
}