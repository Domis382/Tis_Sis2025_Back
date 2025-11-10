import { prisma } from '../config/prisma.js';

export async function list(req, res, next) {
  try {
    const rows = await prisma.clasificados.findMany({
      include: { inscritos: true, fases: true },
      take: 20
    });
    res.json({ total: rows.length, rows });
  } catch (err) { next(err); }
}
