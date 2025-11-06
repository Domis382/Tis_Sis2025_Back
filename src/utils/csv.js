// src/utils/csv.js
import { parse } from 'csv-parse/sync';

export function parseCsvBuffer(buffer) {
  const text = buffer.toString('utf8');

  // Detecta delimitador: si solo hay ';' en la primera línea, usa ';', si no, ','
  const firstLine = (text.split(/\r?\n/)[0] ?? '');
  const delimiter = (firstLine.includes(';') && !firstLine.includes(',')) ? ';' : ',';

  const records = parse(text, {
    columns: true,        // usa la primera fila como encabezados
    bom: true,            // elimina BOM que agrega Excel
    skip_empty_lines: true,
    trim: true,
    delimiter,
  });

  const headers = Object.keys(records[0] ?? {});
  return { rows: records, headers };
}
