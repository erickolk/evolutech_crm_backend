/**
 * @swagger
 * /ordensDeServico:
 *   get:
 *     summary: Listar ordens de serviço
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Aberta, Em Andamento, Aguardando Peça, Concluída, Cancelada]
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de ordens de serviço
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdemServico'
 *   post:
 *     summary: Criar ordem de serviço
 *     tags: [Ordens de Serviço]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - dispositivo_id
 *               - descricao_problema
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               dispositivo_id:
 *                 type: string
 *                 format: uuid
 *               descricao_problema:
 *                 type: string
 *                 example: Smartphone não carrega
 *               descricao_servico:
 *                 type: string
 *               prioridade:
 *                 type: string
 *                 enum: [Baixa, Média, Alta, Urgente]
 *               data_prevista:
 *                 type: string
 *                 format: date-time
 *               valor_servico:
 *                 type: number
 *               tecnico_responsavel:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ordem de serviço criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdemServico'
 */

/**
 * @swagger
 * /ordensDeServico/{id}:
 *   get:
 *     summary: Buscar ordem de serviço por ID
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ordem de serviço encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdemServico'
 *   patch:
 *     summary: Atualizar ordem de serviço
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Aberta, Em Andamento, Aguardando Peça, Concluída, Cancelada]
 *               data_conclusao:
 *                 type: string
 *                 format: date-time
 *               valor_pecas:
 *                 type: number
 *               valor_total:
 *                 type: number
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ordem de serviço atualizada
 *   delete:
 *     summary: Deletar ordem de serviço
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Ordem de serviço deletada
 */
