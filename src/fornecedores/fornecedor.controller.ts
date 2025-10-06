// src/fornecedores/fornecedor.controller.ts
import { type Request, type Response } from 'express';
import { FornecedorService } from './fornecedor.service.js';

export class FornecedorController {
  private service = new FornecedorService();

  async create(req: Request, res: Response) {
    try {
      const novoFornecedor = await this.service.create(req.body);
      res.status(201).json(novoFornecedor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const fornecedores = await this.service.findAll();
      res.status(200).json(fornecedores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do fornecedor é obrigatório.' });
      }
      const fornecedor = await this.service.findById(id);
      if (!fornecedor) {
        return res.status(404).json({ message: 'Fornecedor não encontrado.' });
      }
      res.status(200).json(fornecedor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do fornecedor é obrigatório.' });
      }
      const fornecedorAtualizado = await this.service.update(id, req.body);
      res.status(200).json(fornecedorAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do fornecedor é obrigatório.' });
      }
      await this.service.softDelete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}