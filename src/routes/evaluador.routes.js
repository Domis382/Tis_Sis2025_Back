//se creo para la tabla de el evaluador de admin 
import { Router } from 'express';
import * as evaluadorController from '../controllers/evaluador.controller.js';

const router = Router();

// GET /api/evaluadores
router.get('/', evaluadorController.getAll);

// POST /api/evaluadores
router.post('/', evaluadorController.create);

// PUT /api/evaluadores/:id
router.put('/:id', evaluadorController.update);

// DELETE /api/evaluadores/:id
router.delete('/:id', evaluadorController.remove);

export default router;
