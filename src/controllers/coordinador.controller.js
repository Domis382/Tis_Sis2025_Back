// src/controllers/coordinador.controller.js

import * as coordinadorService from "../services/coordinador.service.js";
import { successResponse } from "../utils/response.js";

// ======================================
// GET /api/coordinador/perfil  (coordinador logueado)
// ======================================
export async function getPerfil(req, res, next) {
  try {
    const idUsuario = req.user.id; // viene del token

    const coord = await coordinadorService.getPerfilCoordinadorByUsuario(
      idUsuario
    );

    if (!coord) {
      return successResponse(
        res,
        { message: "Coordinador no encontrado" },
        404
      );
    }

    const { usuario, area } = coord;

    const perfilPlano = {
      id_usuario: Number(usuario.id_usuario),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      carnet: coord.carnet,
      id_area: Number(coord.id_area),
      area_nombre: area?.nombre ?? null,
    };

    successResponse(res, perfilPlano);
  } catch (err) {
    next(err);
  }
}

// ======================================
// PUT /api/coordinador/perfil
// ======================================
export async function updatePerfil(req, res, next) {
  try {
    const idUsuario = req.user.id;

    const actualizado =
      await coordinadorService.updatePerfilCoordinadorByUsuario(
        idUsuario,
        req.body
      );

    const { usuario, area } = actualizado;

    const perfilPlano = {
      id_usuario: Number(usuario.id_usuario),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      carnet: actualizado.carnet,
      id_area: Number(actualizado.id_area),
      area_nombre: area?.nombre ?? null,
    };

    successResponse(res, perfilPlano);
  } catch (err) {
    next(err);
  }
}

// ======================================
// GET /api/coordinador/:id
// ======================================
export async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const data = await coordinadorService.getCoordinadorById(id);

    if (!data) {
      return successResponse(
        res,
        { message: "Coordinador no encontrado" },
        404
      );
    }

    const { pass_coordinador, ...safe } = data;
    successResponse(res, safe);
  } catch (err) {
    next(err);
  }
}

// ======================================
// GET /api/coordinador
// ======================================
export async function getAll(req, res, next) {
  try {
    const data = await coordinadorService.getAllCoordinadores();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

// ======================================
// POST /api/coordinador
// ======================================
export async function create(req, res, next) {
  try {
    const creado = await coordinadorService.createCoordinador(req.body);

    const { pass_coordinador, ...safe } = creado;
    successResponse(res, safe, 201);
  } catch (err) {
    next(err);
  }
}

// ======================================
// PUT /api/coordinador/:id
// ======================================
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = await coordinadorService.updateCoordinador(id, req.body);
    const { pass_coordinador, ...safe } = data;
    successResponse(res, safe);
  } catch (err) {
    next(err);
  }
}

// ======================================
// DELETE /api/coordinador/:id
// ======================================
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await coordinadorService.deleteCoordinador(id);
    successResponse(res, { ok: true });
  } catch (err) {
    next(err);
  }
}
