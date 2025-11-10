// src/health/prismaCheck.js
import prisma from '../config/prisma.js';

/**
 * Verifica la conexión con la base de datos.
 * Ejecuta un SELECT 1 para confirmar que Prisma puede acceder.
 */
export async function prismaCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  } catch (error) {
    console.error('❌ Error en conexión Prisma:', error.message);
    return { db: 'error', detail: error.message };
  }
}
