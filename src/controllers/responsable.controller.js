//Importa todos los métodos definidos en el servicio de "responsables".
import * as responsableService from '../services/responsable.service.js';
//Importa funciones utilitarias para responder al cliente con un formato uniforme
import { successResponse, errorResponse } from '../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const data = await responsableService.getAllResponsables(); // Llama al servicio que devuelve la lista completa de responsables desde la BD
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

// Usa el servicio para crear un nuevo responsable con los datos recibidos en el body
export async function create(req, res, next) {
  try {
    const creado = await responsableService.createResponsable(req.body);
    successResponse(res, creado, 201);
  } catch (err) {
    next(err);
  }
}

// Extrae el ID del responsable desde los parámetros de la URL
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await responsableService.updateResponsable(id, req.body);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}
//Elimina un responsable según el ID proporcionado en los parámetros de la URL
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await responsableService.deleteResponsable(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}
