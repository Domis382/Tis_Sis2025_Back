// src/routes/health.routes.js
import { Router } from 'express';
import { prismaCheck } from '../health/prismaCheck.js';

const router = Router();

// Endpoint de verificación general
router.get('/', async (_, res) => {
  const dbStatus = await prismaCheck();
  res.json({
    app: 'ok',
    ...dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
