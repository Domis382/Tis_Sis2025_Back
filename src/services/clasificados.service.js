// src/services/clasificados.service.js
import * as clasificadosRepo from "../repositories/clasificados.repository.js";

// rows viene del front como:
// [{ id_inscrito, competidor, estadoTexto, fase }, ...]
export async function createOrUpdateClasificados(rows) {
  const results = [];

  for (const r of rows) {
    try {
      // Solo aceptamos filas con id_inscrito válido
      if (!r.id_inscrito) {
        console.warn("Fila sin id_inscrito, se ignora:", r);
        continue;
      }

      const estado =
        r.estadoTexto === "Clasificado" ? "CLASIFICADO" : "NO_CLASIFICADO";

      const record = await clasificadosRepo.upsertClasificado({
        id_inscrito: r.id_inscrito,
        id_fase: r.fase ?? 2,
        estado,
      });

      results.push(record);
    } catch (err) {
      console.error("Error procesando fila de clasificados:", r, err);
    }
  }

  return results;
}

export async function getAllClasificados() {
  return clasificadosRepo.findAllClasificados();
}
