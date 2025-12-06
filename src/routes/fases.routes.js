// src/routes/fases.routes.js
// Rutas para manejar parámetros de las fases (nota mínima, fase final)

import { Router } from 'express';
import {
  getParametroClasificacion,
  updateParametroClasificacion,
} from '../controllers/fases.controller.js';

const router = Router();

// GET actual nota mínima / estado de la fase clasificatoria
router.get('/clasificacion', getParametroClasificacion);

// PUT para actualizar la nota mínima de clasificación
router.put('/clasificacion', updateParametroClasificacion);

export default router;
