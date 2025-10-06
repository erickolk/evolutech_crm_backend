import { Router } from 'express';
import { ClienteController } from './clientes/cliente.controller.js';
import { DispositivoController } from './dispositivos/dispositivo.controller.js';
import { OsController } from './ordensDeServico/os.controller.js'; 
import { FornecedorController } from './fornecedores/fornecedor.controller.js';
import { ProdutoController } from './produtos/produto.controller.js';

const router = Router();

// Instanciando os controllers
const clienteController = new ClienteController();
const dispositivoController = new DispositivoController();
const osController = new OsController();
const fornecedorController = new FornecedorController();
const produtoController = new ProdutoController();

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

export default router;