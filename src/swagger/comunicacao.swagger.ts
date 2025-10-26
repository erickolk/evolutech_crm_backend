/**
 * @swagger
 * /comunicacao:
 *   get:
 *     summary: Listar comunicações
 *     tags: [Comunicação]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: lida
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de comunicações
 *   post:
 *     summary: Criar comunicação
 *     tags: [Comunicação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - conteudo
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [email, sms, whatsapp, notificacao]
 *               conteudo:
 *                 type: string
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               os_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Comunicação criada
 */

/**
 * @swagger
 * /comunicacao/{id}:
 *   get:
 *     summary: Buscar comunicação por ID
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comunicação encontrada
 *   put:
 *     summary: Atualizar comunicação
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comunicação atualizada
 */

/**
 * @swagger
 * /comunicacao/{id}/lida:
 *   patch:
 *     summary: Marcar comunicação como lida
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comunicação marcada como lida
 */

/**
 * @swagger
 * /comunicacao/lidas:
 *   patch:
 *     summary: Marcar múltiplas comunicações como lidas
 *     tags: [Comunicação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Comunicações marcadas como lidas
 */

/**
 * @swagger
 * /comunicacao/cliente/{clienteId}:
 *   get:
 *     summary: Buscar comunicações de um cliente
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comunicações do cliente
 */

/**
 * @swagger
 * /comunicacao/os/{osId}:
 *   get:
 *     summary: Buscar comunicações de uma OS
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: osId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comunicações da OS
 */

/**
 * @swagger
 * /comunicacao/nao-lidas:
 *   get:
 *     summary: Listar comunicações não lidas
 *     tags: [Comunicação]
 *     responses:
 *       200:
 *         description: Comunicações não lidas
 */

/**
 * @swagger
 * /comunicacao/estatisticas:
 *   get:
 *     summary: Obter estatísticas de comunicação
 *     tags: [Comunicação]
 *     responses:
 *       200:
 *         description: Estatísticas
 */

/**
 * @swagger
 * /comunicacao/agregado:
 *   get:
 *     summary: Obter dados agregados de comunicação
 *     tags: [Comunicação]
 *     responses:
 *       200:
 *         description: Dados agregados
 */

/**
 * @swagger
 * /comunicacao/ia/processar:
 *   post:
 *     summary: Processar comunicação com IA
 *     tags: [Comunicação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mensagem:
 *                 type: string
 *               contexto:
 *                 type: object
 *     responses:
 *       200:
 *         description: Mensagem processada pela IA
 */

/**
 * @swagger
 * /comunicacao/whatsapp/processar:
 *   post:
 *     summary: Processar mensagem do WhatsApp
 *     tags: [Comunicação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mensagem do WhatsApp processada
 */

/**
 * @swagger
 * /comunicacao/whatsapp/cliente/{numero}:
 *   get:
 *     summary: Buscar cliente por número de WhatsApp
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */

/**
 * @swagger
 * /comunicacao/os/{osId}/status:
 *   get:
 *     summary: Obter status da OS
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: osId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status da OS
 */

/**
 * @swagger
 * /comunicacao/cliente/{clienteId}/os-ativas:
 *   get:
 *     summary: Obter OS ativas do cliente
 *     tags: [Comunicação]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OS ativas do cliente
 */
