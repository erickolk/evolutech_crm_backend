import { supabase } from '../lib/supabaseClient.js';
import { type OrcamentoItem, type CreateOrcamentoItemRequest, type UpdateOrcamentoItemRequest } from './orcamento.types.js';

export class OrcamentoItemRepository {
  async findAll(): Promise<OrcamentoItem[]> {
    const { data, error } = await supabase
      .from('orcamento_itens')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens de orçamento:', error);
      throw new Error('Não foi possível buscar os itens de orçamento.');
    }

    return data || [];
  }

  async findById(id: string): Promise<OrcamentoItem | null> {
    const { data, error } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar item de orçamento por ID:', error);
      throw new Error('Não foi possível buscar o item de orçamento.');
    }

    return data;
  }

  async findByOrcamentoId(orcamentoId: string): Promise<OrcamentoItem[]> {
    const { data, error } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens por orçamento:', error);
      throw new Error('Não foi possível buscar os itens do orçamento.');
    }

    return data || [];
  }

  async create(orcamentoId: string, itemData: CreateOrcamentoItemRequest): Promise<OrcamentoItem> {
    // Calcular valor total
    const valorTotal = itemData.quantidade * itemData.valor_unitario;
    
    // Definir garantia padrão se não informada
    let garantiaDias = itemData.garantia_dias;
    if (!garantiaDias) {
      garantiaDias = itemData.tipo_item === 'servico' ? 90 : 30; // 90 dias para serviços, 30 para peças
    }

    const item = {
      orcamento_id: orcamentoId,
      produto_id: itemData.produto_id || null,
      tipo_item: itemData.tipo_item,
      descricao: itemData.descricao,
      quantidade: itemData.quantidade,
      valor_unitario: itemData.valor_unitario,
      valor_total: valorTotal,
      status_aprovacao: 'pendente' as const,
      garantia_dias: garantiaDias,
      observacoes: itemData.observacoes || null,
    };

    const { data, error } = await supabase
      .from('orcamento_itens')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar item de orçamento:', error);
      throw new Error('Não foi possível criar o item de orçamento.');
    }

    return data;
  }

  async update(id: string, itemData: UpdateOrcamentoItemRequest): Promise<OrcamentoItem> {
    // Preparar dados para atualização
    const updateData: any = {
      ...itemData,
      updated_at: new Date().toISOString(),
    };

    // Recalcular valor total se quantidade ou valor unitário foram alterados
    if (itemData.quantidade !== undefined || itemData.valor_unitario !== undefined) {
      const currentItem = await this.findById(id);
      if (currentItem) {
        const quantidade = itemData.quantidade ?? currentItem.quantidade;
        const valorUnitario = itemData.valor_unitario ?? currentItem.valor_unitario;
        updateData.valor_total = quantidade * valorUnitario;
      }
    }

    const { data, error } = await supabase
      .from('orcamento_itens')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar item de orçamento:', error);
      throw new Error('Não foi possível atualizar o item de orçamento.');
    }

    return data;
  }

  async updateApprovalStatus(id: string, status: 'aprovado' | 'rejeitado' | 'cliente_traz_peca'): Promise<OrcamentoItem> {
    const { data, error } = await supabase
      .from('orcamento_itens')
      .update({
        status_aprovacao: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status de aprovação:', error);
      throw new Error('Não foi possível atualizar o status de aprovação do item.');
    }

    return data;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('orcamento_itens')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar item de orçamento:', error);
      throw new Error('Não foi possível deletar o item de orçamento.');
    }

    return { message: 'Item de orçamento removido com sucesso.' };
  }

  async canEdit(id: string): Promise<boolean> {
    const item = await this.findById(id);
    if (!item) {
      return false;
    }

    // Só pode editar se o status for 'pendente'
    return item.status_aprovacao === 'pendente';
  }

  async copyItemsToNewVersion(originalOrcamentoId: string, newOrcamentoId: string): Promise<OrcamentoItem[]> {
    // Buscar itens do orçamento original
    const originalItems = await this.findByOrcamentoId(originalOrcamentoId);
    
    if (originalItems.length === 0) {
      return [];
    }

    // Preparar itens para inserção na nova versão
    const newItems = originalItems.map(item => ({
      orcamento_id: newOrcamentoId,
      produto_id: item.produto_id,
      tipo_item: item.tipo_item,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      valor_total: item.valor_total,
      status_aprovacao: 'pendente' as const, // Reset status para nova versão
      garantia_dias: item.garantia_dias,
      observacoes: item.observacoes,
    }));

    const { data, error } = await supabase
      .from('orcamento_itens')
      .insert(newItems)
      .select();

    if (error) {
      console.error('Erro ao copiar itens para nova versão:', error);
      throw new Error('Não foi possível copiar os itens para a nova versão.');
    }

    return data || [];
  }

  async getOrcamentoCalculations(orcamentoId: string): Promise<{
    valor_total_pecas: number;
    valor_total_servicos: number;
    valor_total_geral: number;
    total_itens_aprovados: number;
    total_itens: number;
  }> {
    const items = await this.findByOrcamentoId(orcamentoId);
    
    let valorTotalPecas = 0;
    let valorTotalServicos = 0;
    let totalItensAprovados = 0;

    items.forEach(item => {
      if (item.status_aprovacao === 'aprovado' || item.status_aprovacao === 'cliente_traz_peca') {
        totalItensAprovados++;
        
        if (item.tipo_item === 'peca' && item.status_aprovacao === 'aprovado') {
          valorTotalPecas += item.valor_total;
        } else if (item.tipo_item === 'servico') {
          valorTotalServicos += item.valor_total;
        }
      }
    });

    const valorTotalGeral = valorTotalPecas + valorTotalServicos;

    return {
      valor_total_pecas: valorTotalPecas,
      valor_total_servicos: valorTotalServicos,
      valor_total_geral: valorTotalGeral,
      total_itens_aprovados: totalItensAprovados,
      total_itens: items.length,
    };
  }
}