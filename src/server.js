// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import prisma from './config/prisma.js';

// Serializar BigInt antes de todo
BigInt.prototype.toJSON = function () { return this.toString(); };

dotenv.config();

const app = express();

// Permitir varias origins separadas por coma o “*”
const origins = (process.env.CORS_ORIGIN ?? '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin: origins.includes('*') ? true : origins,
  credentials: false, // pon true si luego usas cookies/sesión
}));

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/api', routes);

// Health simple
app.get('/', (_req, res) => res.send('API OK'));

// 404 para rutas no encontradas en /api/*
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Manejo de errores centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Cierre elegante
const shutdown = async () => {
  console.log('Cerrando servidor…');
  server.close(async () => {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
