import { Router } from 'express';
import { ClienteController } from './clientes/cliente.controller.js';
import { DispositivoController } from './dispositivos/dispositivo.controller.js';

const router = Router();

// Instanciando os controllers
const clienteController = new ClienteController();
const dispositivoController = new DispositivoController();

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

export default router;