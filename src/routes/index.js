import express from 'express';
import authRoutes from './auth.routes.js';
import areaRoutes from './area.routes.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authRoutes);            // /api/auth/...
router.use('/areas', authMiddleware(['Administrador','Coordinador']), areaRoutes);

// Ruta de perfil protegida - AGREGAR ESTO
router.get('/profile', authMiddleware(['Responsable de Area', 'Administrador', 'Coordinador']), (req, res) => {
  res.json({
    ok: true,
    message: '¡Acceso permitido a ruta protegida!',
    user: req.user
  });
});

router.get('/health', (req, res) => res.json({ ok: true, status: 'UP' }));

export default router;