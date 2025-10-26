/**
 * @swagger
 * /conversas:
 *   get:
 *     summary: Listar conversas
 *     tags: [Conversas]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, em_atendimento, resolvida, fechada]
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, urgente]
 *     responses:
 *       200:
 *         description: Lista de conversas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversa'
 *   post:
 *     summary: Criar conversa
 *     tags: [Conversas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - canal
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               agente_id:
 *                 type: string
 *                 format: uuid
 *               canal:
 *                 type: string
 *                 enum: [whatsapp, email, telefone, presencial]
 *               assunto:
 *                 type: string
 *               prioridade:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *     responses:
 *       201:
 *         description: Conversa criada
 */

/**
 * @swagger
 * /conversas/{id}:
 *   get:
 *     summary: Buscar conversa por ID
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversa encontrada
 *   patch:
 *     summary: Atualizar conversa
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversa atualizada
 *   delete:
 *     summary: Deletar conversa
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Conversa deletada
 */

/**
 * @swagger
 * /conversas/{id}/atribuir-agente:
 *   patch:
 *     summary: Atribuir agente a uma conversa
 *     tags: [Conversas]
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
 *               agente_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Agente atribuído
 */

/**
 * @swagger
 * /conversas/{id}/fechar:
 *   patch:
 *     summary: Fechar conversa
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversa fechada
 */

/**
 * @swagger
 * /conversas/{id}/reabrir:
 *   patch:
 *     summary: Reabrir conversa
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversa reaberta
 */

/**
 * @swagger
 * /conversas/cliente/{clienteId}:
 *   get:
 *     summary: Buscar conversas de um cliente
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversas do cliente
 */

/**
 * @swagger
 * /conversas/agente/{agenteId}:
 *   get:
 *     summary: Buscar conversas de um agente
 *     tags: [Conversas]
 *     parameters:
 *       - in: path
 *         name: agenteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversas do agente
 */

/**
 * @swagger
 * /conversas/stats:
 *   get:
 *     summary: Estatísticas de conversas
 *     tags: [Conversas]
 *     responses:
 *       200:
 *         description: Estatísticas
 */

/**
 * @swagger
 * /conversas/abertas:
 *   get:
 *     summary: Listar conversas abertas
 *     tags: [Conversas]
 *     responses:
 *       200:
 *         description: Conversas abertas
 */

/**
 * @swagger
 * /conversas/sem-agente:
 *   get:
 *     summary: Listar conversas sem agente
 *     tags: [Conversas]
 *     responses:
 *       200:
 *         description: Conversas sem agente atribuído
 */
