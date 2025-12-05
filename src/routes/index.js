// src/routes/index.js
import { Router } from "express";

// Rutas de módulos
import authRoutes from "./auth.routes.js";
import areaRoutes from "./area.routes.js";
import evaluacionRoutes from "./evaluaciones.routes.js";
import responsableRoutes from "./responsable.routes.js";
import evaluadorRoutes from "./evaluador.routes.js";
import inscritosRoutes from "./inscritos.routes.js";
import coordinadorRoutes from "./coordinador.routes.js";
import usuarioEvalRoutes from "./usuarioEval.routes.js";
import clasificadosRoutes from "./clasificados.routes.js";
import passwordRoutes from "./password.routes.js";

// Middlewares
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

/* =========================
   Rutas públicas / health
========================= */

// /api/
router.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Oh! SanSi Backend funcionando ✅" });
});

// /api/health
router.get("/health", (_req, res) => {
  res.json({ ok: true, status: "UP" });
});

/* =========================
   Autenticación
   Nota: authRoutes ya define /auth/*
   Por eso NO le agregamos prefijo aquí.
========================= */

// expone /api/auth/*
router.use(authRoutes);

/* =========================
   Rutas protegidas
========================= */

// Áreas (solo Admin / Coordinador / Responsable de área)
router.use(
  "/areas",
  authMiddleware(["ADMIN", "COORDINADOR", "RESPONSABLE"]),
  areaRoutes
);

// Ejemplo de ruta protegida para probar credenciales
router.get(
  "/profile",
  authMiddleware(["RESPONSABLE", "ADMIN", "COORDINADOR"]),
  (req, res) => {
    res.json({
      ok: true,
      message: "¡Acceso permitido a ruta protegida!",
      user: req.user,
    });
  }
);

/* =========================
   Rutas no protegidas (o con su propio middleware interno)
========================= */

router.use("/evaluaciones", evaluacionRoutes);
router.use("/responsables", responsableRoutes);
router.use("/evaluadores", evaluadorRoutes);
router.use("/coordinador", coordinadorRoutes);
router.use("/usuariosEval", usuarioEvalRoutes);
router.use("/clasificados", clasificadosRoutes);

// Importación de inscritos (estas rutas ya protegen con requireRole en su propio archivo)
router.use("/inscritos", inscritosRoutes);

// Rutas de recuperación de contraseña (password/*)
router.use(passwordRoutes);

/* =========================
   404 para cualquier otra ruta bajo /api
========================= */

router.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default router;
