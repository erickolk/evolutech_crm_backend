import { Router } from 'express';
import { ClienteController } from './clientes/cliente.controller.js';
import { DispositivoController } from './dispositivos/dispositivo.controller.js';
import { OsController } from './ordensDeServico/os.controller.js'; 
import { FornecedorController } from './fornecedores/fornecedor.controller.js';
import { ProdutoController } from './produtos/produto.controller.js';
import { OrcamentoController } from './orcamentos/orcamento.controller.js';
import { OrcamentoItemController } from './orcamentos/orcamentoItem.controller.js';
import { EstoqueController } from './estoque/estoque.controller.js';
import { PagamentoController } from './pagamentos/pagamento.controller.js';
import { SimpleAuthController } from './auth/auth.controller.simple';
// Customer Service Controllers
import { ConversaController } from './conversas/conversa.controller.js';
import { MensagemController } from './mensagens/mensagem.controller.js';
import { AgenteController } from './agentes/agente.controller.js';
import { EtiquetaController } from './etiquetas/etiqueta.controller.js';
// WhatsApp Controller
import { WhatsAppController } from './whatsapp/whatsapp.controller.js';
// Template Controller
import { TemplateController } from './templates/template.controller.js';
// Communication Controller
import { ComunicacaoController } from './comunicacao/comunicacao.controller.js';
// import { authMiddleware } from './middleware/auth.middleware';

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
const pagamentoController = new PagamentoController();
const authController = new SimpleAuthController();
// Customer Service Controllers
const conversaController = new ConversaController();
const mensagemController = new MensagemController();
const agenteController = new AgenteController();
const etiquetaController = new EtiquetaController();
// WhatsApp Controller
const whatsappController = new WhatsAppController();
// Template Controller
const templateController = new TemplateController();
// Communication Controller
const comunicacaoController = new ComunicacaoController();

// --- Rotas de Autenticação ---
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/logout', (req, res) => authController.logout(req, res));
router.get('/auth/me', (req, res) => authController.me(req, res));
router.get('/auth', (req, res) => authController.verify(req, res));
router.post('/auth/refresh', (req, res) => authController.refresh(req, res));
router.post('/auth/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/auth/reset-password', (req, res) => authController.resetPassword(req, res));
router.patch('/auth/change-password', (req, res) => authController.changePassword(req, res));

// --- Rotas de Clientes ---
router.get('/clientes', (req, res) => clienteController.findAll(req, res));
router.post('/clientes', (req, res) => clienteController.create(req, res));
router.patch('/clientes/:id', (req, res) => clienteController.update(req, res));
router.delete('/clientes/:id', (req, res) => clienteController.delete(req, res));

// --- Rotas de Dispositivos ---
// Note a rota aninhada para seguir nossa decisão de arquitetura
router.get('/clientes/:clienteId/dispositivos', (req, res) => dispositivoController.findAllByCliente(req, res));
router.post('/clientes/:clienteId/dispositivos', (req, res) => dispositivoController.create(req, res));

// Rota geral para listar todos os dispositivos (solicitada pelo frontend)
router.get('/dispositivos', (req, res) => dispositivoController.findAll(req, res));
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
// Consulta geral de estoque
router.get('/estoque', (req, res) => estoqueController.listarEstoque(req, res));

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

// --- Rotas de Pagamentos ---
router.get('/pagamentos', (req, res) => pagamentoController.findAll(req, res));
router.post('/pagamentos', (req, res) => pagamentoController.create(req, res));
router.get('/pagamentos/:id', (req, res) => pagamentoController.findById(req, res));
router.patch('/pagamentos/:id', (req, res) => pagamentoController.update(req, res));
router.delete('/pagamentos/:id', (req, res) => pagamentoController.delete(req, res));
router.get('/pagamentos/os/:os_id', (req, res) => pagamentoController.findByOsId(req, res));
router.get('/pagamentos/search', (req, res) => pagamentoController.findWithFilters(req, res));
router.get('/pagamentos/stats', (req, res) => pagamentoController.getStats(req, res));
router.patch('/pagamentos/:id/parcelas/:parcelaId/pagar', (req, res) => pagamentoController.pagarParcela(req, res));
router.patch('/pagamentos/:id/parcelas/:parcelaId/estornar', (req, res) => pagamentoController.estornarParcela(req, res));

// --- Rotas de Atendimento (Customer Service) ---

// Rotas de Conversas
router.get('/conversas', (req, res) => conversaController.findAll(req, res));
router.post('/conversas', (req, res) => conversaController.create(req, res));
router.get('/conversas/:id', (req, res) => conversaController.findById(req, res));
router.patch('/conversas/:id', (req, res) => conversaController.update(req, res));
router.delete('/conversas/:id', (req, res) => conversaController.delete(req, res));
router.get('/conversas/cliente/:clienteId', (req, res) => conversaController.findByClienteId(req, res));
router.get('/conversas/agente/:agenteId', (req, res) => conversaController.findByAgenteId(req, res));
router.patch('/conversas/:id/atribuir-agente', (req, res) => conversaController.atribuirAgente(req, res));
router.patch('/conversas/:id/fechar', (req, res) => conversaController.fechar(req, res));
router.patch('/conversas/:id/reabrir', (req, res) => conversaController.reabrir(req, res));
router.get('/conversas/stats', (req, res) => conversaController.getStats(req, res));
router.get('/conversas/abertas', (req, res) => conversaController.buscarAbertas(req, res));
router.get('/conversas/sem-agente', (req, res) => conversaController.buscarSemAgente(req, res));
router.get('/conversas/prioridade/:prioridade', (req, res) => conversaController.buscarPorPrioridade(req, res));

// Rotas de Mensagens
router.get('/mensagens', (req, res) => mensagemController.findAll(req, res));
router.post('/mensagens', (req, res) => mensagemController.create(req, res));
router.get('/mensagens/:id', (req, res) => mensagemController.findById(req, res));
router.patch('/mensagens/:id', (req, res) => mensagemController.update(req, res));
router.delete('/mensagens/:id', (req, res) => mensagemController.delete(req, res));
router.get('/mensagens/conversa/:conversaId', (req, res) => mensagemController.findByConversaId(req, res));
router.post('/mensagens/enviar', (req, res) => mensagemController.enviarMensagem(req, res));
router.patch('/mensagens/:id/lida', (req, res) => mensagemController.marcarComoLida(req, res));
router.patch('/mensagens/conversa/:conversaId/marcar-todas-lidas', (req, res) => mensagemController.marcarTodasComoLidas(req, res));
router.get('/mensagens/nao-lidas', (req, res) => mensagemController.buscarNaoLidas(req, res));
router.get('/mensagens/nao-lidas/count', (req, res) => mensagemController.countNaoLidas(req, res));
router.get('/mensagens/conversa/:conversaId/ultima', (req, res) => mensagemController.getUltimaMensagem(req, res));
router.get('/mensagens/stats', (req, res) => mensagemController.getStats(req, res));
router.get('/mensagens/buscar/conteudo', (req, res) => mensagemController.buscarPorConteudo(req, res));
router.get('/mensagens/buscar/tipo/:tipo', (req, res) => mensagemController.buscarPorTipo(req, res));

// Rotas de Agentes
router.get('/agentes', (req, res) => agenteController.findAll(req, res));
router.post('/agentes', (req, res) => agenteController.create(req, res));
router.get('/agentes/:id', (req, res) => agenteController.findById(req, res));
router.patch('/agentes/:id', (req, res) => agenteController.update(req, res));
router.delete('/agentes/:id', (req, res) => agenteController.delete(req, res));
router.get('/agentes/email/:email', (req, res) => agenteController.findByEmail(req, res));
router.patch('/agentes/:id/status', (req, res) => agenteController.updateStatus(req, res));
router.patch('/agentes/:id/online', (req, res) => agenteController.setOnline(req, res));
router.patch('/agentes/:id/offline', (req, res) => agenteController.setOffline(req, res));
router.patch('/agentes/:id/ocupado', (req, res) => agenteController.setOcupado(req, res));
router.patch('/agentes/:id/ausente', (req, res) => agenteController.setAusente(req, res));
router.get('/agentes/disponiveis', (req, res) => agenteController.buscarDisponiveis(req, res));
router.post('/agentes/atribuicao-automatica', (req, res) => agenteController.atribuicaoAutomatica(req, res));
router.patch('/agentes/:id/liberar-conversa', (req, res) => agenteController.liberarConversa(req, res));
router.patch('/agentes/:id/registrar-atividade', (req, res) => agenteController.registrarAtividade(req, res));
router.get('/agentes/stats', (req, res) => agenteController.getStats(req, res));
router.get('/agentes/:id/performance', (req, res) => agenteController.getPerformance(req, res));
router.get('/agentes/departamento/:departamento', (req, res) => agenteController.buscarPorDepartamento(req, res));
router.get('/agentes/especialidade/:especialidade', (req, res) => agenteController.buscarPorEspecialidade(req, res));

// Rotas de Etiquetas
router.get('/etiquetas', (req, res) => etiquetaController.findAll(req, res));
router.post('/etiquetas', (req, res) => etiquetaController.create(req, res));
router.get('/etiquetas/:id', (req, res) => etiquetaController.findById(req, res));
router.patch('/etiquetas/:id', (req, res) => etiquetaController.update(req, res));
router.delete('/etiquetas/:id', (req, res) => etiquetaController.delete(req, res));
router.get('/etiquetas/categoria/:categoria', (req, res) => etiquetaController.findByCategoria(req, res));
router.patch('/etiquetas/reorganizar', (req, res) => etiquetaController.reorganizar(req, res));
router.get('/etiquetas/automaticas', (req, res) => etiquetaController.buscarEtiquetasAutomaticas(req, res));
router.post('/etiquetas/aplicar-automaticas', (req, res) => etiquetaController.aplicarEtiquetasAutomaticas(req, res));
router.get('/etiquetas/stats', (req, res) => etiquetaController.getStats(req, res));

// Rotas de Etiquetas em Conversas
router.post('/conversas/:conversaId/etiquetas', (req, res) => etiquetaController.aplicarEtiquetaConversa(req, res));
router.delete('/conversas/:conversaId/etiquetas', (req, res) => etiquetaController.removerEtiquetaConversa(req, res));
router.get('/conversas/:conversaId/etiquetas', (req, res) => etiquetaController.buscarEtiquetasConversa(req, res));

// Rotas de Etiquetas em Mensagens
router.post('/mensagens/:mensagemId/etiquetas', (req, res) => etiquetaController.aplicarEtiquetaMensagem(req, res));
router.delete('/mensagens/:mensagemId/etiquetas', (req, res) => etiquetaController.removerEtiquetaMensagem(req, res));
router.get('/mensagens/:mensagemId/etiquetas', (req, res) => etiquetaController.buscarEtiquetasMensagem(req, res));

// --- Rotas do WhatsApp ---
// Webhook do WhatsApp (verificação e recebimento)
router.get('/whatsapp/webhook', (req, res) => whatsappController.verifyWebhook(req, res));
router.post('/whatsapp/webhook', (req, res) => whatsappController.receiveWebhook(req, res));

// Envio de mensagens
router.post('/whatsapp/send/text', (req, res) => whatsappController.sendTextMessage(req, res));
router.post('/whatsapp/send/media', (req, res) => whatsappController.sendMediaMessage(req, res));
router.post('/whatsapp/send/location', (req, res) => whatsappController.sendLocation(req, res));
router.post('/whatsapp/send/buttons', (req, res) => whatsappController.sendInteractiveButtons(req, res));
router.post('/whatsapp/send/list', (req, res) => whatsappController.sendInteractiveList(req, res));
router.post('/whatsapp/send/template', (req, res) => whatsappController.sendTemplate(req, res));

// Utilitários
router.get('/whatsapp/media/:mediaId', (req, res) => whatsappController.downloadMedia(req, res));
router.get('/whatsapp/profile', (req, res) => whatsappController.getBusinessProfile(req, res));
router.get('/whatsapp/config', (req, res) => whatsappController.checkConfig(req, res));

// --- Rotas de Templates ---
// CRUD de templates
router.post('/templates', (req, res) => templateController.criarTemplate(req, res));
router.get('/templates', (req, res) => templateController.listarTemplates(req, res));
router.get('/templates/:id', (req, res) => templateController.buscarTemplatePorId(req, res));
router.put('/templates/:id', (req, res) => templateController.atualizarTemplate(req, res));
router.delete('/templates/:id', (req, res) => templateController.deletarTemplate(req, res));

// Operações específicas de templates
router.get('/templates/categoria/:categoria', (req, res) => templateController.buscarTemplatesPorCategoria(req, res));
router.patch('/templates/:id/toggle', (req, res) => templateController.alternarStatusTemplate(req, res));

// Processamento de templates
router.post('/templates/process', (req, res) => templateController.processarTemplate(req, res));
router.post('/templates/process-system', (req, res) => templateController.processarTemplateComSistema(req, res));
router.post('/templates/preview', (req, res) => templateController.visualizarTemplate(req, res));

// --- Rotas de Comunicação ---
// CRUD de comunicações
router.post('/comunicacao', (req, res) => comunicacaoController.criar(req, res));
router.get('/comunicacao', (req, res) => comunicacaoController.listar(req, res));
router.get('/comunicacao/:id', (req, res) => comunicacaoController.buscarPorId(req, res));
router.put('/comunicacao/:id', (req, res) => comunicacaoController.atualizar(req, res));
router.patch('/comunicacao/:id/lida', (req, res) => comunicacaoController.marcarComoLida(req, res));
router.patch('/comunicacao/lidas', (req, res) => comunicacaoController.marcarMultiplasComoLidas(req, res));

// Consultas específicas
router.get('/comunicacao/cliente/:clienteId', (req, res) => comunicacaoController.buscarPorCliente(req, res));
router.get('/comunicacao/os/:osId', (req, res) => comunicacaoController.buscarPorOS(req, res));
router.get('/comunicacao/nao-lidas', (req, res) => comunicacaoController.buscarNaoLidas(req, res));
router.get('/comunicacao/estatisticas', (req, res) => comunicacaoController.obterEstatisticas(req, res));
router.get('/comunicacao/agregado', (req, res) => comunicacaoController.obterAgregado(req, res));

// Integração com IA
router.post('/comunicacao/ia/processar', (req, res) => comunicacaoController.processarIA(req, res));
router.post('/comunicacao/whatsapp/processar', (req, res) => comunicacaoController.processarMensagemWhatsApp(req, res));

// Consultas para IA
router.get('/comunicacao/whatsapp/cliente/:numero', (req, res) => comunicacaoController.buscarClientePorWhatsApp(req, res));
router.get('/comunicacao/os/:osId/status', (req, res) => comunicacaoController.obterStatusOS(req, res));
router.get('/comunicacao/cliente/:clienteId/os-ativas', (req, res) => comunicacaoController.obterOSAtivasCliente(req, res));

export default router;