// src/controllers/coordinador.controller.js

import * as coordinadorService from "../services/coordinador.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ======================================
// GET /api/coordinador
// ======================================
export async function getAll(req, res, next) {
  try {
    const data = await coordinadorService.getAllCoordinadores();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

// ======================================
// POST /api/coordinador
// ======================================
export async function create(req, res, next) {
  try {
    const creado = await coordinadorService.createCoordinador(req.body);

    // ocultar pass antes de devolver al front
    const { pass_coordinador, ...safe } = creado;

    successResponse(res, safe, 201);
  } catch (err) {
    next(err);
  }
}

// ======================================
// PUT /api/coordinador/:id
// ======================================
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await coordinadorService.updateCoordinador(id, req.body);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

// ======================================
// DELETE /api/coordinador/:id
// ======================================
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await coordinadorService.deleteCoordinador(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}
