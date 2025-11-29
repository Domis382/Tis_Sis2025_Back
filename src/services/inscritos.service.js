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
 *  - puede traer id_area (del coordinador) -> filtramos por esa área por defecto
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

  // Área: si no viene por query, usamos la del coordinador (si existe)
  const areaId = area || user?.id_area;
  if (areaId) {
    where.id_area = BigInt(areaId);
  }

  if (nivel) {
    where.id_nivel = BigInt(nivel);
  }

  if (estado) {
    // Debe coincidir con tu enum estado_inscripcion_t (ACTIVA, DESCLASIFICADA, etc.)
    where.estado = estado;
  }

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

  if (soloSinEvaluador === "1" || soloSinEvaluador === "true") {
    // Solo inscritos que aún no tienen NINGUNA evaluación registrada
    where.evaluaciones = { none: {} };
  }

  const filas = await prisma.inscritos.findMany({
    where,
    include: {
      area: true,
      nivel: true,
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
      { id_nivel: "asc" },
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
      evaluadorNombre = `${ev.nombre_evaluado} ${ev.apellidos_evaluador}`.trim();
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
      id_nivel: Number(row.id_nivel),
      nivel: row.nivel?.nombre_nivel ?? null,
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
  user = null
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

  // 1) Verificar evaluador
  const evaluador = await prisma.evaluador.findUnique({
    where: { id_evaluador: idEvalBig },
  });

  if (!evaluador) {
    const e = new Error("Evaluador no encontrado");
    e.status = 404;
    throw e;
  }

  // 2) Si el coordinador tiene área, no puede asignar a evaluadores de otra área
  if (user?.id_area) {
    if (Number(evaluador.id_area) !== Number(user.id_area)) {
      const e = new Error(
        "No puedes asignar inscritos a un evaluador de otra área"
      );
      e.status = 403;
      throw e;
    }
  }

  // 3) Buscar inscritos
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

  // Si el coordinador tiene área, validar que todos los inscritos sean de su área
  if (user?.id_area) {
    const mismatch = inscritos.find(
      (i) => Number(i.id_area) !== Number(user.id_area)
    );
    if (mismatch) {
      const e = new Error(
        "Hay inscritos que no pertenecen al área del coordinador"
      );
      e.status = 403;
      throw e;
    }
  }

  // 4) Determinar fase: intentamos "CLASIFICATORIA"; si no existe, usamos la primera
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

  // 5) Crear / asegurar evaluaciones por inscrito-evaluador-fase
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
