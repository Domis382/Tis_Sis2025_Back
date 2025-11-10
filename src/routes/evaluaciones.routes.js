// src/routes/evaluaciones.routes.js
import { Router } from 'express';
import evaluacionController from '../controllers/evaluacion.controller.js';
// import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// router.use(authenticateToken);

router.get('/clasificatoria', (req, res, next) => evaluacionController.listarClasificatoria(req, res, next));
router.get('/metricas', (req, res, next) => evaluacionController.obtenerMetricas(req, res, next));
router.put('/:id', (req, res, next) => evaluacionController.actualizar(req, res, next));
router.post('/guardar-lote', (req, res, next) => evaluacionController.guardarLote(req, res, next));

export default router;
