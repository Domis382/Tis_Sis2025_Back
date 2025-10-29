//agrege esto para tablas de admin
import * as responsableRepo from '../repositories/responsable.repository.js';

export async function getAllResponsables() {
  const rows = await responsableRepo.findAllResponsables();

  // Mapear datos DB → formato que usa tu tabla en el front
  return rows.map(r => ({
    id: r.id_responsable,
    nombres: r.nombres_evaluador,
    apellidos: r.apellidos,
    rol: "RESPONSABLE",
    area: r.area?.nombre_area ?? "",
    correo: r.correo_electronico,
    // campos que el front espera aunque no estén en DB aún
    estado: true,
    telefono: "",
    nombreUsuario: r.usuario_responsable,
  }));
}

export async function createResponsable(data) {
  const created = await responsableRepo.createResponsable(data);
  return {
    id: created.id_responsable,
    nombres: created.nombres_evaluador,
    apellidos: created.apellidos,
    rol: "RESPONSABLE",
    area: created.area?.nombre_area ?? "",
    correo: created.correo_electronico,
    estado: true,
    telefono: "",
    nombreUsuario: created.usuario_responsable,
  };
}

export async function updateResponsable(id, data) {
  const updated = await responsableRepo.updateResponsable(id, data);
  return {
    id: updated.id_responsable,
    nombres: updated.nombres_evaluador,
    apellidos: updated.apellidos,
    rol: "RESPONSABLE",
    area: updated.area?.nombre_area ?? "",
    correo: updated.correo_electronico,
    estado: true,
    telefono: "",
    nombreUsuario: updated.usuario_responsable,
  };
}

export async function deleteResponsable(id) {
  await responsableRepo.deleteResponsable(id);
  return { message: "Responsable eliminado" };
}
