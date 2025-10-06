import { supabase } from '../lib/supabaseClient.js';
import { type Fornecedor } from './fornecedor.types.js';

export class FornecedorRepository {
  async create(fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'deleted_at'>): Promise<Fornecedor> {
    const { data, error } = await supabase.from('Fornecedores').insert(fornecedor).select().single();
    if (error) throw new Error(`Erro ao criar fornecedor: ${error.message}`);
    return data;
  }

  async findAll(): Promise<Fornecedor[]> {
    const { data, error } = await supabase.from('Fornecedores').select('*').is('deleted_at', null);
    if (error) throw new Error(`Erro ao buscar fornecedores: ${error.message}`);
    return data;
  }

  async findById(id: string): Promise<Fornecedor | null> {
    const { data, error } = await supabase.from('Fornecedores').select('*').eq('id', id).is('deleted_at', null).single();
    if (error) throw new Error(`Erro ao buscar fornecedor por ID: ${error.message}`);
    return data;
  }

  async update(id: string, fornecedor: Partial<Fornecedor>): Promise<Fornecedor> {
    const { data, error } = await supabase.from('Fornecedores').update(fornecedor).eq('id', id).select().single();
    if (error) throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
    return data;
  }

  async softDelete(id: string) {
    const { error } = await supabase.from('Fornecedores').update({ deleted_at: new Date() }).eq('id', id);
    if (error) throw new Error(`Erro ao deletar fornecedor: ${error.message}`);
    return { message: 'Fornecedor desativado com sucesso.' };
  }
}