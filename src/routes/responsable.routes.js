//agrege esto para admin
/*import { Router } from 'express';
import * as responsableController from '../controllers/responsable.controller.js';

const router = Router();

router.get('/', responsableController.getAll);
router.post('/', responsableController.create);
router.put('/:id', responsableController.update);
router.delete('/:id', responsableController.remove);

export default router;*/


import { Router } from 'express';
import * as repo from '../repositories/responsables.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// GET /api/responsables
router.get('/', async (req, res) => {
  const data = await repo.findAllResponsables();
  successResponse(res, data);
});

// POST /api/responsables
router.post('/', async (req, res) => {
  const nuevo = await repo.createResponsable(req.body);
  successResponse(res, nuevo, 201);
});

// PUT /api/responsables/:id
router.put('/:id', async (req, res) => {
  const actualizado = await repo.updateResponsable(req.params.id, req.body);
  if (!actualizado) return errorResponse(res, 'Responsable no encontrado', 404);
  successResponse(res, actualizado);
});

// DELETE /api/responsables/:id
router.delete('/:id', async (req, res) => {
  await repo.deleteResponsable(req.params.id);
  successResponse(res, { message: 'Responsable eliminado correctamente' });
});

export default router;

