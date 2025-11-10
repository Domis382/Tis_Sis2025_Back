import * as evaluacionService from "../services/evaluacion.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getResultadosClasificatoria(req, res, next) {
  try {
    const resultados = await evaluacionService.getResultadosClasificatoria();
    successResponse(res, resultados);
  } catch (err) {
    next(err);
  }
}
