import { parse } from 'csv-parse/sync';

export async function parseCsvBuffer(buffer) {
  const text = buffer.toString('utf-8');
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const headers = records.length ? Object.keys(records[0]) : [];
  return { rows: records, headers };
}
