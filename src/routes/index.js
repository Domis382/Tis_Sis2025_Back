// Centraliza todas las rutas.

import { Router } from 'express';
import areaRoutes from './area.routes.js';

const router = Router();

router.use('/areas', areaRoutes);

// Ruta base
router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

export default router;
