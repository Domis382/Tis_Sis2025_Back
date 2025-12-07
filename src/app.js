// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import anuncioRoutes from "./routes/anuncio.routes.js";

// 👇 Soporta ambos tipos de export del errorHandler
import * as errorMod from './middlewares/errorHandler.js';

// (opcional, por si luego lo usas en rutas protegidas)
import { authMiddleware } from './middlewares/authMiddleware.js';

dotenv.config();

// Serializar BigInt (evita errores al devolver IDs bigint)
BigInt.prototype.toJSON = function () { return this.toString(); };

const app = express();

//  CORS (múltiples orígenes o default a localhost:5173) 
const rawOrigins = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const origins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin: origins.length === 1 && origins[0] === '*' ? true : origins,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//  Body parsers 
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));

//  Rutas API 
app.use('/api', routes);
app.use("/api/anuncios", anuncioRoutes);

//  Health 
app.get('/', (_req, res) => res.send('API OK'));

//  404 bajo /api/* 
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Manejo de errores.
const errorHandler =
  errorMod.errorHandler ??
  errorMod.default ??
  ((_err, _req, res, _next) => {
    res.status(500).json({ ok: false, message: 'Error interno' });
  });

app.use(errorHandler);

// 👇 IMPORTANTÍSIMO: aquí NO hay app.listen
export default app;
