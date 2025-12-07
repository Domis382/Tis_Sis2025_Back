// src/controllers/fases.controller.js
import * as fasesService from '../services/fases.service.js';

// GET /api/fases/clasificacion
export async function getParametroClasificacion(req, res, next) {
  try {
    const fase = await fasesService.getParametrosClasificacion();

    if (!fase) {
      return res.status(404).json({
        message: 'No se encontró la fase CLASIFICATORIA.',
      });
    }

    res.json({
      nota_minima: fase.nota_minima,
      fase_final: fase.fase_final,
      id_fases: fase.id_fases,
      nombre_fase: fase.nombre_fase,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/fases/clasificacion
export async function updateParametroClasificacion(req, res, next) {
  try {
    const { nota_minima } = req.body;

    if (nota_minima === undefined) {
      return res.status(400).json({
        message: 'El campo nota_minima es obligatorio.',
      });
    }

    const faseActualizada = await fasesService.setNotaMinimaClasificacion(
      nota_minima
    );

    res.json({
      message: 'Parámetro de clasificación actualizado correctamente.',
      nota_minima: faseActualizada.nota_minima,
    });
  } catch (err) {
    // Si el service tiró un Error de validación, respondemos 400
    if (err.message?.includes('nota mínima')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

export async function eliminarClasificadosController(req, res) {
  try {
    const { ids } = req.body; // array de IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs." });
    }

    const cantidad = await fasesService.eliminarClasificadosPorIds(ids);

    res.json({ message: `${cantidad} clasificados eliminados.` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudieron eliminar los clasificados." });
  }
}