import ExcelJS from 'exceljs';

/**
 * Lee un buffer .xlsx y devuelve { rows, headers }
 * - Sólo mapea encabezados conocidos (evita prototype pollution)
 * - Lee la PRIMERA hoja del Excel
 */
export async function parseXlsxBuffer(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], headers: [] };

  const headerRow = ws.getRow(1);
  const headers = headerRow.values
    .slice(1) // ExcelJS indexa desde 1
    .map(h => String(h || '').trim());

  const rows = [];
  const MAX_ROWS = 10000; // límite sano para HU07
  const lastRow = Math.min(ws.actualRowCount, MAX_ROWS);

  for (let r = 2; r <= lastRow; r++) {
    const row = ws.getRow(r);
    if (!row || row.cellCount === 0) continue;

    const obj = {};
    headers.forEach((h, i) => {
      const val = row.getCell(i + 1).value;
      obj[h] = (val && typeof val === 'object' && 'text' in val) ? val.text : (val ?? '');
    });

    // descarta filas completamente vacías
    const hasData = Object.values(obj).some(v => String(v).trim() !== '');
    if (hasData) rows.push(obj);
  }

  return { rows, headers };
}
