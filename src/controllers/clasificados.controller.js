import * as clasificadosService from "../services/clasificados.service.js";
import { successResponse } from "../utils/response.js";

export async function uploadExcel(req, res, next) {
  try {
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ ok: false, message: "Formato inválido" });
    }

    const data = await clasificadosService.createOrUpdateClasificados(rows);

    successResponse(res, data, 201);
  } catch (err) {
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    const data = await clasificadosService.getAllClasificados();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}
