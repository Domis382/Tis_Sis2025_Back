import * as clasificadosService from "../services/clasificados.service.js";

// GET /api/clasificados
export async function getAll(req, res, next) {
  try {
    console.log("📥 GET /api/clasificados - Solicitando todos los clasificados");
    
    const rows = await clasificadosService.getAllClasificados();
    
    console.log(`✅ GET /api/clasificados - Enviando ${rows.length} clasificados`);
    
    return res.json({ 
      ok: true,
      data: rows,
      message: "Clasificados obtenidos correctamente",
      count: rows.length
    });
  } catch (err) {
    console.error("❌ Error en getAll:", err);
    next(err);
  }
}

// POST /api/clasificados/cargar
export async function uploadExcel(req, res, next) {
  try {
    const { rows } = req.body;

    console.log(`📥 POST /api/clasificados/cargar - Recibiendo ${rows?.length || 0} filas`);

    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ 
        ok: false, 
        message: "No se enviaron filas de clasificados." 
      });
    }

    const resultado = await clasificadosService.createOrUpdateClasificados(rows);

    console.log(`✅ POST /api/clasificados/cargar - Procesadas ${resultado.results?.length || 0} filas`);

    // ✅ Asegúrate de enviar la estructura CORRECTA
    return res.json({
      ok: true,
      message: resultado.mensaje || "Clasificados cargados correctamente.",
      data: resultado.results || [],
      count: resultado.results?.length || 0,
      duplicados: resultado.duplicados?.length || 0,
      errores: resultado.errores?.length || 0,
      summary: {
        totalEnviado: rows.length,
        duplicadosOmitidos: resultado.duplicados?.length || 0,
        filasUnicas: rows.length - (resultado.duplicados?.length || 0),
        exitosas: resultado.results?.length || 0,
        errores: resultado.errores?.length || 0
      }
    });
  } catch (err) {
    console.error("❌ Error en uploadExcel:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}