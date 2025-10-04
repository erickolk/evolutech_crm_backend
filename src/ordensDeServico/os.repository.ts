import { supabase } from '../lib/supabaseClient.js';
import { type OrdemDeServico } from './os.types.js';

export class OsRepository {
  /**
   * Busca todas as Ordens de Serviço ativas no banco de dados.
   */
  async findAll(): Promise<OrdemDeServico[]> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .select('*')
      .is('deleted_at', null); // Aplicando nosso padrão de soft delete desde o início!

    if (error) {
      // É uma boa prática logar o erro no servidor para depuração
      console.error('Erro ao buscar Ordens de Serviço:', error);
      throw new Error('Não foi possível buscar as Ordens de Serviço.');
    }

    return data;
  }

  async create(os: Omit<OrdemDeServico, 'id' | 'created_at'>): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .insert(os)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      throw new Error('Não foi possível criar a Ordem de Serviço.');
    }

    return data;
  }

  async update(id: string, os: Partial<OrdemDeServico>): Promise<OrdemDeServico> {
    const { data, error } = await supabase
      .from('OrdensDeServico')
      .update(os)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar OS:', error);
      throw new Error('Não foi possível atualizar a Ordem de Serviço.');
    }

    return data;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('OrdensDeServico')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar OS:', error);
      throw new Error('Não foi possível deletar a Ordem de Serviço.');
    }

    return { message: 'Ordem de Serviço desativada com sucesso.' };
  }
  // Futuramente, outros métodos como findById, create, update, softDelete, etc. virão aqui.
}