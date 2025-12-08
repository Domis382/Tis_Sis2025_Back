import db from "../config/prisma.js";

// Obtener todos los evaluadores
export async function findAllEvaluadores() {
  return await db.evaluador.findMany({
    include: {
      area: true,
      usuario: true,
    }
  });
}

// Obtener evaluador por ID
export async function findEvaluadores({ idArea } = {}) {
  return prisma.evaluador.findMany({
    where: idArea ? { id_area: BigInt(idArea) } : undefined,
    orderBy: { nombre_evaluado: "asc" },
  });
}


// Crear evaluador

export async function createEvaluador(data) {
  return await db.evaluador.create({
    data: {
      nombre_evaluado: data.nombre_evaluado,
      apellidos_evaluador: data.apellidos_evaluador,
      id_area: Number(data.id_area),
      id_usuario: Number(data.id_usuario) // 👈 importante
    },
    include: {
      area: true,
      usuario: true
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
      area: true,
      usuario: true,
    }
  });
}

// Eliminar evaluador
export async function deleteEvaluador(id) {
  return await db.evaluador.delete({
    where: { id_evaluador: Number(id) },
  include: {
      usuario: true  // <- esto no es estrictamente necesario, pero útil si quieres retornar datos del usuario eliminado
    }
  });
}

export async function findEvaluadorById(id) {
  return await db.evaluador.findUnique({
    where: { id_evaluador: Number(id) },
  });
}
