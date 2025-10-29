// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initDB } from './config/db.js'; // 👈 añadida, para mi BD simulada

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializamos la base de datos simulada
await initDB(); // 👈 añadida para mi BD simulada

// Rutas principales
app.use('/api', routes);

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

