// src/repositories/evaluacion.repository.js
import prisma from "../config/prisma.js";

// === util para ubicar delegates ===
function pickModel(modelDesc, candidates) {
  for (const name of candidates) {
    const delegate = prisma?.[name];
    if (delegate && typeof delegate === "object") {
      return delegate;
    }
  }
  const tried = candidates.join(", ");
  const err = new Error(`Modelo Prisma no encontrado: ${modelDesc}. Probados: ${tried}.
Revisa schema.prisma y agrega el nombre exacto a esta lista.`);
  err.status = 500;
  throw err;
}


const Evaluacion = () =>
  pickModel("evaluaciones", ["evaluaciones", "Evaluaciones", "evaluacion", "Evaluacion"]);

const Inscrito = () =>
  pickModel("inscritos", ["inscritos", "Inscritos", "inscrito", "Inscrito"]);

const Evaluador = () =>
  pickModel("evaluador", ["evaluador", "Evaluador"]);

const Auditoria = () =>
  // Usamos el modelo auditoria que YA existe en Prisma
  pickModel("auditoria", ["auditoria"]);

// === usuario -> evaluador ===
export async function findEvaluadorByUsuario(id_usuario) {
  if (id_usuario === null || id_usuario === undefined) return null;
  return Evaluador().findFirst({
    where: { id_usuario: BigInt(id_usuario) },
    select: { id_evaluador: true, id_area: true },
  });
}

// === listado principal con filtros ===
export async function findResultadosClasificatoria({
  idFase = null,
  idNivel = null,
  estado = null,
  search = null,
  idEvaluador = null,
}) {
  // filtro de evaluacion (por evaluador/fase)
  const whereEval = {};
  if (idEvaluador) whereEval.id_evaluador = BigInt(idEvaluador);
  if (idFase) whereEval.id_fase = BigInt(idFase);

  // buscar área del evaluador (para cruzar con inscritos)
  let areaEvaluador = null;
  if (idEvaluador) {
    const evInfo = await Evaluador().findFirst({
      where: { id_evaluador: BigInt(idEvaluador) },
      select: { id_area: true },
    });
    areaEvaluador = evInfo ? Number(evInfo.id_area) : null;
  }

  // traer evaluaciones
  const evals = await Evaluacion().findMany({
    where: whereEval,
    select: {
      id_evaluacion: true,
      id_inscrito: true,
      id_evaluador: true,
      id_fase: true,
      nota: true,
      observacion: true,
    },
    orderBy: [{ id_evaluacion: "asc" }],
  });

  if (!evals.length) return [];

  // IDs de inscritos presentes en esas evaluaciones
  const idsInscritos = Array.from(
    new Set(evals.map((e) => Number(e.id_inscrito)).filter(Number.isFinite))
  );

  // filtro de inscritos: por conjunto y área del evaluador
  const whereIns = { id_inscritos: { in: idsInscritos.map((n) => BigInt(n)) } };
  if (areaEvaluador) whereIns.id_area = BigInt(areaEvaluador);

  if (idNivel) whereIns.id_nivel = BigInt(String(idNivel));
  if (estado) whereIns.estado = estado;

  if (search) {
    whereIns.OR = [
      { ci_inscrito: { contains: search, mode: "insensitive" } },
      { nombres_inscrito: { contains: search, mode: "insensitive" } },
      { apellidos_inscrito: { contains: search, mode: "insensitive" } },
      { unidad_educativa: { contains: search, mode: "insensitive" } },
    ];
  }

  // traer inscritos filtrados
  const insRows = await Inscrito().findMany({
    where: whereIns,
    select: {
      id_inscritos: true,
      ci_inscrito: true,
      nombres_inscrito: true,
      apellidos_inscrito: true,
      unidad_educativa: true,
      id_nivel: true,
      id_area: true,
      estado: true,
      area: {               // <-- incluye la relación
        select: { nombre_area: true }
      }
    },
  });

  const insMap = new Map(insRows.map((r) => [Number(r.id_inscritos), r]));

  // merge
  const merged = [];
  for (const ev of evals) {
    const idIns = Number(ev.id_inscrito);
    const ins = insMap.get(idIns);
    if (!ins) continue; // fuera por filtros

    merged.push({
      id_evaluacion: Number(ev.id_evaluacion),
      id_inscrito: idIns,
      nota: ev.nota, // ojo: Decimal? (Prisma.Decimal). El front lo usa como string/number y funciona.
      observacion: ev.observacion ?? "",
      competidor: `${(ins.nombres_inscrito ?? "").trim()} ${(ins.apellidos_inscrito ?? "").trim()}`.trim(),
      ci_inscrito: ins.ci_inscrito,
      nivel: Number(ins.id_nivel),
      area: Number(ins.id_area),
      area_nombre: ins.area?.nombre_area || null, // nuevo campo con el nombre
      estado: ins.estado,
    });
  }

  return merged;
}

// === historial (desde `auditoria`) ===
export async function getHistorialEvaluaciones({ idEvaluador = null }) {
  // 1) leemos auditoría para la entidad evaluaciones
  const whereAudit = { entidad: "evaluaciones" };
  if (idEvaluador) {
    whereAudit.id_actor = BigInt(idEvaluador);
  }

  const rows = await Auditoria().findMany({
    where: whereAudit,
    orderBy: [{ fecha_hora: "desc" }],
    select: {
      id_auditoria: true,
      fecha_hora: true,
      actor_tipo: true,
      id_actor: true,
      accion: true,
      entidad: true,
      id_entidad: true,
      valor_anterior: true,
      valor_nuevo: true,
    },
  });

  if (!rows.length) return [];

  // 2) mapear eval -> inscrito
  const evalIds = Array.from(new Set(rows.map(r => Number(r.id_entidad)).filter(Boolean)));
  const evals = await Evaluacion().findMany({
    where: { id_evaluacion: { in: evalIds.map(n => BigInt(n)) } },
    select: { id_evaluacion: true, id_inscrito: true },
  });
  const evalToIns = new Map(evals.map(e => [Number(e.id_evaluacion), Number(e.id_inscrito)]));

  const insIds = Array.from(new Set(evals.map(e => Number(e.id_inscrito)).filter(Boolean)));
  const inscritos = await Inscrito().findMany({
    where: { id_inscritos: { in: insIds.map(n => BigInt(n)) } },
    select: { id_inscritos: true, nombres_inscrito: true, apellidos_inscrito: true },
  });
  const insMap = new Map(inscritos.map(i => [Number(i.id_inscritos), i]));

  // 3) enriquecer con competidor + mapeo de campo para UI
  return rows.map(r => {
    const idEval = Number(r.id_entidad);
    const idIns = evalToIns.get(idEval);
    const ins = idIns ? insMap.get(idIns) : null;
    const competidor = ins
      ? `${(ins.nombres_inscrito ?? "").trim()} ${(ins.apellidos_inscrito ?? "").trim()}`.trim()
      : "";

    const isNota = r.accion === "UPDATE_NOTA";
    const isObs  = r.accion === "UPDATE_OBSERVACION";

    return {
      id_auditoria: Number(r.id_auditoria),
      id_evaluacion: idEval,
      id_evaluador: Number(r.id_actor ?? 0),
      campo: isNota ? "nota" : (isObs ? "observacion" : r.accion),
      anterior: r.valor_anterior,
      nuevo: r.valor_nuevo,
      fecha: r.fecha_hora,
      competidor,
    };
  });
}

// === helpers de validación/updates ===
export async function countEvaluacionesPropias({ idEvaluador, ids }) {
  if (!ids?.length) return 0;
  return Evaluacion().count({
    where: {
      id_evaluacion: { in: ids.map((x) => BigInt(x)) },
      id_evaluador: BigInt(idEvaluador),
    },
  });
}

export async function isEvaluacionPropia({ idEvaluador, id_evaluacion }) {
  const ev = await Evaluacion().findFirst({
    where: {
      id_evaluacion: BigInt(id_evaluacion),
      id_evaluador: BigInt(idEvaluador),
    },
    select: { id_evaluacion: true },
  });
  return !!ev;
}

export async function updateNotasBatch({ cambios }) {
  let updated = 0;
  for (const c of cambios) {
    const id = Number(c.id_evaluacion);
    if (!id) continue;
    await updateNotaIndividual({
      id_evaluacion: id,
      datos: { nota: c.nota, observacion: c.observacion },
    });
    updated++;
  }
  return { updated, message: `Se actualizaron ${updated} registros` };
}

export async function updateNotaIndividual({ id_evaluacion, datos }) {
  // 1) Traer valores previos
  const before = await Evaluacion().findUnique({
    where: { id_evaluacion: BigInt(id_evaluacion) },
    select: { id_evaluacion: true, id_inscrito: true, id_evaluador: true, nota: true, observacion: true },
  });
  if (!before) throw new Error(`Evaluación ${id_evaluacion} no encontrada`);

  // 2) Preparar set
  const set = {};
  if (datos?.hasOwnProperty("nota")) {
    const n = parseFloat(datos.nota);
    set.nota = Number.isNaN(n) ? null : n;
  }
  if (datos?.hasOwnProperty("observacion")) {
    set.observacion = (datos.observacion ?? "").toString();
  }

  // 3) Actualizar
  const after = await Evaluacion().update({
    where: { id_evaluacion: BigInt(id_evaluacion) },
    data: set,
    select: {
      id_evaluacion: true,
      id_inscrito: true,
      id_evaluador: true,
      nota: true,
      observacion: true,
    },
  });

  // 4) Escribir auditoría en `auditoria`
  const auditRows = [];
  const evalId = Number(after.id_evaluacion);
  const evalActor = after.id_evaluador ? Number(after.id_evaluador) : null;

  if (set.hasOwnProperty("nota") && String(before.nota ?? "") !== String(after.nota ?? "")) {
    auditRows.push({
      fecha_hora: new Date(),
      actor_tipo: "EVALUADOR",
      id_actor: evalActor ? BigInt(evalActor) : null,
      accion: "UPDATE_NOTA",
      entidad: "evaluaciones",
      id_entidad: BigInt(evalId),
      valor_anterior: before.nota == null ? null : String(before.nota),
      valor_nuevo: after.nota == null ? null : String(after.nota),
      resultado: "OK",
      motivo_error: null,
    });
  }
  if (set.hasOwnProperty("observacion") && (before.observacion ?? "") !== (after.observacion ?? "")) {
    auditRows.push({
      fecha_hora: new Date(),
      actor_tipo: "EVALUADOR",
      id_actor: evalActor ? BigInt(evalActor) : null,
      accion: "UPDATE_OBSERVACION",
      entidad: "evaluaciones",
      id_entidad: BigInt(evalId),
      valor_anterior: before.observacion ?? null,
      valor_nuevo: after.observacion ?? null,
      resultado: "OK",
      motivo_error: null,
    });
  }

  if (auditRows.length) {
    await Auditoria().createMany({ data: auditRows, skipDuplicates: true });
  }

  // 5) Respuesta
  return {
    id_evaluacion: evalId,
    id_inscrito: Number(after.id_inscrito),
    id_evaluador: Number(after.id_evaluador),
    nota: after.nota,
    observacion: after.observacion ?? "",
  };
}
