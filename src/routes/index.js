// src/routes/index.js
import { Router } from 'express';

// Rutas de módulos
import authRoutes from './auth.routes.js';
import areaRoutes from './area.routes.js';
import evaluacionRoutes from './evaluaciones.routes.js';
import responsableRoutes from './responsable.routes.js';
import evaluadorRoutes from './evaluador.routes.js';
import inscritosRoutes from './inscritos.routes.js';
import coordinadorRoutes from './coordinador.routes.js';

// Middlewares
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/* =========================
   Rutas públicas / health
========================= */
// /api/
router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API Oh! SanSi Backend funcionando ✅' });
});

// /api/health
router.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'UP' });
});

/* =========================
   Autenticación
   Nota: authRoutes ya define /auth/*
   Por eso NO le agregamos prefijo aquí.
========================= */
router.use(authRoutes); // expone /api/auth/*

/* =========================
   Rutas protegidas
========================= */
// Áreas (solo Admin/Coordinador)
router.use(
  '/areas',
  authMiddleware(['Administrador', 'Coordinador']),
  areaRoutes
);

// Ejemplo de ruta protegida para probar credenciales
router.get(
  '/profile',
  authMiddleware(['Responsable de Area', 'Administrador', 'Coordinador']),
  (req, res) => {
    res.json({ ok: true, message: '¡Acceso permitido a ruta protegida!', user: req.user });
  }
);

/* =========================
   Rutas no protegidas (o con su propio middleware interno)
========================= */
router.use('/evaluaciones', evaluacionRoutes);
router.use('/responsables', responsableRoutes);
router.use('/evaluadores', evaluadorRoutes);
router.use('/coordinador', coordinadorRoutes);

// Importación de inscritos (estas rutas ya protegen con requireRole en su propio archivo)
router.use('/inscritos', inscritosRoutes);

/* =========================
   404 para cualquier otra ruta bajo /api
========================= */
router.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

export default router;
