import * as clasificadosRepo from "../repositories/clasificados.repository.js";

export async function createOrUpdateClasificados(rows) {
  const results = [];

  for (const r of rows) {
    const record = await clasificadosRepo.upsertClasificado(r);
    results.push(record);
  }

  return results;
}

export async function getAllClasificados() {
  return await clasificadosRepo.findAllClasificados();
}
