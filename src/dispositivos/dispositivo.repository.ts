import { supabase } from '../lib/supabaseClient.js';
import { type Dispositivo } from './dispositivo.types.js';

export class DispositivoRepository {

  async create(dispositivo: Omit<Dispositivo, 'id' | 'created_at' | 'deleted_at'>): Promise<Dispositivo> {
    const { data, error } = await supabase
      .from('Dispositivos')
      .insert(dispositivo)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar Dispositivo:', error);
      throw new Error('Não foi possível criar o novo dispositivo.');
    }

    return data;
  }

  // Decisão de Arquitetura: Geralmente, buscamos os dispositivos de um cliente específico.
  async findAllByCliente(clienteId: string): Promise<Dispositivo[]> {
    const { data, error } = await supabase
      .from('Dispositivos')
      .select('*')
      .eq('cliente_id', clienteId) // Filtra pelo ID do cliente
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar Dispositivos por cliente:', error);
      throw new Error('Não foi possível buscar os dispositivos do cliente.');
    }

    return data;
  }

  async findById(id: string): Promise<Dispositivo | null> {
    const { data, error } = await supabase
      .from('Dispositivos')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Erro ao buscar Dispositivo por ID:', error);
      throw new Error('Não foi possível buscar o dispositivo.');
    }

    return data;
  }

  async update(id: string, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> {
    const { data, error } = await supabase
      .from('Dispositivos')
      .update(dispositivo)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar Dispositivo:', error);
      throw new Error('Não foi possível atualizar o dispositivo.');
    }

    return data;
  }

  async softDelete(id: string) {
    const { error } = await supabase
      .from('Dispositivos')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar Dispositivo:', error);
      throw new Error('Não foi possível deletar o dispositivo.');
    }

    return { message: 'Dispositivo desativado com sucesso.' };
  }
}