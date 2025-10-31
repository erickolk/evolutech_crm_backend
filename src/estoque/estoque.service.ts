import { EstoqueMovimentacaoRepository } from './estoqueMovimentacao.repository.js';
import { ProdutoRepository } from '../produtos/produto.repository.js';
import { TipoMovimentacao, MotivoMovimentacao } from './estoque.types.js';
import type { 
  EstoqueMovimentacao, 
  CreateMovimentacaoRequest, 
  AjusteEstoqueRequest,
  MovimentacaoResponse,
  FiltroMovimentacao,
  ListaMovimentacoesResponse,
  RelatorioMovimentacoes,
  HistoricoMovimentacoes,
  TransferenciaEstoque,
  ReservaEstoque,
  AuditoriaEstoque,
  BaixaEstoqueOrcamento,
  RelatorioEstoque
} from './estoque.types.js';
import type { Produto } from '../produtos/produto.types.js';

export class EstoqueService {
  private movimentacaoRepository: EstoqueMovimentacaoRepository;
  private produtoRepository: ProdutoRepository;

  constructor() {
    this.movimentacaoRepository = new EstoqueMovimentacaoRepository();
    this.produtoRepository = new ProdutoRepository();
  }

  // ===== OPERAÇÕES DE CONSULTA DE ESTOQUE =====

  async listarEstoque(filtros: any = {}): Promise<any> {
    try {
      // Buscar todos os produtos com suas quantidades atuais
      const produtos = await this.produtoRepository.findAll();
      
      // Aplicar filtros se necessário
      let produtosFiltrados = produtos;
      
      if (filtros.estoque_baixo === 'true') {
        produtosFiltrados = produtos.filter(produto => 
          (produto.quantidade_atual || 0) <= (produto.quantidade_minima || 0)
        );
      }
      
      if (filtros.sem_estoque === 'true') {
        produtosFiltrados = produtos.filter(produto => 
          (produto.quantidade_atual || 0) === 0
        );
      }

      // Formatar resposta
      const estoque = produtosFiltrados.map(produto => ({
        produto_id: produto.id,
        descricao: produto.descricao,
        codigo_interno: produto.codigo_interno,
        quantidade_atual: produto.quantidade_atual || 0,
        quantidade_minima: produto.quantidade_minima || 0,
        quantidade_maxima: produto.quantidade_maxima || 0,
        localizacao_estoque: produto.localizacao_estoque,
        preco_custo: produto.preco_custo,
        preco_venda: produto.preco_venda,
        status_estoque: this.getStatusEstoque(produto),
        ativo: produto.ativo
      }));

      return {
        estoque,
        resumo: {
          total_produtos: estoque.length,
          produtos_estoque_baixo: estoque.filter(p => p.status_estoque === 'BAIXO').length,
          produtos_sem_estoque: estoque.filter(p => p.status_estoque === 'SEM_ESTOQUE').length,
          produtos_ok: estoque.filter(p => p.status_estoque === 'OK').length
        }
      };
    } catch (error: any) {
      console.error('Erro ao listar estoque:', error);
      throw new Error(`Erro ao listar estoque: ${error.message}`);
    }
  }

  private getStatusEstoque(produto: Produto): string {
    const quantidadeAtual = produto.quantidade_atual || 0;
    const quantidadeMinima = produto.quantidade_minima || 0;

    if (quantidadeAtual === 0) {
      return 'SEM_ESTOQUE';
    } else if (quantidadeAtual <= quantidadeMinima) {
      return 'BAIXO';
    } else {
      return 'OK';
    }
  }

  // ===== OPERAÇÕES BÁSICAS DE MOVIMENTAÇÃO =====

  async criarMovimentacao(request: CreateMovimentacaoRequest): Promise<MovimentacaoResponse> {
    // Validar produto
    const produto = await this.produtoRepository.findById(request.produto_id);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    console.log('Produto encontrado para validação:', produto.descricao);

    // Calcular quantidades
    const quantidadeAnterior = produto.quantidade_atual || 0;
    const quantidadeMovimentacao = request.tipo_movimentacao === TipoMovimentacao.ENTRADA 
      ? Math.abs(request.quantidade) 
      : -Math.abs(request.quantidade);
    const quantidadeAtual = quantidadeAnterior + quantidadeMovimentacao;

    console.log('Dados da movimentação:', {
      quantidadeAnterior,
      quantidadeMovimentacao,
      tipoMovimentacao: request.tipo_movimentacao
    });

    // Criar objeto de movimentação simplificado
    const movimentacaoCompleta: CreateMovimentacaoRequest = {
      produto_id: request.produto_id,
      tipo_movimentacao: request.tipo_movimentacao,
      quantidade: quantidadeMovimentacao,
      valor_unitario: request.valor_unitario
    };

    console.log('Objeto movimentacaoCompleta:', movimentacaoCompleta);

    try {
      // Criar movimentação
      console.log('Chamando this.movimentacaoRepository.create...');
      const novaMovimentacao = await this.movimentacaoRepository.create(movimentacaoCompleta);
      console.log('Movimentação criada:', novaMovimentacao);

      // Atualizar quantidade do produto
      console.log('Atualizando quantidade do produto para:', quantidadeAtual);
      await this.produtoRepository.updateQuantidadeAtual(request.produto_id, quantidadeAtual);

      return {
        id: novaMovimentacao.id!,
        produto_id: novaMovimentacao.produto_id,
        tipo_movimentacao: novaMovimentacao.tipo_movimentacao,
        quantidade: novaMovimentacao.quantidade,
        quantidade_anterior: quantidadeAnterior,
        quantidade_atual: quantidadeAtual,
        valor_unitario: novaMovimentacao.valor_unitario,
        valor_total: novaMovimentacao.valor_total || (novaMovimentacao.quantidade * novaMovimentacao.valor_unitario),
        motivo: request.motivo || '',
        documento_referencia: request.documento_referencia || null,
        usuario_id: request.usuario_id || null,
        observacoes: request.observacoes || null,
        created_at: novaMovimentacao.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro durante criação da movimentação:', error);
      throw error;
    }
  }

  async ajustarEstoque(ajuste: AjusteEstoqueRequest): Promise<MovimentacaoResponse> {
    const produto = await this.produtoRepository.findById(ajuste.produto_id);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    if (ajuste.nova_quantidade < 0) {
      throw new Error('Nova quantidade não pode ser negativa.');
    }

    const quantidadeAnterior = produto.quantidade_atual || 0;
    const diferenca = ajuste.nova_quantidade - quantidadeAnterior;

    if (diferenca === 0) {
      throw new Error('Nova quantidade é igual à quantidade atual.');
    }

    const movimentacao: CreateMovimentacaoRequest = {
      produto_id: ajuste.produto_id,
      tipo_movimentacao: TipoMovimentacao.AJUSTE,
      quantidade: ajuste.nova_quantidade,
      valor_unitario: produto.preco_custo || 0,
      motivo: diferenca > 0 ? MotivoMovimentacao.AJUSTE_POSITIVO : MotivoMovimentacao.AJUSTE_NEGATIVO,
      observacoes: ajuste.observacoes || `Ajuste de estoque para ${ajuste.nova_quantidade} unidades`,
      usuario_id: ajuste.usuario_id
    };

    return this.criarMovimentacao(movimentacao);
  }

  // ===== CONSULTAS E RELATÓRIOS =====

  async listarMovimentacoes(filtros: FiltroMovimentacao): Promise<ListaMovimentacoesResponse> {
    return this.movimentacaoRepository.findWithFilters(filtros);
  }

  async obterMovimentacao(id: string): Promise<EstoqueMovimentacao | null> {
    return this.movimentacaoRepository.findById(id);
  }

  async obterHistoricoProduto(produtoId: string): Promise<HistoricoMovimentacoes> {
    return this.movimentacaoRepository.getHistoricoProduto(produtoId);
  }

  async gerarRelatorioMovimentacoes(
    dataInicio: Date, 
    dataFim: Date, 
    produtoId?: string
  ): Promise<RelatorioMovimentacoes> {
    return this.movimentacaoRepository.getRelatorioMovimentacoes(dataInicio, dataFim, produtoId);
  }

  // ===== OPERAÇÕES AVANÇADAS =====

  async transferirEstoque(transferencia: TransferenciaEstoque): Promise<MovimentacaoResponse[]> {
    // Validar produtos
    const produtoOrigem = await this.produtoRepository.findById(transferencia.produto_origem_id);
    const produtoDestino = await this.produtoRepository.findById(transferencia.produto_destino_id);

    if (!produtoOrigem || !produtoDestino) {
      throw new Error('Produto de origem ou destino não encontrado.');
    }

    if ((produtoOrigem.quantidade_atual || 0) < transferencia.quantidade) {
      throw new Error('Estoque insuficiente no produto de origem.');
    }

    // Criar movimentação de saída
    const movimentacaoSaida: CreateMovimentacaoRequest = {
      produto_id: transferencia.produto_origem_id,
      tipo_movimentacao: TipoMovimentacao.SAIDA,
      quantidade: transferencia.quantidade,
      valor_unitario: produtoOrigem.preco_custo || 0,
      motivo: MotivoMovimentacao.TRANSFERENCIA,
      documento_referencia: transferencia.documento_referencia,
      observacoes: `Transferência para produto ${produtoDestino.descricao}`,
      usuario_id: transferencia.usuario_id
    };

    // Criar movimentação de entrada
    const movimentacaoEntrada: CreateMovimentacaoRequest = {
      produto_id: transferencia.produto_destino_id,
      tipo_movimentacao: TipoMovimentacao.ENTRADA,
      quantidade: transferencia.quantidade,
      valor_unitario: produtoDestino.preco_custo || 0,
      motivo: MotivoMovimentacao.TRANSFERENCIA,
      documento_referencia: transferencia.documento_referencia,
      observacoes: `Transferência de produto ${produtoOrigem.descricao}`,
      usuario_id: transferencia.usuario_id
    };

    // Executar transferência
    const saida = await this.criarMovimentacao(movimentacaoSaida);
    const entrada = await this.criarMovimentacao(movimentacaoEntrada);

    return [saida, entrada];
  }

  async reservarEstoque(reserva: ReservaEstoque): Promise<boolean> {
    const produto = await this.produtoRepository.findById(reserva.produto_id);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    const estoqueDisponivel = await this.produtoRepository.verificarEstoqueDisponivel(
      reserva.produto_id, 
      reserva.quantidade
    );

    if (!estoqueDisponivel.pode_reservar) {
      return false;
    }

    // TODO: Implementar tabela de reservas
    // Por enquanto, apenas validamos se é possível reservar
    return true;
  }

  async baixarEstoqueOrcamento(baixa: BaixaEstoqueOrcamento): Promise<MovimentacaoResponse[]> {
    const movimentacoes: MovimentacaoResponse[] = [];

    for (const item of baixa.itens) {
      const produto = await this.produtoRepository.findById(item.produto_id);
      if (!produto) {
        throw new Error(`Produto ${item.produto_id} não encontrado.`);
      }

      if ((produto.quantidade_atual || 0) < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${produto.descricao}.`);
      }

      const movimentacao: CreateMovimentacaoRequest = {
        produto_id: item.produto_id,
        tipo_movimentacao: TipoMovimentacao.SAIDA,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        motivo: MotivoMovimentacao.VENDA_OS,
        documento_referencia: baixa.orcamento_id,
        observacoes: `Baixa automática - Orçamento ${baixa.orcamento_id}`,
        usuario_id: baixa.usuario_id
      };

      const resultado = await this.criarMovimentacao(movimentacao);
      movimentacoes.push(resultado);
    }

    return movimentacoes;
  }

  // ===== INTEGRAÇÃO COM ORÇAMENTOS =====

  async registrarSaidaParaOrcamento(
    produtoId: string, 
    quantidade: number, 
    orcamentoId: string, 
    usuarioId?: string
  ): Promise<MovimentacaoResponse> {
    // Validar produto
    const produto = await this.produtoRepository.findById(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    // Verificar estoque disponível
    const estoqueAtual = produto.quantidade_atual || 0;
    if (estoqueAtual < quantidade) {
      throw new Error(`Estoque insuficiente. Disponível: ${estoqueAtual}, Necessário: ${quantidade}`);
    }

    // Criar movimentação de saída
    const movimentacao: CreateMovimentacaoRequest = {
      produto_id: produtoId,
      tipo_movimentacao: TipoMovimentacao.SAIDA,
      quantidade: quantidade,
      valor_unitario: produto.preco_venda || 0,
      motivo: MotivoMovimentacao.VENDA_OS,
      documento_referencia: orcamentoId,
      observacoes: `Saída para orçamento aprovado - ${orcamentoId}`,
      usuario_id: usuarioId
    };

    return await this.criarMovimentacao(movimentacao);
  }

  async estornarSaidaOrcamento(orcamentoId: string, usuarioId?: string): Promise<MovimentacaoResponse[]> {
    // Buscar todas as movimentações de saída relacionadas ao orçamento
    const movimentacoesSaida = await this.movimentacaoRepository.getMovimentacoesPorDocumento(orcamentoId);
    
    if (!movimentacoesSaida || movimentacoesSaida.length === 0) {
      throw new Error('Nenhuma movimentação encontrada para este orçamento.');
    }

    const estornos: MovimentacaoResponse[] = [];

    for (const movimentacao of movimentacoesSaida) {
      // Apenas estornar movimentações de saída que não foram estornadas
      if (movimentacao.tipo_movimentacao === TipoMovimentacao.SAIDA && !movimentacao.deleted_at) {
        // Criar movimentação de entrada para estornar
        const estorno: CreateMovimentacaoRequest = {
          produto_id: movimentacao.produto_id,
          tipo_movimentacao: TipoMovimentacao.ENTRADA,
          quantidade: movimentacao.quantidade,
          valor_unitario: movimentacao.valor_unitario,
          motivo: MotivoMovimentacao.DEVOLUCAO_CLIENTE,
          documento_referencia: `ESTORNO-${orcamentoId}`,
          observacoes: `Estorno de saída - Orçamento ${orcamentoId} rejeitado/cancelado`,
          usuario_id: usuarioId
        };

        const resultadoEstorno = await this.criarMovimentacao(estorno);
        estornos.push(resultadoEstorno);

        // Marcar a movimentação original como estornada (soft delete)
        await this.movimentacaoRepository.softDelete(movimentacao.id!);
      }
    }

    return estornos;
  }

  async verificarEstoqueDisponivel(produtoId: string, quantidadeNecessaria: number): Promise<boolean> {
    const produto = await this.produtoRepository.findById(produtoId);
    if (!produto) {
      return false;
    }

    const estoqueAtual = produto.quantidade_atual || 0;
    return estoqueAtual >= quantidadeNecessaria;
  }

  async calcularSaldoAtual(produtoId: string): Promise<number> {
    const produto = await this.produtoRepository.findById(produtoId);
    return produto?.quantidade_atual || 0;
  }

  // ===== AUDITORIA E CONTROLE =====

  async auditarEstoque(produtoId?: string): Promise<AuditoriaEstoque[]> {
    const produtos = produtoId 
      ? [await this.produtoRepository.findById(produtoId)].filter(Boolean) as Produto[]
      : await this.produtoRepository.findProdutosAtivos();

    const auditorias: AuditoriaEstoque[] = [];

    for (const produto of produtos) {
      const ultimaMovimentacao = await this.movimentacaoRepository.getUltimaMovimentacao(produto.id!);
      const totalMovimentacoes = await this.movimentacaoRepository.contarMovimentacoesPorProduto(produto.id!);

      // Calcular estoque teórico baseado nas movimentações
      const movimentacoes = await this.movimentacaoRepository.findByProdutoId(produto.id!);
      let estoqueTeoricoCalculado = 0;

      for (const mov of movimentacoes) {
        switch (mov.tipo_movimentacao) {
          case TipoMovimentacao.ENTRADA:
            estoqueTeoricoCalculado += mov.quantidade;
            break;
          case TipoMovimentacao.SAIDA:
            estoqueTeoricoCalculado -= mov.quantidade;
            break;
          case TipoMovimentacao.AJUSTE:
            estoqueTeoricoCalculado = mov.quantidade_atual;
            break;
        }
      }

      const divergencia = (produto.quantidade_atual || 0) - estoqueTeoricoCalculado;

      auditorias.push({
        produto_id: produto.id!,
        produto_descricao: produto.descricao,
        estoque_sistema: produto.quantidade_atual || 0,
        estoque_teorico: estoqueTeoricoCalculado,
        divergencia: divergencia,
        tem_divergencia: Math.abs(divergencia) > 0.01, // Tolerância para arredondamentos
        ultima_movimentacao: ultimaMovimentacao?.data_movimentacao,
        total_movimentacoes: totalMovimentacoes,
        data_auditoria: new Date()
      });
    }

    return auditorias;
  }

  async limparHistoricoAntigo(diasParaManter: number = 365): Promise<number> {
    return this.movimentacaoRepository.limparMovimentacoesAntigas(diasParaManter);
  }

  // ===== MÉTODOS AUXILIARES PRIVADOS =====

  private async validarMovimentacao(movimentacao: CreateMovimentacaoRequest): Promise<void> {
    if (!movimentacao.produto_id) {
      throw new Error('ID do produto é obrigatório.');
    }

    if (movimentacao.quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero.');
    }

    if (movimentacao.valor_unitario < 0) {
      throw new Error('Valor unitário não pode ser negativo.');
    }

    const produto = await this.produtoRepository.findById(movimentacao.produto_id);
    console.log('Produto encontrado para validação:', produto);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    // TODO: Reativar validação quando a coluna 'ativo' for adicionada ao banco
    // if (!produto.ativo) {
    //   console.log('Produto inativo. Bloqueando movimentação.');
    //   throw new Error('Não é possível movimentar estoque de produto inativo.');
    // }
  }

  private calcularNovaQuantidade(
    quantidadeAtual: number, 
    quantidade: number, 
    tipo: TipoMovimentacao
  ): number {
    switch (tipo) {
      case TipoMovimentacao.ENTRADA:
        return quantidadeAtual + quantidade;
      case TipoMovimentacao.SAIDA:
        return quantidadeAtual - quantidade;
      case TipoMovimentacao.AJUSTE:
        return quantidade; // Para ajuste, a quantidade é o novo valor absoluto
      case TipoMovimentacao.TRANSFERENCIA:
        return quantidadeAtual; // Transferência é tratada separadamente
      default:
        throw new Error('Tipo de movimentação inválido.');
    }
  }
}