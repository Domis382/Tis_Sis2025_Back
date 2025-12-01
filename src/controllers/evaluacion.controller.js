// src/controllers/evaluacion.controller.js

import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

/**
 * GET /api/evaluaciones
 * Lista de evaluaciones para la vista del evaluador
 * o para consultas del coordinador si se le pasan filtros en query.
 */
export async function getResultadosClasificatoria(req, res, next) {
  try {
    // Copiamos posibles filtros enviados por query (útil para coordinador)
    const filtros = { ...req.query };

    // Información del usuario autenticado (inyectado por middleware auth)
    const user = req.user || null;

    // 📌 Si es evaluador autenticado, filtramos automáticamente sus evaluaciones
    if (user && user.id_evaluador) {
      filtros.idEvaluador = user.id_evaluador;
    }

    // 📌 Si no mandan idFase, asumimos FASE 1 (Clasificatoria)
    if (!filtros.idFase) {
      filtros.idFase = 1;
    }

    // Obtener datos desde el servicio
    const resultados = await evaluacionService.getResultadosClasificatoria(filtros);

    return successResponse(res, resultados, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/evaluaciones
 * Actualiza notas y observaciones de múltiples evaluaciones.
 */
export async function actualizarNotas(req, res, next) {
  try {
    const filas = req.body; // array que viene del front
    const resultado = await evaluacionService.actualizarNotasEvaluaciones(filas);

    return successResponse(res, resultado, 200);
  } catch (err) {
    console.error("❌ Error en actualizarNotas:", err);
    next(err);
  }
}

/**
 * GET /api/evaluaciones/historial
 * Obtiene historial de cambios (auditoría)
 */
export async function getHistorialEvaluaciones(req, res, next) {
  try {
    const filtros = req.query;
    const historial = await evaluacionService.getHistorialEvaluaciones(filtros);

    return successResponse(res, historial, 200);
  } catch (err) {
    next(err);
  }
}
