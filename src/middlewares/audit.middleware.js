const prisma = require('../config/prisma.js');

// Registra cambios de nota en la tabla auditoria
async function logNotaUpdate({ id_evaluacion, oldNota, newNota, userName = 'Evaluador' }) {
  if (oldNota === newNota) return;

  await prisma.auditoria.create({
    data: {
      actor_tipo: 'EVALUADOR',
      id_actor: null,
      actor_nombre_snapshot: userName,
      accion: 'UPDATE_NOTA',
      entidad: 'evaluaciones',
      id_entidad: BigInt(id_evaluacion),
      valor_anterior: oldNota == null ? null : String(oldNota),
      valor_nuevo: newNota == null ? null : String(newNota),
      resultado: 'OK',
      motivo_error: null
    }
  });
}

module.exports = { logNotaUpdate };
