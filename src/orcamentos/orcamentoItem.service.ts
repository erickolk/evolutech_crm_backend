import { OrcamentoItemRepository } from './orcamentoItem.repository.js';
import { OrcamentoRepository } from './orcamento.repository.js';
import { ProdutoRepository } from '../produtos/produto.repository.js';
import { type OrcamentoItem, type CreateOrcamentoItemRequest, type UpdateOrcamentoItemRequest, type ApprovalRequest } from './orcamento.types.js';

export class OrcamentoItemService {
  private itemRepository = new OrcamentoItemRepository();
  private orcamentoRepository = new OrcamentoRepository();
  private produtoRepository = new ProdutoRepository();

  async findAll(): Promise<OrcamentoItem[]> {
    return this.itemRepository.findAll();
  }

  async findById(id: string): Promise<OrcamentoItem | null> {
    return this.itemRepository.findById(id);
  }

  async findByOrcamentoId(orcamentoId: string): Promise<OrcamentoItem[]> {
    // Verificar se o orçamento existe
    await this.validateOrcamentoExists(orcamentoId);
    
    return this.itemRepository.findByOrcamentoId(orcamentoId);
  }

  async create(orcamentoId: string, itemData: CreateOrcamentoItemRequest): Promise<OrcamentoItem> {
    // Verificar se o orçamento existe e pode ser editado
    await this.validateOrcamentoCanBeEdited(orcamentoId);

    // Validar dados do item
    this.validateItemData(itemData);

    // Validar produto se informado
    if (itemData.produto_id) {
      await this.validateProdutoExists(itemData.produto_id);
    }

    // Criar item
    const item = await this.itemRepository.create(orcamentoId, itemData);

    // Recalcular totais do orçamento
    await this.recalculateOrcamento(orcamentoId);

    return item;
  }

  async update(id: string, itemData: UpdateOrcamentoItemRequest): Promise<OrcamentoItem> {
    // Verificar se o item existe e pode ser editado
    const item = await this.validateItemCanBeEdited(id);

    // Validar dados se fornecidos
    if (itemData.quantidade !== undefined || itemData.valor_unitario !== undefined || itemData.descricao !== undefined) {
      this.validateItemData({
        tipo_item: itemData.tipo_item || item.tipo_item,
        descricao: itemData.descricao || item.descricao,
        quantidade: itemData.quantidade || item.quantidade,
        valor_unitario: itemData.valor_unitario || item.valor_unitario,
      });
    }

    // Validar produto se informado
    if (itemData.produto_id) {
      await this.validateProdutoExists(itemData.produto_id);
    }

    // Atualizar item
    const updatedItem = await this.itemRepository.update(id, itemData);

    // Recalcular totais do orçamento
    await this.recalculateOrcamento(item.orcamento_id);

    return updatedItem;
  }

  async updateApprovalStatus(id: string, approvalData: ApprovalRequest): Promise<OrcamentoItem> {
    // Verificar se o item existe
    const item = await this.validateItemExists(id);

    // Verificar se o item pode ter status alterado (deve estar pendente)
    if (item.status_aprovacao !== 'pendente') {
      throw new Error('Apenas itens com status "pendente" podem ter o status de aprovação alterado.');
    }

    // Atualizar status
    const updatedItem = await this.itemRepository.updateApprovalStatus(id, approvalData.status_aprovacao);

    // Recalcular totais do orçamento
    await this.recalculateOrcamento(item.orcamento_id);

    return updatedItem;
  }

  async delete(id: string) {
    // Verificar se o item existe e pode ser editado
    const item = await this.validateItemCanBeEdited(id);

    // Deletar item
    const result = await this.itemRepository.softDelete(id);

    // Recalcular totais do orçamento
    await this.recalculateOrcamento(item.orcamento_id);

    return result;
  }

  private validateItemData(itemData: Partial<CreateOrcamentoItemRequest>): void {
    if (itemData.descricao !== undefined) {
      if (!itemData.descricao || itemData.descricao.trim().length === 0) {
        throw new Error('Descrição é obrigatória.');
      }
      if (itemData.descricao.length > 500) {
        throw new Error('Descrição não pode ter mais de 500 caracteres.');
      }
    }

    if (itemData.quantidade !== undefined) {
      if (!itemData.quantidade || itemData.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero.');
      }
      if (!Number.isInteger(itemData.quantidade)) {
        throw new Error('Quantidade deve ser um número inteiro.');
      }
    }

    if (itemData.valor_unitario !== undefined) {
      if (!itemData.valor_unitario || itemData.valor_unitario <= 0) {
        throw new Error('Valor unitário deve ser maior que zero.');
      }
    }

    if (itemData.tipo_item !== undefined) {
      if (!['peca', 'servico'].includes(itemData.tipo_item)) {
        throw new Error('Tipo de item deve ser "peca" ou "servico".');
      }
    }

    if (itemData.garantia_dias !== undefined) {
      if (itemData.garantia_dias < 0) {
        throw new Error('Garantia não pode ser negativa.');
      }
      if (itemData.garantia_dias > 3650) { // Máximo 10 anos
        throw new Error('Garantia não pode ser maior que 3650 dias (10 anos).');
      }
    }
  }

  private async validateOrcamentoExists(orcamentoId: string): Promise<void> {
    const orcamento = await this.orcamentoRepository.findById(orcamentoId);
    if (!orcamento) {
      throw new Error('Orçamento não encontrado.');
    }
  }

  private async validateOrcamentoCanBeEdited(orcamentoId: string): Promise<void> {
    await this.validateOrcamentoExists(orcamentoId);
    
    const canEdit = await this.orcamentoRepository.canEdit(orcamentoId);
    if (!canEdit) {
      throw new Error('Apenas a versão mais recente do orçamento pode ser editada.');
    }
  }

  private async validateItemExists(id: string): Promise<OrcamentoItem> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new Error('Item de orçamento não encontrado.');
    }
    return item;
  }

  private async validateItemCanBeEdited(id: string): Promise<OrcamentoItem> {
    const item = await this.validateItemExists(id);
    
    // Verificar se o orçamento pode ser editado
    await this.validateOrcamentoCanBeEdited(item.orcamento_id);
    
    // Verificar se o item pode ser editado (não pode estar aprovado)
    const canEdit = await this.itemRepository.canEdit(id);
    if (!canEdit) {
      throw new Error('Itens aprovados não podem ser editados.');
    }
    
    return item;
  }

  private async validateProdutoExists(produtoId: string): Promise<void> {
    try {
      const produto = await this.produtoRepository.findById(produtoId);
      if (!produto) {
        throw new Error('Produto não encontrado.');
      }
    } catch (error) {
      throw new Error('Produto não encontrado ou inválido.');
    }
  }

  private async recalculateOrcamento(orcamentoId: string): Promise<void> {
    // Importar dinamicamente para evitar dependência circular
    const { OrcamentoService } = await import('./orcamento.service.js');
    const orcamentoService = new OrcamentoService();
    
    await orcamentoService.recalculateOrcamento(orcamentoId);
  }

  async canEdit(id: string): Promise<boolean> {
    return this.itemRepository.canEdit(id);
  }

  async getOrcamentoCalculations(orcamentoId: string) {
    await this.validateOrcamentoExists(orcamentoId);
    return this.itemRepository.getOrcamentoCalculations(orcamentoId);
  }
}