// src/controllers/anuncio.controller.js
import {
  crearAnuncioService,
  listarAnunciosService,
  listarAnunciosVigentesService, eliminarAnuncioService
} from "../services/anuncio.service.js";

export const crearAnuncioController = async (req, res, next) => {
  try {
    // ajusta esto según cómo guardes el usuario en el token
    const id_admin = 7; //maites eso puse para probar ejemplos
     // req.user?.id_usuario || req.user?.id || req.user?.id_admin || null;

    const anuncio = await crearAnuncioService({
      ...req.body,
      id_administrador: id_admin ?? 1, // fallback en caso de estar probando
    });

    res.status(201).json({ ok: true, data: anuncio });
  } catch (err) {
    console.error("Error al crear anuncio:", err);
    res.status(400).json({
      ok: false,
      message: err.message || "No se pudo crear el anuncio",
    });
  }
};

export const listarAnunciosController = async (_req, res, next) => {
  try {
    const data = await listarAnunciosService();
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Error al listar anuncios:", err);
    next(err);
  }
};

export const listarAnunciosVigentesController = async (_req, res, next) => {
  try {
    const data = await listarAnunciosVigentesService();
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Error al listar anuncios vigentes:", err);
    next(err);
  }
};

export const eliminarAnuncioController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eliminarAnuncioService(id);
    res.json({ ok: true, message: "Anuncio eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar anuncio:", err);
    res.status(400).json({
      ok: false,
      message: err.message || "No se pudo eliminar el anuncio",
    });
  }
};
