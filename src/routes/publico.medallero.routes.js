// src/routes/publico.medallero.routes.js
import { Router } from "express";
import { listarMedalleroPublico } from "../controllers/publico.medallero.controller.js";

const publicoMedalleroRoutes = Router();

// GET /api/publico/medallero
publicoMedalleroRoutes.get("/", listarMedalleroPublico);

export default publicoMedalleroRoutes;
