//se creo ara la tabla de evaluadores en admin 
import * as evaluadorRepo from '../repositories/evaluador.repository.js';

import * as usuarioService from './usuarioEval.services.js';

export async function createEvaluadorCompleto(data) {
  // 1️⃣ Crear el usuario primero
  const usuarioPayload = {
    nombre: data.nombre_evaluado,
    apellido: data.apellidos_evaluador,
    correo: data.correo,
    telefono: data.telefono ?? "",
    rol: "EVALUADOR",
    passwordHash: "1234567",
  };

  const usuarioCreado = await usuarioService.createUsuario(usuarioPayload);

  // 2️⃣ Crear evaluador vinculado
  const evaluadorPayload = {
    nombre_evaluado: data.nombre_evaluado,
    apellidos_evaluador: data.apellidos_evaluador,
    id_area: Number(data.id_area),
    id_usuario: Number(usuarioCreado.id),
  };

  const evaluadorCreado = await evaluadorRepo.createEvaluador(evaluadorPayload);

  // 3️⃣ Mapear para el front
  return {
    id: evaluadorCreado.id_evaluador,
    nombres: evaluadorCreado.nombre_evaluado,
    apellidos: evaluadorCreado.apellidos_evaluador,
    rol: "EVALUADOR",
    area: evaluadorCreado.area?.nombre_area ?? "",
    correo: usuarioCreado.correo,
    estado: usuarioCreado.estado,
    telefono: usuarioCreado.telefono ?? "",
    nombreUsuario:
      (evaluadorCreado.nombre_evaluado?.[0] || "") +
      (evaluadorCreado.apellidos_evaluador?.[0] || ""),
    id_usuario: usuarioCreado.id,
  };
}

// Mapear DB → front (el front espera el mismo shape que responsablesTable usa)
export async function getAllEvaluadores() {
  const rows = await evaluadorRepo.findAllEvaluadores();
  return rows.map((e) => ({
    id: e.id_evaluador,
    nombres: e.nombre_evaluado,
    apellidos: e.apellidos_evaluador,
    rol: "EVALUADOR",
    area: e.area?.nombre_area ?? "",
    correo: e.usuario?.correo ?? "",
    estado: e.usuario?.estado ?? true,
    telefono: e.usuario?.telefono ?? "",
    nombreUsuario: (e.nombre_evaluado?.[0] || "") + (e.apellidos_evaluador?.[0] || ""),
    id_usuario: e.id_usuario,
  }));
}

// Actualizar evaluador completo (evaluador + usuario)
export async function updateEvaluadorCompleto(idEvaluador, data) {
  // 1️⃣ Actualizar evaluador
  const updatedEvaluador = await evaluadorRepo.updateEvaluador(idEvaluador, data);

  // 2️⃣ Actualizar usuario vinculado
  if (updatedEvaluador.id_usuario) {
    await usuarioService.updateUsuario(updatedEvaluador.id_usuario, {
      nombre: data.nombre_evaluado,
      apellido: data.apellidos_evaluador,
      correo: data.correo,
      telefono: data.telefono,
    });
  }

  return {
    id: updatedEvaluador.id_evaluador,
    nombres: updatedEvaluador.nombre_evaluado,
    apellidos: updatedEvaluador.apellidos_evaluador,
    rol: "EVALUADOR",
    area: updatedEvaluador.area?.nombre_area ?? "",
    correo: data.correo,
    estado: data.estado ?? true,
    telefono: data.telefono ?? "",
    nombreUsuario:
      (updatedEvaluador.nombre_evaluado?.[0] || "") +
      (updatedEvaluador.apellidos_evaluador?.[0] || ""),
    id_usuario: updatedEvaluador.id_usuario,
  };
}

// Eliminar evaluador completo (evaluador + usuario)
export async function deleteEvaluadorCompleto(id) {
  const evaluador = await evaluadorRepo.findEvaluadorById(id);

  if (!evaluador) throw new Error("Evaluador no encontrado");

  // 1️⃣ Eliminar evaluador
  await evaluadorRepo.deleteEvaluador(id);

  // 2️⃣ Eliminar usuario vinculado
  if (evaluador.id_usuario) {
    await usuarioService.deleteUsuario(evaluador.id_usuario);
  }

  return { message: "Evaluador y usuario eliminados" };
}