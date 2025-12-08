// src/repositories/medallero.repository.js
import prisma from "../config/prisma.js";
// Crear o actualizar una medalla para un clasificado
export async function upsertMedalla({
  id_clasificado,
  id_parametro,
  tipo_medalla,
  puntaje_final,
  es_empate,
}) {
  if (!id_clasificado) throw new Error("id_clasificado es obligatorio");
  if (!id_parametro) throw new Error("id_parametro es obligatorio");

  const idClas = Number(id_clasificado);
  const idParam = Number(id_parametro);

  // Normalizar tipo de medalla
  let tipo = (tipo_medalla || "").toString().trim().toUpperCase();

  //  SOLO CREATE (porque ya borramos todo antes)
  return prisma.medallas_clasificados.create({
    data: {
      id_parametro: idParam,
      id_clasificado: idClas,
      tipo_medalla: tipo,
      puntaje_final,
      es_empate,
    },
  });
}