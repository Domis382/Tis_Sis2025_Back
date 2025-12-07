// src/services/medallero.service.js - VERSIÓN CORREGIDA
import { upsertMedalla } from "../repositories/medallero.repository.js";
import prisma from "../config/prisma.js"; // ← IMPORTACIÓN NECESARIA

export async function publicarMedallero(rows) {
  try {
    // 1️⃣ BORRAR TODOS LOS REGISTROS EXISTENTES
    console.log("🗑️  Borrando medallero anterior...");
    const borrados = await prisma.medallas_clasificados.deleteMany({});
    console.log(`✅ Borrados ${borrados.count} registros anteriores del medallero`);
  } catch (error) {
    console.error("❌ Error al borrar medallero anterior:", error);
    throw new Error(`No se pudo limpiar el medallero anterior: ${error.message}`);
  }

  const resultados = [];
  const errores = [];

  // 2️⃣ INSERTAR NUEVOS REGISTROS
  console.log(`📥 Insertando ${rows.length} nuevos registros...`);
  
  for (const r of rows) {
    try {
      const med = await upsertMedalla(r);
      resultados.push(med);
    } catch (err) {
      console.error("❌ Error procesando fila medallero:", r, err);
      errores.push({ fila: r, error: err.message });
    }
  }

  // 3️⃣ VERIFICAR RESULTADOS
  console.log(`📊 Resultado: ${resultados.length} insertados, ${errores.length} errores`);

  if (!resultados.length) {
    const msg =
      "Ninguna fila pudo guardarse. Errores: " +
      errores.map((e) => e.error).join(" | ");
    const error = new Error(msg);
    error.detalle = errores;
    throw error;
  }

  // Devolvemos ambos para que el controller los use
  return { resultados, errores };
}