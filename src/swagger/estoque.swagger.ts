/**
 * @swagger
 * /estoque:
 *   get:
 *     summary: Listar estoque geral
 *     tags: [Estoque]
 *     parameters:
 *       - in: query
 *         name: estoque_baixo
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar apenas produtos com estoque baixo
 *       - in: query
 *         name: sem_estoque
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar apenas produtos sem estoque
 *     responses:
 *       200:
 *         description: Lista de produtos com informações de estoque
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estoque:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       nome:
 *                         type: string
 *                       descricao:
 *                         type: string
 *                       quantidade_atual:
 *                         type: number
 *                       estoque_minimo:
 *                         type: number
 *                       localizacao_estoque:
 *                         type: string
 *                       preco_venda:
 *                         type: number
 *                       status_estoque:
 *                         type: string
 *                         enum: [OK, BAIXO, SEM_ESTOQUE]
 *                 resumo:
 *                   type: object
 *                   properties:
 *                     total_produtos:
 *                       type: number
 *                     produtos_estoque_baixo:
 *                       type: number
 *                     produtos_sem_estoque:
 *                       type: number
 *                     produtos_ok:
 *                       type: number
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /estoque/movimentacao:
 *   post:
 *     summary: Criar movimentação de estoque
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produto_id
 *               - tipo_movimentacao
 *               - quantidade
 *             properties:
 *               produto_id:
 *                 type: string
 *                 format: uuid
 *               tipo_movimentacao:
 *                 type: string
 *                 enum: [entrada, saida, ajuste, transferencia]
 *               quantidade:
 *                 type: number
 *               motivo:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movimentação criada
 */

/**
 * @swagger
 * /estoque/movimentacoes:
 *   get:
 *     summary: Listar movimentações de estoque
 *     tags: [Estoque]
 *     parameters:
 *       - in: query
 *         name: produto_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de movimentações
 */

/**
 * @swagger
 * /estoque/movimentacoes/{id}:
 *   get:
 *     summary: Buscar movimentação por ID
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Movimentação encontrada
 *   delete:
 *     summary: Excluir movimentação
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Movimentação excluída
 */

/**
 * @swagger
 * /estoque/produto/{produtoId}:
 *   get:
 *     summary: Obter movimentações de um produto
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Movimentações do produto
 */

/**
 * @swagger
 * /estoque/ajuste:
 *   post:
 *     summary: Ajustar estoque
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produto_id
 *               - quantidade_nova
 *               - motivo
 *             properties:
 *               produto_id:
 *                 type: string
 *                 format: uuid
 *               quantidade_nova:
 *                 type: number
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estoque ajustado
 */

/**
 * @swagger
 * /estoque/transferencia:
 *   post:
 *     summary: Transferir estoque entre locais
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Transferência realizada
 */

/**
 * @swagger
 * /estoque/historico/{produtoId}:
 *   get:
 *     summary: Obter histórico de movimentações do produto
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Histórico do produto
 */

/**
 * @swagger
 * /estoque/relatorio:
 *   get:
 *     summary: Gerar relatório de movimentações
 *     tags: [Estoque]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Relatório gerado
 */

/**
 * @swagger
 * /estoque/reserva:
 *   post:
 *     summary: Reservar estoque
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estoque reservado
 */

/**
 * @swagger
 * /estoque/baixa-orcamento:
 *   post:
 *     summary: Baixar estoque para orçamento
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orcamento_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Estoque baixado
 */

/**
 * @swagger
 * /estoque/auditoria:
 *   post:
 *     summary: Auditar estoque
 *     tags: [Estoque]
 *     responses:
 *       200:
 *         description: Auditoria realizada
 */

/**
 * @swagger
 * /estoque/validar-disponibilidade:
 *   post:
 *     summary: Validar disponibilidade de estoque
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Disponibilidade validada
 */

/**
 * @swagger
 * /estoque/registrar-saida-orcamento:
 *   post:
 *     summary: Registrar saída de estoque para orçamento
 *     tags: [Estoque]
 *     responses:
 *       200:
 *         description: Saída registrada
 */

/**
 * @swagger
 * /estoque/estornar-saida-orcamento:
 *   post:
 *     summary: Estornar saída de estoque
 *     tags: [Estoque]
 *     responses:
 *       200:
 *         description: Saída estornada
 */
