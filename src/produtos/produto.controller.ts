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
}