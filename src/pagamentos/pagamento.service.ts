import { PagamentoRepository } from './pagamento.repository.js';
import { OsRepository } from '../ordensDeServico/os.repository.js';
import { 
  type Pagamento,
  type PagamentoParcela,
  type CreatePagamentoRequest,
  type UpdatePagamentoRequest,
  type RegistrarPagamentoParcelaRequest,
  type EstornarPagamentoRequest,
  type PagamentoResponse,
  type PagamentoParcelaResponse,
  type PagamentoFilters,
  type PagamentoListResponse,
  type PagamentoStats,
  type RelatorioFinanceiro,
  type CobrancaAutomatica,
  type ConfiguracaoCobranca,
  type ValidacaoPagamento,
  type HistoricoPagamento,
  StatusPagamento,
  FormaPagamento,
  TipoPagamento
} from './pagamento.types.js';

export class PagamentoService {
  private repository = new PagamentoRepository();
  private osRepository = new OsRepository();

  /**
   * Lista todos os pagamentos
   */
  async findAll(): Promise<Pagamento[]> {
    return await this.repository.findAll();
  }

  /**
   * Cria um novo pagamento
   */
  async create(pagamento: CreatePagamentoRequest, usuario_id: string): Promise<Pagamento> {
    // Validar se a OS existe
    const os = await this.osRepository.findById(pagamento.os_id);
    if (!os) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // Verificar se já existe pagamento para esta OS
    const pagamentoExistente = await this.repository.findByOSId(pagamento.os_id);
    if (pagamentoExistente) {
      throw new Error('Já existe um pagamento cadastrado para esta OS.');
    }

    // Validações de negócio
    if (pagamento.valor_total <= 0) {
      throw new Error('Valor total deve ser maior que zero.');
    }

    if (pagamento.numero_parcelas < 1) {
      throw new Error('Número de parcelas deve ser maior que zero.');
    }

    // Criar o pagamento
    const novoPagamento = await this.repository.create(pagamento);

    // Criar parcelas
    const parcelas = this.gerarParcelas(novoPagamento, pagamento);
    await this.repository.createParcelas(novoPagamento.id, parcelas);

    // Registrar no histórico
    await this.repository.createHistorico({
      pagamento_id: novoPagamento.id,
      usuario_id,
      acao: 'CRIACAO',
      valor_anterior: null,
      valor_novo: pagamento.valor_total,
      observacoes: 'Pagamento criado no sistema'
    });

    return novoPagamento;
  }

  /**
   * Gera parcelas para um pagamento
   */
  private gerarParcelas(
    pagamento: Pagamento, 
    request: CreatePagamentoRequest
  ): Omit<PagamentoParcela, 'id' | 'pagamento_id' | 'created_at' | 'updated_at'>[] {
    const parcelas: Omit<PagamentoParcela, 'id' | 'pagamento_id' | 'created_at' | 'updated_at'>[] = [];
    const valorParcela = pagamento.valor_total / pagamento.numero_parcelas;
    const dataVencimento = new Date(request.data_vencimento || new Date().toISOString().split('T')[0]);

    for (let i = 0; i < pagamento.numero_parcelas; i++) {
      const dataVencimentoParcela = new Date(dataVencimento);
      dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + i);

      parcelas.push({
        numero_parcela: i + 1,
        valor_parcela: Math.round(valorParcela * 100) / 100, // Arredondar para 2 casas decimais
        data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
        status: StatusPagamento.PENDENTE,
        forma_pagamento_parcela: null,
        data_pagamento: null,
        observacoes: null
      });
    }

    // Ajustar última parcela para compensar arredondamentos
    if (parcelas.length > 0) {
      const somaCalculada = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
      const diferenca = pagamento.valor_total - somaCalculada;
      if (Math.abs(diferenca) > 0.01) {
        parcelas[parcelas.length - 1].valor_parcela += diferenca;
        parcelas[parcelas.length - 1].valor_parcela = Math.round(parcelas[parcelas.length - 1].valor_parcela * 100) / 100;
      }
    }

    return parcelas;
  }

  /**
   * Busca pagamento por ID
   */
  async findById(id: string): Promise<PagamentoResponse | null> {
    return this.repository.findById(id);
  }

  /**
   * Busca pagamento por OS ID
   */
  async findByOSId(os_id: string): Promise<PagamentoResponse | null> {
    return this.repository.findByOSId(os_id);
  }

  /**
   * Busca pagamentos com filtros
   */
  async findWithFilters(filters: PagamentoFilters): Promise<PagamentoListResponse> {
    const resultado = await this.repository.findWithFilters(filters);
    
    return {
      pagamentos: resultado.pagamentos,
      total: resultado.total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      total_pages: Math.ceil(resultado.total / (filters.limit || 10))
    };
  }

  /**
   * Atualiza um pagamento
   */
  async update(id: string, updates: UpdatePagamentoRequest, usuario_id: string): Promise<Pagamento> {
    const pagamentoAtual = await this.repository.findById(id);
    if (!pagamentoAtual) {
      throw new Error('Pagamento não encontrado.');
    }

    // Validar se pode ser alterado
    if (pagamentoAtual.status === StatusPagamento.PAGO) {
      throw new Error('Não é possível alterar um pagamento já quitado.');
    }

    // Registrar no histórico se houver mudança de valor
    if (updates.valor_total && updates.valor_total !== pagamentoAtual.valor_total) {
      await this.repository.createHistorico({
        pagamento_id: id,
        usuario_id,
        acao: 'ALTERACAO_VALOR',
        valor_anterior: pagamentoAtual.valor_total,
        valor_novo: updates.valor_total,
        observacoes: 'Valor do pagamento alterado'
      });
    }

    return this.repository.update(id, updates);
  }

  /**
   * Registra pagamento de uma parcela
   */
  async registrarPagamentoParcela(
    parcela_id: string, 
    pagamento: RegistrarPagamentoParcelaRequest,
    usuario_id: string
  ): Promise<PagamentoParcela> {
    // Buscar parcela
    const pagamentoCompleto = await this.repository.findWithFilters({ page: 1, limit: 1000 });
    const parcelaEncontrada = pagamentoCompleto.pagamentos
      .flatMap(p => p.parcelas)
      .find(parcela => parcela.id === parcela_id);

    if (!parcelaEncontrada) {
      throw new Error('Parcela não encontrada.');
    }

    if (parcelaEncontrada.status === StatusPagamento.PAGO) {
      throw new Error('Esta parcela já foi paga.');
    }

    // Validar data de pagamento
    const dataPagamento = new Date(pagamento.data_pagamento);
    const hoje = new Date();
    if (dataPagamento > hoje) {
      throw new Error('Data de pagamento não pode ser futura.');
    }

    // Registrar pagamento da parcela
    const parcelaAtualizada = await this.repository.registrarPagamentoParcela(parcela_id, pagamento);

    // Atualizar status do pagamento principal se necessário
    await this.atualizarStatusPagamentoPrincipal(parcelaEncontrada.pagamento_id);

    // Registrar no histórico
    await this.repository.createHistorico({
      pagamento_id: parcelaEncontrada.pagamento_id,
      usuario_id,
      acao: 'PAGAMENTO_PARCELA',
      valor_anterior: null,
      valor_novo: parcelaEncontrada.valor_parcela,
      observacoes: `Parcela ${parcelaEncontrada.numero_parcela} paga via ${pagamento.forma_pagamento_parcela}`
    });

    return parcelaAtualizada;
  }

  /**
   * Atualiza status do pagamento principal baseado nas parcelas
   */
  private async atualizarStatusPagamentoPrincipal(pagamento_id: string): Promise<void> {
    const pagamento = await this.repository.findById(pagamento_id);
    if (!pagamento) return;

    const parcelasPagas = pagamento.parcelas.filter(p => p.status === StatusPagamento.PAGO);
    const parcelasVencidas = pagamento.parcelas.filter(p => 
      p.status === StatusPagamento.PENDENTE && 
      new Date(p.data_vencimento) < new Date()
    );

    let novoStatus: StatusPagamento;
    let valorPago = parcelasPagas.reduce((sum, p) => sum + p.valor_parcela, 0);
    let valorPendente = pagamento.valor_total - valorPago;

    if (parcelasPagas.length === pagamento.parcelas.length) {
      novoStatus = StatusPagamento.PAGO;
      valorPendente = 0;
    } else if (parcelasVencidas.length > 0) {
      novoStatus = StatusPagamento.VENCIDO;
    } else if (parcelasPagas.length > 0) {
      novoStatus = StatusPagamento.PARCIAL;
    } else {
      novoStatus = StatusPagamento.PENDENTE;
    }

    await this.repository.update(pagamento_id, {
      status: novoStatus,
      valor_pago: valorPago,
      valor_pendente: valorPendente
    });
  }

  /**
   * Estorna um pagamento
   */
  async estornarPagamento(
    pagamento_id: string, 
    estorno: EstornarPagamentoRequest,
    usuario_id: string
  ): Promise<Pagamento> {
    const pagamento = await this.repository.findById(pagamento_id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado.');
    }

    if (pagamento.status !== StatusPagamento.PAGO && pagamento.status !== StatusPagamento.PARCIAL) {
      throw new Error('Só é possível estornar pagamentos pagos ou parciais.');
    }

    // Estornar parcelas pagas
    for (const parcela of pagamento.parcelas) {
      if (parcela.status === StatusPagamento.PAGO) {
        await this.repository.update(parcela.id, {
          status: StatusPagamento.PENDENTE,
          data_pagamento: null,
          forma_pagamento_parcela: null,
          observacoes: `Estornado: ${estorno.motivo}`
        });
      }
    }

    // Atualizar pagamento principal
    const pagamentoEstornado = await this.repository.update(pagamento_id, {
      status: StatusPagamento.PENDENTE,
      valor_pago: 0,
      valor_pendente: pagamento.valor_total
    });

    // Registrar no histórico
    await this.repository.createHistorico({
      pagamento_id,
      usuario_id,
      acao: 'ESTORNO',
      valor_anterior: pagamento.valor_pago,
      valor_novo: 0,
      observacoes: `Estorno: ${estorno.motivo}`
    });

    return pagamentoEstornado;
  }

  /**
   * Busca parcelas vencidas
   */
  async findParcelasVencidas(): Promise<PagamentoParcelaResponse[]> {
    return this.repository.findParcelasVencidas();
  }

  /**
   * Busca parcelas que vencem hoje
   */
  async findParcelasVencemHoje(): Promise<PagamentoParcelaResponse[]> {
    return this.repository.findParcelasVencemHoje();
  }

  /**
   * Busca parcelas que vencem nos próximos N dias
   */
  async findParcelasVencemProximosDias(dias: number): Promise<PagamentoParcelaResponse[]> {
    if (dias < 1) {
      throw new Error('Número de dias deve ser maior que zero.');
    }
    return this.repository.findParcelasVencemProximosDias(dias);
  }

  /**
   * Atualiza status de parcelas vencidas
   */
  async atualizarParcelasVencidas(): Promise<number> {
    const parcelasAtualizadas = await this.repository.updateParcelasVencidas();
    
    // Atualizar status dos pagamentos principais afetados
    const parcelasVencidas = await this.repository.findParcelasVencidas();
    const pagamentosIds = [...new Set(parcelasVencidas.map(p => p.pagamento_id))];
    
    for (const pagamento_id of pagamentosIds) {
      await this.atualizarStatusPagamentoPrincipal(pagamento_id);
    }

    return parcelasAtualizadas;
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  async getStats(): Promise<PagamentoStats> {
    return this.repository.getStats();
  }

  /**
   * Gera relatório financeiro
   */
  async getRelatorioFinanceiro(data_inicio: string, data_fim: string): Promise<RelatorioFinanceiro> {
    // Validar datas
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    
    if (inicio > fim) {
      throw new Error('Data de início deve ser anterior à data de fim.');
    }

    if (fim > new Date()) {
      throw new Error('Data de fim não pode ser futura.');
    }

    return this.repository.getRelatorioFinanceiro(data_inicio, data_fim);
  }

  /**
   * Configura cobrança automática
   */
  async configurarCobrancaAutomatica(config: ConfiguracaoCobranca): Promise<void> {
    // Validações
    if (config.dias_antes_vencimento < 0) {
      throw new Error('Dias antes do vencimento deve ser maior ou igual a zero.');
    }

    if (config.dias_apos_vencimento < 0) {
      throw new Error('Dias após vencimento deve ser maior ou igual a zero.');
    }

    // Aqui seria implementada a lógica de configuração de cobrança automática
    // Por exemplo, salvar configurações em uma tabela específica
    console.log('Configuração de cobrança automática:', config);
  }

  /**
   * Processa cobrança automática
   */
  async processarCobrancaAutomatica(): Promise<CobrancaAutomatica[]> {
    const cobrancas: CobrancaAutomatica[] = [];

    // Parcelas que vencem hoje
    const parcelasHoje = await this.repository.findParcelasVencemHoje();
    
    // Parcelas que vencem em 3 dias (aviso)
    const parcelas3Dias = await this.repository.findParcelasVencemProximosDias(3);
    
    // Parcelas vencidas
    const parcelasVencidas = await this.repository.findParcelasVencidas();

    // Processar avisos de vencimento
    parcelas3Dias.forEach(parcela => {
      cobrancas.push({
        parcela_id: parcela.id,
        tipo_cobranca: 'aviso_vencimento',
        data_envio: new Date().toISOString(),
        meio_envio: 'email', // Configurável
        status_envio: 'pendente',
        tentativas: 0,
        proximo_envio: new Date().toISOString()
      });
    });

    // Processar vencimentos de hoje
    parcelasHoje.forEach(parcela => {
      cobrancas.push({
        parcela_id: parcela.id,
        tipo_cobranca: 'vencimento_hoje',
        data_envio: new Date().toISOString(),
        meio_envio: 'email',
        status_envio: 'pendente',
        tentativas: 0,
        proximo_envio: new Date().toISOString()
      });
    });

    // Processar parcelas vencidas
    parcelasVencidas.forEach(parcela => {
      const diasAtraso = parcela.dias_atraso || 0;
      let tipoCobranca: 'cobranca_1' | 'cobranca_2' | 'cobranca_3' = 'cobranca_1';
      
      if (diasAtraso > 30) {
        tipoCobranca = 'cobranca_3';
      } else if (diasAtraso > 15) {
        tipoCobranca = 'cobranca_2';
      }

      cobrancas.push({
        parcela_id: parcela.id,
        tipo_cobranca: tipoCobranca,
        data_envio: new Date().toISOString(),
        meio_envio: 'email',
        status_envio: 'pendente',
        tentativas: 0,
        proximo_envio: new Date().toISOString()
      });
    });

    return cobrancas;
  }

  /**
   * Valida dados de pagamento
   */
  validarPagamento(pagamento: CreatePagamentoRequest): ValidacaoPagamento {
    const erros: string[] = [];

    if (!pagamento.os_id) {
      erros.push('ID da OS é obrigatório');
    }

    if (!pagamento.valor_total || pagamento.valor_total <= 0) {
      erros.push('Valor total deve ser maior que zero');
    }

    if (!pagamento.forma_pagamento) {
      erros.push('Forma de pagamento é obrigatória');
    }

    if (!pagamento.data_vencimento) {
      erros.push('Data de vencimento é obrigatória');
    } else {
      const dataVencimento = new Date(pagamento.data_vencimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataVencimento < hoje) {
        erros.push('Data de vencimento não pode ser anterior a hoje');
      }
    }

    if (!pagamento.numero_parcelas || pagamento.numero_parcelas < 1) {
      erros.push('Número de parcelas deve ser maior que zero');
    }

    if (pagamento.numero_parcelas > 12) {
      erros.push('Número máximo de parcelas é 12');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Soft delete de um pagamento
   */
  async softDelete(id: string, usuario_id: string): Promise<void> {
    const pagamento = await this.repository.findById(id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado.');
    }

    // Validar se pode ser deletado
    if (pagamento.status === StatusPagamento.PAGO || pagamento.status === StatusPagamento.PARCIAL) {
      throw new Error('Não é possível deletar um pagamento que já possui parcelas pagas.');
    }

    // Registrar no histórico
    await this.repository.createHistorico({
      pagamento_id: id,
      usuario_id,
      acao: 'EXCLUSAO',
      valor_anterior: pagamento.valor_total,
      valor_novo: null,
      observacoes: 'Pagamento removido do sistema'
    });

    return this.repository.softDelete(id);
  }

  /**
   * Obtém histórico de um pagamento
   */
  async getHistorico(pagamento_id: string): Promise<HistoricoPagamento[]> {
    // Implementar busca de histórico quando o repository tiver o método
    // Por enquanto, retorna array vazio
    return [];
  }

  /**
   * Calcula juros e multa para parcela vencida
   */
  calcularJurosMulta(
    valor_parcela: number, 
    dias_atraso: number,
    taxa_juros_dia: number = 0.033, // 1% ao mês = 0.033% ao dia
    percentual_multa: number = 2 // 2% de multa
  ): {
    valor_original: number;
    juros: number;
    multa: number;
    valor_total: number;
  } {
    const multa = dias_atraso > 0 ? (valor_parcela * percentual_multa / 100) : 0;
    const juros = valor_parcela * (taxa_juros_dia / 100) * dias_atraso;
    const valor_total = valor_parcela + juros + multa;

    return {
      valor_original: valor_parcela,
      juros: Math.round(juros * 100) / 100,
      multa: Math.round(multa * 100) / 100,
      valor_total: Math.round(valor_total * 100) / 100
    };
  }
}