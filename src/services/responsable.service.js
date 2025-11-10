// src/services/responsable.service.js
//Importa el cliente de Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Función "norm":
// - Elimina tildes (á, é, í...)
// - Quita espacios
// - Convierte todo a MAYÚSCULAS
// Se usa para generar nombres de usuario sin caracteres especiales.
const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toUpperCase();

async function generarUsuarioUnico(nombres, apellidos) {
  // Crea una base de usuario combinando la inicial del nombre y el apellido (ej: M + PEREZ -> MPEREZ)
  const base = `${norm(nombres)[0]}${norm(apellidos)}`; 
  // Verifica si ya existe un usuario con ese nombre exacto en la tabla
  const ya = await prisma.responsable_area.findUnique({
    where: { usuario_responsable: base },
    select: { usuario_responsable: true },
  });
  // Si no existe, devuelve directamente el nombre base
  if (!ya) return base;

  // si existe, busca sufijos MPEREZ2, MPEREZ3...
  let i = 2;
  while (true) {
    const candidato = `${base}${i}`;
    const existe = await prisma.responsable_area.findUnique({
      where: { usuario_responsable: candidato },
      select: { usuario_responsable: true },
    });
    if (!existe) return candidato;
    i++;
  }
}
// Busca todos los registros en la tabla "responsable_area"
export async function getAllResponsables() {
  return prisma.responsable_area.findMany({
    include: { area: true },
    orderBy: { id_responsable: 'asc' },
  });
}
// Extrae los campos esperados del body recibido
export async function createResponsable(body) {
  const { nombres_evaluador, apellidos, correo_electronico, id_area, carnet } = body;

  // Valida que todos los campos requeridos estén presentes
  if (!nombres_evaluador || !apellidos || !correo_electronico || !id_area || !carnet) {
    const e = new Error('Campos requeridos: nombres_evaluador, apellidos, correo_electronico, id_area, carnet');
    e.status = 400; throw e;
  }

  // Convierte el ID del área a BigInt
  const areaId = BigInt(id_area);
  // Verifica que el área exista antes de crear el responsable
  const area = await prisma.area.findUnique({ where: { id_area: areaId } });
  if (!area) { const e = new Error('id_area no existe'); e.status = 400; throw e; }

  // correo único
  const dupCorreo = await prisma.responsable_area.findUnique({
    where: { correo_electronico },
    select: { id_responsable: true }
  });
  if (dupCorreo) { const e = new Error('Registro duplicado: correo_electronico'); e.status = 409; throw e; }

  // genera usuario único
  const usuario_responsable = await generarUsuarioUnico(nombres_evaluador, apellidos);

  // contraseña inicial = carnet (por ahora)
  const pass_responsable = String(carnet);

  // Crea el registro en la base de datos
  const creado = await prisma.responsable_area.create({
    data: {
      nombres_evaluador,
      apellidos,
      correo_electronico,
      usuario_responsable,
      pass_responsable,
      id_area: areaId,
    },
  });

  return creado;
}
// Actualiza los datos del responsable según su ID
export async function updateResponsable(id, patch) {
  return prisma.responsable_area.update({
    where: { id_responsable: BigInt(id) },
    data: patch,
  });
}
// Elimina un responsable según su ID
export async function deleteResponsable(id) {
  await prisma.responsable_area.delete({ where: { id_responsable: BigInt(id) } });
  return true;
}
//Tip futuro: cuando activen “cambiar/olvidé mi contraseña”, hasheen con bcrypt y no devuelvan el pass.
