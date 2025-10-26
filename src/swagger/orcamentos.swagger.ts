/**
 * @swagger
 * /orcamentos:
 *   get:
 *     summary: Listar orçamentos
 *     tags: [Orçamentos]
 *     responses:
 *       200:
 *         description: Lista de orçamentos
 *   post:
 *     summary: Criar orçamento
 *     tags: [Orçamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ordem_servico_id
 *             properties:
 *               ordem_servico_id:
 *                 type: string
 *                 format: uuid
 *               descricao:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orçamento criado
 */

/**
 * @swagger
 * /orcamentos/{id}:
 *   get:
 *     summary: Buscar orçamento por ID
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Orçamento encontrado
 *   patch:
 *     summary: Atualizar orçamento
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Orçamento atualizado
 *   delete:
 *     summary: Deletar orçamento
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Orçamento deletado
 */

/**
 * @swagger
 * /orcamentos/os/{osId}:
 *   get:
 *     summary: Buscar orçamentos por Ordem de Serviço
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: osId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Orçamentos da OS
 */

/**
 * @swagger
 * /orcamentos/os/{osId}/latest:
 *   get:
 *     summary: Obter última versão do orçamento de uma OS
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: osId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Última versão do orçamento
 */

/**
 * @swagger
 * /orcamentos/{id}/nova-versao:
 *   post:
 *     summary: Criar nova versão do orçamento
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Nova versão criada
 */

/**
 * @swagger
 * /orcamentos/{id}/recalcular:
 *   post:
 *     summary: Recalcular orçamento
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Orçamento recalculado
 */

/**
 * @swagger
 * /orcamentos/{id}/can-edit:
 *   get:
 *     summary: Verificar se orçamento pode ser editado
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Retorna se pode editar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canEdit:
 *                   type: boolean
 */

/**
 * @swagger
 * /orcamentos/{id}/itens:
 *   get:
 *     summary: Listar itens do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de itens
 *   post:
 *     summary: Adicionar item ao orçamento
 *     tags: [Itens de Orçamento]
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
 *             required:
 *               - tipo
 *               - descricao
 *               - quantidade
 *               - valor_unitario
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [servico, peca]
 *               descricao:
 *                 type: string
 *               quantidade:
 *                 type: number
 *               valor_unitario:
 *                 type: number
 *               produto_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Item adicionado
 */

/**
 * @swagger
 * /orcamentos/{id}/itens/{itemId}:
 *   get:
 *     summary: Buscar item específico do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item encontrado
 *   patch:
 *     summary: Atualizar item do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item atualizado
 *   delete:
 *     summary: Deletar item do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Item deletado
 */

/**
 * @swagger
 * /orcamentos/{id}/itens/{itemId}/aprovar:
 *   patch:
 *     summary: Aprovar item do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item aprovado
 */

/**
 * @swagger
 * /orcamentos/{id}/itens/{itemId}/rejeitar:
 *   patch:
 *     summary: Rejeitar item do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item rejeitado
 */

/**
 * @swagger
 * /orcamentos/{id}/calculations:
 *   get:
 *     summary: Obter cálculos do orçamento
 *     tags: [Itens de Orçamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cálculos do orçamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subtotal:
 *                   type: number
 *                 desconto:
 *                   type: number
 *                 total:
 *                   type: number
 */
