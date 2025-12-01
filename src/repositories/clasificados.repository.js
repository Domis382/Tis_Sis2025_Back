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
    create: { id_inscrito: Number(id_inscrito), id_fase: Number(id_fase), estado },
  });
}

// Obtener todos los clasificados
export async function findAllClasificados() {
  return await db.clasificados.findMany({
    include: {
      inscritos: true,
      fases: true,
    },
  });
}
