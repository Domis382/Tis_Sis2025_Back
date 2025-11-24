const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export async function importInscritosCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/inscritos/import`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Error HTTP ${res.status}`);
  }
  return res.json(); // esperado: { ok:true, data:{ id_import, total, importados, errores } }
}

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`);
  if (!res.ok) throw new Error("No se pudieron cargar stats");
  return res.json(); // por ej: { ok:true, data:{ total, clasificados, reportes } }
}
