import express from 'express';
import { login  } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/login', login);
//router.get('/auth/me', me); // opcional: validar token y devolver usuario

export default router;
