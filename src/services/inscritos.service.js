// src/services/inscritos.service.js
import prisma from "../config/prisma.js";

/**
 * Listar inscritos para la vista de “Gestionar Inscritos”
 *
 * filtros (req.query):
 *  - area
 *  - nivel
 *  - estado
 *  - search
 *  - soloSinEvaluador
 *
 * user (req.user):
 *  - SOLO se usa en otras operaciones (como asignar inscritos),
 *    NO para filtrar el listado por área.
 */
export async function listarInscritos(filtros = {}, user = null) {
  const {
    area,
    nivel,
    estado,
    search,
    soloSinEvaluador, // "1" | "true"
  } = filtros;

  const where = {};

  // 🔹 Área: SOLO si viene en query param
  if (area) {
    where.id_area = BigInt(area);
  }

  // 🔹 Nivel: en tu BD está como grado_escolaridad (texto)
  if (nivel) {
    where.grado_escolaridad = nivel;
  }

  // 🔹 Estado (texto: ACTIVA, DESCLASIFICADA, etc.)
  if (estado) {
    where.estado = estado;
  }

  // 🔹 Búsqueda por texto
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { nombres_inscrito: { contains: s, mode: "insensitive" } },
      { apellidos_inscrito: { contains: s, mode: "insensitive" } },
      { ci_inscrito: { contains: s, mode: "insensitive" } },
      { colegio: { contains: s, mode: "insensitive" } },
      { unidad_educativa: { contains: s, mode: "insensitive" } },
    ];
  }

  // 🔹 Solo sin evaluador
  if (soloSinEvaluador === "1" || soloSinEvaluador === "true") {
    where.evaluaciones = { none: {} };
  }

  const filas = await prisma.inscritos.findMany({
    where,
    include: {
      area: true,
      //nivel: true,
      evaluaciones: {
        include: {
          evaluador: {
            include: { usuario: true },
          },
        },
      },
    },
    orderBy: [
      { id_area: "asc" },
      //{ id_nivel: "asc" },
      { apellidos_inscrito: "asc" },
      { nombres_inscrito: "asc" },
    ],
  });

  // Aplanar respuesta para el front
  return filas.map((row) => {
    const primeraEval = row.evaluaciones[0] ?? null;
    let evaluadorNombre = null;

    if (primeraEval?.evaluador) {
      const ev = primeraEval.evaluador;
      evaluadorNombre =
        `${ev.nombre_evaluado} ${ev.apellidos_evaluador}`.trim();
    }

    return {
      id_inscritos: Number(row.id_inscritos),
      nombres_inscrito: row.nombres_inscrito,
      apellidos_inscrito: row.apellidos_inscrito,
      ci_inscrito: row.ci_inscrito,
      unidad_educativa: row.unidad_educativa,
      colegio: row.colegio,
      estado: row.estado,
      id_area: Number(row.id_area),
      area: row.area?.nombre_area ?? null,
      nivel: row.grado_escolaridad || null,
      evaluador: evaluadorNombre,
    };
  });
}

/**
 * Asignar un lote de inscritos a un evaluador.
 *
 * - idEvaluador: id_evaluador (number o string)
 * - idsInscritos: array de ids de inscritos
 * - user: coordinador logueado (puede tener id_area)
 */
export async function asignarInscritosAEvaluador(
  idEvaluador,
  idsInscritos,
  user = null // 👈 ya no usamos el área del coordinador para restringir
) {
  if (!idEvaluador) {
    const e = new Error("idEvaluador es obligatorio");
    e.status = 400;
    throw e;
  }

  if (!Array.isArray(idsInscritos) || idsInscritos.length === 0) {
    const e = new Error("idsInscritos debe ser un arreglo no vacío");
    e.status = 400;
    throw e;
  }

  const idEvalBig = BigInt(idEvaluador);

  // 1) Verificar evaluador (incluyendo su área)
  const evaluador = await prisma.evaluador.findUnique({
    where: { id_evaluador: idEvalBig },
    include: { area: true },
  });

  if (!evaluador) {
    const e = new Error("Evaluador no encontrado");
    e.status = 404;
    throw e;
  }

  // 2) Buscar inscritos
  const idsBig = idsInscritos.map((id) => BigInt(id));

  const inscritos = await prisma.inscritos.findMany({
    where: { id_inscritos: { in: idsBig } },
    select: { id_inscritos: true, id_area: true },
  });

  if (!inscritos.length) {
    const e = new Error("Ningún inscrito encontrado con esos IDs");
    e.status = 404;
    throw e;
  }

  // 🔹 OPCIONAL: validar que todos los inscritos sean del MISMO área que el evaluador
  const mismatch = inscritos.find(
    (i) => Number(i.id_area) !== Number(evaluador.id_area)
  );
  if (mismatch) {
    const e = new Error(
      "Hay inscritos que no pertenecen al área del evaluador seleccionado"
    );
    e.status = 403;
    throw e;
  }

  // 3) Determinar fase: intentamos "CLASIFICATORIA"; si no existe, usamos la primera
  let fase = await prisma.fases.findFirst({
    where: { nombre_fase: "CLASIFICATORIA" },
  });

  if (!fase) {
    fase = await prisma.fases.findFirst();
  }

  if (!fase) {
    const e = new Error("No hay fases configuradas en el sistema");
    e.status = 500;
    throw e;
  }

  const idFase = fase.id_fases;

  // 4) Crear / asegurar evaluaciones por inscrito-evaluador-fase
  await prisma.$transaction(
    idsBig.map((idInscrito) =>
      prisma.evaluaciones.upsert({
        where: {
          // @@unique([id_inscrito, id_evaluador, id_fase])
          id_inscrito_id_evaluador_id_fase: {
            id_inscrito: idInscrito,
            id_evaluador: idEvalBig,
            id_fase: idFase,
          },
        },
        update: {
          // si ya existía, no tocamos nota ni observación
        },
        create: {
          id_inscrito: idInscrito,
          id_evaluador: idEvalBig,
          id_fase: idFase,
          nota: null,
          observacion: null,
        },
      })
    )
  );

  return {
    ok: true,
    idEvaluador: Number(idEvaluador),
    cantidadInscritos: idsInscritos.length,
    idFase: Number(idFase),
  };
}

// ==================== DASHBOARD STATS ====================
export async function getInscritosStats() {
  // Total de inscritos
  const [rowInscritos] = await prisma.$queryRaw`
    SELECT COUNT(*)::bigint AS total
    FROM inscritos
  `;

  // Total de clasificados
  const [rowClasificados] = await prisma.$queryRaw`
    SELECT COUNT(*)::bigint AS total
    FROM clasificados
  `;

  return {
    // convertimos BigInt -> Number
    total: Number(rowInscritos?.total ?? 0n),
    clasificados: Number(rowClasificados?.total ?? 0n),
  };
}



