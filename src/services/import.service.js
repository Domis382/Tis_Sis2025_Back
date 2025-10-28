import prisma from "../config/prisma.js";
import { parseCsvBuffer } from "../utils/csv.js";
import { parseXlsxBuffer } from "../utils/xlsx.js";
import { buildErrorCsv } from "../utils/errorReport.js";

const REQUIRED_HEADERS = [
  "nombres_inscrito",
  "apellidos_inscrito",
  "ci_inscrito",
  "area",
  "nivel",
  "estado",
];

const normalize = (headers) => headers.map((h) => String(h).trim());

function validateRow(row) {
  const errs = [];
  for (const h of ["nombres_inscrito", "apellidos_inscrito", "area", "nivel"]) {
    if (!row[h] || String(row[h]).trim() === "")
      errs.push(`Campo requerido: ${h}`);
  }
  if (
    row.estado &&
    !["ACTIVA", "DESCLASIFICADA"].includes(String(row.estado).toUpperCase())
  )
    errs.push("estado inválido (use ACTIVA o DESCLASIFICADA)");
  return errs;
}

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

async function parseFile(file) {
  const isXlsx =
    file.mimetype?.includes("sheet") || file.originalname.endsWith(".xlsx");
  if (isXlsx) {
    const { rows, headers } = await parseXlsxBuffer(file.buffer);
    return { rows, headers };
  }
  // CSV
  return parseCsvBuffer(file.buffer);
}

export async function previewFile(file) {
  const { rows, headers } = await parseFile(file);
  const norm = normalize(headers);
  const missing = REQUIRED_HEADERS.filter((h) => !norm.includes(h));
  if (missing.length)
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);

  const preview = [];
  const errores = [];
  for (let i = 0; i < rows.length; i++) {
    const r = {};
    // tolera mayúsc/minúsc en headers
    for (const h of REQUIRED_HEADERS)
      r[h] = rows[i][h] ?? rows[i][h.toLowerCase()];
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
}) {
  const { rows, headers } = await parseFile(file);
  const norm = normalize(headers);
  const missing = REQUIRED_HEADERS.filter((h) => !norm.includes(h));
  if (missing.length)
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);

  // crear registro import
  const imp = await prisma.importaciones.create({
    data: {
      id_coordinador: coordinatorId,
      nombre_archivo: fileName,
      total_registro: 0,
      total_ok: 0,
      total_error: 0,
    },
  });

  let ok = 0;
  const errores = [];

  for (let i = 0; i < rows.length; i++) {
    const filaNum = i + 2;
    const src = rows[i];
    const r = {};
    for (const h of REQUIRED_HEADERS) r[h] = src[h] ?? src[h.toLowerCase()];
    const rowErrs = validateRow(r);

    if (rowErrs.length && onlyValid) {
      errores.push({ fila: filaNum, error: rowErrs.join(" | ") });
      continue;
    }

    try {
      const id_area = await ensureArea(r.area);
      const id_nivel = await ensureNivel(r.nivel);
      const estado = r.estado ? String(r.estado).toUpperCase() : "ACTIVA";

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
            },
          });
          ok++;
          continue;
        }
        // 'duplicate' -> crea nuevo registro con mismo CI
      }

      await prisma.inscritos.create({
        data: {
          nombres_inscrito: r.nombres_inscrito,
          apellidos_inscrito: r.apellidos_inscrito,
          ci_inscrito: r.ci_inscrito ?? null,
          id_area,
          id_nivel,
          estado,
          id_import: imp.id_import, // útil para rollback futuro
        },
      });
      ok++;
    } catch (e) {
      errores.push({ fila: filaNum, error: e.message });
    }
  }

  const csvErrores = buildErrorCsv(errores);
  await prisma.importaciones.update({
    where: { id_import: imp.id_import },
    data: {
      total_registro: rows.length,
      total_ok: ok,
      total_error: errores.length,
      detalle_errores: csvErrores,
    },
  });

  return {
    id_import: imp.id_import,
    total: rows.length,
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
