import { Router } from "express";
import * as clasificadosController from "../controllers/clasificados.controller.js";

const router = Router();

// GET /api/clasificados
router.get("/", clasificadosController.getAll);

// POST /api/clasificados/cargar
router.post("/cargar", clasificadosController.uploadExcel);

export default router;
