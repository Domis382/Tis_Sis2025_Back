// src/services/evaluacionService.js
import prisma from '../config/prisma.js';
import auditoriaService from './auditoria.service.js';

class EvaluacionService {
  async listarEvaluaciones(filtros) {
    const { id_evaluador, id_fase, id_area, id_nivel, busqueda } = filtros;

    const where = {
      id_evaluador: BigInt(id_evaluador),
      id_fase: BigInt(id_fase),
    };

    const inscritoWhere = {};
    if (id_area) inscritoWhere.id_area = BigInt(id_area);
    if (id_nivel) inscritoWhere.id_nivel = BigInt(id_nivel);

    if (busqueda) {
      inscritoWhere.OR = [
        { nombres_inscrito: { contains: busqueda, mode: 'insensitive' } },
        { apellidos_inscrito: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (Object.keys(inscritoWhere).length > 0) {
      where.inscrito = inscritoWhere;
    }

    const evaluaciones = await prisma.evaluaciones.findMany({
      where,
      include: {
        inscrito: {
          select: {
            nombres_inscrito: true,
            apellidos_inscrito: true,
            ci_inscrito: true,
          },
        },
      },
      orderBy: [
        { inscrito: { apellidos_inscrito: 'asc' } },
        { inscrito: { nombres_inscrito: 'asc' } },
      ],
    });

    return evaluaciones.map((ev) => ({
      id: Number(ev.id_evaluacion),
      id_evaluacion: Number(ev.id_evaluacion),
      id_inscrito: Number(ev.id_inscrito),
      id_evaluador: Number(ev.id_evaluador),
      id_fase: Number(ev.id_fase),
      competidor: `${ev.inscrito.apellidos_inscrito}, ${ev.inscrito.nombres_inscrito}`,
      nota: ev.nota != null ? Number(ev.nota) : null,
      observacion: ev.observacion || '',
      estado: ev.nota != null ? 'Evaluado' : 'Pendiente',
      fecha: ev.fecha,
    }));
  }

  async calcularMetricas(id_evaluador, id_fase) {
    const where = {
      id_evaluador: BigInt(id_evaluador),
      id_fase: BigInt(id_fase),
    };

    const [total_asignados, total_hechas] = await Promise.all([
      prisma.evaluaciones.count({ where }),
      prisma.evaluaciones.count({ where: { ...where, nota: { not: null } } }),
    ]);

    return {
      total_asignados,
      total_pendientes: total_asignados - total_hechas,
      total_hechas,
    };
  }

  async actualizarEvaluacion(id_evaluacion, datos, id_evaluador) {
    const evaluacion = await prisma.evaluaciones.findUnique({
      where: { id_evaluacion: BigInt(id_evaluacion) },
      include: { inscrito: true },
    });

    if (!evaluacion) {
      const e = new Error('Evaluación no encontrada');
      e.statusCode = 404;
      throw e;
    }

    if (Number(evaluacion.id_evaluador) !== Number(id_evaluador)) {
      const e = new Error('No tiene permiso para editar esta evaluación');
      e.statusCode = 403;
      throw e;
    }

    const valorAnterior = {
      nota: evaluacion.nota != null ? Number(evaluacion.nota) : null,
      observacion: evaluacion.observacion,
    };

    const actualizada = await prisma.evaluaciones.update({
      where: { id_evaluacion: BigInt(id_evaluacion) },
      data: {
        ...(datos.nota !== undefined && { nota: datos.nota }),
        ...(datos.observacion !== undefined && { observacion: datos.observacion }),
      },
      include: { inscrito: true },
    });

    await auditoriaService.registrarCambio({
      actor_tipo: 'EVALUADOR',
      id_actor: BigInt(id_evaluador),
      accion: 'ACTUALIZAR_EVALUACION',
      entidad: 'evaluaciones',
      id_entidad: BigInt(id_evaluacion),
      valor_anterior: JSON.stringify(valorAnterior),
      valor_nuevo: JSON.stringify({
        nota: actualizada.nota != null ? Number(actualizada.nota) : null,
        observacion: actualizada.observacion,
      }),
      resultado: 'OK',
    });

    return {
      id: Number(actualizada.id_evaluacion),
      id_evaluacion: Number(actualizada.id_evaluacion),
      id_inscrito: Number(actualizada.id_inscrito),
      id_evaluador: Number(actualizada.id_evaluador),
      id_fase: Number(actualizada.id_fase),
      competidor: `${actualizada.inscrito.apellidos_inscrito}, ${actualizada.inscrito.nombres_inscrito}`,
      nota: actualizada.nota != null ? Number(actualizada.nota) : null,
      observacion: actualizada.observacion || '',
      estado: actualizada.nota != null ? 'Evaluado' : 'Pendiente',
      fecha: actualizada.fecha,
    };
  }

  async guardarLote(evaluaciones, id_evaluador) {
    const resultados = [];
    const errores = [];

    for (const ev of evaluaciones) {
      try {
        const actualizada = await this.actualizarEvaluacion(
          ev.id_evaluacion,
          { nota: ev.nota, observacion: ev.observacion },
          id_evaluador
        );
        resultados.push(actualizada);
      } catch (error) {
        errores.push({ id_evaluacion: ev.id_evaluacion, error: error.message });
      }
    }

    return { resultados, errores };
  }
}

const service = new EvaluacionService();
export default service;
