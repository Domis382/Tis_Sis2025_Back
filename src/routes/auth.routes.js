// src/routes/auth.routes.js
import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();
// quedará como POST /api/auth/login por el index.js
router.post('/auth/login', login);

export default router;
