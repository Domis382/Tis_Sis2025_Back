// src/services/evaluacion.service.js
import {
  findResultadosClasificatoria,
  updateNotaEvaluacion,
  updateNotasEvaluaciones,
  findHistorialEvaluaciones
} from "../repositories/evaluacion.repository.js";

/**
 * Obtiene los resultados de la clasificatoria con filtros
 */
export function getResultadosClasificatoria(filtros = {}) {
  return findResultadosClasificatoria(filtros);
}

/**
 * Actualiza UNA SOLA evaluación (para guardar en tiempo real)
 */
export function actualizarNotaIndividual(idEvaluacion, datos, usuarioInfo = {}) {
  return updateNotaEvaluacion(idEvaluacion, datos, usuarioInfo);
}

/**
 * Actualiza múltiples evaluaciones en lote
 */
export function actualizarNotasEvaluaciones(filas = [], usuarioInfo = {}) {
  return updateNotasEvaluaciones(filas, usuarioInfo);
}

/**
 * Obtiene el historial de cambios de evaluaciones
 */
export function getHistorialEvaluaciones(filtros = {}) {
  return findHistorialEvaluaciones(filtros);
}