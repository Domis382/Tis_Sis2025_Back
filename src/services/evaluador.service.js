//se creo ara la tabla de evaluadores en admin 
import * as evaluadorRepo from '../repositories/evaluador.repository.js';

// Mapear DB → front (el front espera el mismo shape que responsablesTable usa)
export async function getAllEvaluadores() {
  const rows = await evaluadorRepo.findAllEvaluadores();

  return rows.map(e => ({
    id: e.id_evaluador,
    nombres: e.nombre_evaluado,
    apellidos: e.apellidos_evaluador,
    rol: "EVALUADOR",
    area: e.area?.nombre_area ?? "",
    correo: "",          // tu modelo evaluador no tiene correo aún
    estado: true,        // asumimos activo
    telefono: "",        // no está en DB todavía
    nombreUsuario: (e.nombre_evaluado?.[0] || "") + (e.apellidos_evaluador?.[0] || ""),
  }));
}

export async function createEvaluador(data) {
  const created = await evaluadorRepo.createEvaluador(data);

  return {
    id: created.id_evaluador,
    nombres: created.nombre_evaluado,
    apellidos: created.apellidos_evaluador,
    rol: "EVALUADOR",
    area: created.area?.nombre_area ?? "",
    correo: "",
    estado: true,
    telefono: "",
    nombreUsuario:
      (created.nombre_evaluado?.[0] || "") +
      (created.apellidos_evaluador?.[0] || ""),
  };
}

export async function updateEvaluador(id, data) {
  const updated = await evaluadorRepo.updateEvaluador(id, data);

  return {
    id: updated.id_evaluador,
    nombres: updated.nombre_evaluado,
    apellidos: updated.apellidos_evaluador,
    rol: "EVALUADOR",
    area: updated.area?.nombre_area ?? "",
    correo: "",
    estado: true,
    telefono: "",
    nombreUsuario:
      (updated.nombre_evaluado?.[0] || "") +
      (updated.apellidos_evaluador?.[0] || ""),
  };
}

export async function deleteEvaluador(id) {
  await evaluadorRepo.deleteEvaluador(id);
  return { message: "Evaluador eliminado" };
}
