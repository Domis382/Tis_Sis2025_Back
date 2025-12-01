// src/services/evaluacion.service.js
import prisma from "../config/prisma.js";

/**
 * Obtiene los resultados de la fase clasificatoria
 * en el formato que necesita el frontend.
 */
export async function getResultadosClasificatoria(filters = {}) {
  const { idFase, idArea, idNivel, idEvaluador } = filters;

  // Filtros a nivel de inscritos (área / nivel)
  const whereInscrito = {};
  if (idArea) whereInscrito.id_area = BigInt(idArea);
  if (idNivel) whereInscrito.id_nivel = BigInt(idNivel);

  // Filtros dentro de evaluaciones (fase / evaluador)
  const whereEval = {};
  if (idFase) whereEval.id_fase = BigInt(idFase);
  if (idEvaluador) whereEval.id_evaluador = BigInt(idEvaluador);

  const resultados = await prisma.inscritos.findMany({
    where: Object.keys(whereInscrito).length ? whereInscrito : undefined,
    select: {
      id_inscritos: true,
      nombres_inscrito: true,
      apellidos_inscrito: true,
      clasificados: {
        select: {
          estado: true,
        },
      },
      evaluaciones: {
        where: Object.keys(whereEval).length ? whereEval : undefined,
        select: {
          id_evaluacion: true,
          observacion: true,
          nota: true,
        },
        orderBy: { id_evaluacion: "asc" },
      },
    },
    orderBy: { id_inscritos: "asc" },
  });

  const filas = resultados
    .map((r) => {
      const fullName = `${r.nombres_inscrito} ${r.apellidos_inscrito}`.trim();
      const primeraEval = r.evaluaciones[0] ?? null;

      // 👉 Si estamos filtrando por evaluador y este inscrito
      // no tiene evaluación para ese evaluador/fase, LO EXCLUIMOS
      if (idEvaluador && !primeraEval) {
        return null;
      }

      const notaBruta = primeraEval?.nota ?? null;
      const nota =
        notaBruta === null || notaBruta === undefined
          ? ""
          : Number(notaBruta);

      const estado =
        notaBruta === null || notaBruta === undefined
          ? "Pendiente"
          : "Calificado";

      const estadoClasificacion = r.clasificados[0]?.estado || null;

      return {
        // Para el evaluador SIEMPRE usamos el id de la evaluación
        id: primeraEval?.id_evaluacion ?? r.id_inscritos,
        competidor: fullName,
        nota,
        observacion: primeraEval?.observacion || "",
        estado,
        estadoClasificacion,
      };
    })
    .filter((fila) => fila !== null);

  return filas;
}

/**
 * Actualiza notas de evaluaciones + registra en auditoría.
 */
export async function actualizarNotasEvaluaciones(filas = []) {
  if (!Array.isArray(filas) || filas.length === 0) {
    return { updated: 0 };
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedCount = 0;

    for (const fila of filas) {
      if (fila.id === undefined || fila.id === null || fila.id === "") continue;

      const parsedId = parseInt(fila.id, 10);
      if (!Number.isFinite(parsedId)) {
        continue;
      }

      const idEval = BigInt(parsedId);

      const actual = await tx.evaluaciones.findUnique({
        where: { id_evaluacion: idEval },
      });

      if (!actual) continue;

      const notaAnterior = actual.nota;
      const observacionAnterior = actual.observacion ?? "";

      let notaNueva = null;
      if (
        fila.nota !== "" &&
        fila.nota !== null &&
        fila.nota !== undefined
      ) {
        notaNueva = fila.nota.toString();
      }

      const observacionNueva = fila.observacion ?? null;

      const mismaNota =
        (notaAnterior === null && notaNueva === null) ||
        (notaAnterior !== null &&
          notaNueva !== null &&
          notaAnterior.toString() === notaNueva.toString());

      const mismaObs = observacionAnterior === (observacionNueva ?? "");

      if (mismaNota && mismaObs) {
        continue;
      }

      await tx.evaluaciones.update({
        where: { id_evaluacion: idEval },
        data: {
          nota: notaNueva,
          observacion: observacionNueva,
        },
      });

      await tx.auditoria.create({
        data: {
          actor_tipo: "SISTEMA",
          actor_nombre_snapshot: "Sistema",
          accion: "ACTUALIZAR_NOTA",
          entidad: "EVALUACIONES",
          id_entidad: idEval,
          valor_anterior: notaAnterior?.toString() ?? null,
          valor_nuevo: notaNueva ?? null,
        },
      });

      updatedCount++;
    }

    return { updated: updatedCount };
  });

  return result;
}

/**
 * Historial de cambios de notas (desde auditoría).
 */
export async function getHistorialEvaluaciones(filters = {}) {
  const auditorias = await prisma.auditoria.findMany({
    where: {
      entidad: "EVALUACIONES",
    },
    orderBy: { fecha_hora: "desc" },
    take: 100,
  });

  if (auditorias.length === 0) {
    return [];
  }

  const idsEval = [
    ...new Set(
      auditorias
        .map((a) => a.id_entidad)
        .filter((id) => id !== null && id !== undefined)
    ),
  ];

  const evaluaciones = await prisma.evaluaciones.findMany({
    where: {
      id_evaluacion: {
        in: idsEval,
      },
    },
    include: {
      inscritos: true,
    },
  });

  const mapaEval = new Map();
  evaluaciones.forEach((e) => {
    const competidor = e.inscritos
      ? `${e.inscritos.nombres_inscrito} ${e.inscritos.apellidos_inscrito}`.trim()
      : "";
    mapaEval.set(e.id_evaluacion.toString(), competidor);
  });

  return auditorias.map((a) => {
    const idEvalStr = a.id_entidad ? a.id_entidad.toString() : "";
    const competidor = idEvalStr ? mapaEval.get(idEvalStr) || "" : "";

    return {
      id: a.id_auditoria,
      competidor,
      notaAnterior: a.valor_anterior ?? "",
      notaNueva: a.valor_nuevo ?? "",
      fecha: a.fecha_hora.toISOString().slice(0, 10),
      usuario: a.actor_nombre_snapshot ?? "",
    };
  });
}
