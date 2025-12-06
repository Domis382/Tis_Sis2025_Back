// src/routes/anuncio.routes.js
import { Router } from "express";
import {
  crearAnuncioController,
  listarAnunciosController,
  listarAnunciosVigentesController, eliminarAnuncioController
} from "../controllers/anuncio.controller.js";
// import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Para responsable (gestión)
router.get("/carrusel", /* authMiddleware, */ listarAnunciosController);
router.post("/carrusel", /* authMiddleware, */ crearAnuncioController);

router.delete("/carrusel/:id", eliminarAnuncioController);

// Para homepage (solo vigentes)
router.get(
  "/carrusel/vigentes",
  listarAnunciosVigentesController
);

export default router;
