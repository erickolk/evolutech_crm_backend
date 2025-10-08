import { EstoqueRepository } from './estoque.repository.js';
import { ProdutoService } from '../produtos/produto.service.js';
import { 
  type EstoqueMovimentacao, 
  type CreateMovimentacaoRequest, 
  type AjusteEstoqueRequest,
  type RelatorioMovimentacoes,
  type RelatorioEstoque,
  type HistoricoMovimentacoes,
  type TipoMovimentacao
} from './estoque.types.js';

export class EstoqueService {
  private repository = new EstoqueRepository();
  private produtoService = new ProdutoService();

  // CRUD básico de movimentações
  async createMovimentacao(movimentacaoData: CreateMovimentacaoRequest): Promise<EstoqueMovimentacao> {
    // Validar produto
    await this.produtoService.validarProdutoParaMovimentacao(movimentacaoData.produto_id);

    // Validações de negócio
    if (movimentacaoData.quantidade === 0) {
      throw new Error('Quantidade não pode ser zero.');
    }

    // Para saídas, verificar se há estoque suficiente
    if (movimentacaoData.quantidade < 0) {
      const estoqueDisponivel = await this.repository.verificarEstoqueDisponivel(
        movimentacaoData.produto_id, 
        Math.abs(movimentacaoData.quantidade)
      );

      if (!estoqueDisponivel) {
        throw new Error('Estoque insuficiente para realizar a movimentação.');
      }
    }

    // Criar movimentação
    const movimentacao = await this.repository.create({
      produto_id: movimentacaoData.produto_id,
      tipo_movimentacao: movimentacaoData.tipo_movimentacao,
      quantidade: movimentacaoData.quantidade,
      observacoes: movimentacaoData.observacoes,
      documento_referencia: movimentacaoData.documento_referencia,
      usuario_id: movimentacaoData.usuario_id
    });

    // Atualizar quantidade atual do produto
    await this.atualizarQuantidadeProduto(movimentacaoData.produto_id);

    return movimentacao;
  }

  async findAll(): Promise<EstoqueMovimentacao[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<EstoqueMovimentacao | null> {
    return this.repository.findById(id);
  }

  async findByProdutoId(produtoId: string): Promise<EstoqueMovimentacao[]> {
    return this.repository.findByProdutoId(produtoId);
  }

  // Ajustes de estoque
  async ajustarEstoque(ajusteData: AjusteEstoqueRequest): Promise<EstoqueMovimentacao> {
    // Validar produto
    await this.produtoService.validarProdutoParaMovimentacao(ajusteData.produto_id);

    // Calcular diferença
    const saldoAtual = await this.repository.calcularSaldoAtual(ajusteData.produto_id);
    const diferenca = ajusteData.quantidade_nova - saldoAtual;

    if (diferenca === 0) {
      throw new Error('A quantidade nova é igual ao saldo atual. Nenhum ajuste necessário.');
    }

    // Criar movimentação de ajuste
    const movimentacao = await this.repository.create({
      produto_id: ajusteData.produto_id,
      tipo_movimentacao: 'ajuste',
      quantidade: diferenca,
      observacoes: `Ajuste de estoque. Motivo: ${ajusteData.motivo}`,
      documento_referencia: ajusteData.documento_referencia,
      usuario_id: ajusteData.usuario_id
    });

    // Atualizar quantidade atual do produto
    await this.atualizarQuantidadeProduto(ajusteData.produto_id);

    return movimentacao;
  }

  // Movimentações específicas para integração com orçamentos
  async registrarSaidaParaOrcamento(produtoId: string, quantidade: number, orcamentoId: string, usuarioId: string): Promise<EstoqueMovimentacao> {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero.');
    }

    // Verificar estoque disponível
    const estoqueDisponivel = await this.repository.verificarEstoqueDisponivel(produtoId, quantidade);
    if (!estoqueDisponivel) {
      throw new Error('Estoque insuficiente para atender o orçamento.');
    }

    // Registrar saída
    return this.createMovimentacao({
      produto_id: produtoId,
      tipo_movimentacao: 'saida',
      quantidade: -quantidade, // Negativo para saída
      observacoes: `Saída para orçamento ${orcamentoId}`,
      documento_referencia: orcamentoId,
      usuario_id: usuarioId
    });
  }

  async estornarSaidaOrcamento(orcamentoId: string, usuarioId: string): Promise<EstoqueMovimentacao[]> {
    // Buscar movimentações do orçamento
    const movimentacoes = await this.repository.getMovimentacoesPorDocumento(orcamentoId);
    const estornos: EstoqueMovimentacao[] = [];

    for (const movimentacao of movimentacoes) {
      if (movimentacao.tipo_movimentacao === 'saida' && movimentacao.quantidade < 0) {
        // Criar movimentação de estorno (entrada)
        const estorno = await this.repository.create({
          produto_id: movimentacao.produto_id,
          tipo_movimentacao: 'entrada',
          quantidade: Math.abs(movimentacao.quantidade),
          observacoes: `Estorno de saída do orçamento ${orcamentoId}`,
          documento_referencia: `ESTORNO_${orcamentoId}`,
          usuario_id: usuarioId
        });

        estornos.push(estorno);

        // Atualizar quantidade do produto
        await this.atualizarQuantidadeProduto(movimentacao.produto_id);
      }
    }

    return estornos;
  }

  // Relatórios e consultas
  async gerarRelatorioMovimentacoes(filtros: RelatorioMovimentacoes): Promise<EstoqueMovimentacao[]> {
    return this.repository.findMovimentacoesPorPeriodo(filtros);
  }

  async gerarRelatorioEstoque(): Promise<RelatorioEstoque> {
    const produtosComEstoqueBaixo = await this.produtoService.findProdutosComEstoqueBaixo();
    const produtosSemEstoque = await this.produtoService.findProdutosSemEstoque();
    const totalProdutos = (await this.produtoService.findProdutosAtivos()).length;

    return {
      total_produtos: totalProdutos,
      produtos_estoque_baixo: produtosComEstoqueBaixo,
      produtos_sem_estoque: produtosSemEstoque,
      data_geracao: new Date()
    };
  }

  async getHistoricoProduto(produtoId: string): Promise<HistoricoMovimentacoes> {
    return this.repository.getHistoricoPorProduto(produtoId);
  }

  async getTotaisPorTipo(produtoId?: string): Promise<Record<TipoMovimentacao, number>> {
    return this.repository.getTotaisPorTipo(produtoId);
  }

  // Validações e verificações
  async verificarEstoqueDisponivel(produtoId: string, quantidadeNecessaria: number): Promise<boolean> {
    return this.repository.verificarEstoqueDisponivel(produtoId, quantidadeNecessaria);
  }

  async calcularSaldoAtual(produtoId: string): Promise<number> {
    return this.repository.calcularSaldoAtual(produtoId);
  }

  async getUltimaMovimentacao(produtoId: string): Promise<EstoqueMovimentacao | null> {
    return this.repository.getUltimaMovimentacao(produtoId);
  }

  // Métodos auxiliares
  private async atualizarQuantidadeProduto(produtoId: string): Promise<void> {
    const saldoAtual = await this.repository.calcularSaldoAtual(produtoId);
    await this.produtoService.updateQuantidadeAtual(produtoId, saldoAtual);
  }

  // Validações específicas para orçamentos
  async validarDisponibilidadeParaOrcamento(itens: Array<{produto_id: string, quantidade: number}>): Promise<{valido: boolean, erros: string[]}> {
    const erros: string[] = [];

    for (const item of itens) {
      const disponivel = await this.verificarEstoqueDisponivel(item.produto_id, item.quantidade);
      
      if (!disponivel) {
        const produto = await this.produtoService.findById(item.produto_id);
        const saldoAtual = await this.calcularSaldoAtual(item.produto_id);
        
        erros.push(
          `Produto "${produto?.descricao || item.produto_id}": ` +
          `Solicitado ${item.quantidade}, disponível ${saldoAtual}`
        );
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Transferências entre localizações (futuro)
  async transferirEstoque(produtoId: string, quantidade: number, localizacaoOrigem: string, localizacaoDestino: string, usuarioId: string): Promise<EstoqueMovimentacao[]> {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero.');
    }

    // Validar produto
    await this.produtoService.validarProdutoParaMovimentacao(produtoId);

    // Criar saída da localização origem
    const saida = await this.repository.create({
      produto_id: produtoId,
      tipo_movimentacao: 'transferencia',
      quantidade: -quantidade,
      observacoes: `Transferência de ${localizacaoOrigem} para ${localizacaoDestino}`,
      documento_referencia: `TRANSF_${Date.now()}`,
      usuario_id: usuarioId
    });

    // Criar entrada na localização destino
    const entrada = await this.repository.create({
      produto_id: produtoId,
      tipo_movimentacao: 'transferencia',
      quantidade: quantidade,
      observacoes: `Transferência de ${localizacaoOrigem} para ${localizacaoDestino}`,
      documento_referencia: saida.documento_referencia,
      usuario_id: usuarioId
    });

    return [saida, entrada];
  }

  async softDelete(id: string): Promise<void> {
    const movimentacao = await this.findById(id);
    
    if (!movimentacao) {
      throw new Error('Movimentação não encontrada.');
    }

    // Verificar se pode ser deletada (regras de negócio)
    if (movimentacao.documento_referencia && movimentacao.documento_referencia.startsWith('ORCAMENTO_')) {
      throw new Error('Não é possível deletar movimentações vinculadas a orçamentos.');
    }

    await this.repository.softDelete(id);

    // Recalcular quantidade do produto
    await this.atualizarQuantidadeProduto(movimentacao.produto_id);
  }
}