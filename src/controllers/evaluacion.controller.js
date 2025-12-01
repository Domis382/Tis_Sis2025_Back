// src/controllers/evaluacion.controller.js
import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

export async function getResultadosClasificatoria(req, res, next) {
  try {
    const filtros = { ...req.query };

    const user = req.user || null;
    console.log("👤 req.user en /evaluaciones:", user);

    if (user && user.id_evaluador) {
      filtros.idEvaluador = user.id_evaluador;
    }

    if (!filtros.idFase) {
      filtros.idFase = 1;
    }

    console.log("🔎 Filtros enviados al servicio:", filtros);

    const resultados =
      await evaluacionService.getResultadosClasificatoria(filtros);

    return successResponse(res, resultados, 200);
  } catch (err) {
    console.error("❌ Error en getResultadosClasificatoria:", err);
    next(err);   // 👈 ya no devolvemos el stack al front
  }
}

export async function actualizarNotas(req, res, next) {
  try {
    const filas = req.body;
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
