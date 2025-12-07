// src/routes/evaluaciones.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getResultadosClasificatoria,
  getHistorialEvaluaciones,
  actualizarNotasBatch,
  actualizarNotaIndividual,
} from "../controllers/evaluacion.controller.js";

const router = Router();

/**
 * Queda montado como /api/evaluaciones en src/routes/index.js
 * Todas las rutas requieren estar autenticado.
 */
router.get("/", authMiddleware(), getResultadosClasificatoria);
router.get("/historial", authMiddleware(), getHistorialEvaluaciones);
router.put("/", authMiddleware(), actualizarNotasBatch);
router.patch("/:id", authMiddleware(), actualizarNotaIndividual);

export default router;
