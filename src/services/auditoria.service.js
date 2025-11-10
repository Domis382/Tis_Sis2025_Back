// src/services/auditoriaService.js
import prisma from '../config/prisma.js';

class AuditoriaService {
  async registrarCambio(datos) {
    try {
      await prisma.auditoria.create({
        data: {
          ...datos,
          fecha_hora: new Date(),
        },
      });
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
    }
  }

  async obtenerHistorial(filtros) {
    const { id_evaluador, fecha_desde, fecha_hasta } = filtros;

    const where = {
      actor_tipo: 'EVALUADOR',
      entidad: 'evaluaciones',
      resultado: 'OK',
    };

    if (id_evaluador) where.id_actor = BigInt(id_evaluador);

    if (fecha_desde || fecha_hasta) {
      where.fecha_hora = {};
      if (fecha_desde) where.fecha_hora.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_hora.lte = new Date(fecha_hasta);
    }

    const registros = await prisma.auditoria.findMany({
      where,
      orderBy: { fecha_hora: 'desc' },
      take: 100,
    });

    const historialEnriquecido = await Promise.all(
      registros.map(async (reg) => {
        try {
          const evaluacion = await prisma.evaluaciones.findUnique({
            where: { id_evaluacion: reg.id_entidad },
            include: { inscrito: true, evaluador: true },
          });

          if (!evaluacion) return null;

          const valorAnterior = reg.valor_anterior ? JSON.parse(reg.valor_anterior) : {};
          const valorNuevo = reg.valor_nuevo ? JSON.parse(reg.valor_nuevo) : {};

          return {
            id: Number(reg.id_auditoria),
            competidor: `${evaluacion.inscrito.apellidos_inscrito}, ${evaluacion.inscrito.nombres_inscrito}`,
            nota_anterior: valorAnterior.nota ?? '',
            nota_nueva: valorNuevo.nota ?? '',
            notaAnterior: valorAnterior.nota ?? '',
            notaNueva: valorNuevo.nota ?? '',
            fecha: reg.fecha_hora.toISOString().split('T')[0],
            usuario: `${evaluacion.evaluador.nombre_evaluado}`,
            accion: reg.accion,
          };
        } catch (error) {
          console.error('Error procesando historial:', error);
          return null;
        }
      })
    );

    return historialEnriquecido.filter(Boolean);
  }
}

const service = new AuditoriaService();
export default service;
