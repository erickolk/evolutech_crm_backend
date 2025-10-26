/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Listar templates
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de templates
 *   post:
 *     summary: Criar template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - conteudo
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Bem-vindo
 *               conteudo:
 *                 type: string
 *                 example: Olá {{nome}}, seja bem-vindo!
 *               categoria:
 *                 type: string
 *                 example: Atendimento
 *               variaveis:
 *                 type: array
 *                 items:
 *                   type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Template criado
 */

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Buscar template por ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Template encontrado
 *   put:
 *     summary: Atualizar template
 *     tags: [Templates]
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
 *     responses:
 *       200:
 *         description: Template atualizado
 *   delete:
 *     summary: Deletar template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Template deletado
 */

/**
 * @swagger
 * /templates/categoria/{categoria}:
 *   get:
 *     summary: Buscar templates por categoria
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Templates da categoria
 */

/**
 * @swagger
 * /templates/{id}/toggle:
 *   patch:
 *     summary: Alternar status do template (ativo/inativo)
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status alterado
 */

/**
 * @swagger
 * /templates/process:
 *   post:
 *     summary: Processar template com variáveis
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template_id
 *               - variaveis
 *             properties:
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               variaveis:
 *                 type: object
 *                 example:
 *                   nome: João
 *                   empresa: EvoluTech
 *     responses:
 *       200:
 *         description: Template processado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conteudo:
 *                   type: string
 */

/**
 * @swagger
 * /templates/process-system:
 *   post:
 *     summary: Processar template com dados do sistema
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               os_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Template processado com dados do sistema
 */

/**
 * @swagger
 * /templates/preview:
 *   post:
 *     summary: Visualizar preview do template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               variaveis:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preview do template
 */
