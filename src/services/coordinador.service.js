import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// normaliza strings: quita tildes, espacios y vuelve mayúscula
const norm = (s) =>
  s.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

// generar nombre de usuario único
async function generarUsuarioUnico(nombres, apellidos) {
  const base = `${norm(nombres)[0]}${norm(apellidos)}`;
  
  const existe = await prisma.coordinador_area.findUnique({
    where: { usuario_coordinador: base },
  });

  if (!existe) return base;

  let i = 2;
  while (true) {
    const candidato = `${base}${i}`;
    const existe2 = await prisma.coordinador_area.findUnique({
      where: { usuario_coordinador: candidato },
    });
    if (!existe2) return candidato;
    i++;
  }
}

// =========================
// GET
// =========================
export async function getAllCoordinadores() {
  return prisma.coordinador_area.findMany({
    include: { area: true },
    orderBy: { id_coordinador: "asc" },
  });
}

// =========================
// CREATE
// =========================
export async function createCoordinador(body) {
  const {
    nombre_coordinador,
    apellidos_coordinador,
    correo_electronico,
    carnet,
    telefono,
    id_area,
  } = body;

  if (!nombre_coordinador || !apellidos_coordinador || !id_area) {
    const e = new Error(
      "Campos requeridos: nombre_coordinador, apellidos_coordinador, id_area"
    );
    e.status = 400;
    throw e;
  }

  const areaId = BigInt(id_area);

  const area = await prisma.area.findUnique({
    where: { id_area: areaId },
  });

  if (!area) {
    const e = new Error("id_area no existe");
    e.status = 400;
    throw e;
  }

  // correo único (si viene)
  if (correo_electronico) {
    const dupCorreo = await prisma.coordinador_area.findUnique({
      where: { correo_electronico },
      select: { id_coordinador: true },
    });
    if (dupCorreo) {
      const e = new Error("El correo ya está registrado");
      e.status = 409;
      throw e;
    }
  }

  // generar usuario si lo necesitamos
  const usuario_coordinador = await generarUsuarioUnico(
    nombre_coordinador,
    apellidos_coordinador
  );

  const pass_coordinador = carnet || telefono || "123456";

  const creado = await prisma.coordinador_area.create({
    data: {
      nombre_coordinador,
      apellidos_coordinador,
      correo_electronico,
      usuario_coordinador,
      pass_coordinador,
      carnet,
      telefono,
      id_area: areaId,
    },
  });

  return creado;
}

// =========================
// UPDATE
// =========================
export async function updateCoordinador(id, patch) {
  const data = { ...patch };
  if (data.id_area !== undefined) {
    data.id_area = BigInt(data.id_area);
  }

  return prisma.coordinador_area.update({
    where: { id_coordinador: BigInt(id) },
    data,
  });
}

// =========================
// DELETE
// =========================
export async function deleteCoordinador(id) {
  await prisma.coordinador_area.delete({
    where: { id_coordinador: BigInt(id) },
  });
  return true;
}
