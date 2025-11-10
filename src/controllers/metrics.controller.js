import { prisma } from '../config/prisma.js';

export async function dashboard(req, res, next) {
  try {
    const asignados = await prisma.evaluaciones.count();
    const pendientes = await prisma.evaluaciones.count({ where: { nota: null } });
    const hechas = await prisma.evaluaciones.count({ where: { NOT: { nota: null } } });
    res.json({ asignados, pendientes, hechas });
  } catch (err) { next(err); }
}
