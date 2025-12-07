// src/services/coordinador.service.js
import prisma from "../config/prisma.js";

// =========================
// GET
// =========================
export async function getAllCoordinadores() {
  return prisma.coordinador_area.findMany({
    include: {
      area: true,
      usuario: true,
    },
    orderBy: { id_coordinador: "asc" },
  });
}

export async function getCoordinadorById(id) {
  return prisma.coordinador_area.findUnique({
    where: { id_coordinador: BigInt(id) },
    include: {
      area: true,
      usuario: true,
    },
  });
}

// =========================
// CREATE
// =========================
//
// Espera en body (lo manda el front api/coordinador.js):
// {
//   nombre_coordinador,
//   apellidos_coordinador,
//   correo_electronico,
//   carnet,
//   telefono,
//   id_area,
//   pass_coordinador?   // opcional
// }
export async function createCoordinador(body) {
  const {
    nombre_coordinador,
    apellidos_coordinador,
    correo_electronico,
    carnet,
    telefono,
    id_area,
    pass_coordinador,
  } = body;

  if (
    !nombre_coordinador ||
    !apellidos_coordinador ||
    !correo_electronico ||
    !id_area ||
    !carnet
  ) {
    const e = new Error(
      "Campos requeridos: nombre_coordinador, apellidos_coordinador, correo_electronico, carnet, id_area"
    );
    e.status = 400;
    throw e;
  }

  const areaId = BigInt(id_area);

  // Verificar que exista el área
  const area = await prisma.area.findUnique({
    where: { id_area: areaId },
  });

  if (!area) {
    const e = new Error("id_area no existe");
    e.status = 400;
    throw e;
  }

  // ¿ya existe ese correo en USUARIO?
  const dupUser = await prisma.usuario.findUnique({
    where: { correo: correo_electronico },
  });
  if (dupUser) {
    const e = new Error("El correo ya está registrado en usuario");
    e.status = 409;
    throw e;
  }

  // Password base (igual estilo que en responsable.service)
  const password = pass_coordinador || carnet || telefono || "123456";

  // 1) Crear USUARIO base con rol COORDINADOR
  const usuario = await prisma.usuario.create({
    data: {
      nombre: nombre_coordinador,
      apellido: apellidos_coordinador,
      correo: correo_electronico,
      passwordHash: password,
      telefono: telefono || null,
      rol: "COORDINADOR",
      estado: "ACTIVO",
    },
  });

  // 2) Crear COORDINADOR_AREA vinculado al usuario
  const creado = await prisma.coordinador_area.create({
    data: {
      id_usuario: usuario.id_usuario,
      id_area: areaId,
      carnet,
    },
    include: {
      area: true,
      usuario: true,
    },
  });

  return creado;
}

// =========================
// UPDATE
// =========================
//
// El front envía algo como:
// {
//   nombre_coordinador?,
//   apellidos_coordinador?,
//   correo_electronico?,
//   telefono?,
//   carnet?,
//   id_area?
// }
export async function updateCoordinador(id, patch) {
  const idCoordinador = BigInt(id);

  const coord = await prisma.coordinador_area.findUnique({
    where: { id_coordinador: idCoordinador },
  });

  if (!coord) {
    const e = new Error("Coordinador no encontrado");
    e.status = 404;
    throw e;
  }

  const usuarioUpdates = {};
  const coordUpdates = {};

  // Campos que pertenecen a USUARIO
  if (patch.nombre_coordinador !== undefined)
    usuarioUpdates.nombre = patch.nombre_coordinador;
  if (patch.apellidos_coordinador !== undefined)
    usuarioUpdates.apellido = patch.apellidos_coordinador;
  if (patch.correo_electronico !== undefined)
    usuarioUpdates.correo = patch.correo_electronico;
  if (patch.telefono !== undefined)
    usuarioUpdates.telefono = patch.telefono;
  if (patch.pass_coordinador !== undefined)
    usuarioUpdates.passwordHash = patch.pass_coordinador;

  // Campos propios de COORDINADOR_AREA
  if (patch.carnet !== undefined) coordUpdates.carnet = patch.carnet;
  if (patch.id_area !== undefined) coordUpdates.id_area = BigInt(patch.id_area);

  // 1) Actualizar usuario (si hay cambios)
  if (Object.keys(usuarioUpdates).length) {
    await prisma.usuario.update({
      where: { id_usuario: coord.id_usuario },
      data: usuarioUpdates,
    });
  }

  // 2) Actualizar coordinador_area (si hay cambios)
  const actualizado = await prisma.coordinador_area.update({
    where: { id_coordinador: idCoordinador },
    data: coordUpdates,
    include: {
      area: true,
      usuario: true,
    },
  });

  return actualizado;
}

// =========================
// DELETE
// =========================
//
// Aquí opcionalmente borramos también el usuario asociado (como en responsables)
export async function deleteCoordinador(id) {
  const idCoordinador = BigInt(id);

  const coord = await prisma.coordinador_area.findUnique({
    where: { id_coordinador: idCoordinador },
    select: { id_usuario: true },
  });

  if (!coord) {
    const e = new Error("Coordinador no encontrado");
    e.status = 404;
    throw e;
  }

  await prisma.$transaction(async (tx) => {
    // 1) borrar coordinador_area
    await tx.coordinador_area.delete({
      where: { id_coordinador: idCoordinador },
    });

    // 2) borrar usuario asociado (si existe)
    if (coord.id_usuario) {
      await tx.usuario.delete({
        where: { id_usuario: coord.id_usuario },
      });
    }
  });

  return true;
}

// PERFIL por id_usuario (desde el token)
export async function getPerfilCoordinadorByUsuario(idUsuario) {
  if (idUsuario == null) {
    const e = new Error("idUsuario no definido en token");
    e.status = 401;
    throw e;
  }

  return prisma.coordinador_area.findUnique({
    where: { id_usuario: BigInt(idUsuario) },
    include: {
      usuario: true,
      area: true,
    },
  });
}

export async function updatePerfilCoordinadorByUsuario(idUsuario, body) {
  const coord = await prisma.coordinador_area.findUnique({
    where: { id_usuario: BigInt(idUsuario) },
    include: { usuario: true, area: true },
  });

  if (!coord) {
    const e = new Error("Coordinador no encontrado");
    e.status = 404;
    throw e;
  }

  const userUpdates = {};
  const coordUpdates = {};

  // Datos que viven en USUARIO
  if (body.nombre !== undefined) userUpdates.nombre = body.nombre;
  if (body.apellido !== undefined) userUpdates.apellido = body.apellido;
  if (body.correo !== undefined) userUpdates.correo = body.correo;
  if (body.telefono !== undefined) userUpdates.telefono = body.telefono;

  // Datos de la tabla coordinador_area
  if (body.carnet !== undefined) coordUpdates.carnet = body.carnet;
  if (body.id_area !== undefined) coordUpdates.id_area = BigInt(body.id_area);

  // Actualizar usuario
  if (Object.keys(userUpdates).length) {
    await prisma.usuario.update({
      where: { id_usuario: coord.id_usuario },
      data: userUpdates,
    });
  }

  // Actualizar coordinador_area
  const actualizado = await prisma.coordinador_area.update({
    where: { id_coordinador: coord.id_coordinador },
    data: coordUpdates,
    include: {
      usuario: true,
      area: true,
    },
  });

  return actualizado;
}
