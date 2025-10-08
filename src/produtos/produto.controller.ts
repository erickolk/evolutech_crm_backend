import { type Request, type Response } from 'express';
import { ProdutoService } from './produto.service.js';

export class ProdutoController {
  private service = new ProdutoService();

  async create(req: Request, res: Response) {
    try {
      const novoProduto = await this.service.create(req.body);
      res.status(201).json(novoProduto);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const produtos = await this.service.findAll();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const produto = await this.service.findById(id);
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(200).json(produto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const produtoAtualizado = await this.service.update(id, req.body);
      res.status(200).json(produtoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      await this.service.softDelete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Endpoints específicos de estoque
  async updateEstoqueConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const produtoAtualizado = await this.service.updateEstoqueConfig(id, req.body);
      res.status(200).json(produtoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findProdutosAtivos(req: Request, res: Response) {
    try {
      const produtos = await this.service.findProdutosAtivos();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findProdutosComEstoqueBaixo(req: Request, res: Response) {
    try {
      const produtos = await this.service.findProdutosComEstoqueBaixo();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findProdutosSemEstoque(req: Request, res: Response) {
    try {
      const produtos = await this.service.findProdutosSemEstoque();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getEstoqueAtual(req: Request, res: Response) {
    try {
      const estoque = await this.service.getEstoqueAtual();
      res.status(200).json(estoque);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findByCodigoBarras(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      if (!codigo) {
        return res.status(400).json({ message: 'O código de barras é obrigatório.' });
      }
      const produto = await this.service.findByCodigoBarras(codigo);
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(200).json(produto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async verificarEstoqueDisponivel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const resultado = await this.service.verificarEstoqueDisponivel(id, quantidade);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ===== NOVOS ENDPOINTS DE ESTOQUE =====

  async findWithFilters(req: Request, res: Response) {
    try {
      const filtros = req.query;
      const resultado = await this.service.findWithFilters(filtros);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateConfiguracaoEstoque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const produtoAtualizado = await this.service.updateConfiguracaoEstoque(id, req.body);
      res.status(200).json(produtoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findProdutosParaReposicao(req: Request, res: Response) {
    try {
      const produtos = await this.service.findProdutosParaReposicao();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getValorTotalEstoque(req: Request, res: Response) {
    try {
      const valorTotal = await this.service.getValorTotalEstoque();
      res.status(200).json({ valor_total: valorTotal });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findByCodigoInterno(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      if (!codigo) {
        return res.status(400).json({ message: 'O código interno é obrigatório.' });
      }
      const produto = await this.service.findByCodigoInterno(codigo);
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(200).json(produto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRelatorioEstoque(req: Request, res: Response) {
    try {
      const relatorio = await this.service.getRelatorioEstoque();
      res.status(200).json(relatorio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async processarMovimentacaoEstoque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const movimentacao = await this.service.processarMovimentacaoEstoque(id, req.body);
      res.status(201).json(movimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async ajustarEstoque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade_nova, motivo, observacoes, usuario_id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (quantidade_nova === undefined || quantidade_nova < 0) {
        return res.status(400).json({ message: 'Quantidade nova deve ser informada e não pode ser negativa.' });
      }

      const movimentacao = await this.service.ajustarEstoque(id, quantidade_nova, motivo, observacoes, usuario_id);
      res.status(201).json(movimentacao);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async reservarEstoque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade, orcamento_id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      }

      const reserva = await this.service.reservarEstoque(id, quantidade, orcamento_id);
      res.status(200).json(reserva);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getHistoricoMovimentacoes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      
      const filtros = req.query;
      const historico = await this.service.getHistoricoMovimentacoes(id, filtros);
      res.status(200).json(historico);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}