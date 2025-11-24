//import.service,js
import prisma from "../config/prisma.js";
import { parseCsvBuffer } from "../utils/csv.js";
import { parseXlsxBuffer } from "../utils/xlsx.js";
import { buildErrorCsv } from "../utils/errorReport.js";

/** ======= Normalización / utilidades ======= **/

// Canon: lo que la BD espera
const REQUIRED_HEADERS = [
  "nombres_inscrito",
  "apellidos_inscrito",
  "ci_inscrito",
  "area",
  "nivel",
];

// claves equivalentes que suelen venir en los archivos (insensible a acentos/mayús.)
const HEADER_ALIASES = {
  nombres_inscrito: ["nombres", "nombre", "nombres_inscrito"],
  apellidos_inscrito: ["apellidos", "apellido", "apellidos_inscrito"],
  ci_inscrito: ["ci", "dni", "cedula", "carnet", "ci_inscrito"],
  area: ["area", "área"],
  nivel: ["nivel", "grado", "grado_escolaridad", "grado_escolaridad"],
  estado: ["estado"],
  colegio: ["colegio"],
  contacto_tutor: ["contacto_tutor", "telefono_tutor", "cel_tutor"],
  unidad_educativa: ["unidad_educativa", "ue", "unidadeducativa"],
  departamento: ["departamento", "dpto"],
  grado_escolaridad: ["grado_escolaridad", "grado", "nivel_academico"],
  tutor_academico: ["tutor_academico", "tutor_académico", "docente_tutor"],
};

const toKey = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita tildes
    .replace(/\s+/g, "_") // espacios -> _
    .replace(/[^\w]/g, "_"); // otros símbolos -> _

// Normaliza valores de celda para comparaciones (no para headers)
function normVal(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // sin tildes
}
function same(a, b) { return normVal(a) === normVal(b); }

// ¿en headers hay alguna variante de la clave canónica?
function hasHeader(headers, canonical) {
  const norm = headers.map(toKey);
  const candidates = (HEADER_ALIASES[canonical] ?? [canonical]).map(toKey);
  return candidates.some((c) => norm.includes(c));
}

// extrae del row usando aliases
function getFromRow(row, canonical) {
  const candidates = (HEADER_ALIASES[canonical] ?? [canonical]).map(toKey);
  for (const k of Object.keys(row)) {
    if (candidates.includes(toKey(k))) return row[k];
  }
  return undefined;
}

/** ======= Validación por fila ======= **/
function validateRow(row) {
  const errs = [];
  for (const h of ["nombres_inscrito", "apellidos_inscrito", "area", "nivel"]) {
    if (!row[h] || String(row[h]).trim() === "")
      errs.push(`Campo requerido: ${h}`);
  }
  if (
    row.estado &&
    !["ACTIVA", "DESCLASIFICADA"].includes(String(row.estado).toUpperCase())
  ) {
    errs.push("estado inválido (use ACTIVA o DESCLASIFICADA)");
  }
  return errs;
}

/** ======= Helpers de dominio ======= **/
async function ensureArea(nombre) {
  const n = String(nombre).trim();
  const hit = await prisma.area.findUnique({ where: { nombre_area: n } });
  if (hit) return hit.id_area;
  const created = await prisma.area.create({ data: { nombre_area: n } });
  return created.id_area;
}

async function ensureNivel(nombre) {
  const n = String(nombre).trim();
  const hit = await prisma.nivel.findUnique({ where: { nombre_nivel: n } });
  if (hit) return hit.id_nivel;
  const created = await prisma.nivel.create({ data: { nombre_nivel: n } });
  return created.id_nivel;
}

async function findDuplicate(ci) {
  if (!ci) return null;
  return prisma.inscritos.findFirst({
    where: { ci_inscrito: String(ci).trim() },
  });
}

/** ======= Soporte CSV / XLSX ======= **/
async function parseFile(file) {
  const isXlsx =
    file.mimetype?.includes("sheet") || file.originalname.endsWith(".xlsx");
  if (isXlsx) {
    const { rows, headers } = await parseXlsxBuffer(file.buffer);
    return { rows, headers };
  }
  return parseCsvBuffer(file.buffer);
}

/** ======= API pública del servicio ======= **/
export async function previewFile(file) {
  const { rows, headers } = await parseFile(file);

  // valida encabezados de forma robusta
  const missing = REQUIRED_HEADERS.filter((h) => !hasHeader(headers, h));
  if (missing.length)
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);

  const preview = [];
  const errores = [];

  for (let i = 0; i < rows.length; i++) {
    const r = {
      nombres_inscrito: getFromRow(rows[i], "nombres_inscrito"),
      apellidos_inscrito: getFromRow(rows[i], "apellidos_inscrito"),
      ci_inscrito: getFromRow(rows[i], "ci_inscrito"),
      area: getFromRow(rows[i], "area"),
      nivel: getFromRow(rows[i], "nivel"),
      estado: getFromRow(rows[i], "estado") ?? "ACTIVA",
      colegio: getFromRow(rows[i], "colegio"),
      contacto_tutor: getFromRow(rows[i], "contacto_tutor"),
      unidad_educativa: getFromRow(rows[i], "unidad_educativa"),
      departamento: getFromRow(rows[i], "departamento"),
      grado_escolaridad: getFromRow(rows[i], "grado_escolaridad"),
      tutor_academico: getFromRow(rows[i], "tutor_academico"),
    };

    const rowErrs = validateRow(r);
    if (rowErrs.length)
      errores.push({ fila: i + 2, errores: rowErrs.join(" | ") });
    if (preview.length < 20) preview.push(r);
  }
  return { total: rows.length, preview, errores };
}

export async function runImport({
  file,
  fileName,
  coordinatorId,
  onlyValid,
  duplicatePolicy,
  areaFilter,      // ⬅️ nuevo
  nivelFilter,     // ⬅️ nuevo
  selectedCis,     // ⬅️ nuevo (array de CI, opcional)
}) {
  const { rows, headers } = await parseFile(file);

  const missing = REQUIRED_HEADERS.filter((h) => !hasHeader(headers, h));
  if (missing.length)
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);

  if (!coordinatorId || Number.isNaN(Number(coordinatorId))) {
    throw new Error("Falta id_coordinador (auth stub/login)");
  }

  // 1) Mapear TODO a formato canónico (aún sin insertar)
  const canon = rows.map((r) => ({
    nombres_inscrito: getFromRow(r, "nombres_inscrito"),
    apellidos_inscrito: getFromRow(r, "apellidos_inscrito"),
    ci_inscrito: getFromRow(r, "ci_inscrito"),
    area: getFromRow(r, "area"),
    nivel: getFromRow(r, "nivel"),
    estado: getFromRow(r, "estado") ?? "ACTIVA",

    // extras
    colegio: getFromRow(r, "colegio"),
    contacto_tutor: getFromRow(r, "contacto_tutor"),
    unidad_educativa: getFromRow(r, "unidad_educativa"),
    departamento: getFromRow(r, "departamento"),
    grado_escolaridad: getFromRow(r, "grado_escolaridad"),
    tutor_academico: getFromRow(r, "tutor_academico"),
  }));

  // 2) Aplicar filtros que vienen de la UI
  let filtered = canon;
  if (areaFilter)  filtered = filtered.filter((r) => same(r.area, areaFilter));
  if (nivelFilter) filtered = filtered.filter((r) => same(r.nivel, nivelFilter));

  if (Array.isArray(selectedCis) && selectedCis.length) {
    const set = new Set(selectedCis.map((x) => String(x).trim()));
    filtered = filtered.filter(
      (r) => r.ci_inscrito && set.has(String(r.ci_inscrito).trim())
    );
  }

  if (filtered.length === 0) {
    return {
      id_import: null,
      total: canon.length,
      importados: 0,
      errores: 0,
      filtered: 0,
    };
  }

  // 3) Crear registro de importación
  const imp = await prisma.importaciones.create({
    data: {
      id_coordinador: Number(coordinatorId),
      nombre_archivo: fileName,
      total_registro: 0,
      total_ok: 0,
      total_error: 0,
    },
  });

  // 4) Validar + insertar SOLO lo filtrado
  let ok = 0;
  const errores = [];

  for (let i = 0; i < filtered.length; i++) {
    const r = filtered[i];
    const filaNum = i + 2;

    const rowErrs = validateRow(r);
    if (rowErrs.length && onlyValid) {
      errores.push({ fila: filaNum, error: rowErrs.join(" | ") });
      continue;
    }

    try {
      const id_area = await ensureArea(r.area);
      const id_nivel = await ensureNivel(r.nivel);
      const estado = String(r.estado || "ACTIVA").toUpperCase();

      const dup = await findDuplicate(r.ci_inscrito);
      if (dup) {
        if (duplicatePolicy === "omit") {
          errores.push({
            fila: filaNum,
            error: `Duplicado (CI ya existe): ${r.ci_inscrito}`,
          });
          continue;
        }
        if (duplicatePolicy === "update") {
          await prisma.inscritos.update({
            where: { id_inscritos: dup.id_inscritos },
            data: {
              nombres_inscrito: r.nombres_inscrito,
              apellidos_inscrito: r.apellidos_inscrito,
              id_area,
              id_nivel,
              estado,
              colegio: r.colegio ?? dup.colegio,
              contacto_tutor: r.contacto_tutor ?? dup.contacto_tutor,
              unidad_educativa: r.unidad_educativa ?? dup.unidad_educativa,
              departamento: r.departamento ?? dup.departamento,
              grado_escolaridad: r.grado_escolaridad ?? dup.grado_escolaridad,
              tutor_academico: r.tutor_academico ?? dup.tutor_academico,
            },
          });
          ok++;
          continue;
        }
        // "duplicate" => crear nuevo registro
      }

      await prisma.inscritos.create({
        data: {
          nombres_inscrito: r.nombres_inscrito,
          apellidos_inscrito: r.apellidos_inscrito,
          ci_inscrito: r.ci_inscrito ?? null,
          id_area,
          id_nivel,
          estado,
          colegio: r.colegio ?? null,
          contacto_tutor: r.contacto_tutor ?? null,
          unidad_educativa: r.unidad_educativa ?? null,
          departamento: r.departamento ?? null,
          grado_escolaridad: r.grado_escolaridad ?? null,
          tutor_academico: r.tutor_academico ?? null,
          id_import: imp.id_import,
        },
      });
      ok++;
    } catch (e) {
      errores.push({ fila: filaNum, error: e.message });
    }
  }

  // 5) Guardar resumen
  const csvErrores = buildErrorCsv(errores);
  await prisma.importaciones.update({
    where: { id_import: imp.id_import },
    data: {
      total_registro: canon.length,   // total leídas del archivo
      total_ok: ok,
      total_error: errores.length,
      detalle_errores: csvErrores,
    },
  });

  return {
    id_import: imp.id_import,
    total: canon.length,
    filtered: filtered.length, // cuántas intentaste importar (tras filtros)
    importados: ok,
    errores: errores.length,
  };
}

export async function getErrorReportFile(idImport) {
  const imp = await prisma.importaciones.findUnique({
    where: { id_import: idImport },
  });
  return imp?.detalle_errores ?? null;
}
