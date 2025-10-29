//se creo para la abla de evaluadores en admin 
/*
==========================================
🔒 VERSIÓN ORIGINAL (Prisma + PostgreSQL)
==========================================

import prisma from '../config/prisma.js';

export function findAllEvaluadores() {
  return prisma.evaluador.findMany({
    orderBy: { id_evaluador: 'asc' },
    include: {
      area: true, // para obtener el nombre del área
    },
  });
}

export function createEvaluador(data) {
  return prisma.evaluador.create({
    data: {
      nombre_evaluado: data.nombres,
      apellidos_evaluador: data.apellidos,
      id_area: Number(data.id_area),
    },
    include: { area: true },
  });
}

export function updateEvaluador(id, data) {
  return prisma.evaluador.update({
    where: { id_evaluador: Number(id) },
    data: {
      nombre_evaluado: data.nombres,
      apellidos_evaluador: data.apellidos,
      id_area: Number(data.id_area),
    },
    include: { area: true },
  });
}

export function deleteEvaluador(id) {
  return prisma.evaluador.delete({
    where: { id_evaluador: Number(id) },
  });
}
*/

/*
==========================================
✅ VERSIÓN TEMPORAL (LowDB + mockData.json)
==========================================
*/

// src/repositories/evaluadores.repository.js
// ============================================================
// Repositorio que maneja la persistencia de Evaluadores (LowDB)
// ============================================================

import { db } from '../config/db.js';

// ✅ Obtener todos los evaluadores
export async function findAllEvaluadores() {
  await db.read();
  return db.data.evaluadores;
}

// ✅ Obtener un evaluador por ID
export async function findEvaluadorById(id) {
  await db.read();
  return db.data.evaluadores.find(e => e.id === Number(id)) || null;
}

// ✅ Crear un nuevo evaluador
export async function createEvaluador(data) {
  await db.read();
  const nuevo = {
    id: Date.now(), // ID generado
    ...data
  };
  db.data.evaluadores.push(nuevo);
  await db.write();
  return nuevo;
}

// ✅ Actualizar un evaluador existente
export async function updateEvaluador(id, data) {
  await db.read();
  const index = db.data.evaluadores.findIndex(e => e.id === Number(id));
  if (index === -1) return null;

  db.data.evaluadores[index] = { ...db.data.evaluadores[index], ...data };
  await db.write();
  return db.data.evaluadores[index];
}

// ✅ Eliminar un evaluador
export async function deleteEvaluador(id) {
  await db.read();
  db.data.evaluadores = db.data.evaluadores.filter(e => e.id !== Number(id));
  await db.write();
  return true;
}
