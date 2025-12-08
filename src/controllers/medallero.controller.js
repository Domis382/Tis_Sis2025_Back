import { publicarMedallero } from "../services/medallero.service.js";
// POST /api/medallero/cargar
export async function cargarMedallero(req, res, next) {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No se enviaron filas de medallero." });
    }

    const { resultados, errores } = await publicarMedallero(rows);
// Asegúrarse de enviar la estructura CORRECTA
    return res.json({
      ok: true,
      message: "Medallero publicado correctamente.",
      total: resultados.length,
      errores, 
    });
  } catch (err) {
    next(err);
  }
}
