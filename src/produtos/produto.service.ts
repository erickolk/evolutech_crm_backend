import { ProdutoRepository } from './produto.repository.js';
import { type Produto } from './produto.types.js';

export class ProdutoService {
  private repository = new ProdutoRepository();

  async create(produtoData: Omit<Produto, 'id' | 'created_at' | 'deleted_at'>) {
    if (!produtoData.descricao || produtoData.preco_venda === undefined) {
      throw new Error('Descrição e preço de venda são obrigatórios.');
    }
    return this.repository.create(produtoData);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(id: string, produtoData: Partial<Produto>) {
    if (produtoData.preco_custo !== undefined) {
      throw new Error('Não é permitido alterar o preço de custo de um produto.');
    }
    return this.repository.update(id, produtoData);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }
}