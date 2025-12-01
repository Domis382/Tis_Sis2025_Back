// src/routes/evaluaciones.routes.js
import { Router } from "express";
import * as evaluacionController from "../controllers/evaluacion.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/evaluaciones
router.get(
  "/",
  authMiddleware(["EVALUADOR", "COORDINADOR", "ADMIN"]),
  evaluacionController.getResultadosClasificatoria
);

// GET /api/evaluaciones/historial
router.get(
  "/historial",
  authMiddleware(["EVALUADOR", "COORDINADOR", "ADMIN"]),
  evaluacionController.getHistorialEvaluaciones
);

// PUT /api/evaluaciones
router.put(
  "/",
  authMiddleware(["EVALUADOR", "COORDINADOR", "ADMIN"]),
  evaluacionController.actualizarNotas
);

export default router;
