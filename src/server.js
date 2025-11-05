//Punto de entrada del backend (Express configurado).

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', routes);

// Middleware de errores (último)
app.use(errorHandler);

//Fix error BigInt to String
app.set('json replacer', (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
