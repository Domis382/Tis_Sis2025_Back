//Controladores que manejan la lógica HTTP.

import * as areaService from '../services/area.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getAllAreas(req, res, next) {
  try {
    const areas = await areaService.getAllAreas();
    successResponse(res, areas);
  } catch (err) {
    next(err);
  }
}

export async function getAreaById(req, res, next) {
  try {
    const area = await areaService.getAreaById(parseInt(req.params.id));
    if (!area) return errorResponse(res, 'Área no encontrada', 404);
    successResponse(res, area);
  } catch (err) {
    next(err);
  }
}

export async function createArea(req, res, next) {
  try {
    const area = await areaService.createArea(req.body);
    successResponse(res, area, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateArea(req, res, next) {
  try {
    const area = await areaService.updateArea(parseInt(req.params.id), req.body);
    successResponse(res, area);
  } catch (err) {
    next(err);
  }
}

export async function deleteArea(req, res, next) {
  try {
    await areaService.deleteArea(parseInt(req.params.id));
    successResponse(res, { message: 'Área eliminada correctamente' });
  } catch (err) {
    next(err);
  }
}
