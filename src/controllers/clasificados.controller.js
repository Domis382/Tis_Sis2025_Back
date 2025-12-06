// src/controllers/clasificados.controller.js
import * as clasificadosService from "../services/clasificados.service.js";

// POST /api/clasificados/cargar
export async function uploadExcel(req, res, next) {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || !rows.length) {
      return res
        .status(400)
        .json({ ok: false, message: "No se enviaron filas de clasificados." });
    }

    const data = await clasificadosService.createOrUpdateClasificados(rows);

    return res.json({
      ok: true,
      message: "Clasificados cargados correctamente.",
      data,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/clasificados
export async function getAll(req, res, next) {
  try {
    const rows = await clasificadosService.getAllClasificados();
    // El front ya está preparado para recibir array directo o {data:...}
    return res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}
