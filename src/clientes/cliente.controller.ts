import { type Request, type Response } from 'express';
import { ClienteService } from './cliente.service.js';

export class ClienteController {
    private service = new ClienteService();

    async findAll(req: Request, res: Response) {
        try {
            const clientes = await this.service.findAll();
            res.status(200).json(clientes);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const novoCliente = await this.service.create(req.body);
            // 201 Created é o status HTTP correto para criação de recursos
            res.status(201).json(novoCliente);
        } catch (error: any) {
            // 400 Bad Request é um bom status para erros de validação
            res.status(400).json({ message: error.message });
        }
    }
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // VERIFICAÇÃO: Garante que o ID foi fornecido na URL
            if (!id) {
                return res.status(400).json({ message: 'O ID do cliente é obrigatório.' });
            }

            const clienteAtualizado = await this.service.update(id, req.body);
            res.status(200).json(clienteAtualizado);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // VERIFICAÇÃO: Garante que o ID foi fornecido na URL
            if (!id) {
                return res.status(400).json({ message: 'O ID do cliente é obrigatório.' });
            }

            await this.service.delete(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}