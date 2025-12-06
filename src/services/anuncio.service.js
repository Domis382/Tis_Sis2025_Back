// src/services/anuncio.service.js
import {
  crearAnuncioRepo,
  listarAnunciosRepo,
  listarAnunciosVigentesRepo, eliminarAnuncioRepo
} from "../repositories/anuncio.repository.js";

function parseFecha(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function crearAnuncioService(payload) {
  const {
    titulo,
    contenido,
    imagen_url,
    imagen_alt,
    orden,
    fecha_publicacion,
    fecha_expiracion,
    id_administrador,
  } = payload;

  if (!titulo || !imagen_url) {
    throw new Error("Título e imagen_url son obligatorios");
  }
  if (!id_administrador) {
    throw new Error("id_administrador es obligatorio");
  }

  const data = {
    titulo: String(titulo).trim(),
    contenido: contenido ? String(contenido).trim() : null,
    imagen_url: String(imagen_url).trim(),
    imagen_alt: imagen_alt ? String(imagen_alt).trim() : null,
    orden: Number(orden) || 1,
    fecha_publicacion: parseFecha(fecha_publicacion),
    fecha_expiracion: parseFecha(fecha_expiracion),

    // defaults para tu tabla:
    tipo_anuncio: "SISTEMA",
    estado_anuncio: "ACTIVO",
    es_destacado: true,
    id_administrador,
    id_area: null,
  };

  return crearAnuncioRepo(data);
}

export const listarAnunciosService = () => listarAnunciosRepo();

export const listarAnunciosVigentesService = () =>
  listarAnunciosVigentesRepo();


export async function eliminarAnuncioService(id) {
  const num = Number(id);
  if (!num || Number.isNaN(num)) {
    throw new Error("ID de anuncio inválido");
  }

  
  return eliminarAnuncioRepo(BigInt(num));
}