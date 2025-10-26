/**
 * @swagger
 * /dispositivos:
 *   get:
 *     summary: Listar todos os dispositivos
 *     tags: [Dispositivos]
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dispositivo'
 */

/**
 * @swagger
 * /dispositivos/{id}:
 *   get:
 *     summary: Buscar dispositivo por ID
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dispositivo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dispositivo'
 *       404:
 *         description: Dispositivo não encontrado
 *   patch:
 *     summary: Atualizar dispositivo
 *     tags: [Dispositivos]
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
 *               estado_conservacao:
 *                 type: string
 *                 example: Regular
 *               observacoes:
 *                 type: string
 *                 example: Tela com risco maior
 *     responses:
 *       200:
 *         description: Dispositivo atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dispositivo'
 *   delete:
 *     summary: Deletar dispositivo (soft delete)
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Dispositivo deletado com sucesso
 */

/**
 * @swagger
 * /clientes/{clienteId}/dispositivos:
 *   get:
 *     summary: Listar dispositivos de um cliente
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de dispositivos do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dispositivo'
 *   post:
 *     summary: Criar dispositivo para um cliente
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: clienteId
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
 *               - marca
 *               - modelo
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: Smartphone
 *               marca:
 *                 type: string
 *                 example: Samsung
 *               modelo:
 *                 type: string
 *                 example: Galaxy S21
 *               numero_serie:
 *                 type: string
 *               imei:
 *                 type: string
 *               cor:
 *                 type: string
 *               estado_conservacao:
 *                 type: string
 *               acessorios:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispositivo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dispositivo'
 */
