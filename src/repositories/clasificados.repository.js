// src/repositories/clasificados.repository.js
import db from "../config/prisma.js";

// Crear o actualizar un clasificado
export async function upsertClasificado({ id_inscrito, id_fase, estado }) {
  return await db.clasificados.upsert({
    where: {
      id_inscrito_id_fase: {
        id_inscrito: Number(id_inscrito),
        id_fase: Number(id_fase),
      },
    },
    update: { estado },
    create: {
      id_inscrito: Number(id_inscrito),
      id_fase: Number(id_fase),
      estado,
    },
  });
}

// Listar TODOS los clasificados (solo CLASIFICADO) con datos del inscrito
export async function findAllClasificados() {
  return db.$queryRaw`
    SELECT 
      c.id_clasificado,
      c.id_inscrito,
      c.id_fase,
      c.estado,

      i.nombres_inscrito,
      i.apellidos_inscrito,
      i.ci_inscrito,
      i.colegio,
      i.contacto_tutor,
      i.unidad_educativa,
      i.departamento,
      i.grado_escolaridad,
      i.id_area,
      i.tutor_academico
    FROM clasificados c
    JOIN inscritos i 
      ON i.id_inscritos = c.id_inscrito
    WHERE c.estado = 'CLASIFICADO'
    ORDER BY i.nombres_inscrito, i.apellidos_inscrito
  `;
}
