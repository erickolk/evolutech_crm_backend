/**
 * @swagger
 * /agentes:
 *   get:
 *     summary: Listar agentes
 *     tags: [Agentes]
 *     responses:
 *       200:
 *         description: Lista de agentes
 *   post:
 *     summary: Criar agente
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               departamento:
 *                 type: string
 *               especialidade:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agente criado
 */

/**
 * @swagger
 * /agentes/{id}:
 *   get:
 *     summary: Buscar agente por ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente encontrado
 *   patch:
 *     summary: Atualizar agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente atualizado
 *   delete:
 *     summary: Deletar agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Agente deletado
 */

/**
 * @swagger
 * /agentes/email/{email}:
 *   get:
 *     summary: Buscar agente por email
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Agente encontrado
 */

/**
 * @swagger
 * /agentes/{id}/status:
 *   patch:
 *     summary: Atualizar status do agente
 *     tags: [Agentes]
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
 *                 enum: [online, offline, ocupado, ausente]
 *     responses:
 *       200:
 *         description: Status atualizado
 */

/**
 * @swagger
 * /agentes/{id}/online:
 *   patch:
 *     summary: Definir agente como online
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente definido como online
 */

/**
 * @swagger
 * /agentes/{id}/offline:
 *   patch:
 *     summary: Definir agente como offline
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente definido como offline
 */

/**
 * @swagger
 * /agentes/{id}/ocupado:
 *   patch:
 *     summary: Definir agente como ocupado
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente definido como ocupado
 */

/**
 * @swagger
 * /agentes/{id}/ausente:
 *   patch:
 *     summary: Definir agente como ausente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agente definido como ausente
 */

/**
 * @swagger
 * /agentes/disponiveis:
 *   get:
 *     summary: Listar agentes disponíveis
 *     tags: [Agentes]
 *     responses:
 *       200:
 *         description: Agentes disponíveis para atendimento
 */

/**
 * @swagger
 * /agentes/atribuicao-automatica:
 *   post:
 *     summary: Atribuição automática de agente
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversa_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Agente atribuído automaticamente
 */

/**
 * @swagger
 * /agentes/{id}/liberar-conversa:
 *   patch:
 *     summary: Liberar conversa do agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversa liberada
 */

/**
 * @swagger
 * /agentes/{id}/registrar-atividade:
 *   patch:
 *     summary: Registrar atividade do agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Atividade registrada
 */

/**
 * @swagger
 * /agentes/stats:
 *   get:
 *     summary: Estatísticas dos agentes
 *     tags: [Agentes]
 *     responses:
 *       200:
 *         description: Estatísticas gerais
 */

/**
 * @swagger
 * /agentes/{id}/performance:
 *   get:
 *     summary: Obter performance do agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Métricas de performance
 */

/**
 * @swagger
 * /agentes/departamento/{departamento}:
 *   get:
 *     summary: Buscar agentes por departamento
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: departamento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agentes do departamento
 */

/**
 * @swagger
 * /agentes/especialidade/{especialidade}:
 *   get:
 *     summary: Buscar agentes por especialidade
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: especialidade
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agentes com a especialidade
 */
