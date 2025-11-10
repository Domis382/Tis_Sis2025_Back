// Centraliza todas las rutas.

import { Router } from 'express';
import areaRoutes from './area.routes.js';
import evaluacionRoutes from './evaluaciones.routes.js';

const router = Router();

// Rutas
router.use('/areas', areaRoutes);
router.use('/evaluaciones', evaluacionRoutes);


// Ruta base
router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

export default router;
