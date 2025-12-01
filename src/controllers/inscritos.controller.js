// src/controllers/inscritos.controller.js

import * as inscritosService from "../services/inscritos.service.js";
import { successResponse } from "../utils/response.js";

/**
 * GET /api/inscritos
 * Query params:
 *  - area
 *  - nivel
 *  - estado
 *  - search
 *  - soloSinEvaluador = "1" | "true"
 */
export async function listarInscritos(req, res, next) {
  try {
    const filtros = req.query;
    const user = req.user || null; // viene de requireRole

    const data = await inscritosService.listarInscritos(filtros, user);
    return successResponse(res, data, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inscritos/asignar-evaluador
 * Body:
 *  {
 *    idEvaluador: number,
 *    idsInscritos: number[]
 *  }
 */
export async function asignarInscritosAEvaluador(req, res, next) {
  try {
    const { idEvaluador, idsInscritos } = req.body;
    const user = req.user || null;

    const resultado = await inscritosService.asignarInscritosAEvaluador(
      idEvaluador,
      idsInscritos,
      user
    );

    return successResponse(res, resultado, 200);
  } catch (err) {
    next(err);
  }
}
