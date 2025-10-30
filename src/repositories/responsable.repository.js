/*
==========================================
🔒 VERSIÓN ORIGINAL (Prisma + PostgreSQL)
==========================================

import prisma from '../config/prisma.js';

export function findAll() {
  return prisma.area.findMany({
    orderBy: { id_area: 'asc' }
  });
}

export function findById(id) {
  return prisma.area.findUnique({
    where: { id_area: id }
  });
}

export function create(data) {
  return prisma.area.create({
    data: {
      nombre_area: data.nombre_area
    }
  });
}

export function update(id, data) {
  return prisma.area.update({
    where: { id_area: id },
    data: {
      nombre_area: data.nombre_area
    }
  });
}

export function remove(id) {
  return prisma.area.delete({
    where: { id_area: id }
  });
}
*/

/*
==========================================
✅ VERSIÓN TEMPORAL (LowDB + mockData.json)
==========================================
*/

// Importa la base JSON local
// src/repositories/responsables.repository.js
// ============================================================
// Repositorio que maneja la persistencia de Responsables (LowDB)
// ============================================================
/*
import { db } from '../config/db.js';

// ✅ Obtener todos los responsables
export async function findAllResponsables() {
  await db.read();
  return db.data.responsables;
}

// Obtener un responsable por ID
export async function findResponsableById(id) {
  await db.read();
  return db.data.responsables.find(r => r.id === Number(id)) || null;
}

// Crear un nuevo responsable
export async function createResponsable(data) {
  await db.read();
  const nuevo = {
    id: Date.now(), // ID generado
    ...data
  };
  db.data.responsables.push(nuevo);
  await db.write();
  return nuevo;
}

// Actualizar un responsable existente
export async function updateResponsable(id, data) {
  await db.read();
  const index = db.data.responsables.findIndex(r => r.id === Number(id));
  if (index === -1) return null;

  db.data.responsables[index] = { ...db.data.responsables[index], ...data };
  await db.write();
  return db.data.responsables[index];
}

// Eliminar un responsable
export async function deleteResponsable(id) {
  await db.read();
  db.data.responsables = db.data.responsables.filter(r => r.id !== Number(id));
  await db.write();
  return true;
}
  */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listResponsables() {
  return prisma.responsable_area.findMany({
    include: { area: true },
  });
}

export async function createResponsable({
  nombres_evaluador,
  apellidos,
  correo_electronico,
  usuario_responsable,
  pass_responsable,
  id_area,
}) {
  return prisma.responsable_area.create({
    data: {
      nombres_evaluador,
      apellidos,
      correo_electronico,
      usuario_responsable,
      pass_responsable,
      id_area: Number(id_area),
    },
  });
}
/** Actualizar responsable */
export async function updateResponsable(id_responsable, data) {
  // Filtra solo campos permitidos
  const {
    nombres_evaluador,
    apellidos,
    correo_electronico,
    usuario_responsable,
    pass_responsable,
    id_area,
  } = data;

  return prisma.responsable_area.update({
    where: { id_responsable: Number(id_responsable) },
    data: {
      ...(nombres_evaluador !== undefined && { nombres_evaluador }),
      ...(apellidos !== undefined && { apellidos }),
      ...(correo_electronico !== undefined && { correo_electronico }),
      ...(usuario_responsable !== undefined && { usuario_responsable }),
      ...(pass_responsable !== undefined && { pass_responsable }),
      ...(id_area !== undefined && { id_area: Number(id_area) }),
    },
  });
}

/** Eliminar responsable */
export async function deleteResponsable(id_responsable) {
  await prisma.responsable_area.delete({
    where: { id_responsable: Number(id_responsable) },
  });
  return true;
}
