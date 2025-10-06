import { FornecedorRepository } from './fornecedor.repository.js';
import { type Fornecedor } from './fornecedor.types.js';

export class FornecedorService {
  private repository = new FornecedorRepository();

  async create(fornecedorData: Omit<Fornecedor, 'id' | 'created_at' | 'deleted_at'>) {
    if (!fornecedorData.nome_fantasia) {
      throw new Error('O nome fantasia do fornecedor é obrigatório.');
    }
    return this.repository.create(fornecedorData);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(id: string, fornecedorData: Partial<Fornecedor>) {
    return this.repository.update(id, fornecedorData);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }
}