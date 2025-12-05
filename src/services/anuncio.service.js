import {
  crearAnuncioCarruselRepo,
  listarAnunciosCarruselActivosRepo,
} from "../repositories/anuncio.repository.js";

export async function crearAnuncioCarruselService(payload) {
  return crearAnuncioCarruselRepo(payload);
}

export async function listarAnunciosCarruselService() {
  return listarAnunciosCarruselActivosRepo();
}
