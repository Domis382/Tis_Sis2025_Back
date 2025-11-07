import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
//import authRoutes from './routes/auth.routes.js'
import { errorHandler } from './middlewares/errorHandler.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// await initDB(); // ← si usas LowDB para otras cosas, pero NO para responsables

app.use('/api', routes);
app.get('/', (_, res) => res.send('API OK'));


// Convierte todos los BigInt a Number al serializar JSON
app.set('json replacer', (key, value) =>
  typeof value === 'bigint' ? Number(value) : value
);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


