import { type Request, type Response } from 'express';
import { OsService } from './os.service.js';

export class OsController {
  // O Controller tem uma instância do Service para poder delegar a lógica de negócio.
  private service = new OsService();

  /**
   * Lida com a requisição HTTP para buscar todas as Ordens de Serviço.
   */
  async findAll(req: Request, res: Response) {
    try {
      const ordensDeServico = await this.service.findAll();
      res.status(200).json(ordensDeServico);
    } catch (error: any) {
      // Em um caso real, poderíamos ter um middleware de erro mais sofisticado
      res.status(500).json({ message: error.message });
    }
  }
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      const os = await this.service.findById(id);
      if (!os) {
        return res.status(404).json({ message: 'Ordem de Serviço não encontrada.' });
      }
      res.status(200).json(os);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const novaOs = await this.service.create(req.body);
      res.status(201).json(novaOs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      const osAtualizada = await this.service.update(id, req.body);
      res.status(200).json(osAtualizada);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID da OS é obrigatório.' });
      }
      await this.service.softDelete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}