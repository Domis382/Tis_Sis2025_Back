// src/repositories/fases.repository.js
import prisma from '../config/prisma.js';

// Buscar fase por nombre (por ejemplo "CLASIFICATORIA")
export function findByNombre(nombre_fase) {
  return prisma.fases.findUnique({
    where: { nombre_fase },
  });
}

// Actualizar solo la nota mínima de una fase
export function updateNotaMinima(nombre_fase, nota_minima) {
  return prisma.fases.update({
    where: { nombre_fase },
    data: { nota_minima },
  });
}

// (opcional) actualizar bandera de fase_final, lo usaremos luego
export function updateFaseFinal(nombre_fase, fase_final) {
  return prisma.fases.update({
    where: { nombre_fase },
    data: { fase_final },
  });
}
