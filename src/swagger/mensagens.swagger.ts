/**
 * @swagger
 * /mensagens:
 *   get:
 *     summary: Listar mensagens
 *     tags: [Mensagens]
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *   post:
 *     summary: Criar mensagem
 *     tags: [Mensagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversa_id
 *               - conteudo
 *             properties:
 *               conversa_id:
 *                 type: string
 *                 format: uuid
 *               conteudo:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [texto, imagem, audio, video, documento]
 *     responses:
 *       201:
 *         description: Mensagem criada
 */

/**
 * @swagger
 * /mensagens/{id}:
 *   get:
 *     summary: Buscar mensagem por ID
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mensagem encontrada
 *   patch:
 *     summary: Atualizar mensagem
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mensagem atualizada
 *   delete:
 *     summary: Deletar mensagem
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Mensagem deletada
 */

/**
 * @swagger
 * /mensagens/conversa/{conversaId}:
 *   get:
 *     summary: Listar mensagens de uma conversa
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: conversaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mensagens da conversa
 */

/**
 * @swagger
 * /mensagens/enviar:
 *   post:
 *     summary: Enviar mensagem
 *     tags: [Mensagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversa_id
 *               - conteudo
 *             properties:
 *               conversa_id:
 *                 type: string
 *                 format: uuid
 *               conteudo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensagem enviada
 */

/**
 * @swagger
 * /mensagens/{id}/lida:
 *   patch:
 *     summary: Marcar mensagem como lida
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mensagem marcada como lida
 */

/**
 * @swagger
 * /mensagens/conversa/{conversaId}/marcar-todas-lidas:
 *   patch:
 *     summary: Marcar todas mensagens da conversa como lidas
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: conversaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Todas mensagens marcadas como lidas
 */

/**
 * @swagger
 * /mensagens/nao-lidas:
 *   get:
 *     summary: Listar mensagens não lidas
 *     tags: [Mensagens]
 *     responses:
 *       200:
 *         description: Mensagens não lidas
 */

/**
 * @swagger
 * /mensagens/nao-lidas/count:
 *   get:
 *     summary: Contar mensagens não lidas
 *     tags: [Mensagens]
 *     responses:
 *       200:
 *         description: Quantidade de mensagens não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */

/**
 * @swagger
 * /mensagens/conversa/{conversaId}/ultima:
 *   get:
 *     summary: Obter última mensagem da conversa
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: conversaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Última mensagem
 */

/**
 * @swagger
 * /mensagens/stats:
 *   get:
 *     summary: Estatísticas de mensagens
 *     tags: [Mensagens]
 *     responses:
 *       200:
 *         description: Estatísticas
 */

/**
 * @swagger
 * /mensagens/buscar/conteudo:
 *   get:
 *     summary: Buscar mensagens por conteúdo
 *     tags: [Mensagens]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Mensagens encontradas
 */

/**
 * @swagger
 * /mensagens/buscar/tipo/{tipo}:
 *   get:
 *     summary: Buscar mensagens por tipo
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [texto, imagem, audio, video, documento]
 *     responses:
 *       200:
 *         description: Mensagens do tipo especificado
 */
