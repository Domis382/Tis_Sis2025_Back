import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// LISTAR RESPONSABLES
export async function listResponsables() {
  return prisma.responsable_area.findMany({
    include: { area: true, usuario: true },
  });
}

// CREAR RESPONSABLE (versión con schema actual)
export async function createResponsable({
  nombres_evaluador,
  apellidos,
  correo_electronico,
  id_area,
  id_usuario, // ahora se enlaza con la tabla usuario
}) {
  return prisma.responsable_area.create({
    data: {
      nombres_evaluador,
      apellidos,
      correo_electronico,
      id_area: Number(id_area),
      id_usuario: id_usuario ?? null,
    },
    include: { area: true, usuario: true },
  });
}

// ACTUALIZAR RESPONSABLE
export async function updateResponsable(id_responsable, data) {
  const allowed = {};

  if (data.nombres_evaluador !== undefined)
    allowed.nombres_evaluador = data.nombres_evaluador;

  if (data.apellidos !== undefined)
    allowed.apellidos = data.apellidos;

  if (data.correo_electronico !== undefined)
    allowed.correo_electronico = data.correo_electronico;

  if (data.id_area !== undefined)
    allowed.id_area = Number(data.id_area);

  if (data.id_usuario !== undefined)
    allowed.id_usuario = data.id_usuario ?? null;

  return prisma.responsable_area.update({
    where: { id_responsable: Number(id_responsable) },
    data: allowed,
    include: { area: true, usuario: true },
  });
}

// ELIMINAR RESPONSABLE
export async function deleteResponsable(id_responsable) {
  await prisma.responsable_area.delete({
    where: { id_responsable: Number(id_responsable) },
  });
  return true;
}
