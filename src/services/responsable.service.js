// src/services/responsable.service.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- LISTAR RESPONSABLES ---
export async function getAllResponsables() {
  return prisma.responsable_area.findMany({
    include: { area: true, usuario: true },
    orderBy: { id_responsable: 'asc' },
  });
}

// --- CREAR RESPONSABLE (login unificado, sin bcrypt por ahora) ---
export async function createResponsable(body) {
  const {
    nombres_evaluador,
    apellidos,
    correo_electronico,
    id_area,
    password,
  } = body;

  // VALIDACIÓN
  if (!nombres_evaluador || !apellidos || !correo_electronico || !id_area) {
    const e = new Error(
      'Campos requeridos: nombres_evaluador, apellidos, correo_electronico, id_area'
    );
    e.status = 400;
    throw e;
  }

  const areaId = BigInt(id_area);

  // Verificar existencia del área
  const area = await prisma.area.findUnique({ where: { id_area: areaId } });
  if (!area) {
    const e = new Error('id_area no existe');
    e.status = 400;
    throw e;
  }

  // Validar que no exista usuario con ese correo
  const dupUser = await prisma.usuario.findUnique({
    where: { correo: correo_electronico },
  });
  if (dupUser) {
    const e = new Error('Ya existe un usuario con ese correo');
    e.status = 409;
    throw e;
  }

  // ⚠️ Por ahora: guardar password "en plano" (solo para que no se caiga el sistema)
  // Más adelante: cambiar esto por bcrypt.hash(...)
  const plainPassword = password || '123456';

  // Crear usuario
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombre: nombres_evaluador,
      apellido: apellidos,
      correo: correo_electronico,
      passwordHash: plainPassword, // <- cambiar a hash cuando tengan bcrypt bien configurado
      rol: 'RESPONSABLE',
    },
  });

  // Crear responsable_area vinculado al usuario
  const creado = await prisma.responsable_area.create({
    data: {
      nombres_evaluador,
      apellidos,
      correo_electronico,
      id_area: areaId,
      id_usuario: nuevoUsuario.id_usuario,
    },
    include: { area: true, usuario: true },
  });

  return creado;
}

// --- ACTUALIZAR ---
export async function updateResponsable(id, patch) {
  const idResp = BigInt(id);

  // Obtengo al responsable con su usuario
  const responsable = await prisma.responsable_area.findUnique({
    where: { id_responsable: idResp },
    include: { usuario: true }
  });

  if (!responsable) {
    const e = new Error("Responsable no existe");
    e.status = 404;
    throw e;
  }

  // Campos que sí se guardan en responsable_area
  const dataResp = {};
  if (patch.nombres_evaluador !== undefined)
    dataResp.nombres_evaluador = patch.nombres_evaluador;

  if (patch.apellidos !== undefined)
    dataResp.apellidos = patch.apellidos;

  if (patch.correo_electronico !== undefined)
    dataResp.correo_electronico = patch.correo_electronico;

  if (patch.id_area !== undefined)
    dataResp.id_area = BigInt(patch.id_area);

  // ---- Actualizar tabla USUARIO ----
  const dataUser = {};
  if (patch.correo !== undefined)
    dataUser.correo = patch.correo;

  if (patch.telefono !== undefined)
    dataUser.telefono = patch.telefono;

  if (patch.carnet !== undefined)
    dataUser.passwordHash = await bcrypt.hash(String(patch.carnet), 10);

  // Ejecutamos en transacción
  const [updatedResp, updatedUser] = await prisma.$transaction([
    prisma.responsable_area.update({
      where: { id_responsable: idResp },
      data: dataResp,
      include: { area: true },
    }),
    prisma.usuario.update({
      where: { id_usuario: responsable.id_usuario },
      data: dataUser,
    }),
  ]);

  return { ...updatedResp, usuario: updatedUser };
}



// --- ELIMINAR ---
export async function deleteResponsable(id) {
  const idResp = BigInt(id);

  // 1. Buscar el responsable para saber qué usuario tiene asociado
  const responsable = await prisma.responsable_area.findUnique({
    where: { id_responsable: idResp },
    select: { id_usuario: true },
  });

  if (!responsable) {
    // si ya no existe, no hacemos nada raro
    return true;
  }

  // 2. Hacer todo en una transacción: borrar responsable y, si aplica, su usuario
  await prisma.$transaction(async (tx) => {
    // borrar responsable_area
    await tx.responsable_area.delete({
      where: { id_responsable: idResp },
    });

    // si tiene usuario asociado, borrarlo también
    if (responsable.id_usuario) {
      await tx.usuario.delete({
        where: { id_usuario: responsable.id_usuario },
      });
    }
  });

  return true;
}
