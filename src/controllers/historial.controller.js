// src/controllers/historialController.js
import auditoriaService from '../services/auditoria.service.js';

class HistorialController {
  async obtenerHistorial(req, res, next) {
    try {
      const { id_evaluador, id_fase, fecha_desde, fecha_hasta, busqueda } = req.query;

      const historial = await auditoriaService.obtenerHistorial({
        id_evaluador,
        id_fase,
        fecha_desde,
        fecha_hasta,
        busqueda,
      });

      res.json({ success: true, data: historial });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new HistorialController();
export default controller;
