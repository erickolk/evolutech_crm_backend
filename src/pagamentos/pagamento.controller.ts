import { type Request, type Response } from 'express';
import { PagamentoService } from './pagamento.service.js';
import { StatusPagamento, FormaPagamento, TipoPagamento } from './pagamento.types.js';

export class PagamentoController {
  private service = new PagamentoService();

  /**
   * Cria um novo pagamento
   */
  async create(req: Request, res: Response) {
    try {
      const novoPagamento = await this.service.create(req.body);
      res.status(201).json(novoPagamento);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Busca pagamento por ID
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do pagamento é obrigatório.' });
      }

      const pagamento = await this.service.findById(id);
      if (!pagamento) {
        return res.status(404).json({ message: 'Pagamento não encontrado.' });
      }

      res.status(200).json(pagamento);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca pagamentos por OS
   */
  async findByOsId(req: Request, res: Response) {
    try {
      const { os_id } = req.params;
      if (!os_id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }

      const pagamentos = await this.service.findByOsId(os_id);
      res.status(200).json(pagamentos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca pagamentos com filtros
   */
  async findWithFilters(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pagamentos = await this.service.findWithFilters(filters);
      res.status(200).json(pagamentos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Atualiza um pagamento
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do pagamento é obrigatório.' });
      }

      const pagamentoAtualizado = await this.service.update(id, req.body);
      res.status(200).json(pagamentoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Registra pagamento de parcela
   */
  async registrarPagamentoParcela(req: Request, res: Response) {
    try {
      const { parcela_id } = req.params;
      const { valor_pago, data_pagamento, forma_pagamento, observacoes, usuario_id } = req.body;

      if (!parcela_id) {
        return res.status(400).json({ message: 'O ID da parcela é obrigatório.' });
      }

      if (!valor_pago) {
        return res.status(400).json({ message: 'O valor pago é obrigatório.' });
      }

      const resultado = await this.service.registrarPagamentoParcela(
        parcela_id,
        valor_pago,
        data_pagamento,
        forma_pagamento,
        observacoes,
        usuario_id
      );

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Estorna um pagamento
   */
  async estornarPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo, usuario_id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'O ID do pagamento é obrigatório.' });
      }

      if (!motivo) {
        return res.status(400).json({ message: 'O motivo do estorno é obrigatório.' });
      }

      const resultado = await this.service.estornarPagamento(id, motivo, usuario_id);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Busca parcelas em atraso
   */
  async findParcelasVencidas(req: Request, res: Response) {
    try {
      const parcelas = await this.service.findParcelasVencidas();
      res.status(200).json(parcelas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca parcelas que vencem hoje
   */
  async findParcelasVencemHoje(req: Request, res: Response) {
    try {
      const parcelas = await this.service.findParcelasVencemHoje();
      res.status(200).json(parcelas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Busca parcelas que vencem nos próximos N dias
   */
  async findParcelasVencemProximosDias(req: Request, res: Response) {
    try {
      const { dias } = req.params;
      const diasNum = parseInt(dias);

      if (isNaN(diasNum) || diasNum <= 0) {
        return res.status(400).json({ message: 'Número de dias deve ser um valor positivo.' });
      }

      const parcelas = await this.service.findParcelasVencemProximosDias(diasNum);
      res.status(200).json(parcelas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Atualiza status de parcelas vencidas
   */
  async atualizarStatusParcelasVencidas(req: Request, res: Response) {
    try {
      const resultado = await this.service.atualizarStatusParcelasVencidas();
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  async getEstatisticas(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await this.service.getEstatisticas(
        dataInicio as string,
        dataFim as string
      );
      res.status(200).json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Gera relatório financeiro
   */
  async getRelatorioFinanceiro(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim, agrupamento } = req.query;
      
      if (!dataInicio || !dataFim) {
        return res.status(400).json({ 
          message: 'Data de início e fim são obrigatórias.' 
        });
      }

      const relatorio = await this.service.getRelatorioFinanceiro(
        dataInicio as string,
        dataFim as string,
        agrupamento as 'dia' | 'semana' | 'mes'
      );
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Configura cobrança automática
   */
  async configurarCobrancaAutomatica(req: Request, res: Response) {
    try {
      const configuracao = await this.service.configurarCobrancaAutomatica(req.body);
      res.status(200).json(configuracao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Processa cobrança automática
   */
  async processarCobrancaAutomatica(req: Request, res: Response) {
    try {
      const resultado = await this.service.processarCobrancaAutomatica();
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Calcula juros e multa para parcela
   */
  async calcularJurosMulta(req: Request, res: Response) {
    try {
      const { parcela_id } = req.params;
      
      if (!parcela_id) {
        return res.status(400).json({ message: 'O ID da parcela é obrigatório.' });
      }

      const calculo = await this.service.calcularJurosMulta(parcela_id);
      res.status(200).json(calculo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Remove um pagamento (soft delete)
   */
  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo, usuario_id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'O ID do pagamento é obrigatório.' });
      }

      await this.service.softDelete(id, motivo, usuario_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}