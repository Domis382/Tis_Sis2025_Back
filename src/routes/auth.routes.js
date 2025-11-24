// src/routes/auth.routes.js

// Importamos Router desde Express
//  El Router nos permite definir rutas separadas por módulos (autenticación, áreas, usuarios, etc.)
import { Router } from 'express';

// Importamos la función 'login' desde el controlador de autenticación
// 👉 Este controlador contiene la lógica para validar credenciales y generar el token JWT
import { login } from '../controllers/auth.controller.js';

// Creamos una instancia del router de Express
const router = Router();

// -------------------------------------------------------------
// RUTA DE LOGIN
// -------------------------------------------------------------
// Se define el endpoint POST para iniciar sesión.
// Por convención, el "index.js" de rutas antepone '/api' (por ejemplo '/api/auth/login').
// Entonces esta ruta se resolverá finalmente como:
//  POST http://localhost:3000/api/auth/login
router.post('/auth/login', login);

// Exportamos el router para ser usado en src/routes/index.js
export default router;
