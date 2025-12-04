//se creo para la tabla de el evaluador de admin 
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
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

router.get('/mi-perfil', authMiddleware([]), evaluadorController.getMiPerfil);

export default router;
