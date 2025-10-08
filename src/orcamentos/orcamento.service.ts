import { OrcamentoRepository } from './orcamento.repository.js';
import { OrcamentoItemRepository } from './orcamentoItem.repository.js';
import { OsRepository } from '../ordensDeServico/os.repository.js';
import { type Orcamento, type CreateOrcamentoRequest, type UpdateOrcamentoRequest, type OrcamentoWithItens } from './orcamento.types.js';

export class OrcamentoService {
  private orcamentoRepository = new OrcamentoRepository();
  private itemRepository = new OrcamentoItemRepository();
  private osRepository = new OsRepository();

  async findAll(): Promise<Orcamento[]> {
    return this.orcamentoRepository.findAll();
  }

  async findById(id: string): Promise<OrcamentoWithItens | null> {
    const orcamento = await this.orcamentoRepository.findById(id);
    if (!orcamento) {
      return null;
    }

    const itens = await this.itemRepository.findByOrcamentoId(id);
    return {
      ...orcamento,
      itens,
    };
  }

  async findByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
    return this.orcamentoRepository.findByOrdemServicoId(ordemServicoId);
  }

  async create(orcamentoData: CreateOrcamentoRequest): Promise<Orcamento> {
    // Validar se a OS existe e está ativa
    const os = await this.osRepository.findById(orcamentoData.ordem_servico_id);
    if (!os) {
      throw new Error('Ordem de Serviço não encontrada.');
    }

    // Validar desconto
    this.validateDiscount(orcamentoData.desconto_percentual, orcamentoData.desconto_justificativa);

    return this.orcamentoRepository.create(orcamentoData);
  }

  async update(id: string, orcamentoData: UpdateOrcamentoRequest): Promise<Orcamento> {
    // Verificar se pode editar (apenas versão mais recente)
    const canEdit = await this.orcamentoRepository.canEdit(id);
    if (!canEdit) {
      throw new Error('Apenas a versão mais recente do orçamento pode ser editada.');
    }

    // Validar desconto
    this.validateDiscount(orcamentoData.desconto_percentual, orcamentoData.desconto_justificativa);

    const updatedOrcamento = await this.orcamentoRepository.update(id, orcamentoData);

    // Recalcular totais se necessário
    await this.recalculateOrcamento(id);

    return updatedOrcamento;
  }

  async createNewVersion(originalId: string): Promise<Orcamento> {
    // Verificar se o orçamento original existe
    const original = await this.orcamentoRepository.findById(originalId);
    if (!original) {
      throw new Error('Orçamento original não encontrado.');
    }

    // Criar nova versão do orçamento
    const newVersion = await this.orcamentoRepository.createNewVersion(originalId);

    // Copiar itens da versão anterior
    await this.itemRepository.copyItemsToNewVersion(originalId, newVersion.id!);

    // Recalcular totais
    await this.recalculateOrcamento(newVersion.id!);

    return newVersion;
  }

  async delete(id: string) {
    // Verificar se pode deletar (apenas versão mais recente)
    const canEdit = await this.orcamentoRepository.canEdit(id);
    if (!canEdit) {
      throw new Error('Apenas a versão mais recente do orçamento pode ser deletada.');
    }

    return this.orcamentoRepository.softDelete(id);
  }

  async recalculateOrcamento(orcamentoId: string): Promise<Orcamento> {
    // Buscar cálculos dos itens
    const calculations = await this.itemRepository.getOrcamentoCalculations(orcamentoId);
    
    // Buscar orçamento atual para aplicar desconto
    const orcamento = await this.orcamentoRepository.findById(orcamentoId);
    if (!orcamento) {
      throw new Error('Orçamento não encontrado para recálculo.');
    }

    // Aplicar desconto no valor total geral
    let valorTotalGeral = calculations.valor_total_geral;
    if (orcamento.desconto_percentual && orcamento.desconto_percentual > 0) {
      const desconto = (valorTotalGeral * orcamento.desconto_percentual) / 100;
      valorTotalGeral = valorTotalGeral - desconto;
    }

    // Determinar status do orçamento baseado nos itens
    let status: 'pendente' | 'aprovado_parcial' | 'aprovado_total' | 'rejeitado' = 'pendente';
    
    if (calculations.total_itens > 0) {
      if (calculations.total_itens_aprovados === 0) {
        status = 'pendente';
      } else if (calculations.total_itens_aprovados === calculations.total_itens) {
        status = 'aprovado_total';
      } else {
        status = 'aprovado_parcial';
      }
    }

    // Atualizar orçamento com novos cálculos
    return this.orcamentoRepository.updateCalculations(orcamentoId, {
      valor_total_pecas: calculations.valor_total_pecas,
      valor_total_servicos: calculations.valor_total_servicos,
      valor_total_geral: valorTotalGeral,
      status,
    });
  }

  private validateDiscount(percentual?: number, justificativa?: string): void {
    if (percentual && percentual > 0) {
      if (percentual > 100) {
        throw new Error('Desconto não pode ser maior que 100%.');
      }

      if (percentual > 10 && (!justificativa || justificativa.trim().length === 0)) {
        throw new Error('Desconto acima de 10% requer justificativa obrigatória.');
      }

      if (percentual > 10 && justificativa && justificativa.trim().length < 10) {
        throw new Error('Justificativa deve ter pelo menos 10 caracteres para descontos acima de 10%.');
      }
    }
  }

  async getLatestVersionByOrdemServicoId(ordemServicoId: string): Promise<OrcamentoWithItens | null> {
    const orcamento = await this.orcamentoRepository.findLatestVersionByOrdemServicoId(ordemServicoId);
    if (!orcamento) {
      return null;
    }

    const itens = await this.itemRepository.findByOrcamentoId(orcamento.id!);
    return {
      ...orcamento,
      itens,
    };
  }

  async canEdit(id: string): Promise<boolean> {
    return this.orcamentoRepository.canEdit(id);
  }

  async validateOrcamentoExists(id: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepository.findById(id);
    if (!orcamento) {
      throw new Error('Orçamento não encontrado.');
    }
    return orcamento;
  }
}