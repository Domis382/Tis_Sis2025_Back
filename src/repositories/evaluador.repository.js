import db from "../config/prisma.js";

// Obtener todos los evaluadores
export async function findAllEvaluadores() {
  return await db.evaluador.findMany({
    include: {
      area: true
    }
  });
}

// Obtener evaluador por ID
export async function findEvaluadorById(id) {
  return await db.evaluador.findUnique({
    where: { id_evaluador: Number(id) },
    include: {
      area: true
    }
  });
}

// Crear evaluador
export async function createEvaluador(data) {
  return await db.evaluador.create({
    data: {
      nombre_evaluado: data.nombre_evaluado,
      apellidos_evaluador: data.apellidos_evaluador,
      id_area: Number(data.id_area)
    },
    include: {
      area: true
    }
  });
}

// Actualizar evaluador
export async function updateEvaluador(id, data) {
  return await db.evaluador.update({
    where: { id_evaluador: Number(id) },
    data: {
      nombre_evaluado: data.nombre_evaluado,
      apellidos_evaluador: data.apellidos_evaluador,
      id_area: Number(data.id_area)
    },
    include: {
      area: true
    }
  });
}

// Eliminar evaluador
export async function deleteEvaluador(id) {
  return await db.evaluador.delete({
    where: { id_evaluador: Number(id) }
  });
}


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

