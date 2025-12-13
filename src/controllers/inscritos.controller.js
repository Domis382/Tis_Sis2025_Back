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
// PATCH/POST: asignar inscritos a evaluador (acepta idFase, useFaseFinal, replaceExisting, exclusive)
export async function asignarInscritosAEvaluador(req, res, next) {
  try {
    const { idEvaluador, idsInscritos, idFase, useFaseFinal, replaceExisting, exclusive } = req.body;
    const user = req.user || null;

    const result = await inscritosService.asignarInscritosAEvaluador(
      idEvaluador,
      idsInscritos,
      user,
      idFase ?? null,
      Boolean(useFaseFinal),
      Boolean(replaceExisting),
      Boolean(exclusive) // 👈 NUEVO
    );

    return res.json({ ok: true, data: result });
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

export async function pruneToFinalistas(req, res, next) {
  try {
    const { mode } = req.query; // 'delete' | 'soft' (default: 'soft')
    const result = await inscritosService.pruneToFinalistas({ hardDelete: mode === "delete" });
    return res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}
