import { type Request, type Response } from 'express';
import { DispositivoService } from './dispositivo.service.js';

export class DispositivoController { // <-- A linha mais importante!
  private service = new DispositivoService();

  async create(req: Request, res: Response) {
    try {
      const dispositivoData = { ...req.body, cliente_id: req.params.clienteId };
      const novoDispositivo = await this.service.create(dispositivoData);
      res.status(201).json(novoDispositivo);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAllByCliente(req: Request, res: Response) {
    try {
      const { clienteId } = req.params;
      if (!clienteId) {
        return res.status(400).json({ message: 'O ID do cliente é obrigatório.' });
      }
      const dispositivos = await this.service.findAllByCliente(clienteId);
      res.status(200).json(dispositivos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do dispositivo é obrigatório.' });
      }
      const dispositivo = await this.service.findById(id);
      if (!dispositivo) {
        return res.status(404).json({ message: 'Dispositivo não encontrado.' });
      }
      res.status(200).json(dispositivo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do dispositivo é obrigatório.' });
      }
      const dispositivoAtualizado = await this.service.update(id, req.body);
      res.status(200).json(dispositivoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'O ID do dispositivo é obrigatório.' });
      }
      await this.service.softDelete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}