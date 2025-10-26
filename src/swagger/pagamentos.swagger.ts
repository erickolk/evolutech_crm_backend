/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Listar pagamentos
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendente, Pago, Parcialmente Pago, Cancelado]
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pagamento'
 *   post:
 *     summary: Criar pagamento
 *     tags: [Pagamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - os_id
 *               - valor_total
 *               - metodo_pagamento
 *             properties:
 *               os_id:
 *                 type: string
 *                 format: uuid
 *               valor_total:
 *                 type: number
 *                 example: 250.00
 *               metodo_pagamento:
 *                 type: string
 *                 enum: [Dinheiro, Cartão Débito, Cartão Crédito, PIX, Transferência, Boleto]
 *               numero_parcelas:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Pagamento criado com sucesso
 */

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: Buscar pagamento por ID
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *   patch:
 *     summary: Atualizar pagamento
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagamento atualizado
 *   delete:
 *     summary: Deletar pagamento
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Pagamento deletado
 */

/**
 * @swagger
 * /pagamentos/os/{os_id}:
 *   get:
 *     summary: Buscar pagamentos de uma OS
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: os_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pagamentos da OS
 */

/**
 * @swagger
 * /pagamentos/stats:
 *   get:
 *     summary: Obter estatísticas de pagamentos
 *     tags: [Pagamentos]
 *     responses:
 *       200:
 *         description: Estatísticas de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_recebido:
 *                   type: number
 *                 total_pendente:
 *                   type: number
 *                 quantidade_pagamentos:
 *                   type: integer
 */

/**
 * @swagger
 * /pagamentos/{id}/parcelas/{parcelaId}/pagar:
 *   patch:
 *     summary: Marcar parcela como paga
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: parcelaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parcela paga
 */

/**
 * @swagger
 * /pagamentos/{id}/parcelas/{parcelaId}/estornar:
 *   patch:
 *     summary: Estornar pagamento de parcela
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: parcelaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parcela estornada
 */
