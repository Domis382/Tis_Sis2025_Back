// src/routes/evaluaciones.routes.js
import { Router } from "express";
import {
  getResultadosClasificatoria,
  getHistorialEvaluaciones,
  actualizarNotaIndividual,
  actualizarNotas
} from "../controllers/evaluacion.controller.js";

const router = Router();

// GET /api/evaluaciones
// Obtiene todas las evaluaciones (con filtros opcionales)
router.get("/", getResultadosClasificatoria);

// GET /api/evaluaciones/historial
// Obtiene el historial de cambios
router.get("/historial", getHistorialEvaluaciones);

// PATCH /api/evaluaciones/:id
// Actualiza UNA SOLA evaluación (para guardar en tiempo real)
// Usar este endpoint cuando el usuario edita una celda
router.patch("/:id", actualizarNotaIndividual);

// PUT /api/evaluaciones
// Actualiza múltiples evaluaciones en lote
// Se mantiene para compatibilidad con el botón "Guardar cambios"
router.put("/", actualizarNotas);

export default router;