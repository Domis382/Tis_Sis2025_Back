// controllers/usuarioEval.controller.js
import * as usuarioEvalService from "../services/usuarioEval.services.js";
import { successResponse } from "../utils/response.js";

export async function getAll(req, res, next) {
  try {
    const data = await usuarioEvalService.getAllUsuarios();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = await usuarioEvalService.createUsuario(req.body);
    successResponse(res, data, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await usuarioEvalService.updateUsuario(id, req.body);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await usuarioEvalService.deleteUsuario(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}
