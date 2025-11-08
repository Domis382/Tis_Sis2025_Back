//Punto de entrada del backend (Express configurado).

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
//import authRoutes from './routes/auth.routes.js'
import { errorHandler } from './middlewares/errorHandler.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas principales
app.use('/api', routes);


// Middleware de errores (último)
app.use(errorHandler);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
