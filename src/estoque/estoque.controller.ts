import { type Request, type Response } from 'express';
import { EstoqueService } from './estoque.service.js';

export class EstoqueController {
  private service = new EstoqueService();

  // CRUD de movimentações
  async createMovimentacao(req: Request, res: Response) {
    try {
      const novaMovimentacao = await this.service.createMovimentacao(req.body);
      res.status(201).json(novaMovimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAllMovimentacoes(req: Request, res: Response) {
    try {
      const movimentacoes = await this.service.findAll();
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findMovimentacaoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da movimentação é obrigatório.' });
      }
      const movimentacao = await this.service.findById(id);
      if (!movimentacao) {
        return res.status(404).json({ message: 'Movimentação não encontrada.' });
      }
      res.status(200).json(movimentacao);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findMovimentacoesByProduto(req: Request, res: Response) {
    try {
      const { produtoId } = req.params;
      if (!produtoId) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const movimentacoes = await this.service.findByProdutoId(produtoId);
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Ajustes de estoque
  async ajustarEstoque(req: Request, res: Response) {
    try {
      const ajuste = await this.service.ajustarEstoque(req.body);
      res.status(201).json(ajuste);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Transferências
  async transferirEstoque(req: Request, res: Response) {
    try {
      const { produtoId, quantidade, localizacaoOrigem, localizacaoDestino, usuarioId } = req.body;
      
      if (!produtoId || !quantidade || !localizacaoOrigem || !localizacaoDestino || !usuarioId) {
        return res.status(400).json({ 
          message: 'Produto, quantidade, localização origem, localização destino e usuário são obrigatórios.' 
        });
      }

      const transferencia = await this.service.transferirEstoque(
        produtoId, 
        quantidade, 
        localizacaoOrigem, 
        localizacaoDestino, 
        usuarioId
      );
      res.status(201).json(transferencia);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Consultas e verificações
  async calcularSaldoAtual(req: Request, res: Response) {
    try {
      const { produtoId } = req.params;
      if (!produtoId) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const saldo = await this.service.calcularSaldoAtual(produtoId);
      res.status(200).json({ produto_id: produtoId, saldo_atual: saldo });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async verificarEstoqueDisponivel(req: Request, res: Response) {
    try {
      const { produtoId } = req.params;
      const { quantidade } = req.body;
      
      if (!produtoId) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const disponivel = await this.service.verificarEstoqueDisponivel(produtoId, quantidade);
      res.status(200).json({ 
        produto_id: produtoId, 
        quantidade_solicitada: quantidade,
        disponivel 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUltimaMovimentacao(req: Request, res: Response) {
    try {
      const { produtoId } = req.params;
      if (!produtoId) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const ultimaMovimentacao = await this.service.getUltimaMovimentacao(produtoId);
      res.status(200).json(ultimaMovimentacao);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Relatórios
  async gerarRelatorioMovimentacoes(req: Request, res: Response) {
    try {
      const filtros = req.query;
      const relatorio = await this.service.gerarRelatorioMovimentacoes(filtros as any);
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async gerarRelatorioEstoque(req: Request, res: Response) {
    try {
      const relatorio = await this.service.gerarRelatorioEstoque();
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getHistoricoProduto(req: Request, res: Response) {
    try {
      const { produtoId } = req.params;
      if (!produtoId) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const historico = await this.service.getHistoricoProduto(produtoId);
      res.status(200).json(historico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTotaisPorTipo(req: Request, res: Response) {
    try {
      const { produtoId } = req.query;
      const totais = await this.service.getTotaisPorTipo(produtoId as string);
      res.status(200).json(totais);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Integração com orçamentos
  async validarEstoqueParaOrcamento(req: Request, res: Response) {
    try {
      const { itens } = req.body;
      
      if (!itens || !Array.isArray(itens)) {
        return res.status(400).json({ message: 'Lista de itens é obrigatória.' });
      }

      const validacao = await this.service.validarDisponibilidadeParaOrcamento(itens);
      res.status(200).json(validacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async registrarSaidaParaOrcamento(req: Request, res: Response) {
    try {
      const { produtoId, quantidade, orcamentoId, usuarioId } = req.body;
      
      if (!produtoId || !quantidade || !orcamentoId || !usuarioId) {
        return res.status(400).json({ 
          message: 'Produto, quantidade, orçamento e usuário são obrigatórios.' 
        });
      }

      const movimentacao = await this.service.registrarSaidaParaOrcamento(
        produtoId, 
        quantidade, 
        orcamentoId, 
        usuarioId
      );
      res.status(201).json(movimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async estornarSaidaOrcamento(req: Request, res: Response) {
    try {
      const { orcamentoId, usuarioId } = req.body;
      
      if (!orcamentoId || !usuarioId) {
        return res.status(400).json({ 
          message: 'Orçamento e usuário são obrigatórios.' 
        });
      }

      const estornos = await this.service.estornarSaidaOrcamento(orcamentoId, usuarioId);
      res.status(200).json(estornos);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Soft delete
  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da movimentação é obrigatório.' });
      }
      await this.service.softDelete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}