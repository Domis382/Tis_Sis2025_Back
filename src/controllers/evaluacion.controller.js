// src/controllers/evaluacion.controller.js
import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

export async function getResultadosClasificatoria(req, res, next) {
  try {
    const filtros = req.query; // { idFase, idArea, idNivel, idEvaluador, ... }
    const resultados = await evaluacionService.getResultadosClasificatoria(filtros);

    // successResponse(res, data, status)
    return successResponse(res, resultados, 200);
  } catch (err) {
    next(err);
  }
}

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

export async function getHistorialEvaluaciones(req, res, next) {
  try {
    const filtros = req.query;
    const historial = await evaluacionService.getHistorialEvaluaciones(filtros);

    return successResponse(res, historial, 200);
  } catch (err) {
    next(err);
  }
}
