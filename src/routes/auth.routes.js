// src/routes/auth.routes.js
import { Router } from "express";

// 👇 IMPORTA TODO DESDE auth.controller.js
import {
  login,
  sendResetCode,
  verifyResetCode,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/authMiddleware.js"; // 👈 Agregar

const router = Router();

// LOGIN
router.post("/auth/login", login);

// RECUPERAR CONTRASEÑA
router.post("/password/forgot", sendResetCode);
router.post("/password/verify", verifyResetCode);
router.post("/password/reset", resetPassword);
router.get("/auth/me", authMiddleware([]), getMe);

export default router;
