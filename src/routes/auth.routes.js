// src/routes/auth.routes.js
import { Router } from "express";

// 👇 IMPORTA TODO DESDE auth.controller.js
import {
  login,
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

// LOGIN
router.post("/auth/login", login);

// RECUPERAR CONTRASEÑA
router.post("/password/forgot", sendResetCode);
router.post("/password/verify", verifyResetCode);
router.post("/password/reset", resetPassword);

export default router;
