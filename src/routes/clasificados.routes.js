import { Router } from "express";
import * as clasificadosController from "../controllers/clasificados.controller.js";

const router = Router();

// GET /api/clasificados - Obtener todos los clasificados
router.get("/", clasificadosController.getAll);

router.get("/finalistas", clasificadosController.getFinalistas);

// POST /api/clasificados/cargar - Cargar nuevos clasificados desde Excel
router.post("/cargar", clasificadosController.uploadExcel);

export default router;
