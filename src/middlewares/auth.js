// src/middlewares/auth.js
export function requireRole(roleNeeded) {
  return (req, res, next) => {
    const role = process.env.STUB_ROLE || 'COORDINADOR';
    const coordId = Number(process.env.STUB_COORDINADOR_ID || '1');

    req.user = { rol: role, id_coordinador: coordId };

    if (!req.user || req.user.rol !== roleNeeded) {
      return res.status(403).json({ ok: false, message: 'No autorizado' });
    }
    next();
  };
}
