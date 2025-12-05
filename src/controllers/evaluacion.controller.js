// src/controllers/evaluacion.controller.js
import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse } from "../utils/response.js";

/**
 * GET /api/evaluaciones
 * Obtiene la lista de evaluaciones para la clasificatoria
 */
export async function getResultadosClasificatoria(req, res, next) {
  try {
    const filtros = req.query; // { idFase, idArea, idNivel, idEvaluador, ... }
    const resultados = await evaluacionService.getResultadosClasificatoria(filtros);

    return successResponse(res, resultados, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/evaluaciones/:id
 * Actualiza UNA SOLA evaluación (nota y/o observación)
 * Se usa para guardar en tiempo real cuando el usuario edita una celda
 */
export async function actualizarNotaIndividual(req, res, next) {
  try {
    const { id } = req.params;
    const datos = req.body; // { nota, observacion }
    
    // Obtener info del usuario autenticado (si existe)
    const usuarioInfo = {
      id: req.user?.id_usuario || req.user?.id,
      nombre: req.user?.nombre || "Sistema",
      rol: req.user?.rol || "EVALUADOR"
    };

    const resultado = await evaluacionService.actualizarNotaIndividual(
      id, 
      datos,
      usuarioInfo
    );

    return successResponse(
      res, 
      resultado, 
      200
    );
  } catch (err) {
    console.error("❌ Error en actualizarNotaIndividual:", err);
    next(err);
  }
}

/**
 * PUT /api/evaluaciones
 * Actualiza múltiples evaluaciones en lote
 * Se mantiene para compatibilidad con el botón "Guardar cambios"
 */
export async function actualizarNotas(req, res, next) {
  try {
    const filas = req.body; // array que viene del front
    
    console.log("📥 Datos recibidos para actualizar:", filas);
    
    // Obtener info del usuario autenticado (puede no existir si no hay middleware de auth)
    const usuarioInfo = {
      id: req.user?.id_usuario || req.user?.id || 5, // ID por defecto del usuario demo
      nombre: req.user?.nombre || "Miguel Torres",
      rol: req.user?.rol || "EVALUADOR"
    };

    console.log("👤 Usuario que actualiza:", usuarioInfo);

    const resultado = await evaluacionService.actualizarNotasEvaluaciones(
      filas,
      usuarioInfo
    );

    console.log("✅ Resultado de actualización:", resultado);

    return successResponse(res, resultado, 200);
  } catch (err) {
    console.error("❌ Error en actualizarNotas:", err);
    next(err);
  }
}

/**
 * GET /api/evaluaciones/historial
 * Obtiene el historial de cambios de evaluaciones
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