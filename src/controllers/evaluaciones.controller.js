import { prisma } from '../config/prisma.js';
import { z } from 'zod';

export async function list(req, res, next) {
  try {
    const rows = await prisma.evaluaciones.findMany({
      include: { inscritos: true, evaluador: true, fases: true },
      take: 20
    });
    res.json({ total: rows.length, rows });
  } catch (err) { next(err); }
}

export async function historial(req, res, next) {
  try {
    // … tu lógica (puede ser la que te pasé antes)
    res.json({ total: 0, rows: [] });
  } catch (err) { next(err); }
}

export async function updateNota(req, res, next) {
  try {
    const body = z.object({
      nota: z.number().min(0).max(100),
      observacion: z.string().max(500).optional(),
      userName: z.string().optional()
    }).parse(req.body);

    const id = BigInt(req.params.id);
    const updated = await prisma.evaluaciones.update({
      where: { id_evaluacion: id },
      data: { nota: body.nota, observacion: body.observacion ?? null }
    });
    res.json(updated);
  } catch (err) { next(err); }
}
