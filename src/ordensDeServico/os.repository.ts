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

  // Futuramente, outros métodos como findById, create, update, softDelete, etc. virão aqui.
}