/**
 * @swagger
 * /whatsapp/webhook:
 *   get:
 *     summary: Verificar webhook do WhatsApp
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verificado
 *   post:
 *     summary: Receber webhook do WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook recebido
 */

/**
 * @swagger
 * /whatsapp/send/text:
 *   post:
 *     summary: Enviar mensagem de texto
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 example: "5511999999999"
 *               message:
 *                 type: string
 *                 example: Olá, como posso ajudar?
 *     responses:
 *       200:
 *         description: Mensagem enviada
 */

/**
 * @swagger
 * /whatsapp/send/media:
 *   post:
 *     summary: Enviar mensagem com mídia
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - type
 *               - url
 *             properties:
 *               to:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, video, audio, document]
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mídia enviada
 */

/**
 * @swagger
 * /whatsapp/send/template:
 *   post:
 *     summary: Enviar template do WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - template_name
 *             properties:
 *               to:
 *                 type: string
 *               template_name:
 *                 type: string
 *               language:
 *                 type: string
 *                 default: pt_BR
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Template enviado
 */

/**
 * @swagger
 * /whatsapp/profile:
 *   get:
 *     summary: Obter perfil do negócio
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Perfil do negócio
 */

/**
 * @swagger
 * /whatsapp/config:
 *   get:
 *     summary: Verificar configuração do WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Status da configuração
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configured:
 *                   type: boolean
 *                 phone_number_id:
 *                   type: string
 *                 business_account_id:
 *                   type: string
 */
