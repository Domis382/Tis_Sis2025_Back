// src/routes/evaluaciones.routes.js
import { Router } from "express";
import * as evaluacionController from "../controllers/evaluacion.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/evaluaciones
router.get(
  "/",
  authMiddleware(["Evaluador", "Coordinador Area", "Administrador"]),
  evaluacionController.getResultadosClasificatoria
);

// GET /api/evaluaciones/historial
router.get(
  "/historial",
  authMiddleware(["Evaluador", "Coordinador Area", "Administrador"]),
  evaluacionController.getHistorialEvaluaciones
);

// PUT /api/evaluaciones
router.put(
  "/",
  authMiddleware(["Evaluador", "Coordinador Area", "Administrador"]),
  evaluacionController.actualizarNotas
);

export default router;
