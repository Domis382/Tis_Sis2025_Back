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
    estado,          // puede ser "FINALISTA" (virtual)
    search,
    soloSinEvaluador,
  } = filtros;

  const where = {};

  // Área (opcional)
  if (area) where.id_area = BigInt(area);

  // Nivel (en tu BD es 'grado_escolaridad')
  if (nivel) where.grado_escolaridad = nivel;

  // Búsqueda por texto
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { nombres_inscrito:  { contains: s, mode: "insensitive" } },
      { apellidos_inscrito:{ contains: s, mode: "insensitive" } },
      { ci_inscrito:       { contains: s, mode: "insensitive" } },
      { colegio:           { contains: s, mode: "insensitive" } },
      { unidad_educativa:  { contains: s, mode: "insensitive" } },
    ];
  }

  // Filtro virtual FINALISTA: NO tocamos el enum; usamos la tabla 'clasificados'
  if (estado === "FINALISTA") {
    const finalistas = await prisma.clasificados.findMany({
      where: { estado: "CLASIFICADO" },
      select: { id_inscrito: true },
    });
    const keepIds = finalistas.map(x => x.id_inscrito);
    if (!keepIds.length) return [];
    where.id_inscritos = { in: keepIds };
  } else if (estado) {
    // Estados reales del enum (ACTIVA, PENDIENTE, ASIGNADO, etc.)
    where.estado = estado;
  }

  // Solo sin evaluador
  if (soloSinEvaluador === "1" || soloSinEvaluador === "true" || soloSinEvaluador === true) {
    where.evaluaciones = { none: {} };
  }

  // Consulta principal
  const filas = await prisma.inscritos.findMany({
    where,
    include: {
      area: true,
      evaluaciones: {
        include: {
          evaluador: { include: { usuario: true } },
        },
      },
    },
    orderBy: [
      { id_area: "asc" },
      { apellidos_inscrito: "asc" },
      { nombres_inscrito: "asc" },
    ],
  });

  // Set de finalistas (virtual), para marcar en la UI sin tocar el enum
  const finalistasAll = await prisma.clasificados.findMany({
    where: { estado: "CLASIFICADO" },
    select: { id_inscrito: true },
  });
  const setFinalistas = new Set(finalistasAll.map(x => String(x.id_inscrito)));

  // Aplanar para el front
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
      estado: row.estado,                 // enum real (no se toca)
      finalista: setFinalistas.has(String(row.id_inscritos)), // 👈 virtual
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
  user = null,
  idFase = null,
  useFaseFinal = false,
  replaceExisting = false,
  exclusive = false // 👈 NUEVO
) {
  if (!idEvaluador) { const e = new Error("idEvaluador es obligatorio"); e.status = 400; throw e; }
  if (!Array.isArray(idsInscritos) || idsInscritos.length === 0) {
    const e = new Error("idsInscritos debe ser un arreglo no vacío"); e.status = 400; throw e;
  }

  const idEvalBig = BigInt(idEvaluador);

  // 1) Resolver fase destino
  let fase = null;
  if (idFase) {
    fase = await prisma.fases.findUnique({ where: { id_fases: BigInt(idFase) } });
  } else if (useFaseFinal) {
    fase = await prisma.fases.findFirst({ where: { fase_final: true } });
  } else {
    fase = await prisma.fases.findFirst({ where: { nombre_fase: "CLASIFICATORIA" } })
        || await prisma.fases.findFirst();
  }
  if (!fase) { const e = new Error("No hay fases configuradas en el sistema"); e.status = 500; throw e; }
  const idFaseDestino = fase.id_fases;

  // 2) Verificar evaluador
  const evaluador = await prisma.evaluador.findUnique({
    where: { id_evaluador: idEvalBig },
    include: { area: true },
  });
  if (!evaluador) { const e = new Error("Evaluador no encontrado"); e.status = 404; throw e; }

  // 3) Buscar inscritos y validar área
  const idsBig = idsInscritos.map((id) => BigInt(id));
  const inscritos = await prisma.inscritos.findMany({
    where: { id_inscritos: { in: idsBig } },
    select: { id_inscritos: true, id_area: true },
  });
  if (!inscritos.length) { const e = new Error("Ningún inscrito encontrado con esos IDs"); e.status = 404; throw e; }

  const mismatch = inscritos.find((i) => Number(i.id_area) !== Number(evaluador.id_area));
  if (mismatch) { const e = new Error("Hay inscritos que no pertenecen al área del evaluador seleccionado"); e.status = 403; throw e; }

  // 4) Limpieza previa
  if (replaceExisting) {
    // 4.1) Si exclusive=true, deja SOLO los que vienen en la nueva lista: borra todo lo demás del evaluador
    if (exclusive) {
      await prisma.evaluaciones.deleteMany({
        where: {
          id_evaluador: idEvalBig,
          id_inscrito: { notIn: idsBig }, // 👈 borra NO-finalistas
        },
      });
    }
    // 4.2) Limpia también los actuales para los finalistas (evita arrastrar notas antiguas)
    await prisma.evaluaciones.deleteMany({
      where: {
        id_evaluador: idEvalBig,
        id_inscrito: { in: idsBig },
      },
    });
  }

  // 5) Crear / asegurar evaluaciones (si por constraint existiera, asegura limpiar)
  await prisma.$transaction(
    idsBig.map((idInscrito) =>
      prisma.evaluaciones.upsert({
        where: {
          id_inscrito_id_evaluador_id_fase: {
            id_inscrito: idInscrito,
            id_evaluador: idEvalBig,
            id_fase: idFaseDestino,
          },
        },
        update: {
          nota: null,
          observacion: null,
        },
        create: {
          id_inscrito: idInscrito,
          id_evaluador: idEvalBig,
          id_fase: idFaseDestino,
          nota: null,
          observacion: null,
        },
      })
    )
  );

  return {
    ok: true,
    idEvaluador: Number(idEvaluador),
    idFase: Number(idFaseDestino),
    totalInscritos: idsBig.length,
    replaceExisting,
    exclusive
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

