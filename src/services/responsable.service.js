// src/services/responsable.service.js
import * as repo from '../repositories/responsable.repository.js';

// Si necesitas validaciones adicionales, hazlas aquí.
export async function getAllResponsables() {
  return repo.listResponsables();
}

export async function createResponsable(payload) {
  const {
    nombres_evaluador,
    apellidos,
    correo_electronico,
    usuario_responsable,
    pass_responsable,
    id_area,
  } = payload;

  if (
    !nombres_evaluador ||
    !apellidos ||
    !correo_electronico ||
    !usuario_responsable ||
    !pass_responsable ||
    !id_area
  ) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400;
    throw err;
  }

  try {
    return await repo.createResponsable({
      nombres_evaluador,
      apellidos,
      correo_electronico,
      usuario_responsable,
      pass_responsable,
      id_area,
    });
  } catch (e) {
    // Prisma unique constraint (correo/usuario)
    if (e.code === 'P2002') {
      const err = new Error(`Registro duplicado: ${e.meta?.target?.join(', ')}`);
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

export async function updateResponsable(id, payload) {
  // id en tu modelo es BigInt (id_responsable). Prisma acepta Number o BigInt.
  const numId = Number(id);
  if (!numId) {
    const err = new Error('ID inválido');
    err.status = 400;
    throw err;
  }
  return repo.updateResponsable(numId, payload);
}

export async function deleteResponsable(id) {
  const numId = Number(id);
  if (!numId) {
    const err = new Error('ID inválido');
    err.status = 400;
    throw err;
  }
  return repo.deleteResponsable(numId);
}
