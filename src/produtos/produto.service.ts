import { ProdutoRepository } from './produto.repository.js';
import { type Produto, type UpdateEstoqueConfigRequest, type EstoqueAtual, type ProdutoEstoqueBaixo, type ProdutoSemEstoque } from './produto.types.js';

export class ProdutoService {
  private repository = new ProdutoRepository();

  async create(produtoData: Omit<Produto, 'id' | 'created_at' | 'deleted_at'>) {
    if (!produtoData.descricao || produtoData.preco_venda === undefined) {
      throw new Error('Descrição e preço de venda são obrigatórios.');
    }

    // Validações de estoque
    if (produtoData.quantidade_minima !== undefined && produtoData.quantidade_minima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa.');
    }

    if (produtoData.quantidade_maxima !== undefined && produtoData.quantidade_maxima < 0) {
      throw new Error('Quantidade máxima não pode ser negativa.');
    }

    if (produtoData.quantidade_minima !== undefined && 
        produtoData.quantidade_maxima !== undefined && 
        produtoData.quantidade_minima > produtoData.quantidade_maxima) {
      throw new Error('Quantidade mínima não pode ser maior que a quantidade máxima.');
    }

    if (produtoData.quantidade_atual !== undefined && produtoData.quantidade_atual < 0) {
      throw new Error('Quantidade atual não pode ser negativa.');
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

    // Validações de estoque
    if (produtoData.quantidade_minima !== undefined && produtoData.quantidade_minima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa.');
    }

    if (produtoData.quantidade_maxima !== undefined && produtoData.quantidade_maxima < 0) {
      throw new Error('Quantidade máxima não pode ser negativa.');
    }

    if (produtoData.quantidade_minima !== undefined && 
        produtoData.quantidade_maxima !== undefined && 
        produtoData.quantidade_minima > produtoData.quantidade_maxima) {
      throw new Error('Quantidade mínima não pode ser maior que a quantidade máxima.');
    }

    return this.repository.update(id, produtoData);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }

  // Métodos específicos de estoque
  async updateEstoqueConfig(id: string, configData: UpdateEstoqueConfigRequest) {
    // Validações específicas de configuração de estoque
    if (configData.quantidade_minima !== undefined && configData.quantidade_minima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa.');
    }

    if (configData.quantidade_maxima !== undefined && configData.quantidade_maxima < 0) {
      throw new Error('Quantidade máxima não pode ser negativa.');
    }

    if (configData.quantidade_minima !== undefined && 
        configData.quantidade_maxima !== undefined && 
        configData.quantidade_minima > configData.quantidade_maxima) {
      throw new Error('Quantidade mínima não pode ser maior que a quantidade máxima.');
    }

    return this.repository.updateEstoqueConfig(id, configData);
  }

  async findProdutosAtivos() {
    return this.repository.findProdutosAtivos();
  }

  async findProdutosComEstoqueBaixo(): Promise<ProdutoEstoqueBaixo[]> {
    return this.repository.findProdutosComEstoqueBaixo();
  }

  async findProdutosSemEstoque(): Promise<ProdutoSemEstoque[]> {
    return this.repository.findProdutosSemEstoque();
  }

  async getEstoqueAtual(id: string): Promise<EstoqueAtual | null> {
    return this.repository.getEstoqueAtual(id);
  }

  async updateQuantidadeAtual(id: string, novaQuantidade: number) {
    if (novaQuantidade < 0) {
      throw new Error('Quantidade não pode ser negativa.');
    }

    return this.repository.updateQuantidadeAtual(id, novaQuantidade);
  }

  async findByCodigoBarras(codigoBarras: string) {
    if (!codigoBarras || codigoBarras.trim() === '') {
      throw new Error('Código de barras é obrigatório.');
    }

    return this.repository.findByCodigoBarras(codigoBarras);
  }

  async verificarEstoqueDisponivel(id: string, quantidadeNecessaria: number): Promise<boolean> {
    if (quantidadeNecessaria <= 0) {
      throw new Error('Quantidade necessária deve ser maior que zero.');
    }

    const estoqueAtual = await this.getEstoqueAtual(id);
    if (!estoqueAtual) {
      return false;
    }

    return estoqueAtual.quantidade_atual >= quantidadeNecessaria;
  }

  async validarProdutoParaMovimentacao(id: string): Promise<void> {
    const produto = await this.findById(id);
    
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    if (!produto.ativo) {
      throw new Error('Não é possível movimentar estoque de produto inativo.');
    }
  }
}