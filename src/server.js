// src/server.js
// Punto de entrada SOLO para entorno local (no lo usa Vercel)

import dotenv from 'dotenv';
import prisma from './config/prisma.js';
import app from './app.js';

dotenv.config();

const isTest = process.env.JEST_WORKER_ID !== undefined;

let server;

if (!isTest) {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('Cerrando servidor…');
    server.close(async () => {
      try { await prisma?.$disconnect?.(); } catch (_) {}
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Para tests (Supertest, etc.)
export default app;
