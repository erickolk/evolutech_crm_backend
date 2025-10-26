/**
 * @swagger
 * /etiquetas:
 *   get:
 *     summary: Listar etiquetas
 *     tags: [Etiquetas]
 *     responses:
 *       200:
 *         description: Lista de etiquetas
 *   post:
 *     summary: Criar etiqueta
 *     tags: [Etiquetas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cor
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Urgente
 *               cor:
 *                 type: string
 *                 example: "#FF0000"
 *               categoria:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Etiqueta criada
 */

/**
 * @swagger
 * /etiquetas/{id}:
 *   get:
 *     summary: Buscar etiqueta por ID
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta encontrada
 *   patch:
 *     summary: Atualizar etiqueta
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta atualizada
 *   delete:
 *     summary: Deletar etiqueta
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Etiqueta deletada
 */

/**
 * @swagger
 * /etiquetas/categoria/{categoria}:
 *   get:
 *     summary: Buscar etiquetas por categoria
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Etiquetas da categoria
 */

/**
 * @swagger
 * /etiquetas/reorganizar:
 *   patch:
 *     summary: Reorganizar ordem das etiquetas
 *     tags: [Etiquetas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ordem:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Etiquetas reorganizadas
 */

/**
 * @swagger
 * /etiquetas/automaticas:
 *   get:
 *     summary: Listar etiquetas automáticas
 *     tags: [Etiquetas]
 *     responses:
 *       200:
 *         description: Etiquetas com regras automáticas
 */

/**
 * @swagger
 * /etiquetas/aplicar-automaticas:
 *   post:
 *     summary: Aplicar etiquetas automáticas
 *     tags: [Etiquetas]
 *     responses:
 *       200:
 *         description: Etiquetas automáticas aplicadas
 */

/**
 * @swagger
 * /etiquetas/stats:
 *   get:
 *     summary: Estatísticas de uso de etiquetas
 *     tags: [Etiquetas]
 *     responses:
 *       200:
 *         description: Estatísticas
 */

/**
 * @swagger
 * /conversas/{conversaId}/etiquetas:
 *   get:
 *     summary: Listar etiquetas de uma conversa
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: conversaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiquetas da conversa
 *   post:
 *     summary: Aplicar etiqueta em conversa
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: conversaId
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
 *               etiqueta_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta aplicada
 *   delete:
 *     summary: Remover etiqueta de conversa
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: conversaId
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
 *               etiqueta_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta removida
 */

/**
 * @swagger
 * /mensagens/{mensagemId}/etiquetas:
 *   get:
 *     summary: Listar etiquetas de uma mensagem
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: mensagemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiquetas da mensagem
 *   post:
 *     summary: Aplicar etiqueta em mensagem
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: mensagemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta aplicada
 *   delete:
 *     summary: Remover etiqueta de mensagem
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: path
 *         name: mensagemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Etiqueta removida
 */
