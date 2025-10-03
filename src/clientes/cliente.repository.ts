import { supabase } from '../lib/supabaseClient.js';
import { type Cliente } from './cliente.types.js';

export class ClienteRepository {
    async findAll() {
        const { data, error } = await supabase
            .from('Clientes')
            .select('*')
            .is('deleted_at', null); // SÓ BUSCA ONDE a coluna deleted_at É NULA

        if (error) {
            throw new Error(error.message);
        }
        return data;
    }

    async create(cliente: Cliente) {
        const { data, error } = await supabase
            .from('Clientes')
            .insert(cliente)
            .select() // .select() faz com que o Supabase retorne o objeto criado
            .single(); // .single() para retornar um único objeto em vez de um array

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async update(id: string, cliente: Partial<Cliente>) {
        const { data, error } = await supabase
            .from('Clientes')
            .update(cliente)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    // Renomeie para refletir a ação, ou mantenha "delete" sabendo que é um soft delete
    async softDelete(id: string) {
        const { error } = await supabase
            .from('Clientes')
            .update({ deleted_at: new Date() }) // ATUALIZA a coluna com a data/hora atual
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }

        return { message: 'Cliente desativado com sucesso.' };
    }
}
