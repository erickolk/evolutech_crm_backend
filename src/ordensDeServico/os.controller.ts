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

    async create(req: Request, res: Response) {
        try {
            const novaOs = await this.service.create(req.body);
            res.status(201).json(novaOs);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}