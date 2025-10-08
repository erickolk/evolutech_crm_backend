import { type Request, type Response } from 'express';
import { OrcamentoItemService } from './orcamentoItem.service.js';

export class OrcamentoItemController {
    private service = new OrcamentoItemService();

    async findAll(req: Request, res: Response) {
        try {
            const itens = await this.service.findAll();
            res.status(200).json(itens);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const item = await this.service.findById(itemId);
            
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado.' });
            }

            res.status(200).json(item);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByOrcamentoId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const itens = await this.service.findByOrcamentoId(id);
            res.status(200).json(itens);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const novoItem = await this.service.create(id, req.body);
            res.status(201).json(novoItem);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const itemAtualizado = await this.service.update(itemId, req.body);
            res.status(200).json(itemAtualizado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async approve(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const itemAprovado = await this.service.updateApprovalStatus(itemId, {
                status_aprovacao: 'aprovado'
            });
            
            res.status(200).json(itemAprovado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async reject(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const itemRejeitado = await this.service.updateApprovalStatus(itemId, {
                status_aprovacao: 'rejeitado'
            });
            
            res.status(200).json(itemRejeitado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async setClienteBringsPart(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const itemAtualizado = await this.service.updateApprovalStatus(itemId, {
                status_aprovacao: 'cliente_traz_peca'
            });
            
            res.status(200).json(itemAtualizado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async updateApprovalStatus(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            if (!req.body.status_aprovacao) {
                return res.status(400).json({ message: 'Status de aprovação é obrigatório.' });
            }

            const validStatuses = ['pendente', 'aprovado', 'rejeitado', 'cliente_traz_peca'];
            if (!validStatuses.includes(req.body.status_aprovacao)) {
                return res.status(400).json({ 
                    message: `Status de aprovação deve ser um dos seguintes: ${validStatuses.join(', ')}.` 
                });
            }

            const itemAtualizado = await this.service.updateApprovalStatus(itemId, req.body);
            res.status(200).json(itemAtualizado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            await this.service.delete(itemId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async canEdit(req: Request, res: Response) {
        try {
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({ message: 'O ID do item é obrigatório.' });
            }

            const canEdit = await this.service.canEdit(itemId);
            res.status(200).json({ canEdit });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getOrcamentoCalculations(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const calculations = await this.service.getOrcamentoCalculations(id);
            res.status(200).json(calculations);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }
}