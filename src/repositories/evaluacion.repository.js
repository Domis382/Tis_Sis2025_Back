import prisma from "../config/prisma.js";

export async function findResultadosClasificatoria() {
  const resultados = await prisma.inscritos.findMany({
    select: {
      id_inscritos: true,
      nombres_inscrito: true,
      apellidos_inscrito: true,
      clasificados: {
        select: {
          estado: true,
        },
      },
      evaluaciones: {
        select: {
          observacion: true,
          nota: true,
        },
      },
    },
    orderBy: { id_inscritos: 'asc' },
  });

  // Formatear los datos para que el frontend los reciba listos
  return resultados.map((r) => ({
    competidor: `${r.nombres_inscrito} ${r.apellidos_inscrito}`,
    nota: Number(r.evaluaciones?.[0]?.nota ?? null,),
    observacion: r.evaluaciones[0]?.observacion || "Sin observación",
    estado: r.clasificados[0]?.estado || "Sin estado",
  }));
}
