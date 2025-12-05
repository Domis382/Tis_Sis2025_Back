// src/routes/anuncio.routes.js
import { Router } from "express";
import {
  crearAnuncioCarruselController,
  listarAnunciosCarruselController,
} from "../controllers/anuncio.controller.js";

const router = Router();

router.get("/carrusel", listarAnunciosCarruselController);
router.post("/carrusel", crearAnuncioCarruselController);

export default router;
