// src/services/evaluacion.service.js
import * as repo from "../repositories/evaluacion.repository.js";
import * as clasRepo from "../repositories/clasificados.repository.js";

/**
 * Si el usuario es EVALUADOR → retorna su id_evaluador (num).
 * Otros roles → null (no se filtra por evaluador).
 */
export async function resolveIdEvaluadorByUsuario({ rol, id_usuario }) {
  const isEvaluador = (rol ?? "").toString().includes("EVALUADOR");
  if (!isEvaluador) return null;

  const ev = await repo.findEvaluadorByUsuario(id_usuario);
  if (!ev) throw new Error("No tiene perfil de evaluador");
  return Number(ev.id_evaluador);
}

/** Búsqueda principal para la grilla del evaluador/coordinador */
export async function findResultadosClasificatoria(params) {
  return repo.findResultadosClasificatoria(params);
}

/** Historial de cambios (si existe tabla de auditoría) */
export async function getHistorialEvaluaciones(params) {
  return repo.getHistorialEvaluaciones(params);
}

/** Guardado en lote con validación de propiedad si es EVALUADOR */
export async function actualizarNotasBatch({ idEvaluador, cambios, usuarioInfo }) {
  if (idEvaluador) {
    const ids = cambios.map((c) => Number(c.id_evaluacion)).filter(Boolean);
    const count = await repo.countEvaluacionesPropias({ idEvaluador, ids });
    if (count !== ids.length) {
      const err = new Error("Intento de modificar evaluaciones ajenas");
      err.status = 403;
      throw err;
    }
  }
  return repo.updateNotasBatch({ cambios, usuarioInfo });
}

/** Guardado individual con validación de propiedad si es EVALUADOR */
export async function actualizarNotaIndividual({ idEvaluador, id_evaluacion, datos, usuarioInfo }) {
  if (idEvaluador) {
    const esPropia = await repo.isEvaluacionPropia({ idEvaluador, id_evaluacion });
    if (!esPropia) {
      const err = new Error("Intento de modificar evaluación ajena");
      err.status = 403;
      throw err;
    }
  }
  return repo.updateNotaIndividual({ id_evaluacion, datos, usuarioInfo });
}

/**
 * NUEVO: obtener un nombre mostrable para “Usuario” (Historial).
 * Prioridad: nombre+apellidos → username → email → “Evaluador #<id>”.
 */
export async function resolveNombreDisplay({ id_usuario, idEvaluador }) {
  try {
    return await repo.resolveNombreDisplay({ id_usuario, idEvaluador });
  } catch {
    return idEvaluador ? `Evaluador #${idEvaluador}` : null;
  }
}

export async function findResultadosFinal({ idNivel = null, search = null }) {
  // 1) traer clasificados con datos del inscrito
  const rows = await clasRepo.findAllClasificados(); // ya hace JOIN con inscritos

  // 2) filtros de nivel / búsqueda (si vienen)
  const filtra = (txt) => (txt ?? "").toString().toUpperCase();
  const s = filtra(search);

  const filtrados = rows
    .filter(r => (idNivel ? Number(r.id_nivel) === Number(idNivel) : true))
    .filter(r => {
      if (!search) return true;
      const cad = `${r.nombres_inscrito} ${r.apellidos_inscrito} ${r.ci_inscrito}`.toUpperCase();
      return cad.includes(s);
    })
    .map(r => ({
      id_inscrito: r.id_inscrito,
      competidor: `${r.nombres_inscrito ?? ""} ${r.apellidos_inscrito ?? ""}`.trim(),
      ci: r.ci_inscrito ?? "",
      // En FINAL, puedes traer nota u observación de una tabla evaluacion final si la tienes:
      nota: r.nota ?? null,
      observacion: r.observacion ?? null
    }));

  return filtrados;
}