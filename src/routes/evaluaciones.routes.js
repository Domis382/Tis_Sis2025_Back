// src/routes/evaluaciones.routes.js
import { Router } from "express";
import * as evaluacionController from "../controllers/evaluacion.controller.js";

const router = Router();

// GET /api/evaluaciones
router.get("/", evaluacionController.getResultadosClasificatoria);

// GET /api/evaluaciones/historial
router.get("/historial", evaluacionController.getHistorialEvaluaciones);

// PUT /api/evaluaciones
router.put("/", evaluacionController.actualizarNotas);

export default router;
