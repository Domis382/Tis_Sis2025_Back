// src/routes/password.routes.js
import { Router } from "express";
import {
  enviarCodigoReset,
  verificarCodigoReset,
  resetearPassword,
} from "../controllers/password.controller.js";

const router = Router();

// Esto va debajo de /api (ver index.js)
router.post("/password/forgot", enviarCodigoReset);
router.post("/password/verify", verificarCodigoReset);
router.post("/password/reset", resetearPassword);

export default router;
