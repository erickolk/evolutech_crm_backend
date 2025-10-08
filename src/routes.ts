import { Router } from 'express';
import { ClienteController } from './clientes/cliente.controller.js';
import { DispositivoController } from './dispositivos/dispositivo.controller.js';
import { OsController } from './ordensDeServico/os.controller.js'; 
import { FornecedorController } from './fornecedores/fornecedor.controller.js';
import { ProdutoController } from './produtos/produto.controller.js';
import { OrcamentoController } from './orcamentos/orcamento.controller.js';
import { OrcamentoItemController } from './orcamentos/orcamentoItem.controller.js';
import { EstoqueController } from './estoque/estoque.controller.js';

const router = Router();

// Instanciando os controllers
const clienteController = new ClienteController();
const dispositivoController = new DispositivoController();
const osController = new OsController();
const fornecedorController = new FornecedorController();
const produtoController = new ProdutoController();
const orcamentoController = new OrcamentoController();
const orcamentoItemController = new OrcamentoItemController();
const estoqueController = new EstoqueController();

// --- Rotas de Clientes ---
router.get('/clientes', (req, res) => clienteController.findAll(req, res));
router.post('/clientes', (req, res) => clienteController.create(req, res));
router.patch('/clientes/:id', (req, res) => clienteController.update(req, res));
router.delete('/clientes/:id', (req, res) => clienteController.delete(req, res));

// --- Rotas de Dispositivos ---
// Note a rota aninhada para seguir nossa decisão de arquitetura
router.get('/clientes/:clienteId/dispositivos', (req, res) => dispositivoController.findAllByCliente(req, res));
router.post('/clientes/:clienteId/dispositivos', (req, res) => dispositivoController.create(req, res));

router.get('/dispositivos/:id', (req, res) => dispositivoController.findById(req, res));
router.patch('/dispositivos/:id', (req, res) => dispositivoController.update(req, res));
router.delete('/dispositivos/:id', (req, res) => dispositivoController.softDelete(req, res));

// --- Rotas de Ordens de Serviço ---
router.get('/ordensDeServico', (req, res) => osController.findAll(req, res));
router.post('/ordensDeServico', (req, res) => osController.create(req, res));
router.patch('/ordensDeServico/:id', (req, res) => osController.update(req, res));
router.delete('/ordensDeServico/:id', (req, res) => osController.softDelete(req, res));
// Dentro da seção "Rotas de Ordens de Serviço"
router.get('/ordensDeServico/:id', (req, res) => osController.findById(req, res));

// --- Rotas de Fornecedores ---
router.get('/fornecedores', (req, res) => fornecedorController.findAll(req, res));
router.post('/fornecedores', (req, res) => fornecedorController.create(req, res));
router.get('/fornecedores/:id', (req, res) => fornecedorController.findById(req, res));
router.patch('/fornecedores/:id', (req, res) => fornecedorController.update(req, res));
router.delete('/fornecedores/:id', (req, res) => fornecedorController.softDelete(req, res));

// --- Rotas de Produtos ---
router.get('/produtos', (req, res) => produtoController.findAll(req, res));
router.post('/produtos', (req, res) => produtoController.create(req, res));
router.get('/produtos/:id', (req, res) => produtoController.findById(req, res));
router.patch('/produtos/:id', (req, res) => produtoController.update(req, res));
router.delete('/produtos/:id', (req, res) => produtoController.softDelete(req, res));
// Rotas de estoque para produtos
router.patch('/produtos/:id/estoque', (req, res) => produtoController.updateEstoqueConfig(req, res));
router.get('/produtos/ativos', (req, res) => produtoController.findProdutosAtivos(req, res));
router.get('/produtos/estoque-baixo', (req, res) => produtoController.findProdutosComEstoqueBaixo(req, res));
router.get('/produtos/sem-estoque', (req, res) => produtoController.findProdutosSemEstoque(req, res));
router.get('/produtos/:id/estoque-atual', (req, res) => produtoController.getEstoqueAtual(req, res));
router.get('/produtos/codigo-barras/:codigoBarras', (req, res) => produtoController.findByCodigoBarras(req, res));
router.post('/produtos/:id/verificar-estoque', (req, res) => produtoController.verificarEstoqueDisponivel(req, res));

// --- Rotas de Orçamentos ---
router.get('/orcamentos', (req, res) => orcamentoController.findAll(req, res));
router.post('/orcamentos', (req, res) => orcamentoController.create(req, res));
router.get('/orcamentos/:id', (req, res) => orcamentoController.findById(req, res));
router.patch('/orcamentos/:id', (req, res) => orcamentoController.update(req, res));
router.delete('/orcamentos/:id', (req, res) => orcamentoController.delete(req, res));
router.get('/orcamentos/os/:osId', (req, res) => orcamentoController.findByOrdemServicoId(req, res));
router.get('/orcamentos/os/:osId/latest', (req, res) => orcamentoController.getLatestVersionByOrdemServicoId(req, res));
router.post('/orcamentos/:id/nova-versao', (req, res) => orcamentoController.createNewVersion(req, res));
router.post('/orcamentos/:id/recalcular', (req, res) => orcamentoController.recalculate(req, res));
router.get('/orcamentos/:id/can-edit', (req, res) => orcamentoController.canEdit(req, res));

// --- Rotas de Itens de Orçamento ---
router.get('/orcamentos/:id/itens', (req, res) => orcamentoItemController.findByOrcamentoId(req, res));
router.post('/orcamentos/:id/itens', (req, res) => orcamentoItemController.create(req, res));
router.get('/orcamentos/:id/itens/:itemId', (req, res) => orcamentoItemController.findById(req, res));
router.patch('/orcamentos/:id/itens/:itemId', (req, res) => orcamentoItemController.update(req, res));
router.delete('/orcamentos/:id/itens/:itemId', (req, res) => orcamentoItemController.delete(req, res));
router.patch('/orcamentos/:id/itens/:itemId/aprovar', (req, res) => orcamentoItemController.approve(req, res));
router.patch('/orcamentos/:id/itens/:itemId/rejeitar', (req, res) => orcamentoItemController.reject(req, res));
router.patch('/orcamentos/:id/itens/:itemId/cliente-traz-peca', (req, res) => orcamentoItemController.setClienteBringsPart(req, res));
router.patch('/orcamentos/:id/itens/:itemId/status', (req, res) => orcamentoItemController.updateApprovalStatus(req, res));
router.get('/orcamentos/:id/itens/:itemId/can-edit', (req, res) => orcamentoItemController.canEdit(req, res));
router.get('/orcamentos/:id/calculations', (req, res) => orcamentoItemController.getOrcamentoCalculations(req, res));

// --- Rotas de Estoque ---
// Movimentações de estoque
router.post('/estoque/movimentacao', (req, res) => estoqueController.criarMovimentacao(req, res));
router.get('/estoque/movimentacoes', (req, res) => estoqueController.listarMovimentacoes(req, res));
router.get('/estoque/movimentacoes/:id', (req, res) => estoqueController.obterMovimentacao(req, res));
router.get('/estoque/produto/:produtoId', (req, res) => estoqueController.obterMovimentacoesPorProduto(req, res));
router.delete('/estoque/movimentacoes/:id', (req, res) => estoqueController.excluirMovimentacao(req, res));

// Controle de estoque
router.post('/estoque/ajuste', (req, res) => estoqueController.ajustarEstoque(req, res));
router.post('/estoque/transferencia', (req, res) => estoqueController.transferirEstoque(req, res));

// Consultas de estoque
router.get('/estoque/historico/:produtoId', (req, res) => estoqueController.obterHistoricoProduto(req, res));
router.get('/estoque/relatorio', (req, res) => estoqueController.gerarRelatorioMovimentacoes(req, res));

// Operações avançadas
router.post('/estoque/reserva', (req, res) => estoqueController.reservarEstoque(req, res));
router.post('/estoque/baixa-orcamento', (req, res) => estoqueController.baixarEstoqueOrcamento(req, res));
router.post('/estoque/auditoria', (req, res) => estoqueController.auditarEstoque(req, res));

// Integração com orçamentos
router.post('/estoque/validar-disponibilidade', (req, res) => estoqueController.validarDisponibilidadeParaOrcamento(req, res));
router.post('/estoque/registrar-saida-orcamento', (req, res) => estoqueController.registrarSaidaParaOrcamento(req, res));
router.post('/estoque/estornar-saida-orcamento', (req, res) => estoqueController.estornarSaidaOrcamento(req, res));

export default router;