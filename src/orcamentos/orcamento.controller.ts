import { type Request, type Response } from 'express';
import { OrcamentoService } from './orcamento.service.js';

export class OrcamentoController {
    private service = new OrcamentoService();

    async findAll(req: Request, res: Response) {
        try {
            const orcamentos = await this.service.findAll();
            res.status(200).json(orcamentos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const orcamento = await this.service.findById(id);
            
            if (!orcamento) {
                return res.status(404).json({ message: 'Orçamento não encontrado.' });
            }

            res.status(200).json(orcamento);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByOrdemServicoId(req: Request, res: Response) {
        try {
            const { osId } = req.params;

            if (!osId) {
                return res.status(400).json({ message: 'O ID da ordem de serviço é obrigatório.' });
            }

            const orcamentos = await this.service.findByOrdemServicoId(osId);
            res.status(200).json(orcamentos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getLatestVersionByOrdemServicoId(req: Request, res: Response) {
        try {
            const { osId } = req.params;

            if (!osId) {
                return res.status(400).json({ message: 'O ID da ordem de serviço é obrigatório.' });
            }

            const orcamento = await this.service.getLatestVersionByOrdemServicoId(osId);
            
            if (!orcamento) {
                return res.status(404).json({ message: 'Nenhum orçamento encontrado para esta ordem de serviço.' });
            }

            res.status(200).json(orcamento);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const novoOrcamento = await this.service.create(req.body);
            res.status(201).json(novoOrcamento);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const orcamentoAtualizado = await this.service.update(id, req.body);
            res.status(200).json(orcamentoAtualizado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async createNewVersion(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const novaVersao = await this.service.createNewVersion(id);
            res.status(201).json(novaVersao);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            await this.service.delete(id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async recalculate(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const orcamentoRecalculado = await this.service.recalculateOrcamento(id);
            res.status(200).json(orcamentoRecalculado);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async canEdit(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'O ID do orçamento é obrigatório.' });
            }

            const canEdit = await this.service.canEdit(id);
            res.status(200).json({ canEdit });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}