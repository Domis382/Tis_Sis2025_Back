import { Router } from "express";
import * as evaluacionController from "../controllers/evaluacion.controller.js";

const router = Router();

router.get("/", evaluacionController.getResultadosClasificatoria);

export default router;
