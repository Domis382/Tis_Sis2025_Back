// src/controllers/evaluacion.controller.js
import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

export async function getResultadosClasificatoria(req, res, next) {
  try {
    // Empezamos con los filtros que vengan por query
    const filtros = { ...req.query };

    // Usuario autenticado (inyectado por authMiddleware)
    const user = req.user || null;
    console.log("req.user en /evaluaciones:", user);

    // Si es evaluador y tenemos su id_evaluador en el token, lo usamos
    if (user && user.id_evaluador) {
      filtros.idEvaluador = user.id_evaluador;
    }

    // Si no se envía idFase, asumimos fase 1 (ajusta si usas otra)
    if (!filtros.idFase) {
      filtros.idFase = 1;
    }

    console.log("Filtros enviados al servicio:", filtros);

    const resultados =
      await evaluacionService.getResultadosClasificatoria(filtros);

    return successResponse(res, resultados, 200);
  } catch (err) {
    next(err);
  }
}

export async function actualizarNotas(req, res, next) {
  try {
    const filas = req.body; // array que viene del front
    const resultado =
      await evaluacionService.actualizarNotasEvaluaciones(filas);

    return successResponse(res, resultado, 200);
  } catch (err) {
    console.error(" Error en actualizarNotas:", err);
    next(err);
  }
}

export async function getHistorialEvaluaciones(req, res, next) {
  try {
    const filtros = req.query;
    const historial =
      await evaluacionService.getHistorialEvaluaciones(filtros);

    return successResponse(res, historial, 200);
  } catch (err) {
    next(err);
  }
}
