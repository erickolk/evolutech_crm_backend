/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Listar produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *   post:
 *     summary: Criar produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco_custo
 *               - preco_venda
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *               codigo_barras:
 *                 type: string
 *               preco_custo:
 *                 type: number
 *               preco_venda:
 *                 type: number
 *               fornecedor_id:
 *                 type: string
 *                 format: uuid
 *               controla_estoque:
 *                 type: boolean
 *               estoque_minimo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produto encontrado
 *   patch:
 *     summary: Atualizar produto
 *     tags: [Produtos]
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
 *         description: Produto atualizado
 *   delete:
 *     summary: Deletar produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Produto deletado
 */

/**
 * @swagger
 * /produtos/ativos:
 *   get:
 *     summary: Listar produtos ativos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos ativos
 */

/**
 * @swagger
 * /produtos/estoque-baixo:
 *   get:
 *     summary: Listar produtos com estoque baixo
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Produtos com estoque abaixo do mínimo
 */

/**
 * @swagger
 * /produtos/sem-estoque:
 *   get:
 *     summary: Listar produtos sem estoque
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Produtos sem estoque
 */

/**
 * @swagger
 * /produtos/codigo-barras/{codigoBarras}:
 *   get:
 *     summary: Buscar produto por código de barras
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: codigoBarras
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto encontrado
 */

/**
 * @swagger
 * /produtos/{id}/estoque-atual:
 *   get:
 *     summary: Obter estoque atual do produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estoque atual do produto
 */
