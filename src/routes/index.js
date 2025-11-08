import express from 'express';
import authRoutes from './auth.routes.js';
import areaRoutes from './area.routes.js';
import evaluacionRoutes from "./evaluaciones.routes.js";
import responsableRoutes from "./responsable.routes.js";
import evaluadorRoutes from "./evaluador.routes.js";

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use('/areas', areaRoutes);
router.use("/evaluaciones", evaluacionRoutes);


// RUTAS UNIFICADAS
router.use(authRoutes); // rutas de autenticación

// Áreas protegidas con middleware (de autenticación)
router.use('/areas', authMiddleware(['Administrador', 'Coordinador']), areaRoutes);

// Rutas que no requieren autenticación
router.use('/responsables', responsableRoutes);
router.use('/evaluadores', evaluadorRoutes);

// Endpoint de salud (para verificar que el backend está activo)
router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'UP' });
});

// Ruta raíz (mensaje informativo)
router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

export default router;