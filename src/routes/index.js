// Centraliza todas las rutas.

import { Router } from 'express';
import areaRoutes from './area.routes.js';
import inscritosRoutes from './inscritos.routes.js';

const router = Router();

router.use('/areas', areaRoutes);

// Ruta base
router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

// monta /api/inscritos/*
router.use('/inscritos', inscritosRoutes);

router.get('/', (req, res) => res.json({ ok: true, message: 'API OK' }));

export default router;
