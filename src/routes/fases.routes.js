// src/routes/fases.routes.js
// Rutas para manejar parámetros de las fases (nota mínima, fase final)

import { Router } from 'express';
import {
  getParametroClasificacion,
  updateParametroClasificacion,
  eliminarClasificadosController,
} from '../controllers/fases.controller.js';

const router = Router();

// GET actual nota mínima / estado de la fase clasificatoria
router.get('/clasificacion', getParametroClasificacion);

// PUT para actualizar la nota mínima de clasificación
router.put('/clasificacion', updateParametroClasificacion);

//DELETE
router.delete("/clasificados", eliminarClasificadosController); // sin params


export default router;
