//se creo para la tabla de evaluador en tabla de admin
import * as evaluadorService from '../services/evaluador.service.js';
import { successResponse } from '../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const data = await evaluadorService.getAllEvaluadores();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = await evaluadorService.createEvaluadorCompleto(req.body);
    successResponse(res, data, 201);
  } catch (err) {
    next(err);
  }
}

/* 
export async function create(req, res, next) {
  try {
    const data = await evaluadorService.createEvaluador(req.body);
    successResponse(res, data, 201);
  } catch (err) {
    next(err);
  }
} */

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await evaluadorService.updateEvaluadorCompleto(id, req.body);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await evaluadorService.deleteEvaluadorCompleto(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listarEvaluadores(req, res, next) {
  try {
    const user = req.user; // coordinador autenticado
    const filtros = {
      idArea: user?.id_area || null,
    };

    const data = await evaluadorService.listarEvaluadores(filtros);
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}