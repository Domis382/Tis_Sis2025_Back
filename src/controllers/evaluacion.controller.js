// src/controllers/evaluacionController.js
import evaluacionService from '../services/evaluacion.service.jss';

class EvaluacionController {
  async listarClasificatoria(req, res, next) {
    try {
      const { id_evaluador, id_fase, id_area, id_nivel, busqueda } = req.query;

      if (!id_evaluador || !id_fase) {
        return res.status(400).json({
          success: false,
          error: 'id_evaluador e id_fase son requeridos',
        });
      }

      const evaluaciones = await evaluacionService.listarEvaluaciones({
        id_evaluador,
        id_fase,
        id_area,
        id_nivel,
        busqueda,
      });

      res.json({ success: true, data: evaluaciones });
    } catch (error) {
      next(error);
    }
  }

  async obtenerMetricas(req, res, next) {
    try {
      const { id_evaluador, id_fase } = req.query;

      if (!id_evaluador || !id_fase) {
        return res.status(400).json({
          success: false,
          error: 'id_evaluador e id_fase son requeridos',
        });
      }

      const metricas = await evaluacionService.calcularMetricas(id_evaluador, id_fase);
      res.json({ success: true, data: metricas });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { id_evaluador } = req.query;
      const datos = req.body;

      if (!id_evaluador) {
        return res.status(400).json({
          success: false,
          error: 'id_evaluador es requerido',
        });
      }

      const evaluacion = await evaluacionService.actualizarEvaluacion(id, datos, id_evaluador);
      res.json({ success: true, data: evaluacion, message: 'Evaluación actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async guardarLote(req, res, next) {
    try {
      const { evaluaciones } = req.body;
      const { id_evaluador } = req.query;

      if (!id_evaluador) {
        return res.status(400).json({
          success: false,
          error: 'id_evaluador es requerido',
        });
      }

      if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de evaluaciones',
        });
      }

      const { resultados, errores } = await evaluacionService.guardarLote(evaluaciones, id_evaluador);

      res.json({
        success: true,
        data: resultados,
        message: `${resultados.length} evaluaciones guardadas exitosamente`,
        ...(errores.length > 0 && { errores }),
      });
    } catch (error) {
      next(error);
    }
  }
}

const controller = new EvaluacionController();
export default controller;
