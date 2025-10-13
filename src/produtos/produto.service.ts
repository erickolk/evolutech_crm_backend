import { ProdutoRepository } from './produto.repository.js';
import { EstoqueMovimentacaoRepository } from '../estoque/estoqueMovimentacao.repository.js';
import { type Produto, type UpdateEstoqueConfigRequest, type EstoqueAtual, type ProdutoEstoqueBaixo, type ProdutoSemEstoque } from './produto.types.js';
import { 
  type SaldoAtual,
  type FiltroProdutos,
  type ListaProdutosResponse,
  type ConfiguracaoEstoque,
  type EstoqueDisponivel,
  type RelatorioEstoque,
  type CreateMovimentacaoRequest,
  TipoMovimentacao,
  MotivoMovimentacao
} from '../estoque/estoque.types.js';

export class ProdutoService {
  private repository = new ProdutoRepository();
  private movimentacaoRepository = new EstoqueMovimentacaoRepository();

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

    try {
      return await this.repository.update(id, produtoData);
    } catch (e: any) {
      // Propagate the detailed error message, as per the instruction.
      throw new Error(e.message || 'Não foi possível atualizar o produto.');
    }
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

  async getEstoqueAtual(): Promise<SaldoAtual[]> {
    return this.repository.getEstoqueAtual();
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

  async verificarEstoqueDisponivel(id: string, quantidadeNecessaria: number): Promise<EstoqueDisponivel> {
    if (quantidadeNecessaria <= 0) {
      throw new Error('Quantidade necessária deve ser maior que zero.');
    }

    return this.repository.verificarEstoqueDisponivel(id, quantidadeNecessaria);
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

  // ===== MÉTODOS ESTENDIDOS PARA CONTROLE DE ESTOQUE =====

  async findWithFilters(filtros: FiltroProdutos): Promise<ListaProdutosResponse> {
    return this.repository.findWithFilters(filtros);
  }

  async updateConfiguracaoEstoque(produtoId: string, config: ConfiguracaoEstoque): Promise<void> {
    // Validações
    if (config.quantidade_minima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa.');
    }
    if (config.quantidade_maxima < 0) {
      throw new Error('Quantidade máxima não pode ser negativa.');
    }
    if (config.quantidade_minima > config.quantidade_maxima) {
      throw new Error('Quantidade mínima não pode ser maior que a quantidade máxima.');
    }
    if (config.ponto_reposicao < 0) {
      throw new Error('Ponto de reposição não pode ser negativo.');
    }

    await this.validarProdutoParaMovimentacao(produtoId);
    return this.repository.updateConfiguracaoEstoque(produtoId, config);
  }

  async findProdutosParaReposicao(): Promise<ProdutoEstoqueBaixo[]> {
    return this.repository.findProdutosParaReposicao();
  }

  async getValorTotalEstoque(): Promise<number> {
    return this.repository.getValorTotalEstoque();
  }

  async findByCodigoInterno(codigoInterno: string): Promise<Produto | null> {
    if (!codigoInterno || codigoInterno.trim() === '') {
      throw new Error('Código interno é obrigatório.');
    }
    return this.repository.findByCodigoInterno(codigoInterno);
  }

  async getRelatorioEstoque(): Promise<RelatorioEstoque> {
    const produtos = await this.getEstoqueAtual();
    const produtosComEstoque = produtos.filter(p => p.quantidade_atual > 0);
    const produtosSemEstoque = produtos.filter(p => p.quantidade_atual === 0);
    
    // Buscar produtos com estoque baixo
    const produtosEstoqueBaixo = await this.findProdutosComEstoqueBaixo();
    
    const valorTotalEstoque = produtos.reduce((total, produto) => {
      return total + produto.valor_total;
    }, 0);

    return {
      total_produtos: produtos.length,
      produtos_com_estoque: produtosComEstoque.length,
      produtos_sem_estoque: produtosSemEstoque.length,
      produtos_estoque_baixo: produtosEstoqueBaixo.length,
      valor_total_estoque: valorTotalEstoque,
      produtos
    };
  }

  async validarMovimentacaoEstoque(produtoId: string, quantidade: number, tipo: TipoMovimentacao): Promise<void> {
    await this.validarProdutoParaMovimentacao(produtoId);

    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero.');
    }

    // Para saídas, verificar se há estoque suficiente
    if (tipo === TipoMovimentacao.SAIDA) {
      const estoqueDisponivel = await this.verificarEstoqueDisponivel(produtoId, quantidade);
      if (!estoqueDisponivel.pode_reservar) {
        throw new Error(estoqueDisponivel.motivo_bloqueio || 'Estoque insuficiente.');
      }
    }
  }

  async calcularNovoEstoque(produtoId: string, quantidade: number, tipo: TipoMovimentacao): Promise<number> {
    const produto = await this.findById(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    const estoqueAtual = produto.quantidade_atual || 0;
    
    switch (tipo) {
      case TipoMovimentacao.ENTRADA:
        return estoqueAtual + quantidade;
      case TipoMovimentacao.SAIDA:
        return estoqueAtual - quantidade;
      case TipoMovimentacao.AJUSTE:
        return quantidade; // Para ajuste, a quantidade é o novo valor
      case TipoMovimentacao.TRANSFERENCIA:
        return estoqueAtual; // Transferência não altera o estoque total
      default:
        throw new Error('Tipo de movimentação inválido.');
    }
  }

  async processarMovimentacaoEstoque(movimentacao: CreateMovimentacaoRequest): Promise<void> {
    // Validar movimentação
    await this.validarMovimentacaoEstoque(
      movimentacao.produto_id, 
      movimentacao.quantidade, 
      movimentacao.tipo_movimentacao
    );

    // Calcular novo estoque
    const novoEstoque = await this.calcularNovoEstoque(
      movimentacao.produto_id,
      movimentacao.quantidade,
      movimentacao.tipo_movimentacao
    );

    // Atualizar estoque do produto
    await this.updateQuantidadeAtual(movimentacao.produto_id, novoEstoque);

    // Registrar movimentação
    const movimentacaoCompleta = {
      ...movimentacao,
      quantidade_anterior: (await this.findById(movimentacao.produto_id))?.quantidade_atual || 0,
      quantidade_atual: novoEstoque,
      valor_total: movimentacao.quantidade * movimentacao.valor_unitario
    };

    await this.movimentacaoRepository.create(movimentacaoCompleta);
  }

  async ajustarEstoque(produtoId: string, novaQuantidade: number, motivo: string, observacoes?: string, usuarioId?: string): Promise<void> {
    const produto = await this.findById(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    if (novaQuantidade < 0) {
      throw new Error('Nova quantidade não pode ser negativa.');
    }

    const quantidadeAnterior = produto.quantidade_atual || 0;
    const diferenca = novaQuantidade - quantidadeAnterior;

    if (diferenca === 0) {
      throw new Error('Nova quantidade é igual à quantidade atual.');
    }

    const movimentacao: CreateMovimentacaoRequest = {
      produto_id: produtoId,
      tipo_movimentacao: TipoMovimentacao.AJUSTE,
      quantidade: Math.abs(diferenca),
      valor_unitario: produto.preco_custo || 0,
      motivo: diferenca > 0 ? MotivoMovimentacao.AJUSTE_POSITIVO : MotivoMovimentacao.AJUSTE_NEGATIVO,
      observacoes: observacoes || `Ajuste de estoque: ${motivo}`,
      usuario_id: usuarioId
    };

    await this.processarMovimentacaoEstoque(movimentacao);
  }

  async reservarEstoque(produtoId: string, quantidade: number, documentoReferencia: string, usuarioId?: string): Promise<boolean> {
    const estoqueDisponivel = await this.verificarEstoqueDisponivel(produtoId, quantidade);
    
    if (!estoqueDisponivel.pode_reservar) {
      return false;
    }

    // TODO: Implementar sistema de reservas na tabela específica
    // Por enquanto, apenas validamos se é possível reservar
    return true;
  }

  async liberarReserva(produtoId: string, quantidade: number, documentoReferencia: string): Promise<void> {
    // TODO: Implementar liberação de reserva
    // Por enquanto, método placeholder
  }

  async getHistoricoMovimentacoes(produtoId: string): Promise<any> {
    return this.movimentacaoRepository.getHistoricoProduto(produtoId);
  }
}