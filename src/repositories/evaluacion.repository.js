// src/controllers/evaluacion.repository.js
import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

/**
 * Lista de resultados para la fase clasificatoria
 */
export async function findResultadosClasificatoria(filters = {}) {
  try {
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

    return resultados.map((r) => {
      const fullName = `${r.nombres_inscrito} ${r.apellidos_inscrito}`.trim();
      const primeraEval = r.evaluaciones[0] ?? null;

      const notaBruta = primeraEval?.nota ?? null;
      const nota = notaBruta === null || notaBruta === undefined ? "" : Number(notaBruta);

      const estado = notaBruta === null || notaBruta === undefined ? "Pendiente" : "Calificado";
      const estadoClasificacion = r.clasificados[0]?.estado || null;

      return {
        id: primeraEval?.id_evaluacion ? Number(primeraEval.id_evaluacion) : Number(r.id_inscritos),
        id_inscrito: Number(r.id_inscritos),
        id_evaluacion: primeraEval?.id_evaluacion ? Number(primeraEval.id_evaluacion) : null,
        competidor: fullName,
        nota,
        observacion: primeraEval?.observacion || "",
        estado,
        estadoClasificacion,
      };
    });
  } catch (error) {
    console.error("❌ Error en findResultadosClasificatoria:", error);
    throw error;
  }
}

/**
 * Actualiza UNA SOLA evaluación
 */
export async function updateNotaEvaluacion(idEvaluacion, datos, usuarioInfo = {}) {
  try {
    const idEval = BigInt(idEvaluacion);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener el registro actual
      const actual = await tx.evaluaciones.findUnique({
        where: { id_evaluacion: idEval },
        include: {
          inscritos: {
            select: {
              nombres_inscrito: true,
              apellidos_inscrito: true,
            }
          }
        }
      });

      if (!actual) {
        throw new Error(`Evaluación con ID ${idEvaluacion} no encontrada`);
      }

      // 2. Preparar valores
      const notaAnterior = actual.nota;
      const observacionAnterior = actual.observacion ?? "";

      let notaNueva = null;
      if (datos.nota !== "" && datos.nota !== null && datos.nota !== undefined) {
        const notaNum = parseFloat(datos.nota);
        if (!isNaN(notaNum)) {
          notaNueva = notaNum;
        }
      }

      const observacionNueva = datos.observacion !== undefined ? datos.observacion : observacionAnterior;

      // 3. Verificar cambios
      const mismaNota =
        (notaAnterior === null && notaNueva === null) ||
        (notaAnterior !== null && notaNueva !== null && parseFloat(notaAnterior) === parseFloat(notaNueva));

      const mismaObs = observacionAnterior === (observacionNueva ?? "");

      if (mismaNota && mismaObs) {
        return { 
          updated: false, 
          message: "No hay cambios para guardar",
          evaluacion: actual 
        };
      }

      // 4. Actualizar
      const evaluacionActualizada = await tx.evaluaciones.update({
        where: { id_evaluacion: idEval },
        data: {
          nota: notaNueva,
          observacion: observacionNueva,
          fecha: new Date(),
        },
      });

      // 5. Auditoría
      const competidorNombre = actual.inscritos 
        ? `${actual.inscritos.nombres_inscrito} ${actual.inscritos.apellidos_inscrito}`.trim()
        : "Desconocido";

      await tx.auditoria.create({
        data: {
          actor_tipo: "EVALUADOR",
          id_actor: usuarioInfo.id ? BigInt(usuarioInfo.id) : null,
          actor_nombre_snapshot: usuarioInfo.nombre || "Sistema",
          accion: "ACTUALIZAR_EVALUACION",
          entidad: "EVALUACIONES",
          id_entidad: idEval,
          valor_anterior: JSON.stringify({
            nota: notaAnterior ? notaAnterior.toString() : null,
            observacion: observacionAnterior
          }),
          valor_nuevo: JSON.stringify({
            nota: notaNueva ? notaNueva.toString() : null,
            observacion: observacionNueva ?? ""
          }),
          resultado: "OK",
        },
      });

      return { 
        updated: true, 
        message: "Evaluación actualizada correctamente",
        evaluacion: {
          ...evaluacionActualizada,
          id_evaluacion: Number(evaluacionActualizada.id_evaluacion)
        },
        competidor: competidorNombre
      };
    }, {
      maxWait: 10000, // Espera máxima: 10 segundos
      timeout: 20000,  // Timeout total: 20 segundos
    });

    return result;
  } catch (error) {
    console.error("❌ Error en updateNotaEvaluacion:", error);
    throw error;
  }
}

/**
 * Actualiza múltiples evaluaciones en lote
 */
export async function updateNotasEvaluaciones(filas = [], usuarioInfo = {}) {
  try {
    if (!Array.isArray(filas) || filas.length === 0) {
      return { updated: 0, message: "No hay datos para actualizar" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedCount = 0;
      const errores = [];

      for (const fila of filas) {
        // Validar que tenga id_evaluacion
        const evalId = fila.id_evaluacion || fila.id;
        
        if (!evalId) {
          console.warn("⚠️ Fila sin id_evaluacion:", fila);
          continue;
        }

        const parsedId = parseInt(evalId, 10);
        if (!Number.isFinite(parsedId)) {
          errores.push(`ID inválido: ${evalId}`);
          continue;
        }

        const idEval = BigInt(parsedId);

        try {
          const actual = await tx.evaluaciones.findUnique({
            where: { id_evaluacion: idEval },
            include: {
              inscritos: {
                select: {
                  nombres_inscrito: true,
                  apellidos_inscrito: true,
                }
              }
            }
          });

          if (!actual) {
            errores.push(`Evaluación ${parsedId} no encontrada`);
            continue;
          }

          const notaAnterior = actual.nota;
          const observacionAnterior = actual.observacion ?? "";

          let notaNueva = null;
          if (fila.nota !== "" && fila.nota !== null && fila.nota !== undefined) {
            const notaNum = parseFloat(fila.nota);
            if (!isNaN(notaNum)) {
              notaNueva = notaNum;
            }
          }

          const observacionNueva = fila.observacion !== undefined ? fila.observacion : observacionAnterior;

          const mismaNota =
            (notaAnterior === null && notaNueva === null) ||
            (notaAnterior !== null && notaNueva !== null && parseFloat(notaAnterior) === parseFloat(notaNueva));

          const mismaObs = observacionAnterior === (observacionNueva ?? "");

          if (mismaNota && mismaObs) {
            continue;
          }

          await tx.evaluaciones.update({
            where: { id_evaluacion: idEval },
            data: {
              nota: notaNueva,
              observacion: observacionNueva,
              fecha: new Date(),
            },
          });

          const competidorNombre = actual.inscritos 
            ? `${actual.inscritos.nombres_inscrito} ${actual.inscritos.apellidos_inscrito}`.trim()
            : "Desconocido";

          await tx.auditoria.create({
            data: {
              actor_tipo: "EVALUADOR",
              id_actor: usuarioInfo.id ? BigInt(usuarioInfo.id) : null,
              actor_nombre_snapshot: usuarioInfo.nombre || "Sistema",
              accion: "ACTUALIZAR_EVALUACION",
              entidad: "EVALUACIONES",
              id_entidad: idEval,
              valor_anterior: JSON.stringify({
                nota: notaAnterior ? notaAnterior.toString() : null,
                observacion: observacionAnterior
              }),
              valor_nuevo: JSON.stringify({
                nota: notaNueva ? notaNueva.toString() : null,
                observacion: observacionNueva ?? ""
              }),
              resultado: "OK",
            },
          });

          updatedCount++;
        } catch (error) {
          errores.push(`Error en evaluación ${parsedId}: ${error.message}`);
        }
      }

      return { 
        updated: updatedCount,
        errores: errores.length > 0 ? errores : null,
        message: `${updatedCount} evaluación(es) actualizada(s)`
      };
    }, {
      maxWait: 30000, // Espera máxima: 30 segundos
      timeout: 60000,  // Timeout total: 60 segundos
    });

    return result;
  } catch (error) {
    console.error("❌ Error en updateNotasEvaluaciones:", error);
    throw error;
  }
}

/**
 * Historial de cambios
 */
export async function findHistorialEvaluaciones(filters = {}) {
  try {
    const whereClause = {
      entidad: "EVALUACIONES",
      accion: "ACTUALIZAR_EVALUACION",
    };

    if (filters.idEvaluador) {
      whereClause.id_actor = BigInt(filters.idEvaluador);
    }

    const auditorias = await prisma.auditoria.findMany({
      where: whereClause,
      orderBy: { fecha_hora: "desc" },
      take: 200,
    });

    if (auditorias.length === 0) {
      return [];
    }

    const idsEval = [...new Set(auditorias.map((a) => a.id_entidad).filter((id) => id !== null))];

    const evaluaciones = await prisma.evaluaciones.findMany({
      where: { id_evaluacion: { in: idsEval } },
      include: { inscritos: true },
    });

    const mapaEval = new Map();
    evaluaciones.forEach((e) => {
      const competidor = e.inscritos
        ? `${e.inscritos.nombres_inscrito} ${e.inscritos.apellidos_inscrito}`.trim()
        : "Desconocido";
      mapaEval.set(e.id_evaluacion.toString(), competidor);
    });

    return auditorias.map((a) => {
      const idEvalStr = a.id_entidad ? a.id_entidad.toString() : "";
      const competidor = idEvalStr ? mapaEval.get(idEvalStr) || "Desconocido" : "";

      let notaAnterior = "";
      let notaNueva = "";

      try {
        const anterior = JSON.parse(a.valor_anterior || "{}");
        const nuevo = JSON.parse(a.valor_nuevo || "{}");
        notaAnterior = anterior.nota || "";
        notaNueva = nuevo.nota || "";
      } catch {
        notaAnterior = a.valor_anterior ?? "";
        notaNueva = a.valor_nuevo ?? "";
      }

      return {
        id: Number(a.id_auditoria),
        competidor,
        notaAnterior,
        notaNueva,
        fecha: a.fecha_hora.toISOString().slice(0, 10),
        hora: a.fecha_hora.toISOString().slice(11, 19),
        usuario: a.actor_nombre_snapshot ?? "Sistema",
      };
    });
  } catch (error) {
    console.error("❌ Error en findHistorialEvaluaciones:", error);
    throw error;
  }
}
