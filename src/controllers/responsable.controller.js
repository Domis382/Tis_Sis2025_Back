//agrege esto para las tablas admin
import * as responsableService from '../services/responsable.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const data = await responsableService.getAllResponsables();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = await responsableService.createResponsable(req.body);
    successResponse(res, data, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await responsableService.updateResponsable(id, req.body);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await responsableService.deleteResponsable(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}
