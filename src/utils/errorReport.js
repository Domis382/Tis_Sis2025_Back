export function buildErrorCsv(rows) {
  if (!rows?.length) return '';
  const header = 'fila,error';
  const lines = rows.map(r => `${r.fila},"${(r.error || '').replace(/"/g,'""')}"`);
  return [header, ...lines].join('\n');
}
