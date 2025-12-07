// src/routes/medallero.routes.js
import { Router } from "express";
import { cargarMedallero } from "../controllers/medallero.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /api/medallero/cargar
router.post(
  "/cargar",
  authMiddleware(["Administrador", "Coordinador", "Responsable de Area"]),
  cargarMedallero
);

export default router;
