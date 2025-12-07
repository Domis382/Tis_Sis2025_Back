// src/repositories/clasificados.repository.js
import db from "../config/prisma.js";

// Crear un nuevo clasificado (usamos CREATE porque borramos todo antes)
export async function upsertClasificado({ id_inscrito, id_fase, estado }) {
  try {
    console.log(`📌 Creando clasificado: inscrito=${id_inscrito}, fase=${id_fase}, estado=${estado}`);
    // VERIFICA EL MODELO PRISMA
    console.log("📋 Modelo clasificados disponible?", !!db.clasificados);
    
    return await db.clasificados.create({
      data: {
        id_inscrito: Number(id_inscrito),
        id_fase: Number(id_fase),
        estado,
      },
    });
  } catch (error) {
    console.error("❌ Error en upsertClasificado:", error);
    throw error;
  }
}

// Listar TODOS los clasificados con datos del inscrito
export async function findAllClasificados() {
  try {
    console.log("🔍 findAllClasificados: Ejecutando consulta SQL...");
    
    const results = await db.$queryRaw`
      SELECT 
        c.id_clasificado,
        c.id_inscrito,
        c.id_fase,
        c.estado,

        i.nombres_inscrito,
        i.apellidos_inscrito,
        i.ci_inscrito,
        i.colegio,
        i.contacto_tutor,
        i.unidad_educativa,
        i.departamento,
        i.grado_escolaridad,
        i.id_area,
        i.tutor_academico
      FROM clasificados c
      JOIN inscritos i 
        ON i.id_inscritos = c.id_inscrito
      WHERE c.estado = 'CLASIFICADO'
      ORDER BY i.nombres_inscrito, i.apellidos_inscrito
    `;
    
    console.log(`✅ findAllClasificados: Encontrados ${results.length} registros`);
    return results;
  } catch (error) {
    console.error("❌ Error en findAllClasificados:", error);
    throw new Error(`Error al obtener clasificados: ${error.message}`);
  }
}