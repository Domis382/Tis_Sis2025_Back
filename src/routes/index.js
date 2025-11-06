// src/routes/index.js
import { Router } from 'express';
import areaRoutes from './area.routes.js';
import inscritosRoutes from './inscritos.routes.js';

const router = Router();

// Ruta base de /api
router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API Oh! SanSi Backend funcionando ✅' });
});

router.use('/areas', areaRoutes);
router.use('/inscritos', inscritosRoutes);

export default router;
