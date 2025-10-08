import { type Request, type Response } from 'express';
import { EstoqueService } from './estoque.service.js';

export class EstoqueController {
  private service = new EstoqueService();

  // ===== MOVIMENTAÇÕES BÁSICAS =====

  async criarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacao = await this.service.criarMovimentacao(req.body);
      res.status(201).json(movimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async listarMovimentacoes(req: Request, res: Response) {
    try {
      const filtros = req.query;
      const movimentacoes = await this.service.listarMovimentacoes(filtros);
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async obterMovimentacao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da movimentação é obrigatório.' });
      }
      
      const movimentacao = await this.service.obterMovimentacao(id);
      if (!movimentacao) {
        return res.status(404).json({ message: 'Movimentação não encontrada.' });
      }
      
      res.status(200).json(movimentacao);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async obterMovimentacoesPorProduto(req: Request, res: Response) {
    try {
      const { produto_id } = req.params;
      if (!produto_id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      const filtros = req.query;
      const movimentacoes = await this.service.listarMovimentacoes({ 
        ...filtros, 
        produto_id 
      });
      
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async ajustarEstoque(req: Request, res: Response) {
    try {
      const { produto_id, quantidade_nova, motivo, observacoes, usuario_id } = req.body;
      
      if (!produto_id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (quantidade_nova === undefined || quantidade_nova < 0) {
        return res.status(400).json({ message: 'Quantidade nova deve ser informada e não pode ser negativa.' });
      }

      const movimentacao = await this.service.ajustarEstoque(produto_id, quantidade_nova, motivo, observacoes, usuario_id);
      res.status(201).json(movimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  // ===== HISTÓRICO E RELATÓRIOS =====

  async obterHistoricoProduto(req: Request, res: Response) {
    try {
      const { produto_id } = req.params;
      if (!produto_id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      const filtros = req.query;
      const historico = await this.service.obterHistoricoProduto(produto_id, filtros);
      res.status(200).json(historico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async gerarRelatorioMovimentacoes(req: Request, res: Response) {
    try {
      const filtros = req.query;
      const relatorio = await this.service.gerarRelatorioMovimentacoes(filtros);
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ===== OPERAÇÕES AVANÇADAS =====

  async transferirEstoque(req: Request, res: Response) {
    try {
      const { produto_origem_id, produto_destino_id, quantidade, observacoes, usuario_id } = req.body;
      
      if (!produto_origem_id || !produto_destino_id) {
        return res.status(400).json({ message: 'IDs dos produtos de origem e destino são obrigatórios.' });
      }
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const transferencia = await this.service.transferirEstoque({
        produto_origem_id,
        produto_destino_id,
        quantidade,
        observacoes,
        usuario_id
      });
      
      res.status(201).json(transferencia);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async reservarEstoque(req: Request, res: Response) {
    try {
      const { produto_id, quantidade, orcamento_id, usuario_id } = req.body;
      
      if (!produto_id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const reserva = await this.service.reservarEstoque({
        produto_id,
        quantidade,
        orcamento_id,
        usuario_id
      });
      
      res.status(200).json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async baixarEstoqueOrcamento(req: Request, res: Response) {
    try {
      const { orcamento_id, itens, usuario_id } = req.body;
      
      if (!orcamento_id) {
        return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
      }
      
      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: 'Lista de itens é obrigatória e deve conter pelo menos um item.' });
      }

      const baixas = await this.service.baixarEstoqueOrcamento({
        orcamento_id,
        itens,
        usuario_id
      });
      
      res.status(201).json(baixas);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ===== AUDITORIA E CONTROLE =====

  async auditarEstoque(req: Request, res: Response) {
    try {
      const { produto_id } = req.query;
      const auditoria = await this.service.auditarEstoque(produto_id as string);
      res.status(200).json(auditoria);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async limparHistoricoAntigo(req: Request, res: Response) {
    try {
      const { dias_para_manter } = req.body;
      const diasParaManter = dias_para_manter || 365;
      
      if (diasParaManter < 30) {
        return res.status(400).json({ message: 'Deve manter pelo menos 30 dias de histórico.' });
      }

      const registrosRemovidos = await this.service.limparHistoricoAntigo(diasParaManter);
      res.status(200).json({ 
        message: `${registrosRemovidos} registros removidos com sucesso.`,
        registros_removidos: registrosRemovidos 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ===== INTEGRAÇÃO COM ORÇAMENTOS =====

  async validarDisponibilidadeParaOrcamento(req: Request, res: Response) {
    try {
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens)) {
        return res.status(400).json({ message: 'Lista de itens é obrigatória.' });
      }

      const resultados = [];
      for (const item of itens) {
        if (!item.produto_id || !item.quantidade) {
          return res.status(400).json({ message: 'produto_id e quantidade são obrigatórios para cada item.' });
        }

        const disponivel = await this.service.verificarEstoqueDisponivel(item.produto_id, item.quantidade);
        const saldoAtual = await this.service.calcularSaldoAtual(item.produto_id);
        
        resultados.push({
          produto_id: item.produto_id,
          quantidade_solicitada: item.quantidade,
          saldo_atual: saldoAtual,
          disponivel: disponivel
        });
      }

      res.status(200).json({ itens: resultados });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async registrarSaidaParaOrcamento(req: Request, res: Response) {
    try {
      const { produto_id, quantidade, orcamento_id, usuario_id } = req.body;

      if (!produto_id || !quantidade || !orcamento_id) {
        return res.status(400).json({ message: 'produto_id, quantidade e orcamento_id são obrigatórios.' });
      }

      if (quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const movimentacao = await this.service.registrarSaidaParaOrcamento(
        produto_id, 
        quantidade, 
        orcamento_id, 
        usuario_id
      );

      res.status(201).json(movimentacao);
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('insuficiente')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async estornarSaidaOrcamento(req: Request, res: Response) {
    try {
      const { orcamento_id, usuario_id } = req.body;

      if (!orcamento_id) {
        return res.status(400).json({ message: 'orcamento_id é obrigatório.' });
      }

      const estornos = await this.service.estornarSaidaOrcamento(orcamento_id, usuario_id);
      
      res.status(200).json({
        message: `${estornos.length} movimentações estornadas com sucesso.`,
        estornos: estornos
      });
    } catch (error: any) {
      if (error.message.includes('não encontrado') || error.message.includes('Nenhuma movimentação')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}