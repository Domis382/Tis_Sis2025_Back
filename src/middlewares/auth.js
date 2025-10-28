// src/middlewares/auth.js
export function requireRole(roleNeeded) {
  return (req, res, next) => {
    // ⚠️ Usa un coordinador REAL que exista en tu BD (1 o 2, según tu captura)
    req.user = { rol: 'COORDINADOR', id_coordinador: 1 };

    if (!req.user || req.user.rol !== roleNeeded) {
      return res.status(403).json({ ok: false, message: 'No autorizado' });
    }
    next();
  };
}
