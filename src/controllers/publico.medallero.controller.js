// src/controllers/publico.medallero.controller.js
import prisma from "../config/prisma.js";

/**
 * Medallero público
 * GET /api/publico/medallero
 *
 * Devuelve:
 *  - id_medalla_clasificado
 *  - id_clasificado
 *  - id_parametro
 *  - tipo_medalla (ORO / PLATA / BRONCE)
 *  - puntaje_final
 *  - es_empate
 *  - nombres_inscrito
 *  - apellidos_inscrito
 *  - unidad_educativa / colegio
 *  - departamento
 */
export async function listarMedalleroPublico(req, res, next) {
  try {
    const filas = await prisma.$queryRaw`
      SELECT
        m.id_medalla_clasificado,
        m.id_clasificado,
        m.id_parametro,
        UPPER(m.tipo_medalla)       AS tipo_medalla,
        m.puntaje_final,
        m.es_empate,
        i.nombres_inscrito,
        i.apellidos_inscrito,
        i.unidad_educativa,
        i.colegio,
        i.departamento
      FROM medallas_clasificados m
      JOIN clasificados c
        ON c.id_clasificado = m.id_clasificado
      JOIN inscritos i
        ON i.id_inscritos = c.id_inscrito
      ORDER BY
        CASE UPPER(m.tipo_medalla)
          WHEN 'ORO'    THEN 1
          WHEN 'PLATA'  THEN 2
          WHEN 'BRONCE' THEN 3
          ELSE 4
        END,
        m.puntaje_final DESC
    `;

    return res.json(filas);
  } catch (err) {
    console.error("Error listando medallero público:", err);
    next(err);
  }
}
