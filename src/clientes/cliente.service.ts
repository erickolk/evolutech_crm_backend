import { ClienteRepository } from './cliente.repository.js';
import { type Cliente } from './cliente.types.js';

export class ClienteService {
    private repository = new ClienteRepository();

    async findAll() {
        // Por enquanto, apenas chama o repositório.
        // No futuro, regras de negócio entrariam aqui.
        return this.repository.findAll();
    }

    async create(cliente: Cliente) {
        // LÓGICA DE NEGÓCIO:
        // Exemplo: Verificar se os campos obrigatórios foram enviados.
        if (!cliente.nome || !cliente.cpf || !cliente.whatsapp_id) {
            throw new Error('Nome, CPF e WhatsApp são obrigatórios.');
        }

        // Futuramente, poderíamos verificar se o CPF já existe no banco antes de criar.

        return this.repository.create(cliente);
    }

    async update(id: string, cliente: Partial<Cliente>) {
        // Lógica de negócio (ex: não permitir alterar o CPF)
        if (cliente.cpf) {
            throw new Error('Não é permitido alterar o CPF de um cliente.');
        }
        return this.repository.update(id, cliente);
    }

    async delete(id: string) {
        return this.repository.softDelete(id);
    }
}