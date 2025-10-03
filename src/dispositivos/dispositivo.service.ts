import { DispositivoRepository } from './dispositivo.repository.js';
import { type Dispositivo } from './dispositivo.types.js';

export class DispositivoService {
  private repository = new DispositivoRepository();

  async create(dispositivoData: Omit<Dispositivo, 'id' | 'created_at' | 'deleted_at'>) {
    // REGRA DE NEGÓCIO: Um dispositivo não pode ser criado "solto", ele precisa de um dono.
    if (!dispositivoData.cliente_id) {
      throw new Error('O ID do cliente é obrigatório para cadastrar um novo dispositivo.');
    }
    return this.repository.create(dispositivoData);
  }

  async findAllByCliente(clienteId: string) {
    // Lógica futura: poderíamos verificar se o cliente existe antes de buscar.
    return this.repository.findAllByCliente(clienteId);
  }

  async findById(id: string) {
    // Lógica futura: verificar se o usuário logado tem permissão para ver este dispositivo.
    return this.repository.findById(id);
  }

  async update(id: string, dispositivoData: Partial<Dispositivo>) {
    // REGRA DE NEGÓCIO: Não permitimos que um dispositivo mude de dono.
    if (dispositivoData.cliente_id) {
      throw new Error('Não é permitido alterar o cliente proprietário de um dispositivo.');
    }
    return this.repository.update(id, dispositivoData);
  }

  async softDelete(id: string) {
    // Lógica futura: verificar se o dispositivo não está em uma OS ativa antes de "deletar".
    return this.repository.softDelete(id);
  }
}