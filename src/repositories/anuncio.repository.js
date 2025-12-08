// src/repositories/anuncio.repository.js
import  prisma from "../config/prisma.js";

export const crearAnuncioRepo = (data) =>
  prisma.anuncio.create({ data });
// Repositorio para listar todos los anuncios
export const listarAnunciosRepo = () =>
  prisma.anuncio.findMany({
    orderBy: [{ orden: "asc" }, { fecha_publicacion: "desc" }],
  });

// Repositorio para listar anuncios vigentes
export const listarAnunciosVigentesRepo = () =>
  prisma.anuncio.findMany({
    where: {
      tipo_anuncio: "SISTEMA",
      estado_anuncio: "ACTIVO",
      es_destacado: true,
      AND: [
        {
          OR: [
            { fecha_publicacion: null },
            { fecha_publicacion: { lte: new Date() } },
          ],
        },
        {
          OR: [
            { fecha_expiracion: null },
            { fecha_expiracion: { gte: new Date() } },
          ],
        },
      ],
    },
    orderBy: [{ orden: "asc" }, { fecha_publicacion: "desc" }],
  });
// Repositorio para eliminar un anuncio por ID
  export const eliminarAnuncioRepo = (id_anuncio) =>
  prisma.anuncio.delete({
    where: { id_anuncio },
  });
