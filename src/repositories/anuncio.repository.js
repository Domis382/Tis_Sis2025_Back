// src/repositories/anuncio.repository.js
import prisma from "../config/prisma.js"; 

// INSERT para anuncio del carrusel
export async function crearAnuncioCarruselRepo({
  titulo,
  contenido,
  imagen_url,
  imagen_alt,
  orden,
  fecha_publicacion,
  fecha_expiracion,
  id_administrador = null,
  id_area = null,
}) {
  return prisma.anuncio.create({
    data: {
      titulo,
      contenido: contenido ?? "",
      tipo_anuncio: "CARRUSEL",   
      estado_anuncio: "PUBLICADO",
      fecha_publicacion: fecha_publicacion ?? new Date(),
      fecha_expiracion: fecha_expiracion ?? null,
      imagen_url,
      imagen_alt: imagen_alt ?? "",
      orden: orden ?? 1,
      es_destacado: true,
      id_administrador,
      id_area,
    },
  });
}

// Listar anuncios activos del carrusel
export async function listarAnunciosCarruselActivosRepo() {
  const hoy = new Date();

  return prisma.anuncio.findMany({
    where: {
      tipo_anuncio: "CARRUSEL",
      estado_anuncio: "PUBLICADO",
      AND: [
        {
          OR: [
            { fecha_publicacion: null },
            { fecha_publicacion: { lte: hoy } },
          ],
        },
        {
          OR: [
            { fecha_expiracion: null },
            { fecha_expiracion: { gte: hoy } },
          ],
        },
      ],
    },
    orderBy: [{ orden: "asc" }, { fecha_publicacion: "desc" }],
  });
}
