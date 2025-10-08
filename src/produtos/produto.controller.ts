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
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
      }
      const estoque = await this.service.getEstoqueAtual(id);
      if (!estoque) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
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

      const disponivel = await this.service.verificarEstoqueDisponivel(id, quantidade);
      res.status(200).json({ disponivel });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}