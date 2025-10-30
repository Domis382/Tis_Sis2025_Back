import { Router } from 'express';
import areaRoutes from './area.routes.js';
import responsableRoutes from './responsable.routes.js';
import evaluadorRoutes from './evaluador.routes.js';

const router = Router();

router.use('/areas', areaRoutes);
router.use('/responsables', responsableRoutes);
router.use('/evaluadores', evaluadorRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

export default router;

