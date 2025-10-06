import { supabase } from '../lib/supabaseClient.js';
import { type Produto } from './produto.types.js';

export class ProdutoRepository {
  async create(produto: Omit<Produto, 'id' | 'created_at' | 'deleted_at'>): Promise<Produto> {
    const { data, error } = await supabase
      .from('Produtos')
      .insert(produto)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar Produto:', error);
      throw new Error('Não foi possível criar o novo produto.');
    }

    return data as Produto;
  }

  async findAll(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar Produtos:', error);
      throw new Error('Não foi possível buscar os produtos.');
    }

    return data as Produto[];
  }

  async findById(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('Produtos')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar Produto por ID:', error);
      throw new Error('Não foi possível buscar o produto.');
    }

    return (data ?? null) as Produto | null;
  }

  async update(id: string, produto: Partial<Produto>): Promise<Produto> {
    const { data, error } = await supabase
      .from('Produtos')
      .update(produto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar Produto:', error);
      throw new Error('Não foi possível atualizar o produto.');
    }

    return data as Produto;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('Produtos')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar Produto:', error);
      throw new Error('Não foi possível deletar o produto.');
    }

    return { message: 'Produto desativado com sucesso.' };
  }
}