//Importa el Router de Express, que se usa para definir rutas específicas de este módulo.
import { Router } from 'express';
import * as ctrl from '../controllers/responsable.controller.js';

const router = Router();

// GET /api/responsables
router.get('/', ctrl.getAll);
// POST /api/responsables
router.post('/', ctrl.create);
// PUT /api/responsables/:id
router.put('/:id', ctrl.update);
// DELETE /api/responsables/:id
router.delete('/:id', ctrl.remove);
// Endpoint de prueba para verificar que las rutas del módulo funcionan.
router.get('/_ping', (req, res) => res.json({ ok: true }));

export default router;


