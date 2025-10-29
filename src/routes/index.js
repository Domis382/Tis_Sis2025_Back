// Centraliza todas las rutas.

import { Router } from 'express';
import areaRoutes from './area.routes.js';
import responsableRoutes from './responsable.routes.js';//se creo para tabla de responsable en la vista de admin
import evaluadorRoutes from './evaluador.routes.js';//e creo para tabla de evaluadores en la vista de admin

const router = Router();

router.use('/areas', areaRoutes);
router.use('/responsables', responsableRoutes);//se creo para tabla de responsable en la vista de admin
router.use('/evaluadores', evaluadorRoutes);//se creo para tabla de evaluadores en la vista de admin
// Ruta base
router.get('/', (req, res) => {
  res.json({ message: 'API Oh! SanSi Backend funcionando ✅' });
});

export default router;
