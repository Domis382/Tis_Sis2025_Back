// src/services/anuncio.service.js
import {
  crearAnuncioRepo,
  listarAnunciosRepo,
  listarAnunciosVigentesRepo, eliminarAnuncioRepo
} from "../repositories/anuncio.repository.js";
// Función auxiliar para parsear fechas
function parseFecha(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
// Servicio para crear un nuevo anuncio
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
// Preparar datos para el repositorio
  const data = {
    titulo: String(titulo).trim(),
    contenido: contenido ? String(contenido).trim() : null,
    imagen_url: String(imagen_url).trim(),
    imagen_alt: imagen_alt ? String(imagen_alt).trim() : null,
    orden: Number(orden) || 1,
    fecha_publicacion: parseFecha(fecha_publicacion),
    fecha_expiracion: parseFecha(fecha_expiracion),

    // defaults para la tabla:
    tipo_anuncio: "SISTEMA",
    estado_anuncio: "ACTIVO",
    es_destacado: true,
    id_administrador,
    id_area: null,
  };

  return crearAnuncioRepo(data);
}
// Servicio para listar todos los anuncios
export const listarAnunciosService = () => listarAnunciosRepo();
// Servicio para listar anuncios vigentes
export const listarAnunciosVigentesService = () =>
  listarAnunciosVigentesRepo();
// Servicio para eliminar un anuncio por ID
export async function eliminarAnuncioService(id) {
  const num = Number(id);
  if (!num || Number.isNaN(num)) {
    throw new Error("ID de anuncio inválido");
  }

  
  return eliminarAnuncioRepo(BigInt(num));
}