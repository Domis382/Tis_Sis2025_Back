// src/services/clasificados.service.js
import * as clasificadosRepo from "../repositories/clasificados.repository.js";
import prisma from "../config/prisma.js";
import * as fasesRepo from "../repositories/fases.repository.js";
import * as evalRepo from "../repositories/evaluacion.repository.js";
// Función para obtener todos los clasificados con datos de inscritos
export async function getAllClasificados() {
  try {
    console.log(" getAllClasificados: Obteniendo clasificados con inscritos...");
    
    // Usar la función del repositorio que hace el JOIN con inscritos
    const clasificados = await clasificadosRepo.findAllClasificados();
    
    console.log(` getAllClasificados: Encontrados ${clasificados.length} clasificados`);
    
    return clasificados;
  } catch (error) {
    console.error(" Error en getAllClasificados:", error);
    throw new Error(`No se pudieron obtener los clasificados: ${error.message}`);
  }
}

// Función para crear o actualizar clasificados
export async function createOrUpdateClasificados(rows) {
  // Primero, detectar y manejar duplicados en el MISMO Excel
  const uniqueRows = [];
  const duplicadosEncontrados = [];
  const procesados = new Set();
  
  rows.forEach((r, index) => {
    const clave = `${r.id_inscrito}-${r.fase ?? 2}`;
    if (procesados.has(clave)) {
      console.warn(` Duplicado en Excel: Fila ${index + 1}, Inscrito ${r.id_inscrito}, Fase ${r.fase}`);
      duplicadosEncontrados.push({
        fila: index + 1,
        inscrito: r.id_inscrito,
        competidor: r.competidor,
        fase: r.fase
      });
    } else {
      procesados.add(clave);
      uniqueRows.push(r);
    }
  });
  
  console.log(` Duplicados en Excel: ${duplicadosEncontrados.length}`);
  console.log(` Filas únicas a procesar: ${uniqueRows.length}`);
  
  if (duplicadosEncontrados.length > 0) {
    console.warn(" Lista de duplicados:", duplicadosEncontrados);
  }

  try {
    console.log("createOrUpdateClasificados: Borrando clasificados anteriores...");
    
    // Borrar TODOS los clasificados existentes
    const borrados = await prisma.clasificados.deleteMany({});
    console.log(` Borrados ${borrados.count} registros anteriores de clasificados`);
  } catch (error) {
    console.error(" Error al borrar clasificados anteriores:", error);
    throw new Error(`No se pudo limpiar los clasificados anteriores: ${error.message}`);
  }

  const results = [];
  const errores = [];

  //  Procesar solo las filas ÚNICAS
  for (const [index, r] of uniqueRows.entries()) {
    try {
      if (!r.id_inscrito) {
        console.warn(` Fila ${index + 1} sin id_inscrito, se ignora:`, r);
        errores.push(`Fila ${index + 1}: Sin id_inscrito`);
        continue;
      }

      // IMPORTANTE: Cambia esto si la PK es id_inscritos
      const inscritoExiste = await prisma.inscritos.findUnique({
        where: { id_inscritos: Number(r.id_inscrito) }  // ← ¡CORREGIDO!
      });

      if (!inscritoExiste) {
        console.warn(` Fila ${index + 1}: Inscrito con ID ${r.id_inscrito} no existe. Se omite.`);
        errores.push(`Fila ${index + 1}: Inscrito ID ${r.id_inscrito} no existe`);
        continue;
      }

      const estado = "CLASIFICADO";

      console.log(` Procesando fila ${index + 1}: Inscrito ${r.id_inscrito}, Fase ${r.fase}`);

      const record = await clasificadosRepo.upsertClasificado({
        id_inscrito: r.id_inscrito,
        id_fase: r.fase ?? 2,
        estado,
      });

      console.log(` Clasificado creado: ID=${record.id_clasificado}, Inscrito=${r.id_inscrito}`);
      results.push(record);
    } catch (err) {
      console.error(` Error procesando fila ${index + 1}:`, r, err);
      errores.push(`Fila ${index + 1}: ${err.message}`);
    }
  }
//  Resumen final
  console.log(` Total procesado: ${uniqueRows.length} filas únicas, exitosas: ${results.length}, errores: ${errores.length}`);
  
  //  Preparar mensaje informativo para el frontend
  let mensajeFinal = `Se procesaron ${uniqueRows.length} filas únicas del Excel.`;
  
  if (duplicadosEncontrados.length > 0) {
    mensajeFinal += ` Se omitieron ${duplicadosEncontrados.length} duplicados dentro del mismo Excel.`;
  }
  
  if (errores.length > 0) {
    mensajeFinal += ` Hubo ${errores.length} errores en el procesamiento.`;
  }
  
  console.log("📋 Resumen:", mensajeFinal);

  if (results.length === 0 && uniqueRows.length > 0) {
    throw new Error("Ninguna fila pudo guardarse. Errores: " + errores.join(" | "));
  }

  return {
    results,
    errores,
    duplicados: duplicadosEncontrados,
    mensaje: mensajeFinal
  };
}

export async function promoverDesdeEvaluaciones({ nivel = null, limpiarPrevios = true }) {
  const fase = await fasesRepo.findByNombre("CLASIFICATORIA");
  const notaMinima = Number(fase?.nota_minima ?? 0);

  // Traer IDs de inscritos que cumplen la nota mínima (de la primera fase)
  const candidatos = await evalRepo.findInscritosQueCumplenNotaMinima({ notaMinima, nivel });

  let inserted = 0, skipped = 0, deleted = 0;
  await prisma.$transaction(async (tx) => {
    if (limpiarPrevios) {
      const del = await tx.clasificados.deleteMany({});
      deleted = del.count;
    }
    for (const c of candidatos) {
      try {
        await tx.clasificados.create({
          data: { id_inscrito: Number(c.id_inscrito), id_fase: 2, estado: 'CLASIFICADO' }
        });
        inserted++;
      } catch {
        skipped++; // ya estaba, etc.
      }
    }
  });

  return { totalCandidatos: candidatos.length, inserted, skipped, deleted };
}