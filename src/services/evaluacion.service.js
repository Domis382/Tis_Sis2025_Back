// src/services/evaluacion.service.js
import * as evaluacionRepository from "../repositories/evaluacion.repository.js";

export function getResultadosClasificatoria(filtros = {}) {
  return evaluacionRepository.findResultadosClasificatoria(filtros);
}

export function actualizarNotasEvaluaciones(filas = []) {
  return evaluacionRepository.updateNotasEvaluaciones(filas);
}

export function getHistorialEvaluaciones(filtros = {}) {
  return evaluacionRepository.findHistorialEvaluaciones(filtros);
}
