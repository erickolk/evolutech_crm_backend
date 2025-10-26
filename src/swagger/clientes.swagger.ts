/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar todos os clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou CPF/CNPJ
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - whatsapp_id
 *               - tipo_cliente
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Santos
 *               cpf:
 *                 type: string
 *                 example: 123.456.789-00
 *               cnpj:
 *                 type: string
 *                 example: 12.345.678/0001-90
 *               whatsapp_id:
 *                 type: string
 *                 example: "5511999999999"
 *               cep:
 *                 type: string
 *                 example: 01234-567
 *               endereco:
 *                 type: string
 *                 example: Rua das Flores, 123
 *               numero_residencia:
 *                 type: string
 *                 example: "123"
 *               bairro:
 *                 type: string
 *                 example: Centro
 *               cidade:
 *                 type: string
 *                 example: São Paulo
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: 1985-03-15
 *               tipo_cliente:
 *                 type: string
 *                 enum: [Pessoa Física, Pessoa Jurídica]
 *                 example: Pessoa Física
 *               razao_social:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /clientes/{id}:
 *   patch:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
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
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *               numero_residencia:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               cep:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos ou CPF não pode ser alterado
 *       404:
 *         description: Cliente não encontrado
 *   delete:
 *     summary: Deletar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
