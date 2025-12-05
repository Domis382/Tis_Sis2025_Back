import {
  crearAnuncioCarruselService,
  listarAnunciosCarruselService,
} from "../services/anuncio.service.js";

export async function crearAnuncioCarruselController(req, res, next) {
  try {
    const data = await crearAnuncioCarruselService(req.body);
    res.status(201).json(data);
  } catch (e) {
    console.error("Error creando anuncio carrusel:", e);
    next(e);
  }
}

export async function listarAnunciosCarruselController(req, res, next) {
  try {
    const data = await listarAnunciosCarruselService();
    res.json(data);
  } catch (e) {
    console.error("Error listando anuncios carrusel:", e);
    next(e);
  }
}
