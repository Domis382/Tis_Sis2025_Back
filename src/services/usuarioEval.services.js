// services/usuarioEval.services.js
import * as usuarioRepo from "../repositories/usuarioEval.repository.js";

export async function getAllUsuarios() {
  const rows = await usuarioRepo.findAllUsuarios();

  return rows.map(u => ({
    id: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    correo: u.correo,
    telefono: u.telefono ?? "",
    rol: u.rol,
    estado: u.estado,
    nombreUsuario: (u.nombre?.[0] || "") + (u.apellido?.[0] || "")
  }));
}

export async function createUsuario(data) {
  
  const created = await usuarioRepo.createUsuario({
    ...data,
    passwordHash: "1234567"
  });

  return {
    id: created.id_usuario,
    nombre: created.nombre,
    apellido: created.apellido,
    correo: created.correo,
    telefono: created.telefono ?? "",
    rol: created.rol,
    estado: created.estado,
    nombreUsuario:
      (created.nombre?.[0] || "") + (created.apellido?.[0] || "")
  };
}
export async function updateUsuario(id, data) {
  const updated = await usuarioRepo.updateUsuario(id, data);

  return {
    id: updated.id_usuario,
    nombre: updated.nombre,
    apellido: updated.apellido,
    correo: updated.correo,
    telefono: updated.telefono ?? "",
    rol: updated.rol,
    estado: updated.estado,
    nombreUsuario:
      (updated.nombre?.[0] || "") + (updated.apellido?.[0] || "")
  };
}

export async function deleteUsuario(id) {
  await usuarioRepo.deleteUsuario(id);
  return { message: "Usuario eliminado" };
}
