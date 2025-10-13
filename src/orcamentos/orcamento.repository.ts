import { supabase } from '../lib/supabaseClient.js';
import { type Orcamento, type CreateOrcamentoRequest, type UpdateOrcamentoRequest } from './orcamento.types.js';

export class OrcamentoRepository {
  async findAll(): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw new Error('Não foi possível buscar os orçamentos.');
    }

    return data || [];
  }

  async findById(id: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar orçamento por ID:', error);
      throw new Error('Não foi possível buscar o orçamento.');
    }

    return data;
  }

  async findByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .select('*')
      .eq('os_id', ordemServicoId)
      .order('versao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar orçamentos por OS:', error);
      throw new Error('Não foi possível buscar os orçamentos da Ordem de Serviço.');
    }

    return data || [];
  }

  async findLatestVersionByOrdemServicoId(ordemServicoId: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .select('*')
      .eq('os_id', ordemServicoId)
      .order('versao', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar última versão do orçamento:', error);
      throw new Error('Não foi possível buscar a última versão do orçamento.');
    }

    return data;
  }

  async getNextVersion(ordemServicoId: string): Promise<number> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .select('versao')
      .eq('os_id', ordemServicoId)
      .order('versao', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao buscar próxima versão:', error);
      throw new Error('Não foi possível determinar a próxima versão.');
    }

    return data && data.length > 0 ? data[0].versao + 1 : 1;
  }

  async create(orcamentoData: CreateOrcamentoRequest): Promise<Orcamento> {
    // Buscar próxima versão
    const nextVersion = await this.getNextVersion(orcamentoData.os_id);

    const orcamento = {
      os_id: orcamentoData.os_id,
      versao: nextVersion,
      status: 'pendente' as const,
    };

    const { data, error } = await supabase
      .from('Orcamentos')
      .insert(orcamento)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar orçamento:', error);
      throw new Error('Não foi possível criar o orçamento.');
    }

    return data;
  }

  async update(id: string, orcamentoData: UpdateOrcamentoRequest): Promise<Orcamento> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .update({
        ...orcamentoData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw new Error('Não foi possível atualizar o orçamento.');
    }

    return data;
  }

  async updateCalculations(id: string, calculations: {
    valor_total_pecas: number;
    valor_total_servicos: number;
    valor_total_geral: number;
    status?: string;
  }): Promise<Orcamento> {
    const { data, error } = await supabase
      .from('Orcamentos')
      .update({
        ...calculations,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cálculos do orçamento:', error);
      throw new Error('Não foi possível atualizar os cálculos do orçamento.');
    }

    return data;
  }

  async createNewVersion(originalId: string): Promise<Orcamento> {
    // Buscar orçamento original
    const original = await this.findById(originalId);
    if (!original) {
      throw new Error('Orçamento original não encontrado.');
    }

    // Buscar próxima versão
    const nextVersion = await this.getNextVersion(original.os_id);

    // Criar nova versão
    const newVersion = {
      os_id: original.os_id,
      versao: nextVersion,
      status: 'pendente' as const,
      desconto_percentual: original.desconto_percentual,
      desconto_justificativa: original.desconto_justificativa,
      valor_total_pecas: 0,
      valor_total_servicos: 0,
      valor_total_geral: 0,
      observacoes: original.observacoes,
    };

    const { data, error } = await supabase
      .from('Orcamentos')
      .insert(newVersion)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar nova versão do orçamento:', error);
      throw new Error('Não foi possível criar nova versão do orçamento.');
    }

    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Orcamentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw new Error('Não foi possível deletar o orçamento.');
    }
  }

  async canEdit(id: string): Promise<boolean> {
    const orcamento = await this.findById(id);
    if (!orcamento) {
      return false;
    }

    // Verificar se é a versão mais recente
    const latestVersion = await this.findLatestVersionByOrdemServicoId(orcamento.os_id);
    return latestVersion?.id === id;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('Orcamentos')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Error('Não foi possível atualizar o status.');
    }
  }
}