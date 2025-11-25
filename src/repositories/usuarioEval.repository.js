// repositories/usuarioEval.repository.js
import db from "../config/prisma.js";

// Obtener todos los usuarios con rol EVALUADOR
export async function findAllUsuarios() {
  return await db.usuario.findMany({
    where: { rol: "EVALUADOR" } // <-- aquí filtramos por rol
  });
}

// Obtener por ID
export async function findUsuarioById(id) {
  return await db.usuario.findUnique({
    where: { id_usuario: Number(id) }
  });
}

// Crear
export async function createUsuario(data) {
  return await db.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      passwordHash: data.passwordHash, // ya debe venir hasheado
      telefono: data.telefono,
      rol: data.rol,
      estado: data.estado ?? "ACTIVO",
    }
  });
}

// Actualizar
export async function updateUsuario(id, data) {
  return await db.usuario.update({
    where: { id_usuario: Number(id) },
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      telefono: data.telefono,
      rol: data.rol,
      estado: data.estado,
    }
  });
}

// Eliminar
export async function deleteUsuario(id) {
  return await db.usuario.delete({
    where: { id_usuario: Number(id) }
  });
}
