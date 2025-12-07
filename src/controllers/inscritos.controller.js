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
    const filtros = {
      area: req.query.area || "",
      nivel: req.query.nivel || "",
      estado: req.query.estado || "",
      search: req.query.search || "",
      soloSinEvaluador: req.query.soloSinEvaluador || "",
    };

    const user = req.user || null; // por si luego lo necesitas en otros servicios

    const data = await inscritosService.listarInscritos(filtros, user);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inscritos/asignar-evaluador
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

// =================== STATS DASHBOARD ===================
export async function getInscritosStats(req, res, next) {
  try {
    const data = await inscritosService.getInscritosStats();
    res.json({ ok: true, data });
  } catch (e) {
    console.error("Error getInscritosStats:", e);
    next(e);
  }
}